export const TOKEN_PRICING_DATE = "2026-09-27";

export type TokenizerKind = "o200k_base" | "cl100k_base" | "estimate";

export interface ModelPricingTier {
  aboveInputTokens: number;
  inputMultiplier: number;
  outputMultiplier: number;
}

export interface TokenModel {
  id: string;
  label: string;
  provider: "OpenAI" | "Anthropic" | "Google" | "DeepSeek";
  tokenizer: TokenizerKind;
  estimateCharsPerToken?: number;
  contextWindow: number;
  maxOutput: number;
  inputPrice: number;
  cachedInputPrice?: number;
  outputPrice: number;
  batchDiscount?: number;
  pricingTier?: ModelPricingTier;
  sourceUrl: string;
  note?: string;
}

const OPENAI_MODELS = "https://developers.openai.com/api/docs/models";
const ANTHROPIC_MODELS = "https://docs.anthropic.com/en/docs/about-claude/models";
const GOOGLE_PRICING = "https://ai.google.dev/gemini-api/docs/pricing";
const DEEPSEEK_PRICING = "https://api-docs.deepseek.com/quick_start/pricing";

export const TOKEN_MODELS: TokenModel[] = [
  {
    id: "gpt-5.6-sol",
    label: "GPT-5.6 Sol",
    provider: "OpenAI",
    tokenizer: "o200k_base",
    contextWindow: 1_050_000,
    maxOutput: 128_000,
    inputPrice: 4,
    cachedInputPrice: 0.4,
    outputPrice: 20,
    batchDiscount: 0.5,
    pricingTier: {
      aboveInputTokens: 272_000,
      inputMultiplier: 2,
      outputMultiplier: 1.5,
    },
    sourceUrl: OPENAI_MODELS,
    note: "Promotional pricing; prompts above 272K input tokens use higher rates.",
  },
  {
    id: "gpt-5.6-terra",
    label: "GPT-5.6 Terra",
    provider: "OpenAI",
    tokenizer: "o200k_base",
    contextWindow: 1_050_000,
    maxOutput: 128_000,
    inputPrice: 2,
    cachedInputPrice: 0.2,
    outputPrice: 12,
    batchDiscount: 0.5,
    pricingTier: {
      aboveInputTokens: 272_000,
      inputMultiplier: 2,
      outputMultiplier: 1.5,
    },
    sourceUrl: OPENAI_MODELS,
    note: "Prompts above 272K input tokens use 2× input and 1.5× output rates.",
  },
  {
    id: "gpt-5.6-luna",
    label: "GPT-5.6 Luna",
    provider: "OpenAI",
    tokenizer: "o200k_base",
    contextWindow: 1_050_000,
    maxOutput: 128_000,
    inputPrice: 0.2,
    cachedInputPrice: 0.02,
    outputPrice: 1.2,
    batchDiscount: 0.5,
    pricingTier: {
      aboveInputTokens: 272_000,
      inputMultiplier: 2,
      outputMultiplier: 1.5,
    },
    sourceUrl: OPENAI_MODELS,
    note: "Prompts above 272K input tokens use higher rates.",
  },
  {
    id: "gpt-5.4-mini",
    label: "GPT-5.4 Mini",
    provider: "OpenAI",
    tokenizer: "o200k_base",
    contextWindow: 400_000,
    maxOutput: 128_000,
    inputPrice: 0.75,
    cachedInputPrice: 0.075,
    outputPrice: 4.5,
    batchDiscount: 0.5,
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-5.4-mini",
  },
  {
    id: "gpt-5.4-nano",
    label: "GPT-5.4 Nano",
    provider: "OpenAI",
    tokenizer: "o200k_base",
    contextWindow: 400_000,
    maxOutput: 128_000,
    inputPrice: 0.2,
    cachedInputPrice: 0.02,
    outputPrice: 1.25,
    batchDiscount: 0.5,
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-5.4-nano",
  },
  {
    id: "claude-fable-5.1",
    label: "Claude Fable 5.1",
    provider: "Anthropic",
    tokenizer: "estimate",
    estimateCharsPerToken: 2.7,
    contextWindow: 1_000_000,
    maxOutput: 128_000,
    inputPrice: 10,
    cachedInputPrice: 0.25,
    outputPrice: 50,
    batchDiscount: 0.5,
    sourceUrl: ANTHROPIC_MODELS,
    note: "Uses Anthropic's newer tokenizer; exact counts require its Token Count API.",
  },
  {
    id: "claude-opus-5",
    label: "Claude Opus 5",
    provider: "Anthropic",
    tokenizer: "estimate",
    estimateCharsPerToken: 2.7,
    contextWindow: 1_000_000,
    maxOutput: 128_000,
    inputPrice: 5,
    cachedInputPrice: 0.5,
    outputPrice: 25,
    batchDiscount: 0.5,
    sourceUrl: ANTHROPIC_MODELS,
    note: "Exact counts require Anthropic's Token Count API.",
  },
  {
    id: "claude-sonnet-5",
    label: "Claude Sonnet 5",
    provider: "Anthropic",
    tokenizer: "estimate",
    estimateCharsPerToken: 2.7,
    contextWindow: 1_000_000,
    maxOutput: 128_000,
    inputPrice: 2,
    cachedInputPrice: 0.2,
    outputPrice: 10,
    batchDiscount: 0.5,
    sourceUrl: ANTHROPIC_MODELS,
    note: "Exact counts require Anthropic's Token Count API.",
  },
  {
    id: "claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    provider: "Anthropic",
    tokenizer: "estimate",
    estimateCharsPerToken: 3.5,
    contextWindow: 200_000,
    maxOutput: 64_000,
    inputPrice: 1,
    cachedInputPrice: 0.1,
    outputPrice: 5,
    batchDiscount: 0.5,
    sourceUrl: ANTHROPIC_MODELS,
    note: "Exact counts require Anthropic's Token Count API.",
  },
  {
    id: "gemini-3.8-flash",
    label: "Gemini 3.8 Flash",
    provider: "Google",
    tokenizer: "estimate",
    estimateCharsPerToken: 4,
    contextWindow: 1_048_576,
    maxOutput: 65_536,
    inputPrice: 0.75,
    cachedInputPrice: 0.075,
    outputPrice: 3.75,
    sourceUrl: GOOGLE_PRICING,
    note: "Introductory pricing through December 31, 2026.",
  },
  {
    id: "gemini-3.1-pro-preview",
    label: "Gemini 3.1 Pro",
    provider: "Google",
    tokenizer: "estimate",
    estimateCharsPerToken: 4,
    contextWindow: 1_048_576,
    maxOutput: 65_536,
    inputPrice: 2,
    cachedInputPrice: 0.2,
    outputPrice: 12,
    pricingTier: {
      aboveInputTokens: 200_000,
      inputMultiplier: 2,
      outputMultiplier: 1.5,
    },
    sourceUrl: GOOGLE_PRICING,
    note: "Preview model; prompts above 200K input tokens use $4/$18 rates.",
  },
  {
    id: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash Lite",
    provider: "Google",
    tokenizer: "estimate",
    estimateCharsPerToken: 4,
    contextWindow: 1_048_576,
    maxOutput: 65_536,
    inputPrice: 0.25,
    cachedInputPrice: 0.025,
    outputPrice: 1.5,
    sourceUrl: GOOGLE_PRICING,
  },
  {
    id: "deepseek-flash",
    label: "DeepSeek Flash",
    provider: "DeepSeek",
    tokenizer: "estimate",
    estimateCharsPerToken: 3.5,
    contextWindow: 1_000_000,
    maxOutput: 384_000,
    inputPrice: 0.3,
    cachedInputPrice: 0.006,
    outputPrice: 1.2,
    sourceUrl: DEEPSEEK_PRICING,
    note: "Peak pricing shown; off-peak token rates are 50% lower.",
  },
  {
    id: "deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    provider: "DeepSeek",
    tokenizer: "estimate",
    estimateCharsPerToken: 3.5,
    contextWindow: 1_000_000,
    maxOutput: 384_000,
    inputPrice: 1.32,
    cachedInputPrice: 0.044,
    outputPrice: 3.96,
    sourceUrl: DEEPSEEK_PRICING,
    note: "Peak pricing shown; off-peak token rates are 50% lower.",
  },
];

export const TOKEN_PROVIDERS = [
  "All",
  "OpenAI",
  "Anthropic",
  "Google",
  "DeepSeek",
] as const;

export function getTokenModel(id: string): TokenModel {
  return TOKEN_MODELS.find((model) => model.id === id) ?? TOKEN_MODELS[1];
}
