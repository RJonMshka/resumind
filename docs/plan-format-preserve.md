# Plan: Format-Preserving Resume Output

## Goal
Output the optimized resume in the same format that maintains its original layout, formatting, and theme.

## Approach: Hybrid (DOCX Round-Trip + PDF Templates)

### Phase 1: DOCX Round-Trip (High Priority)
When a user uploads a `.docx` file, preserve the original document structure and only replace the text content with optimized text.

**Libraries:**
- `mammoth` — extract structured text from .docx (with paragraphs/sections)
- `jszip` — read/write the .docx ZIP structure (for raw XML manipulation)

**Implementation steps:**
1. **Update `lib/file.ts`**: Add `.docx` to `ALLOWED_TYPES`. Add `extractDocx()` function that:
   - Uses `mammoth` to extract text (for LLM input)
   - Stores the raw `.docx` `ArrayBuffer` in memory (for later reconstruction)
   - Returns `{ text, docxBuffer }` instead of just `string`
2. **Create `lib/docx.ts`**: New module with:
   - `parseDocx(buffer: ArrayBuffer)` — uses JSZip to open the docx, reads `word/document.xml`, extracts text paragraphs with their XML paths
   - `rebuildDocx(originalBuffer: ArrayBuffer, optimizedText: string)` — opens original ZIP, parses `document.xml`, replaces `<w:t>` text content with optimized text (paragraph-by-paragraph mapping), re-zips
   - Uses a paragraph-level diffing strategy: split both original and optimized text by paragraphs, map them 1:1, replace text nodes while preserving all `<w:rPr>` (run properties: bold, italic, font, size, color)
3. **Update types**: Add `InputFormat` type (`'txt' | 'pdf' | 'docx' | 'paste'`), add `docxBuffer` to state
4. **Update `UploadZone.tsx`**: Accept `.docx` files, pass buffer up alongside text
5. **Update `ATSOptimizer.tsx`**: Track `inputFormat` and `docxBuffer` in state, update `handleExport` to call `rebuildDocx()` when format is `docx`
6. **Update `AnalysisPanel.tsx`**: Show appropriate export label based on format

**Key constraint:** The paragraph mapping will not be perfect if the LLM significantly restructures the resume (adds/removes sections). The prompt should instruct the LLM to preserve the same section structure and paragraph count when possible.

### Phase 2: PDF Template-Based Export (Medium Priority)
For `.pdf` and `.txt` uploads (where we cannot recover original formatting), offer professional resume templates.

**Library:**
- `@react-pdf/renderer` — client-side PDF generation from React components

**Implementation steps:**
1. **Update `lib/prompt.ts`**: Add structured output mode — LLM returns resume sections as structured JSON (contact, summary, experience[], education[], skills[]) in addition to flat text
2. **Create `lib/templates/`**: Define 3-4 resume template components using @react-pdf/renderer:
   - `ClassicTemplate` — traditional single-column
   - `ModernTemplate` — two-column with sidebar
   - `MinimalTemplate` — clean, lots of whitespace
   - `ExecutiveTemplate` — bold headers, formal tone
3. **Update types**: Add `StructuredResume` type with section definitions
4. **Update `lib/parser.ts`**: Parse the new structured output alongside flat text
5. **Create `components/TemplateSelector.tsx`**: Small UI for picking a template before PDF export
6. **Update export flow**: When input was PDF/TXT, show template picker, then generate PDF

### Phase 3: Integration & UX
1. **Smart export button**: Shows format-appropriate options
   - DOCX input → "Export as DOCX" (primary) + "Export as TXT" (secondary)
   - PDF/TXT input → "Export as PDF" (opens template picker) + "Export as TXT" (secondary)
   - Paste input → "Export as PDF" (opens template picker) + "Export as TXT" (secondary)
2. **Prompt update**: Tell LLM to preserve section structure and paragraph ordering
3. **Tests**: Unit tests for docx parsing/rebuilding, template rendering, format detection

## Architecture Decisions
- All new code is **client-side only** — no new server routes
- Original `.docx` buffer stored in React state (session memory only, never persisted — consistent with privacy invariant)
- `mammoth` runs client-side via its browser build
- `@react-pdf/renderer` runs client-side
- Fallback: plain `.txt` export always available regardless of input format

## File Changes Summary
| File | Change |
|---|---|
| `types/index.ts` | Add `InputFormat`, `StructuredResume`, update `OptimizationResult` |
| `lib/file.ts` | Add `.docx` support, return format metadata |
| `lib/docx.ts` | NEW — DOCX parse/rebuild logic |
| `lib/prompt.ts` | Add structured output instructions |
| `lib/parser.ts` | Parse structured resume sections |
| `lib/templates/*.tsx` | NEW — PDF template components (Phase 2) |
| `components/UploadZone.tsx` | Accept `.docx`, pass buffer |
| `components/ATSOptimizer.tsx` | Track format/buffer, smart export |
| `components/AnalysisPanel.tsx` | Format-aware export button |
| `components/TemplateSelector.tsx` | NEW — template picker (Phase 2) |
| `package.json` | Add mammoth, jszip, @react-pdf/renderer |
