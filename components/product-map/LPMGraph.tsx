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
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading knowledge graph…</p>
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

export function LPMGraph({
  nodes,
  edges,
  selectedNodeId: controlledSelectedId,
  onNodeSelect,
  externalHighlightIds,
}: LPMGraphProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilters, setActiveTypeFilters] = useState<NodeType[]>([]);

  const selectedNodeId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;
  const graph = useMemo(() => buildSigmaGraph(nodes, edges), [nodes, edges]);

  function handleNodeClick(id: string) {
    const newId = selectedNodeId === id ? null : id;
    if (onNodeSelect) {
      onNodeSelect(newId);
    } else {
      setInternalSelectedId(newId);
    }
  }

  function handleStageClick() {
    if (onNodeSelect) {
      onNodeSelect(null);
    } else {
      setInternalSelectedId(null);
    }
  }

  return (
    <div className="relative h-full w-full bg-slate-50">
      <div className="absolute inset-0">
        <SigmaGraph
          graph={graph}
          selectedId={selectedNodeId ?? null}
          onNodeClick={handleNodeClick}
          onStageClick={handleStageClick}
          searchQuery={searchQuery}
          activeFilters={activeTypeFilters}
          externalHighlightIds={externalHighlightIds}
        />
      </div>

      <div className="absolute left-4 top-4 z-10">
        <GraphControls
          collapsed={controlsCollapsed}
          onToggleCollapse={() => setControlsCollapsed((c) => !c)}
          onSearch={setSearchQuery}
          onFilter={setActiveTypeFilters}
        />
      </div>

      <div className="absolute bottom-4 left-4 z-10">
        <div className="rounded-lg border bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
          {nodes.length} nodes · {edges.length} connections
        </div>
      </div>
    </div>
  );
}
