import type { RAGConfig, RetrievedChunk, ContextStrategy } from "./types";

export function buildRAGPrompt(
  query: string,
  chunks: RetrievedChunk[],
  config: RAGConfig
): { systemMessage: string; userMessage: string; fullPrompt: string } {
  const contextText = formatContext(chunks, config);

  const systemMessage = config.systemPrompt;

  let userMessage: string;

  switch (config.contextStrategy) {
    case "stuff":
      userMessage = buildStuffPrompt(query, contextText);
      break;
    case "map-reduce":
      userMessage = buildMapReducePrompt(query, contextText);
      break;
    case "refine":
      userMessage = buildRefinePrompt(query, contextText);
      break;
    default:
      userMessage = buildStuffPrompt(query, contextText);
  }

  const fullPrompt = `[System]\n${systemMessage}\n\n[User]\n${userMessage}`;

  return { systemMessage, userMessage, fullPrompt };
}

function formatContext(chunks: RetrievedChunk[], config: RAGConfig): string {
  return chunks
    .map((chunk, i) => {
      const header = config.includeMetadata
        ? `[Source: ${chunk.metadata.sourcebook} ${chunk.metadata.section} — ${chunk.metadata.title}]\n`
        : "";
      return `--- Context ${i + 1} (Score: ${(chunk.score * 100).toFixed(1)}%) ---\n${header}${chunk.text}`;
    })
    .join("\n\n");
}

function buildStuffPrompt(query: string, context: string): string {
  return `Using the following context from the FCA Handbook, answer the question below.

${context}

---
Question: ${query}

Provide a comprehensive answer citing specific sections where possible.`;
}

function buildMapReducePrompt(query: string, context: string): string {
  return `Using the following context from the FCA Handbook, answer the question below.

For each piece of context, first extract the key relevant information, then synthesise a final answer.

${context}

---
Question: ${query}

Step 1: Extract key points from each context piece.
Step 2: Synthesise a comprehensive answer citing specific sections.`;
}

function buildRefinePrompt(query: string, context: string): string {
  return `Using the following context from the FCA Handbook, answer the question below.

Read each context piece in order and progressively refine your answer, adding detail and nuance as you go.

${context}

---
Question: ${query}

Build your answer iteratively, citing specific sections.`;
}
