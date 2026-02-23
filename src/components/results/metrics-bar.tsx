"use client";

import type { QueryMetrics } from "@/lib/types";
import { formatCost } from "@/lib/cost-calculator";
import { Clock, Zap, Coins, Layers } from "lucide-react";

interface MetricsBarProps {
  metrics: QueryMetrics | null;
}

export function MetricsBar({ metrics }: MetricsBarProps) {
  if (!metrics) return null;

  const items = [
    { icon: Clock, label: "Retrieval", value: `${Math.round(metrics.retrievalLatencyMs)}ms` },
    { icon: Zap, label: "Generation", value: `${Math.round(metrics.generationLatencyMs)}ms` },
    { icon: Coins, label: "Tokens", value: `${metrics.totalTokens.toLocaleString()}` },
    { icon: Coins, label: "Cost", value: formatCost(metrics.estimatedCost) },
    { icon: Layers, label: "Chunks", value: `${metrics.chunksAfterThreshold}/${metrics.chunksRetrieved}` },
  ];

  return (
    <div className="flex flex-wrap gap-3 py-2.5 px-3 bg-secondary/30 rounded-md border border-border">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <item.icon className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{item.label}</span>
          <span className="text-[11px] font-mono font-medium text-emerald-400">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
