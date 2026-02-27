import type { Rule } from "@/types";

export const DEFAULT_RULES: Rule[] = [
  {
    id: "preserve_voice",
    label: "Preserve Voice",
    desc: "Keep the candidate's original tone and writing style",
    on: true,
  },
  {
    id: "no_fabricate",
    label: "No Fabrication",
    desc: "Never invent experience, skills, or qualifications",
    on: true,
  },
  {
    id: "quantify",
    label: "Quantify Impact",
    desc: "Add metrics and numbers where the original implies them",
    on: true,
  },
  {
    id: "senior_lang",
    label: "Senior Language",
    desc: "Use leadership-level phrasing (led, architected, drove)",
    on: false,
  },
  {
    id: "ats_keywords",
    label: "ATS Keywords",
    desc: "Mirror key terms from the job description into the resume",
    on: true,
  },
  {
    id: "concise",
    label: "Concise",
    desc: "Remove filler words and tighten bullet points",
    on: false,
  },
];
