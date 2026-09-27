"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Tiktoken } from "js-tiktoken/lite";
import { ToolShell } from "@/components/ToolShell";
import { getToolBySlug } from "@/lib/tools";
import {
  calculateCost,
  countTextStats,
  estimateTokens,
  formatCost,
  formatTokenCount,
} from "@/lib/tokenCounter";
import {
  getTokenModel,
  TOKEN_MODELS,
  TOKEN_PRICING_DATE,
  TOKEN_PROVIDERS,
  type TokenModel,
} from "@/lib/tokenModels";

const tool = getToolBySlug("token-counter")!;

const SAMPLE =
  "You are a helpful assistant. Summarize the following customer support ticket in two sentences, then suggest a next action for the support agent to take.";

const DEFAULT_COMPARE_IDS = [
  "gpt-5.6-terra",
  "claude-sonnet-5",
  "gemini-3.8-flash",
  "deepseek-flash",
];

const encoderCache = new Map<string, Promise<Tiktoken>>();

async function getEncoder(tokenizer: "o200k_base" | "cl100k_base"): Promise<Tiktoken> {
  let cached = encoderCache.get(tokenizer);
  if (!cached) {
    cached = (async () => {
      const { Tiktoken } = await import("js-tiktoken/lite");
      const ranks =
        tokenizer === "o200k_base"
          ? (await import("js-tiktoken/ranks/o200k_base")).default
          : (await import("js-tiktoken/ranks/cl100k_base")).default;
      return new Tiktoken(ranks);
    })().catch((error) => {
      encoderCache.delete(tokenizer);
      throw error;
    });
    encoderCache.set(tokenizer, cached);
  }
  return cached;
}

function tokensForModel(model: TokenModel, input: string, localTokenCount: number): number {
  if (model.tokenizer !== "estimate") return localTokenCount;
  return estimateTokens(input, model.estimateCharsPerToken ?? 4);
}

function numberFromInput(value: string, fallback: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(0, Math.round(parsed)));
}

