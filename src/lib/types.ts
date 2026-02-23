// ============================================
// RAG Playground — Core Types
// ============================================

export type ChunkingStrategy = "fixed" | "sentence" | "paragraph" | "recursive";

export type EmbeddingModel =
  | "text-embedding-3-small"
  | "text-embedding-3-large"
  | "text-embedding-ada-002";

export type RetrievalMethod = "cosine" | "mmr" | "hybrid";

export type GenerationModel =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4-turbo"
  | "gpt-3.5-turbo";

export type ContextStrategy = "stuff" | "map-reduce" | "refine";

export type Sourcebook = "PRIN" | "SYSC" | "COBS" | "ICOBS" | "DISP" | "FCG";

export interface RAGConfig {
  // Document Processing
  chunkingStrategy: ChunkingStrategy;
  chunkSize: number;
  chunkOverlap: number;
  sourcebookFilter: Sourcebook[];

  // Retrieval
  embeddingModel: EmbeddingModel;
  topK: number;
  similarityThreshold: number;
  retrievalMethod: RetrievalMethod;
  reranking: boolean;

  // Generation
  generationModel: GenerationModel;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;

  // Advanced
  contextStrategy: ContextStrategy;
  includeMetadata: boolean;
  showRawPrompt: boolean;
}

export interface ChunkMetadata {
  sourcebook: Sourcebook;
  section: string;
  title: string;
  pageNumber?: number;
}

export interface DocumentChunk {
  id: string;
  text: string;
  metadata: ChunkMetadata;
  embedding?: number[];
}

export interface RetrievedChunk extends DocumentChunk {
  score: number;
  rank: number;
}

export interface QueryMetrics {
  retrievalLatencyMs: number;
  generationLatencyMs: number;
  totalLatencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  chunksRetrieved: number;
  chunksAfterThreshold: number;
}

export interface QueryResult {
  answer: string;
  retrievedChunks: RetrievedChunk[];
  metrics: QueryMetrics;
  rawPrompt?: string;
  config: RAGConfig;
}

export interface DemoAnswer {
  question: string;
  answer: string;
  chunks: RetrievedChunk[];
  metrics: QueryMetrics;
  rawPrompt: string;
}

export const DEFAULT_SYSTEM_PROMPT =
  "You are an expert UK financial regulation advisor. Answer questions using only the provided FCA Handbook context. Always cite the specific sourcebook, chapter, and section number. If the context does not contain the answer, say so clearly.";

export const DEFAULT_CONFIG: RAGConfig = {
  chunkingStrategy: "recursive",
  chunkSize: 500,
  chunkOverlap: 10,
  sourcebookFilter: ["PRIN", "SYSC", "COBS", "ICOBS", "DISP", "FCG"],

  embeddingModel: "text-embedding-3-small",
  topK: 5,
  similarityThreshold: 0.7,
  retrievalMethod: "cosine",
  reranking: false,

  generationModel: "gpt-4o-mini",
  temperature: 0.3,
  maxTokens: 1000,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,

  contextStrategy: "stuff",
  includeMetadata: true,
  showRawPrompt: false,
};

export const EXAMPLE_QUESTIONS = [
  "What are the 12 FCA Principles for Businesses?",
  "What are a firm's obligations under Treating Customers Fairly?",
  "What systems and controls are required for anti-money laundering?",
  "What are the rules around inducements under MiFID?",
  "How should firms handle complaints under DISP?",
  "What are the conduct of business rules for insurance products?",
];

export const SOURCEBOOK_INFO: Record<Sourcebook, { name: string; description: string }> = {
  PRIN: { name: "Principles for Businesses", description: "The fundamental obligations of all regulated firms" },
  SYSC: { name: "Senior Management Arrangements, Systems and Controls", description: "Organisational requirements for firms" },
  COBS: { name: "Conduct of Business Sourcebook", description: "Rules for firms conducting investment business" },
  ICOBS: { name: "Insurance: Conduct of Business", description: "Rules for insurance distribution activities" },
  DISP: { name: "Dispute Resolution: Complaints", description: "Complaints handling and FOS referral rules" },
  FCG: { name: "Financial Crime Guide", description: "Guidance on financial crime systems and controls" },
};
