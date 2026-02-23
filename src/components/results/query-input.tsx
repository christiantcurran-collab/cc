"use client";

import { useState } from "react";
import { EXAMPLE_QUESTIONS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2 } from "lucide-react";

interface QueryInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

export function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) onSubmit(query.trim());
  };

  const handleExampleClick = (q: string) => {
    setQuery(q);
    onSubmit(q);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about the FCA Handbook..."
          className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !query.trim()} className="bg-emerald-600 hover:bg-emerald-700">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="ml-1.5">Ask</span>
        </Button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLE_QUESTIONS.map((q) => (
          <Badge
            key={q}
            variant="secondary"
            className="cursor-pointer hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors text-[11px] py-1"
            onClick={() => handleExampleClick(q)}
          >
            {q.length > 50 ? q.slice(0, 50) + "..." : q}
          </Badge>
        ))}
      </div>
    </div>
  );
}
