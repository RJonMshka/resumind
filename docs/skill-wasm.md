# Skill: Go / WASM Resume Optimizer

**Purpose**: Standalone Go CLI tool that orchestrates resume optimization — parsing input, calling an LLM provider, and returning structured output. Compiles to both a native binary and a WASM module for browser embedding.

---

## Architecture Overview

Two-phase build:

1. **Phase 1 — Go CLI** (`resumind-cli`): Native binary. Accepts resume + JD + rules + API config as input, returns optimized resume + analysis as JSON.
2. **Phase 2 — WASM module** (`resumind.wasm`): Same core logic compiled to `GOOS=js GOARCH=wasm`. Callable from JavaScript via the Go WASM bridge.

Both phases share the same `core/` package. The CLI and WASM entry points are thin wrappers.

---

## Directory Structure

```
resumind-go/
├── cmd/
│   ├── cli/
│   │   └── main.go           # CLI entry point (Phase 1)
│   └── wasm/
│       └── main.go           # WASM entry point (Phase 2)
├── core/
│   ├── types.go              # shared types (mirrors TS types)
│   ├── rules.go              # default rules + rule filtering
│   ├── prompt.go             # system prompt builder
│   ├── parser.go             # JSON response parser + validation
│   ├── llm.go                # unified LLM caller (HTTP)
│   └── providers.go          # provider configs + endpoints
├── core_test/
│   ├── prompt_test.go
│   ├── parser_test.go
│   ├── rules_test.go
│   └── providers_test.go
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

---

## Core Types

```go
// core/types.go

package core

type RuleID string

const (
    RulePreserveVoice RuleID = "preserve_voice"
    RuleNoFabricate   RuleID = "no_fabricate"
    RuleQuantify      RuleID = "quantify"
    RuleSeniorLang    RuleID = "senior_lang"
    RuleATSKeywords   RuleID = "ats_keywords"
    RuleConcise       RuleID = "concise"
)

type Rule struct {
    ID    RuleID `json:"id"`
    Label string `json:"label"`
    Desc  string `json:"desc"`
    On    bool   `json:"on"`
}

type ProviderID string

const (
    ProviderAnthropic ProviderID = "anthropic"
    ProviderOpenAI    ProviderID = "openai"
    ProviderGroq      ProviderID = "groq"
)

type Provider struct {
    ID     ProviderID `json:"id"`
    Label  string     `json:"label"`
    Models []string   `json:"models"`
}

type AnalysisType string

const (
    AnalysisMatch   AnalysisType = "match"
    AnalysisReframe AnalysisType = "reframe"
    AnalysisGap     AnalysisType = "gap"
)

type AnalysisItem struct {
    Type   AnalysisType `json:"type"`
    Text   string       `json:"text"`
    Detail string       `json:"detail,omitempty"`
}

type OptimizationResult struct {
    BeforeScore     int            `json:"before_score"`
    AfterScore      int            `json:"after_score"`
    Analysis        []AnalysisItem `json:"analysis"`
    OptimizedResume string         `json:"optimized_resume"`
}

type LLMConfig struct {
    Provider ProviderID `json:"provider"`
    APIKey   string     `json:"api_key"`
    Model    string     `json:"model"`
    MaxTokens int      `json:"max_tokens,omitempty"`
}

type OptimizeRequest struct {
    Resume string    `json:"resume"`
    JD     string    `json:"job_description"`
    Rules  []Rule    `json:"rules"`
    LLM    LLMConfig `json:"llm"`
}

type LLMError struct {
    Code      string `json:"code"`      // "auth", "rate_limit", "context_length", "network", "unknown"
    Message   string `json:"message"`
    Retryable bool   `json:"retryable"`
}

func (e *LLMError) Error() string {
    return e.Message
}
```

---

## CLI Entry Point (Phase 1)

```go
// cmd/cli/main.go

package main

import (
    "encoding/json"
    "fmt"
    "io"
    "os"

    "resumind-go/core"
)

// Usage:
//   resumind-cli < input.json > output.json
//   resumind-cli -f input.json
//   cat input.json | resumind-cli

func main() {
    input, err := readInput()
    if err != nil {
        fatal("Failed to read input: %v", err)
    }

    var req core.OptimizeRequest
    if err := json.Unmarshal(input, &req); err != nil {
        fatal("Invalid JSON input: %v", err)
    }

    if msg := core.ValidateInputs(req.Resume, req.JD); msg != "" {
        fatal("Validation failed: %s", msg)
    }

    result, err := core.Optimize(req)
    if err != nil {
        fatal("Optimization failed: %v", err)
    }

    enc := json.NewEncoder(os.Stdout)
    enc.SetIndent("", "  ")
    enc.Encode(result)
}

func readInput() ([]byte, error) {
    // Check for -f flag or read from stdin
    if len(os.Args) > 2 && os.Args[1] == "-f" {
        return os.ReadFile(os.Args[2])
    }
    return io.ReadAll(os.Stdin)
}

func fatal(format string, args ...any) {
    fmt.Fprintf(os.Stderr, format+"\n", args...)
    os.Exit(1)
}
```

---

## Core Optimize Function

```go
// core/llm.go (public entry point)

func Optimize(req OptimizeRequest) (*OptimizationResult, error) {
    if req.LLM.MaxTokens == 0 {
        req.LLM.MaxTokens = 4096
    }

    systemPrompt := BuildSystemPrompt(req.Rules)
    userMessage := BuildUserMessage(req.Resume, req.JD)

    raw, err := CallLLM(req.LLM, systemPrompt, userMessage)
    if err != nil {
        return nil, err
    }

    result, err := ParseOptimizationResult(raw)
    if err != nil {
        return nil, fmt.Errorf("failed to parse LLM response: %w", err)
    }

    return result, nil
}
```

---

## LLM Caller

```go
// core/llm.go

