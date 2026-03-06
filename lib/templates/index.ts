import type { TemplateId } from "@/types";

export interface TemplateOption {
  id: TemplateId;
  label: string;
  description: string;
}

export const TEMPLATES: TemplateOption[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Traditional single-column layout with clean section dividers",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Two-column layout with dark sidebar for contact and skills",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Clean design with generous whitespace and subtle typography",
  },
  {
    id: "executive",
    label: "Executive",
    description: "Bold headers and formal structure for senior positions",
  },
];
