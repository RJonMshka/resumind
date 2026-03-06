import type { OptimizationResult, AnalysisItem, AnalysisType, StructuredResume, ContactInfo, ExperienceItem, EducationItem } from "@/types";

const VALID_ANALYSIS_TYPES: AnalysisType[] = ["match", "reframe", "gap"];

function extractJSON(raw: string): string {
  let text = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Find first { and last } to handle preamble/postamble text
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in LLM response");
  }

  return text.slice(start, end + 1);
}

function isValidScore(val: unknown): val is number {
  return typeof val === "number" && val >= 0 && val <= 100 && Number.isFinite(val);
}

function isValidAnalysisItem(item: unknown): item is AnalysisItem {
  if (typeof item !== "object" || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    VALID_ANALYSIS_TYPES.includes(obj.type as AnalysisType) &&
    typeof obj.text === "string" &&
    obj.text.length > 0 &&
    (obj.detail === undefined || typeof obj.detail === "string")
  );
}

function parseContact(obj: unknown): ContactInfo | null {
  if (typeof obj !== "object" || obj === null) return null;
  const c = obj as Record<string, unknown>;
  if (typeof c.name !== "string" || c.name.length === 0) return null;
  const contact: ContactInfo = { name: c.name };
  if (typeof c.email === "string" && c.email.length > 0) contact.email = c.email;
  if (typeof c.phone === "string" && c.phone.length > 0) contact.phone = c.phone;
  if (typeof c.location === "string" && c.location.length > 0) contact.location = c.location;
  if (typeof c.linkedin === "string" && c.linkedin.length > 0) contact.linkedin = c.linkedin;
  if (typeof c.website === "string" && c.website.length > 0) contact.website = c.website;
  return contact;
}

function parseExperience(arr: unknown): ExperienceItem[] {
  if (!Array.isArray(arr)) return [];
  const items: ExperienceItem[] = [];
  for (const item of arr) {
    if (typeof item !== "object" || item === null) continue;
    const e = item as Record<string, unknown>;
    if (typeof e.title !== "string" || typeof e.company !== "string" || typeof e.dates !== "string") continue;
    const bullets: string[] = Array.isArray(e.bullets)
      ? e.bullets.filter((b): b is string => typeof b === "string" && b.length > 0)
      : [];
    const exp: ExperienceItem = { title: e.title, company: e.company, dates: e.dates, bullets };
    if (typeof e.location === "string" && e.location.length > 0) exp.location = e.location;
    items.push(exp);
  }
  return items;
}

function parseEducation(arr: unknown): EducationItem[] {
  if (!Array.isArray(arr)) return [];
  const items: EducationItem[] = [];
  for (const item of arr) {
    if (typeof item !== "object" || item === null) continue;
    const ed = item as Record<string, unknown>;
    if (typeof ed.degree !== "string" || typeof ed.institution !== "string") continue;
    const edu: EducationItem = { degree: ed.degree, institution: ed.institution };
    if (typeof ed.dates === "string" && ed.dates.length > 0) edu.dates = ed.dates;
    if (typeof ed.details === "string" && ed.details.length > 0) edu.details = ed.details;
    items.push(edu);
  }
  return items;
}

function parseStructuredResume(obj: unknown): StructuredResume | undefined {
  if (typeof obj !== "object" || obj === null) return undefined;
  const sr = obj as Record<string, unknown>;

  const contact = parseContact(sr.contact);
  if (!contact) return undefined;

  const experience = parseExperience(sr.experience);
  const education = parseEducation(sr.education);

  const skills: string[] = Array.isArray(sr.skills)
    ? sr.skills.filter((s): s is string => typeof s === "string" && s.length > 0)
    : [];

  const result: StructuredResume = { contact, experience, education, skills };
  if (typeof sr.summary === "string" && sr.summary.length > 0) {
    result.summary = sr.summary;
  }

  return result;
}

export function parseOptimizationResult(raw: string): OptimizationResult {
  const jsonStr = extractJSON(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("LLM returned invalid JSON — try again or switch models");
  }

  const obj = parsed as Record<string, unknown>;

  if (!isValidScore(obj.before_score)) {
    throw new Error("Invalid or missing before_score (expected 0-100)");
  }
  if (!isValidScore(obj.after_score)) {
    throw new Error("Invalid or missing after_score (expected 0-100)");
  }

  if (!Array.isArray(obj.analysis) || obj.analysis.length === 0) {
    throw new Error("Missing or empty analysis array");
  }
  const analysis: AnalysisItem[] = [];
  for (const item of obj.analysis) {
    if (!isValidAnalysisItem(item)) {
      throw new Error(`Invalid analysis item: ${JSON.stringify(item)}`);
    }
    analysis.push(item);
  }

  if (typeof obj.optimized_resume !== "string" || obj.optimized_resume.trim().length < 50) {
    throw new Error("Missing or too-short optimized_resume");
  }

  const structured = parseStructuredResume(obj.structured_resume);

  const result: OptimizationResult = {
    before_score: Math.round(obj.before_score),
    after_score: Math.round(obj.after_score),
    analysis,
    optimized_resume: obj.optimized_resume.trim(),
  };

  if (structured) {
    result.structured_resume = structured;
  }

  return result;
}
