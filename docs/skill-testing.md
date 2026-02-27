# Skill: Testing

**Purpose**: Unit testing strategy for `lib/` modules using Vitest. Covers `tests/setup.ts` and all files in `tests/lib/`.

---

## Test Setup

### Vitest Configuration

```typescript
// vitest.config.ts (project root)

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

### Setup File

```typescript
// tests/setup.ts

import "@testing-library/jest-dom";
```

### package.json Script

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## Test File Locations

Tests mirror the `lib/` directory structure:

```
tests/
├── setup.ts
└── lib/
    ├── prompt.test.ts
    ├── parser.test.ts
    ├── rules.test.ts
    ├── providers.test.ts
    └── file.test.ts
```

No tests for `lib/llm.ts` — it makes real API calls and is tested manually. No component tests unless explicitly requested.

---

## tests/lib/prompt.test.ts

```typescript
import { describe, it, expect } from "vitest";
import { buildSystemPrompt, buildUserMessage, validateInputs } from "@/lib/prompt";
import type { Rule } from "@/types";

const mockRules: Rule[] = [
  { id: "preserve_voice", label: "Preserve Voice", desc: "Keep original tone", on: true },
  { id: "no_fabricate", label: "No Fabrication", desc: "Don't make things up", on: true },
  { id: "quantify", label: "Quantify", desc: "Add numbers where possible", on: false },
];

describe("buildSystemPrompt", () => {
  it("includes only enabled rules", () => {
    const prompt = buildSystemPrompt(mockRules);
    expect(prompt).toContain("Preserve Voice");
    expect(prompt).toContain("No Fabrication");
    expect(prompt).not.toContain("Quantify");
  });

  it("includes JSON schema instruction", () => {
    const prompt = buildSystemPrompt(mockRules);
    expect(prompt).toContain("before_score");
    expect(prompt).toContain("after_score");
    expect(prompt).toContain("optimized_resume");
  });

  it("includes guardrails", () => {
    const prompt = buildSystemPrompt(mockRules);
    expect(prompt).toContain("NEVER fabricate");
  });

  it("handles all rules disabled", () => {
    const allOff = mockRules.map((r) => ({ ...r, on: false }));
    const prompt = buildSystemPrompt(allOff);
    expect(prompt).toContain("best judgment");
  });

  it("handles empty rules array", () => {
    const prompt = buildSystemPrompt([]);
    expect(prompt).toContain("best judgment");
  });
});

describe("buildUserMessage", () => {
  it("includes resume and JD text", () => {
    const msg = buildUserMessage("My resume content", "Job description here");
    expect(msg).toContain("My resume content");
    expect(msg).toContain("Job description here");
  });

  it("trims whitespace from inputs", () => {
    const msg = buildUserMessage("  resume  ", "  jd  ");
    expect(msg).toContain("## Resume\nresume");
    expect(msg).toContain("## Job Description\njd");
  });
});

describe("validateInputs", () => {
  const validResume = "A".repeat(100);
  const validJD = "B".repeat(100);

  it("returns null for valid inputs", () => {
    expect(validateInputs(validResume, validJD)).toBeNull();
  });

  it("rejects short resume", () => {
    expect(validateInputs("short", validJD)).toContain("Resume");
  });

  it("rejects short JD", () => {
    expect(validateInputs(validResume, "short")).toContain("Job description");
  });

  it("rejects oversized resume", () => {
    expect(validateInputs("A".repeat(31_000), validJD)).toContain("30,000");
  });

  it("rejects oversized JD", () => {
    expect(validateInputs(validResume, "B".repeat(16_000))).toContain("15,000");
  });
});
```

---

## tests/lib/parser.test.ts

```typescript
import { describe, it, expect } from "vitest";
import { parseOptimizationResult } from "@/lib/parser";

const validResult = {
  before_score: 42,
  after_score: 85,
  analysis: [
    { type: "match", text: "Python experience" },
    { type: "reframe", text: "Leadership reframed", detail: "Used stronger language" },
    { type: "gap", text: "Missing Kubernetes" },
  ],
  optimized_resume: "A".repeat(100),
};

const validJSON = JSON.stringify(validResult);

describe("parseOptimizationResult", () => {
  it("parses valid bare JSON", () => {
    const result = parseOptimizationResult(validJSON);
    expect(result.before_score).toBe(42);
    expect(result.after_score).toBe(85);
    expect(result.analysis).toHaveLength(3);
    expect(result.optimized_resume).toBeTruthy();
  });

  it("handles markdown code fences", () => {
    const wrapped = "```json\n" + validJSON + "\n```";
    const result = parseOptimizationResult(wrapped);
    expect(result.before_score).toBe(42);
  });

  it("handles preamble and postamble text", () => {
    const wrapped = "Here is the result:\n" + validJSON + "\nHope this helps!";
    const result = parseOptimizationResult(wrapped);
    expect(result.after_score).toBe(85);
  });

  it("rounds fractional scores", () => {
    const data = { ...validResult, before_score: 42.7, after_score: 84.2 };
    const result = parseOptimizationResult(JSON.stringify(data));
    expect(result.before_score).toBe(43);
    expect(result.after_score).toBe(84);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseOptimizationResult("not json at all")).toThrow();
  });

  it("throws on missing before_score", () => {
    const data = { ...validResult, before_score: undefined };
    expect(() => parseOptimizationResult(JSON.stringify(data))).toThrow("before_score");
  });

  it("throws on score out of range", () => {
    const data = { ...validResult, before_score: 150 };
    expect(() => parseOptimizationResult(JSON.stringify(data))).toThrow("before_score");
  });

  it("throws on empty analysis array", () => {
    const data = { ...validResult, analysis: [] };
    expect(() => parseOptimizationResult(JSON.stringify(data))).toThrow("analysis");
  });

  it("throws on invalid analysis item type", () => {
    const data = {
      ...validResult,
      analysis: [{ type: "invalid", text: "test" }],
    };
    expect(() => parseOptimizationResult(JSON.stringify(data))).toThrow("Invalid analysis item");
  });

  it("throws on too-short optimized_resume", () => {
    const data = { ...validResult, optimized_resume: "short" };
    expect(() => parseOptimizationResult(JSON.stringify(data))).toThrow("optimized_resume");
  });
});
```

---

## tests/lib/rules.test.ts

```typescript
import { describe, it, expect } from "vitest";
import { DEFAULT_RULES } from "@/lib/rules";

