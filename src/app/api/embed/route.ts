import { NextRequest, NextResponse } from "next/server";
import type { EmbeddingModel } from "@/lib/types";
import { isDemoMode } from "@/lib/openai";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(req: NextRequest) {
  try {
    const { text, model } = (await req.json()) as {
      text: string;
      model: EmbeddingModel;
    };

    if (!text || !model) {
      return NextResponse.json({ error: "Missing text or model" }, { status: 400 });
    }

    if (isDemoMode()) {
      return NextResponse.json({
        error: "Embedding generation requires an OpenAI API key. Currently running in demo mode.",
        demoMode: true,
      }, { status: 200 });
    }

    const embedding = await generateEmbedding(text, model);
    return NextResponse.json({
      embedding,
      dimensions: embedding.length,
      model,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
