"use client";

import styles from "./RuleToggle.module.css";

interface RuleToggleProps {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function RuleToggle({ label, desc, checked, onChange }: RuleToggleProps) {
  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.toggle}
        data-checked={checked}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        aria-label={label}
      />
      <div className={styles.text}>
        <div className={styles.label}>{label}</div>
        <div className={styles.desc}>{desc}</div>
      </div>
    </div>
  );
}
