"use client";

import { useState, useCallback } from "react";
import type { ProviderId, Rule, OptimizationResult } from "@/types";
import { DEFAULT_RULES } from "@/lib/rules";
import { callLLM } from "@/lib/llm";
import { buildSystemPrompt, buildUserMessage, validateInputs } from "@/lib/prompt";
import { parseOptimizationResult } from "@/lib/parser";
import ConfigPanel from "./ConfigPanel";
import Workspace from "./Workspace";
import AnalysisPanel from "./AnalysisPanel";
import styles from "./ATSOptimizer.module.css";

export default function ATSOptimizer() {
  const [provider, setProvider] = useState<ProviderId>("anthropic");
  const [model, setModel] = useState<string>("claude-opus-4-6");
  const [apiKey, setApiKey] = useState<string>("");
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [resumeText, setResumeText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"resume" | "jd" | "output">("resume");

  const canRun = resumeText.trim().length > 0
    && jobDescription.trim().length > 0
    && apiKey.trim().length > 0
    && !loading;

  const handleRuleToggle = useCallback((id: string, checked: boolean) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, on: checked } : rule))
    );
  }, []);

  const handleRun = useCallback(async () => {
    const inputError = validateInputs(resumeText, jobDescription);
    if (inputError) {
      setError(inputError);
      setActiveTab("output");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const systemPrompt = buildSystemPrompt(rules);
      const userMessage = buildUserMessage(resumeText, jobDescription);
      const raw = await callLLM({
        provider,
        apiKey,
        model,
        systemPrompt,
        userMessage,
      });
      const parsed = parseOptimizationResult(raw);
      setResult(parsed);
      setActiveTab("output");
    } catch (err: unknown) {
      let message = "An unknown error occurred";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        message = String((err as { message: unknown }).message);
      }
      setError(message);
      setActiveTab("output");
    } finally {
      setLoading(false);
    }
  }, [provider, apiKey, model, rules, resumeText, jobDescription]);

  const handleUploadError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleExport = useCallback(() => {
    if (!result?.optimized_resume) return;
    const blob = new Blob([result.optimized_resume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume_optimized.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className={styles.container}>
      {loading && <div className={styles.progress} />}
      <ConfigPanel
        provider={provider}
        onProviderChange={setProvider}
        model={model}
        onModelChange={setModel}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        rules={rules}
        onRuleToggle={handleRuleToggle}
        canRun={canRun}
        loading={loading}
        onRun={handleRun}
      />
      <Workspace
        resumeText={resumeText}
        onResumeChange={setResumeText}
        jobDescription={jobDescription}
        onJobDescriptionChange={setJobDescription}
        optimizedResume={result?.optimized_resume ?? null}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        error={error}
        onUploadError={handleUploadError}
      />
      <AnalysisPanel
        result={result}
        onExport={handleExport}
      />
    </div>
  );
}
