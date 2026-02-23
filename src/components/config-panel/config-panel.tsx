"use client";

import type { RAGConfig } from "@/lib/types";
import { DEFAULT_CONFIG } from "@/lib/types";
import { ChunkingConfig } from "./chunking-config";
import { RetrievalConfig } from "./retrieval-config";
import { GenerationConfig } from "./generation-config";
import { AdvancedConfig } from "./advanced-config";
import { Button } from "@/components/ui/button";
import { RotateCcw, Copy, Settings2 } from "lucide-react";

interface ConfigPanelProps {
  config: RAGConfig;
  onChange: (config: RAGConfig) => void;
  label?: string;
}

export function ConfigPanel({ config, onChange, label }: ConfigPanelProps) {
  const handleReset = () => onChange({ ...DEFAULT_CONFIG });

  const handleCopyConfig = () => {
    const configJson = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(configJson);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold">{label || "Configuration"}</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyConfig} title="Copy config as JSON">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset} title="Reset to defaults">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <ChunkingConfig config={config} onChange={onChange} />
        <RetrievalConfig config={config} onChange={onChange} />
        <GenerationConfig config={config} onChange={onChange} />
        <AdvancedConfig config={config} onChange={onChange} />
      </div>
    </div>
  );
}
