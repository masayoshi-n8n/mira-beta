'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getNodeColor } from '@/lib/graph-utils';
import { getEdgesForNode, getNodeById } from '@/lib/data';
import type { LPMNode } from '@/lib/types';

interface NodeSidePanelProps {
  node: LPMNode;
  onClose: () => void;
}

function confidenceLevel(score: number) {
  if (score >= 0.8) return { label: 'High', color: 'bg-emerald-100 text-emerald-700' };
  if (score >= 0.5) return { label: 'Inferred', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Low', color: 'bg-red-100 text-red-700' };
}

const EDGE_TYPE_COLORS: Record<string, string> = {
  influenced: 'bg-purple-100 text-purple-700',
  caused: 'bg-blue-100 text-blue-700',
  preceded: 'bg-gray-100 text-gray-700',
  contradicts: 'bg-red-100 text-red-700',
  relates_to: 'bg-gray-100 text-gray-600',
  is_child_of: 'bg-indigo-100 text-indigo-700',
  was_deprioritized_by: 'bg-orange-100 text-orange-700',
};

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
            className="mt-1 h-3 w-3 shrink-0 rounded-full"
            style={{ background: color }}
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {node.type}
            </p>
            <h3 className="mt-0.5 text-sm font-semibold leading-snug">{node.label}</h3>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mt-0.5" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        <p className="text-sm text-muted-foreground leading-relaxed">{node.description}</p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/40 px-3 py-2.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Confidence</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${conf.color}`}>
                {conf.label}
              </span>
              <span className="text-xs font-semibold text-foreground">{Math.round(node.confidence * 100)}%</span>
            </div>
          </div>
          <div className="rounded-lg bg-muted/40 px-3 py-2.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Source</p>
            <p className="mt-1.5 text-xs font-semibold text-foreground">{node.source}</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/40 px-3 py-2.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Date ingested</p>
          <p className="mt-1.5 text-xs text-foreground">
            {new Date(node.timestamp).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Connections */}
        {edges.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
              Connections ({edges.length})
            </p>
            <div className="flex flex-col gap-2">
              {edges.map((e) => {
                const isSource = e.source === node.id;
                const otherId = isSource ? e.target : e.source;
                const otherNode = getNodeById(otherId);
                const otherColor = otherNode ? getNodeColor(otherNode.type) : '#94a3b8';
                const edgeClass = EDGE_TYPE_COLORS[e.type] ?? 'bg-gray-100 text-gray-600';
                return (
                  <div
                    key={e.id}
                    className="flex flex-col gap-1.5 rounded-lg border bg-muted/20 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">{isSource ? '→' : '←'}</span>
                      <div
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ background: otherColor }}
                      />
                      <span className="text-xs font-medium text-foreground leading-tight line-clamp-1">
                        {otherNode?.label ?? otherId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-[9px] h-4 border-0 font-medium ${edgeClass}`}
                      >
                        {e.type.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground">
                        {Math.round(e.confidence * 100)}% conf.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Metadata */}
        {Object.keys(node.metadata).length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
              Metadata
            </p>
            <div className="flex flex-col gap-1.5">
              {Object.entries(node.metadata).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 text-xs">
                  <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                  <span className="font-medium text-right max-w-[55%] truncate text-foreground">
                    {String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
