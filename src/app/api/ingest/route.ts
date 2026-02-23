import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // PDF ingestion endpoint — placeholder for future implementation
  // Would handle: download PDF → extract text → chunk → embed → store
  return NextResponse.json({
    message: "PDF ingestion pipeline is available when deployed with an OpenAI API key. The current demo uses pre-processed FCA Handbook data.",
    supportedSourcebooks: ["PRIN", "SYSC", "COBS", "ICOBS", "DISP", "FCG"],
    pipeline: [
      "1. Download PDF from FCA Handbook website",
      "2. Extract text using pdf-parse",
      "3. Chunk text using selected strategy",
      "4. Generate embeddings via OpenAI API",
      "5. Store vectors in Supabase pgvector (or in-memory)",
    ],
  });
}
