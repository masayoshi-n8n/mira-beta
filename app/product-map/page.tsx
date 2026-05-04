'use client';

import { useState } from 'react';
import { getEdges, getNodeById, getNodes } from '@/lib/data';
import { LPMGraph } from '@/components/product-map/LPMGraph';
import { GraphQueryPanel } from '@/components/product-map/GraphQueryPanel';
import type { LPMNode } from '@/lib/types';

export default function ProductMapPage() {
  const nodes = getNodes();
  const edges = getEdges();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[] | null>(null);

  const selectedNode: LPMNode | null = selectedNodeId ? (getNodeById(selectedNodeId) ?? null) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header — dark to blend into the graph */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#1a2235] bg-[#080b10] shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-slate-200">Product Map</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            {nodes.length} nodes · {edges.length} connections · 60 days of context
            {highlightedNodeIds && (
              <span className="ml-2 text-indigo-400 font-medium">
                · {highlightedNodeIds.length} highlighted
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Graph */}
        <div className="flex-1 min-w-0">
          <LPMGraph
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
            externalHighlightIds={highlightedNodeIds}
          />
        </div>

        {/* Right panel */}
        <GraphQueryPanel
          allNodes={nodes}
          selectedNode={selectedNode}
          onHighlight={setHighlightedNodeIds}
          onCloseNode={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
}
