"use client";

import type { OptimizationResult, AnalysisType } from "@/types";
import styles from "./AnalysisPanel.module.css";

interface AnalysisPanelProps {
  result: OptimizationResult | null;
  onExport: () => void;
}

function scoreColor(score: number): string {
  if (score >= 75) return "var(--green)";
  if (score >= 50) return "var(--orange)";
  return "var(--red)";
}

const DOT_COLORS: Record<AnalysisType, string> = {
  match: "var(--green)",
  reframe: "var(--accent)",
  gap: "var(--red)",
};

export default function AnalysisPanel({ result, onExport }: AnalysisPanelProps) {
  if (!result) {
    return (
      <div className={styles.panel}>
        <div className={styles.heading}>Analysis</div>
        <div className={styles.empty}>
          Run an analysis to see scores and insights here.
        </div>
      </div>
    );
  }

  const delta = result.after_score - result.before_score;

  return (
    <div className={styles.panel}>
      <div className={styles.heading}>Analysis</div>

      <div className={styles.scoreSection}>
        <div className={styles.scoreBox}>
          <div className={styles.scoreValue} style={{ color: scoreColor(result.before_score) }}>
            {result.before_score}
          </div>
          <div className={styles.scoreLabel}>Before</div>
        </div>
        <div className={styles.scoreBox}>
          <div className={styles.scoreValue} style={{ color: scoreColor(result.after_score) }}>
            {result.after_score}
          </div>
          <div className={styles.scoreLabel}>After</div>
        </div>
      </div>

      {delta > 0 && (
        <div className={styles.delta} style={{ color: "var(--green)" }}>
          +{delta} points
        </div>
      )}

      <div className={styles.analysisList}>
        {result.analysis.map((item, i) => (
          <div key={i} className={styles.analysisItem}>
            <div
              className={styles.dot}
              style={{ background: DOT_COLORS[item.type] }}
            />
            <div>
              <div className={styles.itemText}>{item.text}</div>
              {item.detail && (
                <div className={styles.itemDetail}>{item.detail}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.dot} style={{ background: "var(--green)" }} />
          <span>Match</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.dot} style={{ background: "var(--accent)" }} />
          <span>Reframed</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.dot} style={{ background: "var(--red)" }} />
          <span>Gap</span>
        </div>
      </div>

      <button
        type="button"
        className={styles.exportButton}
        onClick={onExport}
      >
        Export Optimized Resume
      </button>
    </div>
  );
}