describe("DEFAULT_RULES", () => {
  it("exports an array of 6 rules", () => {
    expect(DEFAULT_RULES).toHaveLength(6);
  });

  it("each rule has required fields", () => {
    for (const rule of DEFAULT_RULES) {
      expect(rule).toHaveProperty("id");
      expect(rule).toHaveProperty("label");
      expect(rule).toHaveProperty("desc");
      expect(rule).toHaveProperty("on");
      expect(typeof rule.id).toBe("string");
      expect(typeof rule.label).toBe("string");
      expect(typeof rule.desc).toBe("string");
      expect(typeof rule.on).toBe("boolean");
    }
  });

  it("has unique IDs", () => {
    const ids = DEFAULT_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("preserve_voice and no_fabricate are enabled by default", () => {
    const preserveVoice = DEFAULT_RULES.find((r) => r.id === "preserve_voice");
    const noFabricate = DEFAULT_RULES.find((r) => r.id === "no_fabricate");
    expect(preserveVoice?.on).toBe(true);
    expect(noFabricate?.on).toBe(true);
  });
});
```

---

## tests/lib/providers.test.ts

```typescript
import { describe, it, expect } from "vitest";
import { PROVIDERS } from "@/lib/providers";

describe("PROVIDERS", () => {
  it("exports 3 providers", () => {
    expect(PROVIDERS).toHaveLength(3);
  });

  it("each provider has id, label, and models", () => {
    for (const p of PROVIDERS) {
      expect(typeof p.id).toBe("string");
      expect(typeof p.label).toBe("string");
      expect(Array.isArray(p.models)).toBe(true);
      expect(p.models.length).toBeGreaterThan(0);
    }
  });

  it("includes anthropic, openai, and groq", () => {
    const ids = PROVIDERS.map((p) => p.id);
    expect(ids).toContain("anthropic");
    expect(ids).toContain("openai");
    expect(ids).toContain("groq");
  });
});
```

---

## tests/lib/file.test.ts

```typescript
import { describe, it, expect } from "vitest";
import { validateFile } from "@/lib/file";

describe("validateFile", () => {
  function makeFile(name: string, size: number): File {
    const content = new Uint8Array(size);
    return new File([content], name);
  }

  it("accepts .txt files", () => {
    expect(validateFile(makeFile("resume.txt", 1000))).toBeNull();
  });

  it("accepts .pdf files", () => {
    expect(validateFile(makeFile("resume.pdf", 1000))).toBeNull();
  });

  it("rejects .docx files", () => {
    expect(validateFile(makeFile("resume.docx", 1000))).toContain("supported");
  });

  it("rejects files over 5 MB", () => {
    expect(validateFile(makeFile("big.pdf", 6 * 1024 * 1024))).toContain("5 MB");
  });

  it("rejects empty files", () => {
    expect(validateFile(makeFile("empty.txt", 0))).toContain("empty");
  });
});
```

> **Note**: `extractText` is not unit tested because it depends on `FileReader` and `fetch`. Test it via integration or manually. Only `validateFile` is unit-testable in isolation.

---

## Testing Patterns

### Do

- Test **pure functions** — prompt builders, parser, validators, constants
- Test **edge cases** — empty inputs, oversized inputs, malformed JSON, boundary scores
- Test **error messages** — assert the thrown error contains a meaningful substring
- Use `describe` blocks grouped by function name
- Keep each test focused on one assertion (or closely related assertions)

### Do Not

- Do not test `lib/llm.ts` — it makes real HTTP requests
- Do not write component tests unless explicitly requested
- Do not mock `fetch` globally — if a test needs fetch, it belongs in integration tests
- Do not test internal/private functions — test the public API only
- Do not use snapshots — they are brittle and add maintenance cost

---

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode during development
npm run test:watch

# Run a specific test file
npx vitest run tests/lib/parser.test.ts
```

---

## Hard Rules

- Tests live in `tests/lib/` only — no tests in `src/` or next to source files
- Every `lib/` module (except `llm.ts`) must have a corresponding test file
- Test file naming: `<module>.test.ts` — matches the source file name
- Use `vitest` globals (`describe`, `it`, `expect`) — no manual imports needed when `globals: true`
- Imports use the `@/` path alias — same as source code
- Tests must pass with `npm test` before any PR — no skipped tests, no `.only`
- The `tests/setup.ts` file imports `@testing-library/jest-dom` for DOM matchers — this is pre-configured
