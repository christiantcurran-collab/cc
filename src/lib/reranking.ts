import type { RetrievedChunk } from "./types";
import { getOpenAIClient } from "./openai";

export async function rerankChunks(
  query: string,
  chunks: RetrievedChunk[]
): Promise<RetrievedChunk[]> {
  const client = getOpenAIClient();
  if (!client) {
    // Demo mode: apply a slight shuffle based on keyword density
    return demoRerank(query, chunks);
  }

  const prompt = `You are a relevance ranker. Given a query and a list of text passages, rank them by relevance to the query. Return ONLY a JSON array of indices (0-based) in order of relevance, most relevant first.

Query: "${query}"

Passages:
${chunks.map((c, i) => `[${i}] ${c.text.slice(0, 200)}...`).join("\n\n")}

Return only the JSON array of indices, e.g. [2, 0, 1, 3]`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content || "";
    const match = content.match(/\[[\d,\s]+\]/);
    if (match) {
      const indices: number[] = JSON.parse(match[0]);
      return indices
        .filter((i) => i >= 0 && i < chunks.length)
        .map((i, rank) => ({
          ...chunks[i],
          rank: rank + 1,
          score: chunks[i].score * (1 - rank * 0.02), // Slight decay by new rank
        }));
    }
  } catch {
    // Fall through to return original order
  }

  return chunks;
}

function demoRerank(query: string, chunks: RetrievedChunk[]): RetrievedChunk[] {
  const queryWords = new Set(query.toLowerCase().split(/\s+/));
  return [...chunks]
    .map((chunk) => {
      const words = chunk.text.toLowerCase().split(/\s+/);
      const density = words.filter((w) => queryWords.has(w)).length / words.length;
      return { ...chunk, score: chunk.score * 0.8 + density * 0.2 };
    })
    .sort((a, b) => b.score - a.score)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}
