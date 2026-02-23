"use client";

import type { RAGConfig, EmbeddingModel, RetrievalMethod } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface Props {
  config: RAGConfig;
  onChange: (config: RAGConfig) => void;
}

const embeddingModels: { value: EmbeddingModel; label: string }[] = [
  { value: "text-embedding-3-small", label: "text-embedding-3-small" },
  { value: "text-embedding-3-large", label: "text-embedding-3-large" },
  { value: "text-embedding-ada-002", label: "text-embedding-ada-002" },
];

const retrievalMethods: { value: RetrievalMethod; label: string }[] = [
  { value: "cosine", label: "Cosine Similarity" },
  { value: "mmr", label: "MMR (Maximal Marginal Relevance)" },
  { value: "hybrid", label: "Hybrid (keyword + semantic)" },
];

export function RetrievalConfig({ config, onChange }: Props) {
  return (
    <div className="config-section">
      <div className="config-section-title">
        <Search className="h-3.5 w-3.5" />
        Retrieval
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Embedding Model</Label>
        <Select value={config.embeddingModel} onValueChange={(v) => onChange({ ...config, embeddingModel: v as EmbeddingModel })}>
          <SelectTrigger className="h-8 text-xs font-mono"><SelectValue /></SelectTrigger>
          <SelectContent>
            {embeddingModels.map((m) => (
              <SelectItem key={m.value} value={m.value} className="text-xs font-mono">{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Top-K Chunks</Label>
          <span className="text-xs font-mono text-emerald-400">{config.topK}</span>
        </div>
        <Slider
          value={[config.topK]}
          onValueChange={([v]) => onChange({ ...config, topK: v })}
          min={1} max={20} step={1}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Similarity Threshold</Label>
          <span className="text-xs font-mono text-emerald-400">{config.similarityThreshold.toFixed(2)}</span>
        </div>
        <Slider
          value={[config.similarityThreshold * 100]}
          onValueChange={([v]) => onChange({ ...config, similarityThreshold: v / 100 })}
          min={0} max={100} step={5}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Retrieval Method</Label>
        <Select value={config.retrievalMethod} onValueChange={(v) => onChange({ ...config, retrievalMethod: v as RetrievalMethod })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {retrievalMethods.map((m) => (
              <SelectItem key={m.value} value={m.value} className="text-xs">{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Reranking</Label>
        <Switch
          checked={config.reranking}
          onCheckedChange={(v) => onChange({ ...config, reranking: v })}
        />
      </div>
    </div>
  );
}
