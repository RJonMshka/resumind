"use client";

import { useState, useCallback, useEffect } from "react";
import type { TemplateId } from "@/types";
import { TEMPLATES } from "@/lib/templates";
import styles from "./TemplateSelector.module.css";

interface TemplateSelectorProps {
  open: boolean;
  exporting: boolean;
  onSelect: (templateId: TemplateId) => void;
  onClose: () => void;
}

export default function TemplateSelector({
  open,
  exporting,
  onSelect,
  onClose,
}: TemplateSelectorProps) {
  const [selected, setSelected] = useState<TemplateId>("classic");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !exporting) {
        onClose();
      }
    },
    [onClose, exporting]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !exporting) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.title}>Export as PDF</div>
        <div className={styles.subtitle}>
          Choose a template for your optimized resume
        </div>

        <div className={styles.grid}>
          {TEMPLATES.map((tmpl) => {
            const isSelected = selected === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                onClick={() => setSelected(tmpl.id)}
                disabled={exporting}
              >
                <div className={`${styles.radio} ${isSelected ? styles.radioSelected : ""}`}>
                  {isSelected && <div className={styles.radioInner} />}
                </div>
                <div>
                  <div className={styles.optionLabel}>{tmpl.label}</div>
                  <div className={styles.optionDesc}>{tmpl.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={exporting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.exportButton}
            onClick={() => onSelect(selected)}
            disabled={exporting}
          >
            {exporting ? "Generating PDF..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
