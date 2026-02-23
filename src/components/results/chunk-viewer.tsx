"use client";

import { useState } from "react";
import type { RetrievedChunk } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChunkViewerProps {
  chunks: RetrievedChunk[];
  isLoading: boolean;
}

export function ChunkViewer({ chunks, isLoading }: ChunkViewerProps) {
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());

  if (isLoading) return null;
  if (chunks.length === 0) return null;

  const toggleChunk = (id: string) => {
    const next = new Set(expandedChunks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedChunks(next);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <FileText className="h-3.5 w-3.5 text-emerald-400" />
        Retrieved Chunks ({chunks.length})
      </h3>
      <div className="space-y-1.5">
        {chunks.map((chunk) => {
          const isExpanded = expandedChunks.has(chunk.id);
          const scorePercent = Math.round(chunk.score * 100);

          return (
            <div key={chunk.id} className="border border-border rounded-md overflow-hidden">
              <button
                onClick={() => toggleChunk(chunk.id)}
                className="w-full flex items-center gap-2 p-2.5 text-left hover:bg-secondary/30 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
                <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                  #{chunk.rank}
                </Badge>
                <span className="text-xs font-medium truncate flex-1">
                  {chunk.metadata.sourcebook} {chunk.metadata.section}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full score-bar-fill",
                        scorePercent >= 80 ? "bg-emerald-500" :
                        scorePercent >= 60 ? "bg-yellow-500" : "bg-orange-500"
                      )}
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                    {scorePercent}%
                  </span>
                </div>
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-border">
                  <div className="flex items-center gap-2 py-2 text-[10px] text-muted-foreground">
                    <span className="font-semibold">{chunk.metadata.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {chunk.text}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
