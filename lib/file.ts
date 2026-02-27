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
    throw new Error((data as Record<string, string>).error ?? `PDF parsing failed (${res.status})`);
  }

  const data = await res.json();
  return (data as Record<string, string>).text;
}
