import type { TokenModel } from "@/lib/tokenModels";

export interface CostOptions {
  inputTokens: number;
  outputTokens: number;
  cachedPercent: number;
  batch: boolean;
  requestsPerDay: number;
}

export interface CostEstimate {
  inputCost: number;
  outputCost: number;
  costPerRequest: number;
  dailyCost: number;
  monthlyCost: number;
  effectiveInputPrice: number;
  effectiveOutputPrice: number;
  longContextPricing: boolean;
}

export function estimateTokens(text: string, charsPerToken: number): number {
  if (!text) return 0;
  return Math.ceil(Array.from(text).length / charsPerToken);
}

export function countTextStats(text: string) {
  const characters = Array.from(text).length;
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  const lines = text ? text.split(/\r\n?|\n/u).length : 0;
  return { characters, words, lines };
}

export function calculateCost(
  model: TokenModel,
  {
    inputTokens,
    outputTokens,
    cachedPercent,
    batch,
    requestsPerDay,
  }: CostOptions
): CostEstimate {
  const longContextPricing = Boolean(
    model.pricingTier && inputTokens > model.pricingTier.aboveInputTokens
  );
  const inputMultiplier = longContextPricing
    ? model.pricingTier?.inputMultiplier ?? 1
    : 1;
  const outputMultiplier = longContextPricing
    ? model.pricingTier?.outputMultiplier ?? 1
    : 1;
  const effectiveInputPrice = model.inputPrice * inputMultiplier;
  const effectiveOutputPrice = model.outputPrice * outputMultiplier;
  const safeCachedPercent = model.cachedInputPrice
    ? Math.min(100, Math.max(0, cachedPercent))
    : 0;
  const cachedTokens = inputTokens * (safeCachedPercent / 100);
  const uncachedTokens = inputTokens - cachedTokens;
  const cachedPrice =
    (model.cachedInputPrice ?? model.inputPrice) * inputMultiplier;
  const batchMultiplier = batch && model.batchDiscount
    ? 1 - model.batchDiscount
    : 1;

  const inputCost =
    ((uncachedTokens * effectiveInputPrice + cachedTokens * cachedPrice) /
      1_000_000) *
    batchMultiplier;
  const outputCost =
    (outputTokens * effectiveOutputPrice * batchMultiplier) / 1_000_000;
  const costPerRequest = inputCost + outputCost;
  const dailyCost = costPerRequest * Math.max(0, requestsPerDay);

  return {
    inputCost,
    outputCost,
    costPerRequest,
    dailyCost,
    monthlyCost: dailyCost * 30,
    effectiveInputPrice,
    effectiveOutputPrice,
    longContextPricing,
  };
}

export function formatTokenCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  }
  return value.toLocaleString();
}

export function formatCost(value: number): string {
  if (value <= 0) return "$0.00";
  if (value < 0.000001) return "< $0.000001";
  if (value < 0.01) return `$${value.toFixed(6)}`;
  if (value < 1) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(2)}`;
}
