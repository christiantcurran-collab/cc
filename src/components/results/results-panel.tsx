"use client";

import type { QueryResult, RAGConfig } from "@/lib/types";
import { QueryInput } from "./query-input";
import { AnswerDisplay } from "./answer-display";
import { ChunkViewer } from "./chunk-viewer";
import { MetricsBar } from "./metrics-bar";
import { Separator } from "@/components/ui/separator";

interface ResultsPanelProps {
  result: QueryResult | null;
  isLoading: boolean;
  onQuery: (query: string) => void;
}

export function ResultsPanel({ result, isLoading, onQuery }: ResultsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <QueryInput onSubmit={onQuery} isLoading={isLoading} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {result && <MetricsBar metrics={result.metrics} />}
        <AnswerDisplay
          answer={result?.answer || null}
          rawPrompt={result?.rawPrompt}
          isLoading={isLoading}
        />
        {result && (
          <>
            <Separator />
            <ChunkViewer chunks={result.retrievedChunks} isLoading={isLoading} />
          </>
        )}
      </div>
    </div>
  );
}
