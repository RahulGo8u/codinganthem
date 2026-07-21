"use client";

import { useState, useEffect, useRef } from "react";
import type { Tiktoken } from "js-tiktoken/lite";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("token-counter")!;

// Pricing snapshot — bump this date whenever the table below is updated.
// Provider pricing changes frequently; this is a snapshot, not a live feed.
const PRICE_DATE = "2026-07-04";

const SAMPLE =
  "You are a helpful assistant. Summarize the following customer support ticket in two sentences, then suggest a next action for the support agent to take.";

type TokenizerKind = "o200k_base" | "cl100k_base" | "estimate";

interface ModelDef {
  id: string;
  label: string;
  provider: string;
  tokenizer: TokenizerKind;
  contextWindow: number;
  inputPrice: number; // USD per 1M input tokens
  outputPrice: number; // USD per 1M output tokens
}

const MODELS: ModelDef[] = [
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI", tokenizer: "o200k_base", contextWindow: 128_000, inputPrice: 2.5, outputPrice: 10 },
  { id: "gpt-4o-mini", label: "GPT-4o mini", provider: "OpenAI", tokenizer: "o200k_base", contextWindow: 128_000, inputPrice: 0.15, outputPrice: 0.6 },
  { id: "gpt-4.1", label: "GPT-4.1", provider: "OpenAI", tokenizer: "o200k_base", contextWindow: 1_000_000, inputPrice: 2, outputPrice: 8 },
  { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", provider: "OpenAI", tokenizer: "cl100k_base", contextWindow: 16_000, inputPrice: 0.5, outputPrice: 1.5 },
  { id: "claude-sonnet", label: "Claude Sonnet", provider: "Anthropic", tokenizer: "estimate", contextWindow: 200_000, inputPrice: 3, outputPrice: 15 },
  { id: "claude-haiku", label: "Claude Haiku", provider: "Anthropic", tokenizer: "estimate", contextWindow: 200_000, inputPrice: 1, outputPrice: 5 },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "Google", tokenizer: "estimate", contextWindow: 1_000_000, inputPrice: 0.3, outputPrice: 2.5 },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "Google", tokenizer: "estimate", contextWindow: 1_000_000, inputPrice: 1.25, outputPrice: 10 },
];

const PROVIDERS = ["OpenAI", "Anthropic", "Google"];

// Cache loaded tokenizers at module scope so switching models back and forth
// within a session never re-downloads the same rank data.
const encoderCache = new Map<string, Promise<Tiktoken>>();

async function getEncoder(tokenizer: "o200k_base" | "cl100k_base"): Promise<Tiktoken> {
  let cached = encoderCache.get(tokenizer);
  if (!cached) {
    cached = (async () => {
      const { Tiktoken } = await import("js-tiktoken/lite");
      const res = await fetch(`https://tiktoken.pages.dev/js/${tokenizer}.json`);
      if (!res.ok) throw new Error("Failed to download tokenizer data.");
      const ranks = await res.json();
      return new Tiktoken(ranks);
    })();
    encoderCache.set(tokenizer, cached);
  }
  return cached;
}

function formatCost(n: number): string {
  if (n <= 0) return "$0.00";
  if (n < 0.000001) return "< $0.000001";
  if (n < 1) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(2)}`;
}

export function TokenCounter() {
  const [input, setInput] = useState("");
  const [modelId, setModelId] = useState("gpt-4o");
  const [tokenCount, setTokenCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqRef = useRef(0);

  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!input.trim()) {
      setTokenCount(0);
      setError(undefined);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const id = ++reqRef.current;

      if (model.tokenizer === "estimate") {
        setTokenCount(Math.ceil(input.length / 4));
        setError(undefined);
        setLoading(false);
        return;
      }

      setLoading(true);
      getEncoder(model.tokenizer)
        .then((enc) => {
          if (id !== reqRef.current) return;
          setTokenCount(enc.encode(input).length);
          setError(undefined);
        })
        .catch(() => {
          if (id !== reqRef.current) return;
          setError("Failed to load the tokenizer — check your connection and try again.");
        })
        .finally(() => {
          if (id === reqRef.current) setLoading(false);
        });
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, model]);

  const contextPct = Math.min(100, (tokenCount / model.contextWindow) * 100);
  const promptCost = (tokenCount / 1_000_000) * model.inputPrice;
  const cost1k = promptCost * 1_000;
  const cost100k = promptCost * 100_000;

  const output = input.trim()
    ? `${tokenCount.toLocaleString()} tokens (${model.label}, ${model.tokenizer === "estimate" ? "estimate" : "exact"}) — ${contextPct.toFixed(1)}% of ${model.contextWindow.toLocaleString()} token context window`
    : "";

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      hideFileActions
      showClear
      inputLabel="Text"
      outputLabel="Result"
      inputPlaceholder="Paste your prompt or text here..."
      outputPlaceholder="Paste text above to see the token count and cost estimate..."
      badges={<span className="badge badge-neutral">Client-side</span>}
      extraActions={
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <div className="flex flex-col gap-2 w-full">
          {PROVIDERS.map((provider) => (
            <div key={provider} className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] w-16 shrink-0">
                {provider}
              </span>
              {MODELS.filter((m) => m.provider === provider).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModelId(m.id)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                    modelId === m.id
                      ? "bg-[#6366f1]/15 text-[#6366f1] border-[#6366f1]/40"
                      : "text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      }
      outputContent={
        input.trim() ? (
          <div className="p-4 flex flex-col gap-5">
            {/* Token count */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-semibold text-[var(--text-primary)] mono">
                {loading ? "…" : tokenCount.toLocaleString()}
              </span>
              <span className="text-sm text-[var(--text-muted)]">tokens</span>
              <span className={`badge ${model.tokenizer === "estimate" ? "" : "badge-success"}`} style={model.tokenizer === "estimate" ? { color: "#f59e0b", background: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.4)" } : undefined}>
                {model.tokenizer === "estimate" ? "Estimate" : "Exact"}
              </span>
            </div>

            {/* Context window bar */}
            <div className="result-card flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Context window used</span>
                <span className="mono">
                  {tokenCount.toLocaleString()} / {model.contextWindow.toLocaleString()} ({contextPct.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                  style={{ width: `${contextPct}%` }}
                />
              </div>
            </div>

            {/* Cost for this prompt */}
            <div className="result-card flex flex-col gap-1">
              <span className="text-xs text-[var(--text-muted)]">Cost for this prompt (input only)</span>
              <span className="text-lg font-semibold text-[var(--text-primary)] mono">{formatCost(promptCost)}</span>
            </div>

            {/* Cost at volume */}
            <div className="result-card flex flex-col gap-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                At volume (input cost only)
              </span>
              <div className="flex gap-6">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-[var(--text-muted)]">1,000 requests</span>
                  <span className="text-sm font-medium text-[var(--text-primary)] mono">{formatCost(cost1k)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-[var(--text-muted)]">100,000 requests</span>
                  <span className="text-sm font-medium text-[var(--text-primary)] mono">{formatCost(cost100k)}</span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                Prices as of {PRICE_DATE}, sourced from public provider pricing pages. Output-token cost isn't included since response length can't be known from a prompt alone. Verify against your provider's billing dashboard before budgeting.
              </p>
            </div>

            {model.tokenizer === "estimate" && (
              <p className="text-[10px] text-[#f59e0b] leading-relaxed">
                {model.provider} doesn't publish a public tokenizer, so this count is a character-based approximation (~4 characters per token) rather than an exact count.
              </p>
            )}
          </div>
        ) : undefined
      }
    />
  );
}
