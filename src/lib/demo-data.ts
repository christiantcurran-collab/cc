import type { DocumentChunk, RetrievedChunk, QueryResult, RAGConfig, QueryMetrics } from "./types";
import { keywordSimilarity } from "./embeddings";
import { buildRAGPrompt } from "./prompts";
import demoChunksRaw from "@/data/demo-chunks.json";
import demoAnswersRaw from "@/data/demo-answers.json";

// Load demo chunks
export const demoChunks: DocumentChunk[] = demoChunksRaw as DocumentChunk[];

interface DemoAnswerEntry {
  question: string;
  answer: string;
  chunkIds: string[];
  metrics: QueryMetrics;
}

const demoAnswers: DemoAnswerEntry[] = demoAnswersRaw as DemoAnswerEntry[];

// Find closest matching demo answer
function findDemoAnswer(query: string): DemoAnswerEntry | null {
  const q = query.toLowerCase().trim();
  // Exact match first
  const exact = demoAnswers.find(
    (a) => a.question.toLowerCase().trim() === q
  );
  if (exact) return exact;

  // Fuzzy match using keyword similarity
  let bestMatch: DemoAnswerEntry | null = null;
  let bestScore = 0;
  for (const entry of demoAnswers) {
    const score = keywordSimilarity(query, entry.question);
    if (score > bestScore && score > 0.3) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  return bestMatch;
}

export function demoQuery(query: string, config: RAGConfig): QueryResult {
  const startTime = Date.now();

  // Try to find a pre-generated answer
  const demoAnswer = findDemoAnswer(query);

  // Retrieve relevant chunks using keyword similarity
  const scoredChunks: RetrievedChunk[] = demoChunks
    .filter((c) => config.sourcebookFilter.includes(c.metadata.sourcebook))
    .map((chunk) => ({
      ...chunk,
      score: keywordSimilarity(query, chunk.text + " " + chunk.metadata.title),
      rank: 0,
    }))
    .sort((a, b) => b.score - a.score)
    .filter((c) => c.score >= config.similarityThreshold * 0.5) // More lenient in demo mode
    .slice(0, config.topK)
    .map((c, i) => ({ ...c, rank: i + 1 }));

  const retrievalTime = Date.now() - startTime;

  // Build the prompt
  const { fullPrompt } = buildRAGPrompt(query, scoredChunks, config);

  // Use pre-generated answer if available, otherwise generate a demo response
  let answer: string;
  if (demoAnswer) {
    answer = demoAnswer.answer;
  } else {
    answer = generateFallbackAnswer(query, scoredChunks);
  }

  const generationTime = demoAnswer ? demoAnswer.metrics.generationLatencyMs : 800 + Math.random() * 500;

  const metrics: QueryMetrics = {
    retrievalLatencyMs: retrievalTime + Math.random() * 20,
    generationLatencyMs: generationTime,
    totalLatencyMs: retrievalTime + generationTime,
    promptTokens: Math.floor(fullPrompt.length / 4),
    completionTokens: Math.floor(answer.length / 4),
    totalTokens: Math.floor((fullPrompt.length + answer.length) / 4),
    estimatedCost: 0,
    chunksRetrieved: scoredChunks.length,
    chunksAfterThreshold: scoredChunks.length,
  };

  // Estimate cost based on model
  const modelCosts: Record<string, { input: number; output: number }> = {
    "gpt-4o": { input: 2.5, output: 10 },
    "gpt-4o-mini": { input: 0.15, output: 0.6 },
    "gpt-4-turbo": { input: 10, output: 30 },
    "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
  };
  const cost = modelCosts[config.generationModel] || modelCosts["gpt-4o-mini"];
  metrics.estimatedCost =
    (metrics.promptTokens / 1_000_000) * cost.input +
    (metrics.completionTokens / 1_000_000) * cost.output;

  return {
    answer,
    retrievedChunks: scoredChunks,
    metrics,
    rawPrompt: config.showRawPrompt ? fullPrompt : undefined,
    config,
  };
}

function generateFallbackAnswer(query: string, chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "**No relevant context found.** The query did not match any chunks in the current sourcebook selection above the similarity threshold. Try:\n- Lowering the similarity threshold\n- Expanding the sourcebook filter\n- Rephrasing the question\n\n*This is demo mode — connect an OpenAI API key for full AI-generated responses.*";
  }

  const sources = chunks
    .slice(0, 3)
    .map((c) => `- **${c.metadata.sourcebook} ${c.metadata.section}** — ${c.metadata.title}`)
    .join("\n");

  const contextSummary = chunks
    .slice(0, 3)
    .map((c) => `> ${c.text.slice(0, 150)}...`)
    .join("\n\n");

  return `Based on the retrieved FCA Handbook context, here are the most relevant provisions:\n\n### Relevant Sources\n${sources}\n\n### Key Context\n${contextSummary}\n\n---\n*This is a demo mode response using keyword-based retrieval. Connect an OpenAI API key to get full AI-generated answers with proper reasoning and citations.*`;
}