func CallLLM(config LLMConfig, systemPrompt, userMessage string) (string, error) {
    switch config.Provider {
    case ProviderAnthropic:
        return callAnthropic(config, systemPrompt, userMessage)
    case ProviderOpenAI:
        return callOpenAICompat("https://api.openai.com/v1", config, systemPrompt, userMessage)
    case ProviderGroq:
        return callOpenAICompat("https://api.groq.com/openai/v1", config, systemPrompt, userMessage)
    default:
        return "", fmt.Errorf("unknown provider: %s", config.Provider)
    }
}

// callAnthropic uses the Anthropic Messages API
// callOpenAICompat handles both OpenAI and Groq (same shape, different base URL)

// Error normalization: map HTTP status to LLMError
// 401 -> auth, 429 -> rate_limit, 400 + "context" -> context_length
// Network errors -> network, everything else -> unknown
```

---

## WASM Entry Point (Phase 2)

```go
// cmd/wasm/main.go

package main

import (
    "encoding/json"
    "syscall/js"

    "resumind-go/core"
)

func main() {
    // Register the optimize function on the global JS object
    js.Global().Set("resumindOptimize", js.FuncOf(optimize))

    // Block forever — WASM module stays alive
    select {}
}

func optimize(this js.Value, args []js.Value) any {
    if len(args) < 1 {
        return errorResult("missing input argument")
    }

    inputJSON := args[0].String()

    var req core.OptimizeRequest
    if err := json.Unmarshal([]byte(inputJSON), &req); err != nil {
        return errorResult("invalid JSON: " + err.Error())
    }

    result, err := core.Optimize(req)
    if err != nil {
        return errorResult(err.Error())
    }

    out, _ := json.Marshal(result)
    return string(out)
}

func errorResult(msg string) string {
    out, _ := json.Marshal(map[string]string{"error": msg})
    return string(out)
}
```

### JS Integration (browser)

```javascript
// Load WASM in the browser
const go = new Go();
const result = await WebAssembly.instantiateStreaming(
  fetch("/resumind.wasm"),
  go.importObject
);
go.run(result.instance);

// Call the optimizer
const input = JSON.stringify({
  resume: "...",
  job_description: "...",
  rules: [...],
  llm: { provider: "openai", api_key: "sk-...", model: "gpt-4o" }
});

const output = window.resumindOptimize(input);
const parsed = JSON.parse(output);
```

---

## Makefile

```makefile
BINARY=resumind-cli
WASM=resumind.wasm

.PHONY: build wasm test clean

build:
	go build -o $(BINARY) ./cmd/cli

wasm:
	GOOS=js GOARCH=wasm go build -o $(WASM) ./cmd/wasm
	cp "$$(go env GOROOT)/misc/wasm/wasm_exec.js" .

test:
	go test ./core_test/... -v

clean:
	rm -f $(BINARY) $(WASM) wasm_exec.js
```

---

## Build Commands

```bash
# Phase 1: Native CLI
go build -o resumind-cli ./cmd/cli
echo '{"resume":"...","job_description":"...","rules":[],"llm":{"provider":"openai","api_key":"sk-...","model":"gpt-4o"}}' | ./resumind-cli

# Phase 2: WASM
GOOS=js GOARCH=wasm go build -o resumind.wasm ./cmd/wasm
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .
# Serve wasm_exec.js + resumind.wasm from a web server
```

---

## Prompt & Parser

The prompt builder and parser in Go must produce identical behavior to the TypeScript versions:

- `BuildSystemPrompt(rules []Rule) string` — same plain-text format as `lib/prompt.ts`, no markdown in output
- `BuildUserMessage(resume, jd string) string` — same structure
- `ParseOptimizationResult(raw string) (*OptimizationResult, error)` — same JSON extraction logic (strip code fences, find first `{`, last `}`)
- `ValidateInputs(resume, jd string) string` — same length checks (min 50 chars, resume max 30000, JD max 15000)

Do not diverge from the TypeScript logic. Port it faithfully.

---

## Testing

```go
// core_test/prompt_test.go — same cases as tests/lib/prompt.test.ts
// core_test/parser_test.go — same cases as tests/lib/parser.test.ts
// core_test/rules_test.go  — same cases as tests/lib/rules.test.ts

// Run with: go test ./core_test/... -v
// No tests for llm.go — same rationale as TypeScript (real HTTP calls)
```

---

## Hard Rules

- API keys are **never** logged, written to disk, or sent anywhere except the provider endpoint
- The CLI reads from stdin or a file and writes to stdout — no interactive prompts
- WASM module exposes a single function `resumindOptimize(jsonString) -> jsonString`
- All core logic lives in `core/` — entry points (`cmd/cli`, `cmd/wasm`) are thin wrappers
- No CGo — pure Go only, required for WASM compilation
- No third-party HTTP libraries — use `net/http` from the standard library
- No third-party JSON libraries — use `encoding/json` from the standard library
- Prompt output must not contain markdown syntax — same invariant as the TypeScript codebase
- The Go module must produce output that is **byte-compatible** with the TypeScript `OptimizationResult` JSON shape
- WASM build must not exceed 10 MB uncompressed — keep dependencies minimal
- Go version: 1.22+ (required for improved WASM support)
