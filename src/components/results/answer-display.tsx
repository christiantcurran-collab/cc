"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton } from "@/components/ui/skeleton";

interface AnswerDisplayProps {
  answer: string | null;
  rawPrompt?: string;
  isLoading: boolean;
}

export function AnswerDisplay({ answer, rawPrompt, isLoading }: AnswerDisplayProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  if (!answer) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Ask a question to see the AI-generated answer
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="markdown-content text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
      </div>
      {rawPrompt && (
        <div className="mt-4 border border-border rounded-md">
          <div className="px-3 py-2 bg-secondary/50 border-b border-border text-xs font-semibold text-muted-foreground">
            Raw Prompt Sent to API
          </div>
          <pre className="p-3 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap max-h-80 overflow-y-auto">
            {rawPrompt}
          </pre>
        </div>
      )}
    </div>
  );
}
