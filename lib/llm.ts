import type { ProviderId, LLMError } from "@/types";

export interface LLMCallParams {
  provider: ProviderId;
  apiKey: string;
  model: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
}

interface ProviderCallParams {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens: number;
}

export async function callLLM(params: LLMCallParams): Promise<string> {
  const { provider, apiKey, model, systemPrompt, userMessage, maxTokens = 4096 } = params;

  try {
    switch (provider) {
      case "anthropic": return await callAnthropic({ apiKey, model, systemPrompt, userMessage, maxTokens });
      case "openai":    return await callOpenAI({ apiKey, model, systemPrompt, userMessage, maxTokens });
      case "groq":      return await callGroq({ apiKey, model, systemPrompt, userMessage, maxTokens });
      default:          throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (err) {
    throw normalizeError(err);
  }
}

async function callAnthropic({ apiKey, model, systemPrompt, userMessage, maxTokens }: ProviderCallParams): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.error?.message };
  return data.content[0].text as string;
}

async function callOpenAI({ apiKey, model, systemPrompt, userMessage, maxTokens }: ProviderCallParams): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.error?.message };
  return data.choices[0].message.content as string;
}

async function callGroq(params: ProviderCallParams): Promise<string> {
  return callOpenAICompat("https://api.groq.com/openai/v1", params);
}

async function callOpenAICompat(baseUrl: string, { apiKey, model, systemPrompt, userMessage, maxTokens }: ProviderCallParams): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.error?.message };
  return data.choices[0].message.content as string;
}

class LLMCallError extends Error {
  code: LLMError["code"];
  retryable: boolean;

  constructor(info: LLMError) {
    super(info.message);
    this.name = "LLMCallError";
    this.code = info.code;
    this.retryable = info.retryable;
  }
}

function normalizeError(err: unknown): LLMCallError {
  const status = (err as Record<string, unknown>)?.status as number | undefined;
  const message = ((err as Record<string, unknown>)?.message as string) ?? "Unknown error";

  if (status === 401) return new LLMCallError({ code: "auth", message: "Invalid API key", retryable: false });
  if (status === 429) return new LLMCallError({ code: "rate_limit", message: "Rate limit exceeded — try again in a moment", retryable: true });
  if (status === 400 && message.includes("context")) return new LLMCallError({ code: "context_length", message: "Input too long for this model — shorten your resume or job description", retryable: false });
  if (err instanceof TypeError) return new LLMCallError({ code: "network", message: "Network error — check your connection or try a different provider", retryable: true });
  return new LLMCallError({ code: "unknown", message, retryable: false });
}
