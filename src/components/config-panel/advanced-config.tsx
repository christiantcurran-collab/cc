"use client";

import type { RAGConfig, ContextStrategy } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench } from "lucide-react";

interface Props {
  config: RAGConfig;
  onChange: (config: RAGConfig) => void;
}

const contextStrategies: { value: ContextStrategy; label: string }[] = [
  { value: "stuff", label: "Stuff All Chunks" },
  { value: "map-reduce", label: "Map-Reduce" },
  { value: "refine", label: "Refine" },
];

export function AdvancedConfig({ config, onChange }: Props) {
  return (
    <div className="config-section">
      <div className="config-section-title">
        <Wrench className="h-3.5 w-3.5" />
        Advanced
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Context Window Strategy</Label>
        <Select value={config.contextStrategy} onValueChange={(v) => onChange({ ...config, contextStrategy: v as ContextStrategy })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {contextStrategies.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Include Chunk Metadata</Label>
        <Switch
          checked={config.includeMetadata}
          onCheckedChange={(v) => onChange({ ...config, includeMetadata: v })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Show Raw Prompt</Label>
        <Switch
          checked={config.showRawPrompt}
          onCheckedChange={(v) => onChange({ ...config, showRawPrompt: v })}
        />
      </div>
    </div>
  );
}
