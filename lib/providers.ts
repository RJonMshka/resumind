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
