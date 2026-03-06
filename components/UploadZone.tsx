"use client";

import { useRef, useState, useCallback } from "react";
import type { ExtractionResult } from "@/types";
import { validateFile, extractText } from "@/lib/file";
import styles from "./UploadZone.module.css";

interface UploadZoneProps {
  onFileExtracted: (result: ExtractionResult) => void;
  onError: (message: string) => void;
}

export default function UploadZone({ onFileExtracted, onError }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }
    setLoading(true);
    setUploadedName(null);
    try {
      const result = await extractText(file);
      onFileExtracted(result);
      setUploadedName(file.name);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to extract text");
    } finally {
      setLoading(false);
    }
  }, [onFileExtracted, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }, [handleFile]);

  let zoneClass = styles.zone;
  if (dragging) zoneClass += ` ${styles.zoneDragOver}`;
  if (loading) zoneClass += ` ${styles.zoneLoading}`;
  if (uploadedName && !loading) zoneClass += ` ${styles.zoneSuccess}`;

  return (
    <div
      className={zoneClass}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
    >
      {loading
        ? "Extracting text..."
        : uploadedName
          ? `Loaded: ${uploadedName}`
          : "Drop .txt, .pdf, or .docx here, or click to browse"
      }
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf,.docx"
        className={styles.hidden}
        onChange={handleInputChange}
      />
    </div>
  );
}
