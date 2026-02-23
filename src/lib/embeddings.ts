import type { EmbeddingModel } from "./types";
import { getOpenAIClient } from "./openai";

export async function generateEmbedding(
  text: string,
  model: EmbeddingModel
): Promise<number[]> {
  const client = getOpenAIClient();
  if (!client) throw new Error("OpenAI client not available — demo mode active");

  const response = await client.embeddings.create({
    model,
    input: text,
  });

  return response.data[0].embedding;
}

export async function generateEmbeddings(
  texts: string[],
  model: EmbeddingModel
): Promise<number[][]> {
  const client = getOpenAIClient();
  if (!client) throw new Error("OpenAI client not available — demo mode active");

  const response = await client.embeddings.create({
    model,
    input: texts,
  });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

// Simple keyword-based similarity for demo mode
export function keywordSimilarity(query: string, text: string): number {
  const queryTokens = tokenize(query);
  const textTokens = tokenize(text);
  if (queryTokens.length === 0) return 0;

  const textSet = new Set(textTokens);
  let matches = 0;
  for (const token of queryTokens) {
    if (textSet.has(token)) matches++;
  }

  // Jaccard-like similarity boosted by match ratio
  const matchRatio = matches / queryTokens.length;
  const jaccardDenom = new Set([...queryTokens, ...textTokens]).size;
  const jaccard = matches / jaccardDenom;

  return matchRatio * 0.7 + jaccard * 0.3;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
  "her", "was", "one", "our", "out", "has", "have", "been", "some", "them",
  "than", "its", "over", "such", "that", "this", "with", "will", "each",
  "from", "they", "what", "which", "their", "said", "who", "does", "shall",
  "must", "may", "should", "would", "could", "into", "about", "under",
]);
