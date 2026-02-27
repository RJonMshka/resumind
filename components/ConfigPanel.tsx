"use client";

import type { Rule, ProviderId } from "@/types";
import { PROVIDERS } from "@/lib/providers";
import RuleToggle from "./RuleToggle";
import styles from "./ConfigPanel.module.css";

interface ConfigPanelProps {
  provider: ProviderId;
  onProviderChange: (provider: ProviderId) => void;
  model: string;
  onModelChange: (model: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  rules: Rule[];
  onRuleToggle: (id: string, checked: boolean) => void;
  canRun: boolean;
  loading: boolean;
  onRun: () => void;
}

export default function ConfigPanel({
  provider,
  onProviderChange,
  model,
  onModelChange,
  apiKey,
  onApiKeyChange,
  rules,
  onRuleToggle,
  canRun,
  loading,
  onRun,
}: ConfigPanelProps) {
  const currentProvider = PROVIDERS.find((p) => p.id === provider);
  const models = currentProvider?.models ?? [];

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as ProviderId;
    onProviderChange(newProvider);
    const newModels = PROVIDERS.find((p) => p.id === newProvider)?.models ?? [];
    if (newModels.length > 0) {
      onModelChange(newModels[0]);
    }
  };

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>Resumind</h1>

      <div className={styles.group}>
        <label className={styles.label}>Provider</label>
        <select
          className={styles.select}
          value={provider}
          onChange={handleProviderChange}
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Model</label>
        <select
          className={styles.select}
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
        >
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>API Key</label>
        <input
          type="password"
          className={styles.input}
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
        />
      </div>

      <div className={styles.rulesSection}>
        <div className={styles.label}>Rules</div>
        {rules.map((rule) => (
          <RuleToggle
            key={rule.id}
            label={rule.label}
            desc={rule.desc}
            checked={rule.on}
            onChange={(checked) => onRuleToggle(rule.id, checked)}
          />
        ))}
      </div>

      <button
        type="button"
        className={styles.runButton}
        disabled={!canRun || loading}
        onClick={onRun}
      >
        {loading ? "Running..." : "Run Analysis"}
      </button>
    </div>
  );
}
