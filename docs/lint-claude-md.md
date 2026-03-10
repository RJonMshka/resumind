# Lint CLAUDE.md

Run this audit whenever CLAUDE.md is updated. Read CLAUDE.md, then apply each rule below. Remove or move anything that fails.

## Keep/Remove test

For every line, ask: **"Would violating this cause a bug or architectural regression that's hard to catch by reading source?"**

- **YES → keep.** Invariants, architectural constraints, ordering rules, "do not" prohibitions.
- **NO → remove.** Implementation details recoverable from source files.

## Specific removal targets

| Remove | Why | Where it lives instead |
|---|---|---|
| Hex color values | Read `globals.css` `:root` | `app/globals.css` |
| CSS snippets (font-family, letter-spacing, box-shadow, etc.) | Read the CSS module | `components/*.module.css` |
| Pixel dimensions of UI elements | Implementation detail | CSS modules |
| Full lists of rule IDs | Read the type or the array | `types/index.ts`, `lib/rules.ts` |
| Model names, API endpoint URLs | Read the source | `lib/llm.ts`, `lib/providers.ts` |
| Component prop interfaces | Read the component | `components/*.tsx` |

## What must stay

- Project identity (1-line description)
- Stack table
- Directory structure
- Skill file routing table
- Invariants (hard constraints that prevent security/quality regressions)
- Prompt architecture ordering (numbered list only — no inline examples)
- "Do not" prohibitions (second LLM call, "be creative", etc.)
- UX behavior rules (disabled states, auto-switch, score thresholds)

## Size budget

CLAUDE.md should be **under 80 lines**. If it exceeds 80, something readable from source crept in.
