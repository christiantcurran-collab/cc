import type { DocumentChunk, RetrievedChunk, RetrievalMethod, RAGConfig } from "./types";
import { cosineSimilarity, keywordSimilarity } from "./embeddings";

export function retrieveChunks(
  queryEmbedding: number[] | null,
  queryText: string,
  chunks: DocumentChunk[],
  config: RAGConfig
): RetrievedChunk[] {
  // Filter by sourcebook
  const filtered = chunks.filter((c) =>
    config.sourcebookFilter.includes(c.metadata.sourcebook)
  );

  let scored: RetrievedChunk[];

  switch (config.retrievalMethod) {
    case "cosine":
      scored = cosineRetrieval(queryEmbedding, queryText, filtered);
      break;
    case "mmr":
      scored = mmrRetrieval(queryEmbedding, queryText, filtered, config.topK);
      break;
    case "hybrid":
      scored = hybridRetrieval(queryEmbedding, queryText, filtered);
      break;
    default:
      scored = cosineRetrieval(queryEmbedding, queryText, filtered);
  }

  // Apply similarity threshold
  const thresholded = scored.filter((c) => c.score >= config.similarityThreshold);

  // Take top K
  const topK = thresholded.slice(0, config.topK);

  // Assign ranks
  return topK.map((c, i) => ({ ...c, rank: i + 1 }));
}

function cosineRetrieval(
  queryEmbedding: number[] | null,
  queryText: string,
  chunks: DocumentChunk[]
): RetrievedChunk[] {
  return chunks
    .map((chunk) => {
      const score =
        queryEmbedding && chunk.embedding
          ? cosineSimilarity(queryEmbedding, chunk.embedding)
          : keywordSimilarity(queryText, chunk.text);
      return { ...chunk, score, rank: 0 };
    })
    .sort((a, b) => b.score - a.score);
}

function mmrRetrieval(
  queryEmbedding: number[] | null,
  queryText: string,
  chunks: DocumentChunk[],
  topK: number,
  lambda: number = 0.7
): RetrievedChunk[] {
  const allScored = cosineRetrieval(queryEmbedding, queryText, chunks);
  if (allScored.length === 0) return [];

  const selected: RetrievedChunk[] = [allScored[0]];
  const remaining = allScored.slice(1);

  while (selected.length < topK && remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const relevance = remaining[i].score;
      // Max similarity to already selected chunks
      let maxSim = 0;
      for (const sel of selected) {
        const sim =
          remaining[i].embedding && sel.embedding
            ? cosineSimilarity(remaining[i].embedding!, sel.embedding!)
            : textOverlap(remaining[i].text, sel.text);
        maxSim = Math.max(maxSim, sim);
      }
      const mmrScore = lambda * relevance - (1 - lambda) * maxSim;
      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIdx = i;
      }
    }

    selected.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }

  return selected;
}

function hybridRetrieval(
  queryEmbedding: number[] | null,
  queryText: string,
  chunks: DocumentChunk[]
): RetrievedChunk[] {
  // Combine semantic and keyword scores
  return chunks
    .map((chunk) => {
      const semanticScore =
        queryEmbedding && chunk.embedding
          ? cosineSimilarity(queryEmbedding, chunk.embedding)
          : 0;
      const keywordScore = keywordSimilarity(queryText, chunk.text);
      // Weighted combination: 60% semantic, 40% keyword
      const score = semanticScore > 0
        ? semanticScore * 0.6 + keywordScore * 0.4
        : keywordScore;
      return { ...chunk, score, rank: 0 };
    })
    .sort((a, b) => b.score - a.score);
}

function textOverlap(a: string, b: string): number {
  const arrA = a.toLowerCase().split(/\s+/);
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  let overlap = 0;
  for (let i = 0; i < arrA.length; i++) {
    if (wordsB.has(arrA[i])) overlap++;
  }
  return overlap / Math.max(arrA.length, wordsB.size);
}
