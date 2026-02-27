# Skill: Prompt Engineering & Response Parsing

**Purpose**: Build the system prompt sent to the LLM and parse structured JSON from freeform LLM output. Covers `lib/prompt.ts` and `lib/parser.ts`.

---

## lib/prompt.ts — System Prompt Builder

### Canonical Interface

```typescript
// lib/prompt.ts

import type { Rule } from "@/types";

/**
 * Builds the system prompt from active rules.
 * Returns a single string — the full system prompt for the LLM.
 */
export function buildSystemPrompt(rules: Rule[]): string;

/**
 * Builds the user message containing resume + JD for analysis.
 */
export function buildUserMessage(resumeText: string, jobDescription: string): string;

/**
 * Quick sanity check — returns null if valid, error message string if invalid.
 */
export function validateInputs(resumeText: string, jobDescription: string): string | null;
```

### System Prompt Structure

The system prompt has four sections in fixed order:

```
1. ROLE        — "You are an expert ATS resume optimizer..."
2. RULES       — only enabled rules, formatted as numbered constraints
3. OUTPUT_JSON — exact JSON schema the model must return
4. GUARDRAILS  — do not fabricate, do not hallucinate, reframe only
```

### buildSystemPrompt Implementation

```typescript
export function buildSystemPrompt(rules: Rule[]): string {
  const activeRules = rules.filter((r) => r.on);

  const rulesBlock = activeRules.length > 0
    ? activeRules.map((r, i) => `${i + 1}. ${r.label}: ${r.desc}`).join("\n")
    : "No specific rules enabled — use best judgment.";

  return `You are an expert ATS resume optimizer. Your task is to analyze a resume against a job description and produce an optimized version that maximizes ATS compatibility while preserving the candidate's authentic experience.

## Rules
${rulesBlock}

## Output Format
You MUST respond with valid JSON matching this exact schema — no markdown, no code fences, no explanation outside the JSON:

{
  "before_score": <number 0-100>,
  "after_score": <number 0-100>,
  "analysis": [
    {
      "type": "match" | "reframe" | "gap",
      "text": "<short label>",
      "detail": "<optional explanation>"
    }
  ],
  "optimized_resume": "<full optimized resume text>"
}

## Guardrails
- NEVER fabricate experience, skills, or qualifications the candidate does not have
- NEVER invent metrics or numbers — only quantify if the original implies a quantity
- Reframe existing experience to align with job requirements using stronger language
- Preserve the candidate's voice and writing style unless "senior_lang" rule is active
- Include at least 3 analysis items: ideally a mix of match, reframe, and gap types
- before_score reflects the original resume's ATS match; after_score reflects the optimized version`;
}
```

### buildUserMessage Implementation

```typescript
export function buildUserMessage(resumeText: string, jobDescription: string): string {
  return `## Resume
${resumeText.trim()}

## Job Description
${jobDescription.trim()}

Analyze the resume against the job description. Return your response as the JSON object described in your instructions.`;
}
```

### validateInputs Implementation

```typescript
export function validateInputs(resumeText: string, jobDescription: string): string | null {
  const resume = resumeText.trim();
  const jd = jobDescription.trim();

  if (resume.length < 50) return "Resume is too short — paste your full resume text.";
  if (jd.length < 50) return "Job description is too short — paste the full listing.";
  if (resume.length > 30_000) return "Resume exceeds 30,000 characters — please shorten.";
  if (jd.length > 15_000) return "Job description exceeds 15,000 characters — please shorten.";
  return null;
}
```

---

## lib/parser.ts — JSON Extraction & Validation

### Canonical Interface

```typescript
// lib/parser.ts

import type { OptimizationResult, AnalysisItem, AnalysisType } from "@/types";

/**
 * Extracts and validates an OptimizationResult from raw LLM output.
 * Throws descriptive errors if parsing or validation fails.
 */
export function parseOptimizationResult(raw: string): OptimizationResult;
```

### Extraction Strategy

LLMs sometimes wrap JSON in markdown code fences or add preamble text. The parser must handle all of these:

```typescript
function extractJSON(raw: string): string {
  let text = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Find first { and last } — covers preamble/postamble text
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in LLM response");
  }

  return text.slice(start, end + 1);
}
```

### Type Guards

```typescript
const VALID_ANALYSIS_TYPES: AnalysisType[] = ["match", "reframe", "gap"];

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
```

### parseOptimizationResult Implementation

```typescript
export function parseOptimizationResult(raw: string): OptimizationResult {
  const jsonStr = extractJSON(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("LLM returned invalid JSON — try again or switch models");
  }

  const obj = parsed as Record<string, unknown>;

  // Validate scores
  if (!isValidScore(obj.before_score)) {
    throw new Error("Invalid or missing before_score (expected 0-100)");
  }
  if (!isValidScore(obj.after_score)) {
    throw new Error("Invalid or missing after_score (expected 0-100)");
  }

  // Validate analysis array
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

  // Validate optimized resume
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
```

---

## Hard Rules

- `buildSystemPrompt` is a **pure function** — no side effects, no async, no state
- `buildUserMessage` is a **pure function** — concatenation only
- `parseOptimizationResult` must **never** silently return partial data — throw on any validation failure
- JSON extraction must handle: bare JSON, markdown-fenced JSON, JSON with preamble/postamble text
- Scores are always **rounded to integers** via `Math.round()`
- The parser must not import or depend on any LLM module — it is provider-agnostic
- Character limits in `validateInputs` are soft guards for UX — the real limit is the model's context window
