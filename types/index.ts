export type RuleId = "preserve_voice" | "no_fabricate" | "quantify" | "senior_lang" | "ats_keywords" | "concise";

export interface Rule {
  id: RuleId;
  label: string;
  desc: string;
  on: boolean;
}

export type ProviderId = "anthropic" | "openai" | "groq";

export interface Provider {
  id: ProviderId;
  label: string;
  models: string[];
}

export type AnalysisType = "match" | "reframe" | "gap";

export interface AnalysisItem {
  type: AnalysisType;
  text: string;
  detail?: string;
}

export interface OptimizationResult {
  before_score: number;   // 0-100
  after_score: number;    // 0-100
  analysis: AnalysisItem[];
  optimized_resume: string;
}

export interface LLMError {
  code: "auth" | "rate_limit" | "context_length" | "network" | "unknown";
  message: string;
  retryable: boolean;
}
