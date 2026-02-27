"use client";

import UploadZone from "./UploadZone";
import styles from "./Workspace.module.css";

type Tab = "resume" | "jd" | "output";

interface WorkspaceProps {
  resumeText: string;
  onResumeChange: (text: string) => void;
  jobDescription: string;
  onJobDescriptionChange: (text: string) => void;
  optimizedResume: string | null;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  error: string | null;
  onUploadError: (message: string) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "resume", label: "Resume" },
  { id: "jd", label: "Job Description" },
  { id: "output", label: "Output" },
];

export default function Workspace({
  resumeText,
  onResumeChange,
  jobDescription,
  onJobDescriptionChange,
  optimizedResume,
  activeTab,
  onTabChange,
  error,
  onUploadError,
}: WorkspaceProps) {
  return (
    <div className={styles.workspace}>
      <div className={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ""}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === "resume" && (
          <>
            <UploadZone
              onTextExtracted={onResumeChange}
              onError={onUploadError}
            />
            {error && (
              <div className={styles.error}>{error}</div>
            )}
            <textarea
              className={styles.textarea}
              placeholder="Or paste your resume text here..."
              value={resumeText}
              onChange={(e) => onResumeChange(e.target.value)}
            />
          </>
        )}

        {activeTab === "jd" && (
          <textarea
            className={styles.textarea}
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
          />
        )}

        {activeTab === "output" && (
          <>
            {error && (
              <div className={styles.error}>{error}</div>
            )}
            {!optimizedResume && !error && (
              <div className={styles.placeholder}>
                Run an analysis to see your optimized resume here.
              </div>
            )}
            {optimizedResume && (
              <div className={styles.output}>{optimizedResume}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
