import type { OptimizationResult, AnalysisItem, AnalysisType } from "@/types";

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

  return {
    before_score: Math.round(obj.before_score),
    after_score: Math.round(obj.after_score),
    analysis,
    optimized_resume: obj.optimized_resume.trim(),
  };
}
