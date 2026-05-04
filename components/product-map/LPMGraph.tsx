'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { buildSigmaGraph } from '@/lib/sigma-utils';
import { GraphControls } from './GraphControls';
import type { LPMNode, LPMEdge, NodeType } from '@/lib/types';
import type { SigmaGraphProps } from './SigmaGraph';

const SigmaGraph = dynamic<SigmaGraphProps>(
  () => import('./SigmaGraph').then((m) => ({ default: m.SigmaGraph })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#080b10]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-xs text-slate-500">Initialising graph…</p>
        </div>
      </div>
    ),
  }
);

interface LPMGraphProps {
  nodes: LPMNode[];
  edges: LPMEdge[];
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string | null) => void;
  externalHighlightIds?: string[] | null;
}

export function LPMGraph({ nodes, edges, selectedNodeId: controlledId, onNodeSelect, externalHighlightIds }: LPMGraphProps) {
  const [internalId,       setInternalId]       = useState<string | null>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [searchQuery,       setSearchQuery]       = useState('');
  const [activeFilters,     setActiveFilters]     = useState<NodeType[]>([]);
  const [depth,             setDepth]             = useState(0);

  const selectedNodeId = controlledId !== undefined ? controlledId : internalId;
  const graph          = useMemo(() => buildSigmaGraph(nodes, edges), [nodes, edges]);

  function handleNodeClick(id: string) {
    const newId = selectedNodeId === id ? null : id;
    onNodeSelect ? onNodeSelect(newId) : setInternalId(newId);
  }

  function handleStageClick() {
    onNodeSelect ? onNodeSelect(null) : setInternalId(null);
  }

  return (
    <div className="relative h-full w-full bg-[#080b10]">
      <div className="absolute inset-0">
        <SigmaGraph
          graph={graph}
          selectedId={selectedNodeId ?? null}
          onNodeClick={handleNodeClick}
          onStageClick={handleStageClick}
          searchQuery={searchQuery}
          activeFilters={activeFilters}
          depth={depth}
          externalHighlightIds={externalHighlightIds}
        />
      </div>

      {/* Controls — top left */}
      <div className="absolute left-4 top-4 z-10">
        <GraphControls
          collapsed={controlsCollapsed}
          depth={depth}
          onToggleCollapse={() => setControlsCollapsed((c) => !c)}
          onSearch={setSearchQuery}
          onFilter={setActiveFilters}
          onDepthChange={setDepth}
        />
      </div>

      {/* Stats pill — bottom left */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="rounded-full border border-white/10 bg-[#0f1623]/80 backdrop-blur-sm px-3 py-1 text-[10px] text-slate-500 font-mono">
          {nodes.length} nodes · {edges.length} edges
        </div>
      </div>
    </div>
  );
}
