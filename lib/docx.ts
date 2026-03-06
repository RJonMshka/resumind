import JSZip from "jszip";

/**
 * DOCX round-trip: rebuild a .docx file by replacing text content
 * in the original document with optimized text, while preserving
 * all formatting (fonts, bold, italic, colors, spacing, layout).
 *
 * Strategy:
 *   1. Open the original .docx (a ZIP file) with JSZip
 *   2. Parse word/document.xml to find all paragraphs (<w:p> elements)
 *   3. Extract text from each paragraph (concatenation of <w:t> nodes)
 *   4. Split the optimized resume text into paragraphs
 *   5. Map optimized paragraphs back onto original XML paragraphs
 *   6. For each paragraph, distribute optimized text across existing
 *      <w:t> nodes, preserving the run properties (<w:rPr>) of the
 *      first run so formatting is maintained
 *   7. Re-zip everything and return the new .docx as an ArrayBuffer
 */

const DOCUMENT_XML_PATH = "word/document.xml";

/** Extract paragraph texts from document.xml for debugging/mapping. */
export function extractParagraphs(documentXml: string): string[] {
  const paragraphs: string[] = [];
  const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
  let pMatch: RegExpExecArray | null;

  while ((pMatch = pRegex.exec(documentXml)) !== null) {
    const pXml = pMatch[0];
    const texts: string[] = [];
    const tRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    let tMatch: RegExpExecArray | null;

    while ((tMatch = tRegex.exec(pXml)) !== null) {
      texts.push(tMatch[1]);
    }

    const combined = texts.join("");
    // Only include paragraphs that have actual text content
    if (combined.trim().length > 0) {
      paragraphs.push(combined);
    }
  }

  return paragraphs;
}

/**
 * Replace the text content of a single <w:p> element with new text,
 * keeping the formatting of the first run (<w:r>).
 *
 * Approach:
 *   - Find all runs (<w:r>) that contain <w:t> nodes
 *   - Keep the first run's formatting (<w:rPr>), put all new text there
 *   - Remove <w:t> from all subsequent runs (keep non-text runs intact)
 */
function replaceParagraphText(pXml: string, newText: string): string {
  // Find all runs with text nodes
  const runRegex = /<w:r>[\s\S]*?<\/w:r>|<w:r\s[^>]*>[\s\S]*?<\/w:r>/g;
  const runs: Array<{ full: string; hasText: boolean; index: number }> = [];
  let runMatch: RegExpExecArray | null;

  while ((runMatch = runRegex.exec(pXml)) !== null) {
    const hasText = /<w:t[\s>]/.test(runMatch[0]);
    runs.push({ full: runMatch[0], hasText, index: runMatch.index });
  }

  const textRuns = runs.filter((r) => r.hasText);
  if (textRuns.length === 0) return pXml;

  // Build a new first text run with the new text, preserving rPr
  const firstRun = textRuns[0].full;
  const rPrMatch = firstRun.match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
  const rPr = rPrMatch ? rPrMatch[0] : "";

  // xml:space="preserve" keeps leading/trailing spaces
  const newRun = `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(newText)}</w:t></w:r>`;

  // Replace: put new run where first text run was, remove other text runs
  let result = pXml;

  // Process in reverse order so indices stay valid
  for (let i = textRuns.length - 1; i >= 0; i--) {
    const run = textRuns[i];
    if (i === 0) {
      // Replace first text run with our new combined run
      result = result.slice(0, run.index) + newRun + result.slice(run.index + run.full.length);
    } else {
      // Remove subsequent text runs entirely
      result = result.slice(0, run.index) + result.slice(run.index + run.full.length);
    }
  }

  return result;
}

/** Escape special XML characters in text content. */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Rebuild a .docx file with optimized text.
 *
 * @param originalBuffer - The original .docx file as an ArrayBuffer
 * @param optimizedText  - The optimized resume as plain text
 * @returns A new .docx file as an ArrayBuffer
 */
export async function rebuildDocx(
  originalBuffer: ArrayBuffer,
  optimizedText: string,
): Promise<ArrayBuffer> {
  const zip = await JSZip.loadAsync(originalBuffer);

  const docXmlFile = zip.file(DOCUMENT_XML_PATH);
  if (!docXmlFile) {
    throw new Error("Invalid .docx: missing word/document.xml");
  }

  const docXml = await docXmlFile.async("string");

  // Extract original paragraphs (text-containing only)
  const originalParagraphs = extractParagraphs(docXml);

  // Split optimized text into paragraphs
  const optimizedParagraphs = optimizedText
    .split(/\n/)
    .filter((line) => line.trim().length > 0);

  // Build the mapping: for each original paragraph, find the corresponding
  // optimized paragraph. If there are more optimized paragraphs than original,
  // append the extras to the last paragraph. If there are fewer, keep
  // remaining original paragraphs unchanged.
  const mappedParagraphs = originalParagraphs.map((_, i) => {
    if (i < optimizedParagraphs.length) {
      return optimizedParagraphs[i];
    }
    // If optimized has fewer paragraphs, keep original text
    return originalParagraphs[i];
  });

  // If optimized text has more paragraphs than original, append extras
  // to the last mapped paragraph (separated by newlines within that paragraph)
  if (optimizedParagraphs.length > originalParagraphs.length && originalParagraphs.length > 0) {
    const extras = optimizedParagraphs.slice(originalParagraphs.length);
    const lastIdx = mappedParagraphs.length - 1;
    mappedParagraphs[lastIdx] = mappedParagraphs[lastIdx] + " " + extras.join(" ");
  }

  // Now walk through document.xml and replace paragraph text
  let newDocXml = docXml;
  const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
  let pMatch: RegExpExecArray | null;
  let textParaIdx = 0;
  const replacements: Array<{ start: number; end: number; replacement: string }> = [];

  while ((pMatch = pRegex.exec(docXml)) !== null) {
    const pXml = pMatch[0];

    // Check if this paragraph has text
    const tRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    const texts: string[] = [];
    let tMatch: RegExpExecArray | null;
    while ((tMatch = tRegex.exec(pXml)) !== null) {
      texts.push(tMatch[1]);
    }
    const combined = texts.join("");

    if (combined.trim().length > 0 && textParaIdx < mappedParagraphs.length) {
      const newPXml = replaceParagraphText(pXml, mappedParagraphs[textParaIdx]);
      replacements.push({
        start: pMatch.index,
        end: pMatch.index + pXml.length,
        replacement: newPXml,
      });
      textParaIdx++;
    }
  }

  // Apply replacements in reverse order to preserve indices
  for (let i = replacements.length - 1; i >= 0; i--) {
    const r = replacements[i];
    newDocXml = newDocXml.slice(0, r.start) + r.replacement + newDocXml.slice(r.end);
  }

  // Write modified document.xml back into the zip
  zip.file(DOCUMENT_XML_PATH, newDocXml);

  // Generate the new .docx as ArrayBuffer
  const newBuffer = await zip.generateAsync({ type: "arraybuffer" });
  return newBuffer;
}
