export type RuleId =
  | "preserve_voice" | "no_fabricate" | "quantify" | "senior_lang"
  | "ats_keywords" | "concise" | "action_verbs" | "keyword_density"
  | "section_order" | "gap_flag" | "bullet_format";

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
  structured_resume?: StructuredResume;  // populated when PDF export available
}

// --- Structured resume for PDF template rendering ---

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  location?: string;
  dates: string;
  bullets: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  dates?: string;
  details?: string;
}

export interface StructuredResume {
  contact: ContactInfo;
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
}

export type TemplateId = "classic" | "modern" | "minimal" | "executive";

export interface LLMError {
  code: "auth" | "rate_limit" | "context_length" | "network" | "unknown";
  message: string;
  retryable: boolean;
}

// --- Format-preserving output types ---

export type InputFormat = "txt" | "pdf" | "docx" | "paste";

export interface ExtractionResult {
  text: string;
  format: InputFormat;
  docxBuffer?: ArrayBuffer;  // original .docx bytes for round-trip rebuild
}
