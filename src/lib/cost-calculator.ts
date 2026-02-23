import type { GenerationModel, EmbeddingModel } from "./types";

// Pricing per 1M tokens (USD) as of early 2025
const MODEL_PRICING: Record<GenerationModel, { input: number; output: number }> = {
  "gpt-4o":         { input: 2.50,  output: 10.00 },
  "gpt-4o-mini":    { input: 0.15,  output: 0.60  },
  "gpt-4-turbo":    { input: 10.00, output: 30.00 },
  "gpt-3.5-turbo":  { input: 0.50,  output: 1.50  },
};

const EMBEDDING_PRICING: Record<EmbeddingModel, number> = {
  "text-embedding-3-small": 0.02,
  "text-embedding-3-large": 0.13,
  "text-embedding-ada-002": 0.10,
};

export function estimateGenerationCost(
  model: GenerationModel,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  const inputCost = (promptTokens / 1_000_000) * pricing.input;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

export function estimateEmbeddingCost(
  model: EmbeddingModel,
  tokens: number
): number {
  return (tokens / 1_000_000) * EMBEDDING_PRICING[model];
}

export function formatCost(cost: number): string {
  if (cost < 0.001) return "<$0.001";
  return `$${cost.toFixed(4)}`;
}
