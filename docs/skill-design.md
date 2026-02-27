# Skill: Design System & Components

**Purpose**: Visual design, layout, CSS variables, CSS Modules, and all component structure. Covers `app/globals.css` and every file in `components/`.

---

## Design Tokens (CSS Variables)

All colors, spacing, and typography are defined as CSS custom properties on `:root` in `app/globals.css`.

```css
/* app/globals.css */

:root {
  /* Colors — dark theme */
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --bg-tertiary: #1e1e1e;
  --bg-hover: #252525;

  --text-primary: #f0f0f0;
  --text-secondary: #a0a0a0;
  --text-muted: #666666;

  --accent: #6c63ff;
  --accent-hover: #5a52d9;
  --accent-muted: rgba(108, 99, 255, 0.15);

  --green: #4caf50;
  --orange: #ff9800;
  --red: #f44336;

  --border: #2a2a2a;
  --border-focus: #6c63ff;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "SF Mono", "Fira Code", "Fira Mono", monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

### Global Reset (in globals.css)

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--text-primary);
  background: var(--bg-primary);
  -webkit-font-smoothing: antialiased;
}

button {
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  border: none;
  background: none;
  color: inherit;
}

input,
textarea,
select {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-md);
  outline: none;
  transition: border-color var(--transition-fast);
}

input:focus,
textarea:focus,
select:focus {
  border-color: var(--border-focus);
}

textarea {
  resize: vertical;
}
```

---

## Layout — 3-Column Grid

`ATSOptimizer.tsx` is the shell. It uses CSS Grid for the 3-column layout:

```
┌──────────────┬───────────────────────────┬──────────────┐
│  ConfigPanel │       Workspace           │ AnalysisPanel│
│  (280px)     │       (1fr)               │ (300px)      │
│              │                           │              │
│  - Provider  │  [Resume] [JD] [Output]   │  - Scores    │
│  - Model     │                           │  - Analysis  │
│  - API Key   │  ┌─────────────────────┐  │    items     │
│  - Rules     │  │                     │  │              │
│              │  │   Active tab area   │  │              │
│              │  │                     │  │              │
│  [Run]       │  └─────────────────────┘  │  [Export]    │
└──────────────┴───────────────────────────┴──────────────┘
```

### ATSOptimizer CSS Module

```css
/* components/ATSOptimizer.module.css */

.container {
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  height: 100vh;
  overflow: hidden;
}

.progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--accent);
  animation: progress 2s ease-in-out infinite;
  z-index: 100;
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}
```

---

## Component Specifications

### ConfigPanel (left column)

```
Layout: Vertical stack, padding var(--space-lg)
Background: var(--bg-secondary)
Border-right: 1px solid var(--border)
```

Elements top to bottom:
1. **App title** — `<h1>` styled as `text-lg`, `font-weight: 600`
2. **Provider selector** — `<select>` with Anthropic/OpenAI/Groq options
3. **Model selector** — `<select>` that updates based on selected provider
4. **API Key input** — `<input type="password">` with placeholder "sk-..."
5. **Rules section** — header + list of `RuleToggle` components
6. **Run button** — full width, accent bg, disabled state when inputs incomplete

```css
/* components/ConfigPanel.module.css */

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  height: 100vh;
}

.title {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--space-sm);
}

.label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
}

.select,
.input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.runButton {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: var(--accent);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: background var(--transition-fast);
  margin-top: auto;
}

.runButton:hover:not(:disabled) {
  background: var(--accent-hover);
}

.runButton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

### RuleToggle (leaf component)

A single row with a toggle switch, label, and description.

```typescript
// components/RuleToggle.tsx — props
interface RuleToggleProps {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}
```

```css
/* components/RuleToggle.module.css */

.row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
}

.toggle {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  flex-shrink: 0;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.toggle[data-checked="true"] {
  background: var(--accent);
  border-color: var(--accent);
}

.toggle::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  transition: transform var(--transition-fast);
}

.toggle[data-checked="true"]::after {
  transform: translateX(16px);
}

.label {
  font-size: var(--text-sm);
  font-weight: 500;
}

.desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
}
```

### Workspace (center column)

Tab bar at top with 3 tabs: **Resume**, **Job Description**, **Output**.

```typescript
// components/Workspace.tsx — props
interface WorkspaceProps {
  resumeText: string;
  onResumeChange: (text: string) => void;
  jobDescription: string;
  onJobDescriptionChange: (text: string) => void;
  optimizedResume: string | null;
  activeTab: "resume" | "jd" | "output";
  onTabChange: (tab: "resume" | "jd" | "output") => void;
}
```

Tab behavior:
- **Resume tab**: `<textarea>` + `UploadZone` for drag-drop
- **JD tab**: `<textarea>` only (paste job description)
- **Output tab**: read-only `<textarea>` showing `optimizedResume`, empty state if null

```css
/* components/Workspace.module.css */

.workspace {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
}

.tabBar {
  display: flex;
  border-bottom: 1px solid var(--border);
  padding: 0 var(--space-md);
}

.tab {
  padding: var(--space-md) var(--space-lg);
  font-size: var(--text-sm);
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.tab:hover {
  color: var(--text-secondary);
}

.tabActive {
  color: var(--text-primary);
  border-bottom-color: var(--accent);
}

.content {
  flex: 1;
  padding: var(--space-lg);
  overflow-y: auto;
}

.textarea {
  width: 100%;
  height: 100%;
  min-height: 300px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.6;
  resize: none;
}
```

### UploadZone (leaf component)

Drag-and-drop area with file input fallback.

```typescript
// components/UploadZone.tsx — props
interface UploadZoneProps {
  onTextExtracted: (text: string) => void;
  onError: (message: string) => void;
}
```

States:
- **Idle**: dashed border, muted text "Drop .txt or .pdf here, or click to browse"
- **Drag over**: accent border, accent muted background
- **Loading**: "Extracting text..." with subtle pulse animation

```css
/* components/UploadZone.module.css */

.zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.zone:hover,
.zoneDragOver {
  border-color: var(--accent);
  background: var(--accent-muted);
}

.zoneLoading {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.hidden {
  display: none;
}
```

### AnalysisPanel (right column)

```
Layout: Vertical stack, padding var(--space-lg)
Background: var(--bg-secondary)
Border-left: 1px solid var(--border)
```

Elements top to bottom:
1. **Score display** — before/after scores with color coding
2. **Analysis items** — scrollable list with colored dot indicators
3. **Export button** — bottom, downloads `resume_optimized.txt`

Score color logic:
```typescript
function scoreColor(score: number): string {
  if (score >= 75) return "var(--green)";
  if (score >= 50) return "var(--orange)";
  return "var(--red)";
}
```

Analysis dot colors:
- `match` → `var(--green)`
- `reframe` → `var(--accent)`
- `gap` → `var(--red)`

```css
/* components/AnalysisPanel.module.css */

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--bg-secondary);
  border-left: 1px solid var(--border);
  overflow-y: auto;
  height: 100vh;
}

.scoreSection {
  display: flex;
  gap: var(--space-lg);
  justify-content: center;
}

.scoreBox {
  text-align: center;
}

.scoreValue {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.scoreLabel {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: var(--space-xs);
}

.analysisItem {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.itemText {
  font-size: var(--text-sm);
  font-weight: 500;
}

.itemDetail {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: var(--space-xs);
}

.exportButton {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  transition: background var(--transition-fast);
  margin-top: auto;
}

.exportButton:hover {
  background: var(--bg-hover);
}
```

---

## Export Functionality

Download optimized resume as plain text via Blob URL:

```typescript
function handleExport(text: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume_optimized.txt";
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## State Management

All state lives in `ATSOptimizer.tsx`. No context providers, no external state libraries. Props flow down, callbacks flow up.

```typescript
// ATSOptimizer.tsx — core state shape
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
```

---

## Hard Rules

- **No component libraries** — no Material UI, Chakra, Radix, Shadcn, etc.
- **No Tailwind** — CSS Modules + global CSS variables only
- **Dark theme only** — no light mode toggle (unless explicitly requested)
- Every component uses a `.module.css` file for scoped styles
- Global styles go in `app/globals.css` — only resets, variables, and base element styles
- All interactive elements must have visible focus states for accessibility
- The progress bar is the **only** loading indicator — no spinners
- Score colors are computed inline using the `scoreColor` helper — not via CSS classes
- The 3-column layout does not collapse on smaller screens (unless responsive design is explicitly requested)
