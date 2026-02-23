import { NextRequest, NextResponse } from "next/server";
import type { RAGConfig, QueryResult, RetrievedChunk, QueryMetrics } from "@/lib/types";
import { isDemoMode, getOpenAIClient } from "@/lib/openai";
import { demoQuery, demoChunks } from "@/lib/demo-data";
import { retrieveChunks } from "@/lib/retrieval";
import { buildRAGPrompt } from "@/lib/prompts";
import { rerankChunks } from "@/lib/reranking";
import { estimateGenerationCost } from "@/lib/cost-calculator";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(req: NextRequest) {
  try {
    const { query, config } = (await req.json()) as {
      query: string;
      config: RAGConfig;
    };

    if (!query || !config) {
      return NextResponse.json({ error: "Missing query or config" }, { status: 400 });
    }

    // Demo mode
    if (isDemoMode()) {
      const result = demoQuery(query, config);
      return NextResponse.json(result);
    }

    // Live mode with OpenAI
    const client = getOpenAIClient()!;
    const startTime = Date.now();

    // 1. Generate query embedding
    const queryEmbedding = await generateEmbedding(query, config.embeddingModel);
    const retrievalStart = Date.now();

    // 2. Retrieve chunks
    let retrieved = retrieveChunks(queryEmbedding, query, demoChunks, config);
    const retrievalLatency = Date.now() - retrievalStart;

    // 3. Rerank if enabled
    if (config.reranking && retrieved.length > 1) {
      retrieved = await rerankChunks(query, retrieved);
    }

    // 4. Build prompt
    const { systemMessage, userMessage, fullPrompt } = buildRAGPrompt(query, retrieved, config);

    // 5. Generate answer
    const genStart = Date.now();
    const completion = await client.chat.completions.create({
      model: config.generationModel,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      top_p: config.topP,
      frequency_penalty: config.frequencyPenalty,
      presence_penalty: config.presencePenalty,
    });
    const generationLatency = Date.now() - genStart;

    const answer = completion.choices[0]?.message?.content || "No response generated.";
    const promptTokens = completion.usage?.prompt_tokens || 0;
    const completionTokens = completion.usage?.completion_tokens || 0;

    const metrics: QueryMetrics = {
      retrievalLatencyMs: retrievalLatency,
      generationLatencyMs: generationLatency,
      totalLatencyMs: Date.now() - startTime,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      estimatedCost: estimateGenerationCost(config.generationModel, promptTokens, completionTokens),
      chunksRetrieved: retrieved.length,
      chunksAfterThreshold: retrieved.length,
    };

    const result: QueryResult = {
      answer,
      retrievedChunks: retrieved,
      metrics,
      rawPrompt: config.showRawPrompt ? fullPrompt : undefined,
      config,
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
