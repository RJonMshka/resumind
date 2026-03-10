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
    desc: "Never invent experience, skills, or qualifications. Every claim must trace to a specific line in the original. If a job requirement has no match, flag it as a gap instead of implying it",
    on: true,
  },
  {
    id: "quantify",
    label: "Quantify Impact",
    desc: "Reframe achievements to highlight scope and impact. Only add a specific number if the original text contains it. Use ranges (e.g., multiple teams) but never invent precise figures",
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
  {
    id: "action_verbs",
    label: "Strong Action Verbs",
    desc: "Replace weak verbs (helped, worked on, was responsible for) with precise action verbs (developed, implemented, delivered) while preserving meaning",
    on: true,
  },
  {
    id: "keyword_density",
    label: "Keyword Balance",
    desc: "Distribute keywords across summary, skills, and bullets rather than clustering. Avoid repeating any keyword more than 4 times",
    on: true,
  },
  {
    id: "gap_flag",
    label: "Flag Gaps",
    desc: "When the JD requires something not in the resume, report it as a gap in the analysis. Do NOT attempt to cover the gap by implying the candidate has the skill",
    on: true,
  },
  {
    id: "bullet_format",
    label: "Impact Bullets",
    desc: "Structure each bullet as: Action Verb + Specific Task + Result/Impact. Keep bullets to 1-2 lines maximum",
    on: false,
  },
  {
    id: "section_order",
    label: "ATS Section Order",
    desc: "Ensure standard ATS-friendly section ordering: Contact, Summary, Experience, Education, Skills. Uses conventional section headers",
    on: false,
  },
];
