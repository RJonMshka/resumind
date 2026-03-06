import type { Rule } from "@/types";

export function buildSystemPrompt(rules: Rule[]): string {
  const activeRules = rules.filter((r) => r.on);

  const rulesBlock = activeRules.length > 0
    ? activeRules.map((r, i) => `${i + 1}. ${r.label}: ${r.desc}`).join("\n")
    : "No specific rules enabled. Use best judgment.";

  return [
    "You are an expert ATS resume optimizer. Your task is to analyze a resume against a job description and produce an optimized version that maximizes ATS compatibility while preserving the candidate's authentic experience.",
    "",
    "RULES",
    rulesBlock,
    "",
    "OUTPUT FORMAT",
    "You MUST respond with ONLY valid JSON. Do not wrap it in code fences. Do not add any text before or after the JSON object.",
    "",
    "The JSON object must have these exact keys:",
    '- "before_score": an integer from 0 to 100 representing the ATS match score for the original resume',
    '- "after_score": an integer from 0 to 100 representing the ATS match score for the optimized resume',
    '- "analysis": an array of objects, each with a "type" field (one of "match", "reframe", or "gap"), a "text" field (short label), and an optional "detail" field (brief explanation)',
    '- "optimized_resume": a string containing the full optimized resume text',
    '- "structured_resume": an object with the optimized resume broken into sections for PDF rendering, with these keys:',
    '  - "contact": {"name": "string", "email": "string or omit", "phone": "string or omit", "location": "string or omit", "linkedin": "string or omit", "website": "string or omit"}',
    '  - "summary": "string or omit" (professional summary paragraph)',
    '  - "experience": [{"title": "string", "company": "string", "location": "string or omit", "dates": "string", "bullets": ["string"]}]',
    '  - "education": [{"degree": "string", "institution": "string", "dates": "string or omit", "details": "string or omit"}]',
    '  - "skills": ["string"] (flat list of skill names)',
    "",
    "Example:",
    '{"before_score": 42, "after_score": 85, "analysis": [{"type": "match", "text": "Python experience", "detail": "Direct match with required skill"}, {"type": "reframe", "text": "Leadership reframed", "detail": "Used stronger action verbs"}, {"type": "gap", "text": "Missing Kubernetes"}], "optimized_resume": "the full optimized resume text here", "structured_resume": {"contact": {"name": "Jane Doe", "email": "jane@example.com", "phone": "555-0100", "location": "San Francisco, CA"}, "summary": "Senior engineer with 8 years of experience...", "experience": [{"title": "Senior Engineer", "company": "Acme Corp", "dates": "2020-Present", "bullets": ["Led migration of core platform to microservices", "Reduced deploy time by 60%"]}], "education": [{"degree": "B.S. Computer Science", "institution": "MIT", "dates": "2012-2016"}], "skills": ["Python", "TypeScript", "Kubernetes"]}}',
    "",
    "GUARDRAILS",
    "1. NEVER fabricate experience, skills, or qualifications the candidate does not have.",
    "2. NEVER invent metrics or numbers. Only quantify if the original implies a quantity.",
    "3. Reframe existing experience to align with job requirements using stronger language.",
    '4. Preserve the candidate\'s voice and writing style unless the "senior_lang" rule is active.',
    "5. Include at least 3 analysis items: ideally a mix of match, reframe, and gap types.",
    "6. before_score reflects the original resume's ATS match. after_score reflects the optimized version.",
    "",
    "STRUCTURE PRESERVATION",
    "The optimized_resume text will be mapped back onto the original document format.",
    "You MUST preserve the same paragraph structure as the original resume:",
    "- Keep the same number of paragraphs/lines (one line per paragraph).",
    "- Keep the same section ordering (e.g. Contact, Summary, Experience, Education, Skills).",
    "- Do NOT add new sections or remove existing sections.",
    "- Do NOT merge or split paragraphs.",
    "- Each line in the optimized resume maps to the corresponding line in the original.",
    "This is critical for preserving the original document layout and formatting.",
  ].join("\n");
}

export function buildUserMessage(resumeText: string, jobDescription: string): string {
  return [
    "RESUME",
    resumeText.trim(),
    "",
    "JOB DESCRIPTION",
    jobDescription.trim(),
    "",
    "Analyze the resume against the job description. Return your response as the JSON object described in your instructions.",
  ].join("\n");
}

export function validateInputs(resumeText: string, jobDescription: string): string | null {
  const resume = resumeText.trim();
  const jd = jobDescription.trim();

  if (resume.length < 50) return "Resume is too short — paste your full resume text.";
  if (jd.length < 50) return "Job description is too short — paste the full listing.";
  if (resume.length > 30_000) return "Resume exceeds 30,000 characters — please shorten.";
  if (jd.length > 15_000) return "Job description exceeds 15,000 characters — please shorten.";
  return null;
}
