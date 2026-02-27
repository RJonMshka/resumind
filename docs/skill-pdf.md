# Skill: File Parsing (PDF & Text)

**Purpose**: Extract plain text from uploaded files. `.txt` files are read client-side via `FileReader`. `.pdf` files are sent to a server-side API route that uses `pdf-parse`. Covers `lib/file.ts` and `app/api/parse-pdf/route.ts`.

---

## lib/file.ts — Client-Side Entry Point

### Canonical Interface

```typescript
// lib/file.ts

/**
 * Extracts text from an uploaded File object.
 * Supports .txt and .pdf files.
 * Throws on unsupported formats or extraction failure.
 */
export async function extractText(file: File): Promise<string>;
```

### Implementation

```typescript
export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt")) {
    return readTextFile(file);
  }

  if (name.endsWith(".pdf")) {
    return parsePDF(file);
  }

  throw new Error("Unsupported file type — upload a .txt or .pdf file");
}

function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      if (text.trim().length === 0) {
        reject(new Error("File is empty"));
        return;
      }
      resolve(text);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

async function parsePDF(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/parse-pdf", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `PDF parsing failed (${res.status})`);
  }

  const data = await res.json();
  return data.text;
}
```

### File Validation (pre-upload)

Validate before calling `extractText` in the component layer:

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [".txt", ".pdf"];

export function validateFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const ext = name.slice(name.lastIndexOf("."));

  if (!ALLOWED_TYPES.includes(ext)) {
    return "Only .txt and .pdf files are supported";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File exceeds 5 MB limit";
  }
  if (file.size === 0) {
    return "File is empty";
  }
  return null;
}
```

---

## app/api/parse-pdf/route.ts — Server-Side PDF Extraction

This is the **only** server-side route in the entire application.

### Canonical Interface

```typescript
// app/api/parse-pdf/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse>;
```

### Implementation

```typescript
import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Size guard — 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds 5 MB limit" },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await pdf(buffer);
    const text = result.text.trim();

    if (text.length === 0) {
      return NextResponse.json(
        { error: "PDF contains no extractable text — try a different file" },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("PDF parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse PDF" },
      { status: 500 }
    );
  }
}
```

### Route Config

```typescript
// Disable body parser — we handle FormData manually
export const config = {
  api: {
    bodyParser: false,
  },
};
```

> **Note**: In Next.js App Router, `formData()` on the request handles multipart parsing natively. The config above is only needed if using Pages Router. For App Router, the implementation works without additional config.

---

## Drag & Drop Integration

`lib/file.ts` is consumed by `components/UploadZone.tsx`. The component handles:

- `onDrop` event → `e.dataTransfer.files[0]`
- `<input type="file" accept=".txt,.pdf">` → `e.target.files[0]`

Both paths call `validateFile()` first, then `extractText()`:

```typescript
// Inside UploadZone component
async function handleFile(file: File) {
  const error = validateFile(file);
  if (error) {
    onError(error);
    return;
  }
  try {
    const text = await extractText(file);
    onTextExtracted(text);
  } catch (err) {
    onError(err instanceof Error ? err.message : "Failed to extract text");
  }
}
```

---

## Hard Rules

- PDF content is **never** persisted — the API route processes in memory and returns text immediately
- The API route must **never** write files to disk — `Buffer.from(arrayBuffer)` only
- The API route must **never** log file contents — only log errors
- `extractText` is the single entry point — components never call `parsePDF` or `readTextFile` directly
- Max file size is **5 MB** — enforced on both client (`validateFile`) and server (API route)
- Only `.txt` and `.pdf` are supported — reject all other extensions immediately
- `pdf-parse` is the only PDF dependency — do not add `pdfjs-dist` or other libraries
- `FileReader` is used for `.txt` — do not send text files to the API route
