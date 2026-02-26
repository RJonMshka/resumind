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
| Testing | Vitest + Testing Library |

## Structure

```
app/                        → layout, page, globals.css, api/parse-pdf
components/                 → ATSOptimizer (shell), ConfigPanel, Workspace,
                              AnalysisPanel, UploadZone, RuleToggle
lib/                        → llm, prompt, parser, file, rules, providers
types/index.ts              → shared types
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

## UX Rules

- Run button disabled until: resume + JD + API key all non-empty
- Auto-switch to Output tab after successful run
- Progress bar (2px, accent) during API call
- Scores: `<50` red, `50-74` orange, `>=75` green
- Analysis dots: green=match, accent=reframe, red=gap
- Export downloads `resume_optimized.txt` via Blob URL
- Upload errors shown inline on Resume tab
