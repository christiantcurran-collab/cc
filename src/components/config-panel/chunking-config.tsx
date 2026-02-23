"use client";

import type { RAGConfig, Sourcebook, ChunkingStrategy } from "@/lib/types";
import { SOURCEBOOK_INFO } from "@/lib/types";
import { CHUNKING_DESCRIPTIONS } from "@/lib/chunking";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, HelpCircle } from "lucide-react";

interface Props {
  config: RAGConfig;
  onChange: (config: RAGConfig) => void;
}

const strategies: { value: ChunkingStrategy; label: string }[] = [
  { value: "fixed", label: "Fixed Size" },
  { value: "sentence", label: "Sentence-based" },
  { value: "paragraph", label: "Paragraph-based" },
  { value: "recursive", label: "Recursive" },
];

const sourcebooks: Sourcebook[] = ["PRIN", "SYSC", "COBS", "ICOBS", "DISP", "FCG"];

export function ChunkingConfig({ config, onChange }: Props) {
  return (
    <div className="config-section">
      <div className="config-section-title">
        <FileText className="h-3.5 w-3.5" />
        Document Processing
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <Label className="text-xs text-muted-foreground">Chunking Strategy</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger><HelpCircle className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">{CHUNKING_DESCRIPTIONS[config.chunkingStrategy]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={config.chunkingStrategy} onValueChange={(v) => onChange({ ...config, chunkingStrategy: v as ChunkingStrategy })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {strategies.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Chunk Size (tokens)</Label>
          <span className="text-xs font-mono text-emerald-400">{config.chunkSize}</span>
        </div>
        <Slider
          value={[config.chunkSize]}
          onValueChange={([v]) => onChange({ ...config, chunkSize: v })}
          min={100} max={2000} step={50}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>100</span><span>2000</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Chunk Overlap</Label>
          <span className="text-xs font-mono text-emerald-400">{config.chunkOverlap}%</span>
        </div>
        <Slider
          value={[config.chunkOverlap]}
          onValueChange={([v]) => onChange({ ...config, chunkOverlap: v })}
          min={0} max={50} step={5}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Sourcebook Filter</Label>
        <div className="grid grid-cols-3 gap-2">
          {sourcebooks.map((sb) => (
            <label key={sb} className="flex items-center gap-1.5 cursor-pointer" title={SOURCEBOOK_INFO[sb].name}>
              <Checkbox
                checked={config.sourcebookFilter.includes(sb)}
                onCheckedChange={(checked) => {
                  const newFilter = checked
                    ? [...config.sourcebookFilter, sb]
                    : config.sourcebookFilter.filter((s) => s !== sb);
                  onChange({ ...config, sourcebookFilter: newFilter });
                }}
              />
              <span className="text-xs">{sb}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
