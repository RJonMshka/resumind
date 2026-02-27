# Skill: LLM Integration

**Purpose**: Unified interface for calling Anthropic, OpenAI, and Groq. All API calls are client-side. Keys are never logged, stored, or proxied.

---

## Canonical Interface

```typescript
// lib/llm.ts

import type { ProviderId } from "@/types";

export interface LLMCallParams {
  provider: ProviderId;
  apiKey: string;
  model: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
}

export interface LLMError {
  code: "auth" | "rate_limit" | "context_length" | "network" | "unknown";
  message: string;
  retryable: boolean;
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
```

---

## Provider Implementations

### Anthropic

```typescript
async function callAnthropic({ apiKey, model, systemPrompt, userMessage, maxTokens }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.error?.message };
  return data.content[0].text as string;
}
```

### OpenAI

```typescript
async function callOpenAI({ apiKey, model, systemPrompt, userMessage, maxTokens }) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
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
```

### Groq

```typescript
// Identical to OpenAI shape — only base URL differs
async function callGroq(params) {
  return callOpenAICompat("https://api.groq.com/openai/v1", params);
}

async function callOpenAICompat(baseUrl: string, { apiKey, model, systemPrompt, userMessage, maxTokens }) {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
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
```

---

## Error Normalization

```typescript
function normalizeError(err: unknown): LLMError {
  const status = (err as any)?.status;
  const message = (err as any)?.message ?? "Unknown error";

  if (status === 401) return { code: "auth", message: "Invalid API key", retryable: false };
  if (status === 429) return { code: "rate_limit", message: "Rate limit exceeded", retryable: true };
  if (status === 400 && message.includes("context")) return { code: "context_length", message: "Input too long", retryable: false };
  if (err instanceof TypeError) return { code: "network", message: "Network error — check connection", retryable: true };
  return { code: "unknown", message, retryable: false };
}
```

---

## Provider Config (source of truth)

```typescript
// lib/providers.ts
import type { Provider } from "@/types";

export const PROVIDERS: Provider[] = [
  {
    id: "anthropic",
    label: "Anthropic",
    models: ["claude-opus-4-6", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"],
  },
  {
    id: "openai",
    label: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  },
  {
    id: "groq",
    label: "Groq",
    models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"],
  },
];
```

---

## Hard Rules

- API keys are **never** stored in `localStorage`, `sessionStorage`, cookies, or sent to any server other than the provider's own endpoint
- All fetch calls must have explicit error handling — never let `res.json()` throw silently
- `maxTokens` default is `4096` — do not raise above `8192` without testing context limits
- Do not add streaming support unless explicitly requested — it complicates the parser
- Timeout is browser default — do not add `AbortController` timeout unless requested