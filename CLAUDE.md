# RESUMIND

ATS resume optimizer — user-supplied LLM API keys, fully client-side except PDF parsing.

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | CSS Modules + CSS variables |
| LLM | Anthropic / OpenAI / Groq (client-side) |
| PDF | pdf-parse v1 via API route (`require`, not `import`) |
| PDF Export | `@react-pdf/renderer` (client-only, dynamic import) |
| DOCX | mammoth (read) + jszip (rebuild) |
| Testing | Vitest + Testing Library |

## Structure

```
app/                        → layout, page, globals.css, api/parse-pdf
components/                 → ATSOptimizer (shell), ConfigPanel, Workspace,
                              AnalysisPanel, UploadZone, RuleToggle,
                              TemplateSelector
lib/                        → llm, prompt, parser, file, rules, providers,
                              docx, templates/
types/index.ts              → shared types (incl. StructuredResume, TemplateId)
tests/lib/                  → unit tests for lib/ modules
docs/                       → skill files (load per task, not all at once)
```

## Skills

| Working on | Load |
|---|---|
| `lib/llm.ts`, providers | `@docs/skill-llm.md` |
| `lib/prompt.ts`, `lib/parser.ts` | `@docs/skill-prompt.md` |
| `lib/file.ts`, `api/parse-pdf` | `@docs/skill-pdf.md` |
| Components, `globals.css` | `@docs/skill-design.md` |
| Tests | `@docs/skill-testing.md` |
| `resumind-go/`, WASM | `@docs/skill-wasm.md` |

## Invariants

- API keys **never** stored (no localStorage, cookies, logs)
- PDF content **never** persisted — session memory only
- No fabrication — only reframe real experience
- No component libraries — CSS Modules + globals only
- `api/parse-pdf` is the **only** server route
- **No markdown in runtime strings** — LLM prompts use plain text, concrete examples. Skill files have pseudocode; translate before writing source.
- All LLM calls use `temperature: 0.2` — set in each provider function in `lib/llm.ts`

## Prompt Architecture

`buildSystemPrompt` in `lib/prompt.ts` uses strict section ordering:
1. ROLE (editor, not creator)
2. GUARDRAILS (top — primacy effect, overrides all)
3. FABRICATION EXAMPLES (3 BAD/GOOD pairs, do not exceed 3)
4. ACTIVE RULES (from user toggles)
5. SECTION-SPECIFIC RULES (summary, bullets, skills)
6. SELF-CHECK (verification before output)
7. STRUCTURE PRESERVATION
8. OUTPUT FORMAT (last — closest to generation)

Do **not** add a second LLM call for validation. Do **not** use "be creative" anywhere.

## UX Rules

- Run button disabled until: resume + JD + API key all non-empty
- Auto-switch to Output tab after successful run
- Progress bar (2px, accent shimmer) during API call
- Scores: `<50` red, `50-74` orange, `>=75` green
- Analysis dots: green=match, accent=reframe, red=gap
- Smart export: DOCX primary if DOCX input, PDF via template picker, TXT fallback
- Upload errors shown inline on Resume tab
