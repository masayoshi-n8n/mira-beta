'use client';

import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getNodeColor } from '@/lib/graph-utils';
import { getEdgesForNode } from '@/lib/data';
import type { LPMNode } from '@/lib/types';

interface NodeSidePanelProps {
  node: LPMNode;
  onClose: () => void;
}

const CONFIDENCE_LABEL: Record<string, string> = {
  high: 'High',
  inferred: 'Inferred',
};

function confidenceLevel(score: number) {
  if (score >= 0.8) return { label: 'High', color: 'bg-emerald-100 text-emerald-700' };
  if (score >= 0.5) return { label: 'Inferred', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Low', color: 'bg-red-100 text-red-700' };
}

export function NodeSidePanel({ node, onClose }: NodeSidePanelProps) {
  const edges = getEdgesForNode(node.id);
  const color = getNodeColor(node.type);
  const conf = confidenceLevel(node.confidence);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b px-4 py-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
            style={{ background: color }}
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {node.type}
            </p>
            <h3 className="mt-0.5 text-sm font-semibold leading-snug">{node.label}</h3>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{node.description}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/40 px-3 py-2">
            <p className="text-[10px] font-medium text-muted-foreground">Confidence</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${conf.color}`}>
                {conf.label}
              </span>
              <span className="text-xs font-semibold">{Math.round(node.confidence * 100)}%</span>
            </div>
          </div>
          <div className="rounded-lg bg-muted/40 px-3 py-2">
            <p className="text-[10px] font-medium text-muted-foreground">Source</p>
            <p className="mt-1 text-xs font-medium">{node.source}</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <p className="text-[10px] font-medium text-muted-foreground">Date ingested</p>
          <p className="mt-1 text-xs">{new Date(node.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {edges.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Connections ({edges.length})
            </p>
            <div className="flex flex-col gap-1.5">
              {edges.map((e) => {
                const isSource = e.source === node.id;
                const other = isSource ? e.target : e.source;
                return (
                  <div key={e.id} className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs">
                    <span className="text-muted-foreground">{isSource ? '→' : '←'}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{other}</span>
                    <Badge variant="secondary" className="ml-auto text-[9px] h-4 border-0 bg-muted">
                      {e.type}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {Object.keys(node.metadata).length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Metadata
            </p>
            <div className="flex flex-col gap-1">
              {Object.entries(node.metadata).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 text-xs">
                  <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                  <span className="font-medium text-right max-w-[60%] truncate">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
