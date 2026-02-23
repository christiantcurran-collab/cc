"use client";

import type { RAGConfig, GenerationModel } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";

interface Props {
  config: RAGConfig;
  onChange: (config: RAGConfig) => void;
}

const models: { value: GenerationModel; label: string }[] = [
  { value: "gpt-4o", label: "gpt-4o" },
  { value: "gpt-4o-mini", label: "gpt-4o-mini" },
  { value: "gpt-4-turbo", label: "gpt-4-turbo" },
  { value: "gpt-3.5-turbo", label: "gpt-3.5-turbo" },
];

export function GenerationConfig({ config, onChange }: Props) {
  return (
    <div className="config-section">
      <div className="config-section-title">
        <Sparkles className="h-3.5 w-3.5" />
        Generation
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Model</Label>
        <Select value={config.generationModel} onValueChange={(v) => onChange({ ...config, generationModel: v as GenerationModel })}>
          <SelectTrigger className="h-8 text-xs font-mono"><SelectValue /></SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.value} value={m.value} className="text-xs font-mono">{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Temperature</Label>
          <span className="text-xs font-mono text-emerald-400">{config.temperature.toFixed(1)}</span>
        </div>
        <Slider
          value={[config.temperature * 10]}
          onValueChange={([v]) => onChange({ ...config, temperature: v / 10 })}
          min={0} max={20} step={1}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Max Tokens</Label>
          <span className="text-xs font-mono text-emerald-400">{config.maxTokens}</span>
        </div>
        <Slider
          value={[config.maxTokens]}
          onValueChange={([v]) => onChange({ ...config, maxTokens: v })}
          min={100} max={4000} step={100}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Top P</Label>
          <span className="text-xs font-mono text-emerald-400">{config.topP.toFixed(1)}</span>
        </div>
        <Slider
          value={[config.topP * 10]}
          onValueChange={([v]) => onChange({ ...config, topP: v / 10 })}
          min={0} max={10} step={1}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Frequency Penalty</Label>
          <span className="text-xs font-mono text-emerald-400">{config.frequencyPenalty.toFixed(1)}</span>
        </div>
        <Slider
          value={[config.frequencyPenalty * 10]}
          onValueChange={([v]) => onChange({ ...config, frequencyPenalty: v / 10 })}
          min={0} max={20} step={1}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Presence Penalty</Label>
          <span className="text-xs font-mono text-emerald-400">{config.presencePenalty.toFixed(1)}</span>
        </div>
        <Slider
          value={[config.presencePenalty * 10]}
          onValueChange={([v]) => onChange({ ...config, presencePenalty: v / 10 })}
          min={0} max={20} step={1}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">System Prompt</Label>
        <Textarea
          value={config.systemPrompt}
          onChange={(e) => onChange({ ...config, systemPrompt: e.target.value })}
          className="min-h-[100px] text-xs font-mono resize-y"
        />
      </div>
    </div>
  );
}