export function TokenCounter() {
  const [input, setInput] = useState("");
  const [modelId, setModelId] = useState("gpt-5.6-terra");
  const [tokenCount, setTokenCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [provider, setProvider] =
    useState<(typeof TOKEN_PROVIDERS)[number]>("All");
  const [modelSearch, setModelSearch] = useState("");
  const [outputTokens, setOutputTokens] = useState(500);
  const [cachedPercent, setCachedPercent] = useState(0);
  const [batch, setBatch] = useState(false);
  const [requestsPerDay, setRequestsPerDay] = useState(1_000);
  const [compareIds, setCompareIds] = useState(DEFAULT_COMPARE_IDS);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef(0);

  const model = getTokenModel(modelId);
  const textStats = useMemo(() => countTextStats(input), [input]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const requestId = ++requestRef.current;

      if (!input) {
        setTokenCount(0);
        setError(undefined);
        setLoading(false);
        return;
      }

      if (model.tokenizer === "estimate") {
        setTokenCount(estimateTokens(input, model.estimateCharsPerToken ?? 4));
        setError(undefined);
        setLoading(false);
        return;
      }

      setLoading(true);
      getEncoder(model.tokenizer)
        .then((encoder) => {
          if (requestId !== requestRef.current) return;
          setTokenCount(encoder.encode(input).length);
          setError(undefined);
        })
        .catch(() => {
          if (requestId !== requestRef.current) return;
          setTokenCount(0);
          setError("Failed to load the local tokenizer. Please try again.");
        })
        .finally(() => {
          if (requestId === requestRef.current) setLoading(false);
        });
    }, 120);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, model]);

  const filteredModels = useMemo(() => {
    const query = modelSearch.trim().toLowerCase();
    return TOKEN_MODELS.filter(
      (candidate) =>
        (provider === "All" || candidate.provider === provider) &&
        (!query ||
          candidate.label.toLowerCase().includes(query) ||
          candidate.provider.toLowerCase().includes(query) ||
          candidate.id.includes(query))
    );
  }, [modelSearch, provider]);

  const activeBatch = batch && Boolean(model.batchDiscount);
  const activeCachedPercent = model.cachedInputPrice ? cachedPercent : 0;
  const estimate = calculateCost(model, {
    inputTokens: tokenCount,
    outputTokens,
    cachedPercent: activeCachedPercent,
    batch: activeBatch,
    requestsPerDay,
  });

  const totalTokens = tokenCount + outputTokens;
  const contextPercent = Math.min(100, (totalTokens / model.contextWindow) * 100);
  const remainingTokens = Math.max(0, model.contextWindow - totalTokens);
  const contextOverflow = totalTokens > model.contextWindow;
  const outputOverflow = outputTokens > model.maxOutput;
  const accuracyLabel =
    model.tokenizer === "estimate" ? "Estimated" : "Exact plain text";
  const sliderMax = Math.min(model.maxOutput, 32_000);
  const sliderCapped = model.maxOutput > 32_000;

  const comparedModels = useMemo(() => {
    const ids = compareIds.includes(model.id)
      ? compareIds
      : [model.id, ...compareIds].slice(0, 4);
    return ids
      .map((id) => getTokenModel(id))
      .map((candidate) => {
        const count = tokensForModel(candidate, input, tokenCount);
        const cost = calculateCost(candidate, {
          inputTokens: count,
          outputTokens: Math.min(outputTokens, candidate.maxOutput),
          cachedPercent,
          batch,
          requestsPerDay,
        });
        return {
          model: candidate,
          count,
          cost,
          fits: count + Math.min(outputTokens, candidate.maxOutput) <= candidate.contextWindow,
        };
      })
      .sort((a, b) => a.cost.costPerRequest - b.cost.costPerRequest);
  }, [
    batch,
    cachedPercent,
    compareIds,
    input,
    model.id,
    outputTokens,
    requestsPerDay,
    tokenCount,
  ]);

  const output = useMemo(() => {
    if (!input) return "";
    const lines = [
      `Token & cost analysis — ${model.label} (${model.provider})`,
      "",
      `Input tokens: ${tokenCount.toLocaleString()} (${accuracyLabel}${loading ? ", updating…" : ""})`,
      `Characters: ${textStats.characters.toLocaleString()}`,
      `Words: ${textStats.words.toLocaleString()}`,
      `Lines: ${textStats.lines.toLocaleString()}`,
      `Expected output tokens: ${outputTokens.toLocaleString()}`,
      `Context used: ${totalTokens.toLocaleString()} / ${model.contextWindow.toLocaleString()} (${contextPercent.toFixed(2)}%)`,
      contextOverflow
        ? `Over context by ${(totalTokens - model.contextWindow).toLocaleString()} tokens`
        : `Remaining context: ${remainingTokens.toLocaleString()} tokens`,
      outputOverflow
        ? `Requested output exceeds max ${model.maxOutput.toLocaleString()} tokens`
        : "",
      "",
      `Cached input: ${activeCachedPercent}%`,
      `Batch API: ${activeBatch ? "yes" : "no"}`,
      `Requests / day: ${requestsPerDay.toLocaleString()}`,
      `Input cost: ${formatCost(estimate.inputCost)}`,
      `Output cost: ${formatCost(estimate.outputCost)}`,
      `Per request: ${formatCost(estimate.costPerRequest)}`,
      `30-day total: ${formatCost(estimate.monthlyCost)}`,
      estimate.longContextPricing ? "Long-context pricing applies." : "",
      "",
      "Model comparison (lowest cost first):",
      ...comparedModels.map(
        (row) =>
          `- ${row.model.label} (${row.model.provider}): ${row.count.toLocaleString()} tokens · ${formatCost(row.cost.costPerRequest)}/req · ${formatCost(row.cost.monthlyCost)}/mo · fits=${row.fits ? "yes" : "no"}`
      ),
      "",
      `Prices checked ${TOKEN_PRICING_DATE}. Source: ${model.sourceUrl}`,
      model.note,
      "Forecast excludes taxes, tool-call fees, cache-write/storage charges, free tiers, and regional pricing.",
    ];
    return lines.filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n");
  }, [
    accuracyLabel,
    activeBatch,
    activeCachedPercent,
    comparedModels,
    contextOverflow,
    contextPercent,
    estimate.inputCost,
    estimate.longContextPricing,
    estimate.costPerRequest,
    estimate.monthlyCost,
    estimate.outputCost,
    input,
    loading,
    model.contextWindow,
    model.label,
    model.maxOutput,
    model.note,
    model.provider,
    model.sourceUrl,
    outputOverflow,
    outputTokens,
    remainingTokens,
    requestsPerDay,
    textStats.characters,
    textStats.lines,
    textStats.words,
    tokenCount,
    totalTokens,
  ]);

  function toggleCompare(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.length === 1 ? current : current.filter((item) => item !== id);
      }
      return [...current, id].slice(-4);
    });
  }

  return (
    <ToolShell
      tool={tool}
      input={input}
      output={output}
      onInputChange={setInput}
      error={error}
      hideFileActions
      showClear
      inputLabel="Prompt or text"
      outputLabel="Token & cost analysis"
      inputPlaceholder="Paste a prompt, document, code, or JSON here..."
      outputPlaceholder="Paste text above to analyze tokens, context fit, and API cost..."
      extraActions={
        <button
          type="button"
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Load sample
        </button>
      }
      options={
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-wrap items-center gap-1.5">
            {TOKEN_PROVIDERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setProvider(item)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                  provider === item
                    ? "bg-[#6366f1]/15 text-[var(--accent-text)] border-[#6366f1]/40"
                    : "text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item}
              </button>
            ))}
            <input
              type="search"
              aria-label="Search models"
              value={modelSearch}
              onChange={(event) => setModelSearch(event.target.value)}
              placeholder="Search models…"
              className="ml-auto min-w-36 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filteredModels.map((candidate) => (
              <div
                key={candidate.id}
                className={`shrink-0 rounded-lg border p-2 transition-colors ${
                  candidate.id === model.id
                    ? "border-[#6366f1]/60 bg-[#6366f1]/10"
                    : "border-[var(--border)] bg-[var(--bg-surface)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setModelId(candidate.id)}
                  aria-pressed={candidate.id === model.id}
                  className="block text-left"
                >
                  <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    {candidate.provider}
                  </span>
                  <span className="block text-xs font-medium text-[var(--text-primary)]">
                    {candidate.label}
                  </span>
                  <span className="block text-[10px] text-[var(--text-muted)] mt-0.5">
                    {formatTokenCount(candidate.contextWindow)} context
                  </span>
                </button>
                <label className="mt-1.5 flex items-center gap-1 text-[10px] text-[var(--text-muted)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={compareIds.includes(candidate.id)}
                    onChange={() => toggleCompare(candidate.id)}
                    className="accent-[#6366f1]"
                  />
                  Compare
                </label>
              </div>
            ))}
            {filteredModels.length === 0 && (
              <span className="py-3 text-xs text-[var(--text-muted)]">
                No matching models.
              </span>
            )}
          </div>
        </div>
      }
      outputContent={
        input ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                ["Input tokens", loading ? "…" : tokenCount.toLocaleString()],
                ["Characters", textStats.characters.toLocaleString()],
                ["Words", textStats.words.toLocaleString()],
                ["Lines", textStats.lines.toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="result-card flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    {label}
                  </span>
                  <span className="text-lg font-semibold mono text-[var(--text-primary)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge ${model.tokenizer === "estimate" ? "" : "badge-success"}`}>
                {accuracyLabel}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {textStats.words
                  ? `${(tokenCount / textStats.words).toFixed(2)} tokens/word`
                  : "0 tokens/word"}
              </span>
              <span className="text-xs text-[var(--text-muted)]">·</span>
              <span className="text-xs text-[var(--text-muted)]">
                {tokenCount
                  ? `${(textStats.characters / tokenCount).toFixed(2)} chars/token`
                  : "0 chars/token"}
              </span>
            </div>

            <div className="result-card flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">Expected output</p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Include response and reasoning tokens in the cost forecast.
                  </p>
                </div>
                <input
                  aria-label="Expected output tokens"
                  type="number"
                  min={0}
                  max={model.maxOutput}
                  value={outputTokens}
                  onChange={(event) =>
                    setOutputTokens(
                      numberFromInput(event.target.value, 0, model.maxOutput)
                    )
                  }
                  className="w-28 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-right text-xs mono"
                />
              </div>
              <input
                aria-label="Expected output tokens slider"
                aria-valuemin={0}
                aria-valuemax={sliderMax}
                aria-valuenow={Math.min(outputTokens, sliderMax)}
                aria-valuetext={`${Math.min(outputTokens, sliderMax).toLocaleString()} of ${sliderMax.toLocaleString()} tokens on slider`}
                type="range"
                min={0}
                max={sliderMax}
                step={100}
                value={Math.min(outputTokens, sliderMax)}
                onChange={(event) => setOutputTokens(Number(event.target.value))}
                className="w-full accent-[#6366f1]"
              />
              <p className="text-[10px] text-[var(--text-muted)]">
                Slider range: 0–{sliderMax.toLocaleString()} tokens
                {sliderCapped
                  ? ` (use the number field for up to ${model.maxOutput.toLocaleString()}).`
                  : "."}{" "}
                Current: {outputTokens.toLocaleString()}.
              </p>
            </div>

            <div className="result-card flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Context used (input + output)</span>
                <span className="mono text-[var(--text-primary)]">
                  {totalTokens.toLocaleString()} / {model.contextWindow.toLocaleString()}{" "}
                  ({contextPercent.toFixed(2)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    contextOverflow ? "bg-[#ef4444]" : "bg-[var(--accent)]"
                  }`}
                  style={{ width: `${contextPercent}%` }}
                />
              </div>
              <p className={`text-[10px] ${contextOverflow ? "text-[#ef4444]" : "text-[var(--text-muted)]"}`}>
                {contextOverflow
                  ? `Over context limit by ${(totalTokens - model.contextWindow).toLocaleString()} tokens.`
                  : `${remainingTokens.toLocaleString()} tokens remain in the context window.`}
                {outputOverflow
                  ? ` Requested output exceeds this model's ${model.maxOutput.toLocaleString()}-token maximum.`
                  : ""}
              </p>
            </div>

            <div className="result-card flex flex-col gap-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Cached input
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      aria-label="Cached input percentage"
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={cachedPercent}
                      disabled={!model.cachedInputPrice}
                      onChange={(event) => setCachedPercent(Number(event.target.value))}
                      className="min-w-0 flex-1 accent-[#6366f1] disabled:opacity-40"
                    />
                    <span className="w-9 text-right text-xs mono">{cachedPercent}%</span>
                  </div>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Requests / day
                  </span>
                  <input
                    aria-label="Requests per day"
                    type="number"
                    min={0}
                    max={10_000_000}
                    value={requestsPerDay}
                    onChange={(event) =>
                      setRequestsPerDay(
                        numberFromInput(event.target.value, 0, 10_000_000)
                      )
                    }
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-xs mono"
                  />
                </label>
                <label className="flex items-center gap-2 self-end rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)]">
                  <input
                    type="checkbox"
                    checked={activeBatch}
                    disabled={!model.batchDiscount}
                    onChange={(event) => setBatch(event.target.checked)}
                    className="accent-[#6366f1]"
                  />
                  Batch API
                  {model.batchDiscount
                    ? ` (−${model.batchDiscount * 100}%)`
                    : " unavailable"}
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[var(--border)] pt-3">
                {[
                  ["Input", formatCost(estimate.inputCost)],
                  ["Output", formatCost(estimate.outputCost)],
                  ["Per request", formatCost(estimate.costPerRequest)],
                  ["30-day total", formatCost(estimate.monthlyCost)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
                    <p
                      data-testid={label === "30-day total" ? "monthly-cost" : undefined}
                      className="text-sm font-semibold mono text-[var(--text-primary)]"
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              {estimate.longContextPricing && (
                <p className="text-[10px] text-[#f59e0b]">
                  Long-context pricing applies to this request.
                </p>
              )}
            </div>

            <div className="result-card flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Model comparison
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  Lowest projected cost first
                </span>
              </div>
              <ul className="flex flex-col gap-2 sm:hidden">
                {comparedModels.map((row) => (
                  <li
                    key={row.model.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3 text-xs"
                  >
                    <p className="font-medium text-[var(--text-primary)]">{row.model.label}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {row.model.provider} ·{" "}
                      {row.model.tokenizer === "estimate" ? "estimate" : "local text"}
                    </p>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                      <div>
                        <dt className="text-[10px] text-[var(--text-muted)]">Tokens</dt>
                        <dd className="mono">{row.count.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] text-[var(--text-muted)]">Per request</dt>
                        <dd className="mono">{formatCost(row.cost.costPerRequest)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] text-[var(--text-muted)]">Monthly</dt>
                        <dd className="mono">{formatCost(row.cost.monthlyCost)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] text-[var(--text-muted)]">Fits context</dt>
                        <dd className={row.fits ? "text-[#22c55e]" : "text-[#ef4444]"}>
                          {row.fits ? "Yes" : "No"}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
              <div className="overflow-x-auto hidden sm:block">
                <table className="w-full min-w-[540px] text-xs">
                  <caption className="sr-only">
                    Model comparison by projected cost
                  </caption>
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                      <th className="pb-2 font-medium">Model</th>
                      <th className="pb-2 font-medium text-right">Tokens</th>
                      <th className="pb-2 font-medium text-right">Per request</th>
                      <th className="pb-2 font-medium text-right">Monthly</th>
                      <th className="pb-2 font-medium text-right">Fits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparedModels.map((row) => (
                      <tr key={row.model.id} className="border-t border-[var(--border)]">
                        <td className="py-2">
                          <span className="font-medium text-[var(--text-primary)]">
                            {row.model.label}
                          </span>
                          <span className="block text-[10px] text-[var(--text-muted)]">
                            {row.model.provider} · {row.model.tokenizer === "estimate" ? "estimate" : "local text"}
                          </span>
                        </td>
                        <td className="py-2 text-right mono">{row.count.toLocaleString()}</td>
                        <td className="py-2 text-right mono">
                          {formatCost(row.cost.costPerRequest)}
                        </td>
                        <td className="py-2 text-right mono">
                          {formatCost(row.cost.monthlyCost)}
                        </td>
                        <td className={`py-2 text-right ${row.fits ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                          {row.fits ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-[10px] text-[var(--text-muted)] leading-relaxed space-y-1">
              <p>
                Prices checked {TOKEN_PRICING_DATE}.{" "}
                <a
                  href={model.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-text)] hover:underline"
                >
                  Official {model.provider} source
                </a>
                . {model.note}
              </p>
              <p>
                {model.tokenizer === "estimate"
                  ? `${model.provider} does not provide a browser-ready tokenizer for this model, so the local count is a transparent character-based estimate.`
                  : "The bundled tokenizer exactly encodes this plain text locally; API message formatting, tools, files, and hidden model overhead can add tokens."}
              </p>
              <p>
                Forecast excludes taxes, tool-call fees, cache-write/storage charges, free tiers,
                and provider-specific regional pricing. Verify billing data before budgeting.
              </p>
            </div>
          </div>
        ) : undefined
      }
    />
  );
}
