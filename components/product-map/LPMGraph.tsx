'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft } from 'lucide-react';

import { GroupCardNode } from './GroupCard';
import { LpmNodeCard } from './LpmNode';
import {
  buildGroupNodes,
  buildGroupEdges,
  buildGroupDetailNodes,
  buildGroupDetailEdges,
  THEME_GROUP_CONFIG,
} from '@/lib/graph-utils';
import type { LPMNode, LPMEdge, ThemeGroupKey } from '@/lib/types';

// Defined outside component — prevents ReactFlow from remounting custom nodes on every render
const NODE_TYPES: NodeTypes = {
  groupCard: GroupCardNode,
  lpmNode: LpmNodeCard,
};

interface LPMGraphProps {
  nodes: LPMNode[];
  edges: LPMEdge[];
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string | null) => void;
  externalHighlightIds?: string[] | null;
}

function LPMGraphInner({
  nodes,
  edges,
  selectedNodeId: controlledId,
  onNodeSelect,
  externalHighlightIds,
}: LPMGraphProps) {
  const [activeGroup, setActiveGroup] = useState<ThemeGroupKey | null>(null);
  const [internalId, setInternalId] = useState<string | null>(null);
  const [hoveredGroup, setHoveredGroup] = useState<ThemeGroupKey | null>(null);
  const { fitView } = useReactFlow();

  const selectedNodeId = controlledId !== undefined ? controlledId : internalId;

  const handleNodeSelect = useCallback(
    (id: string) => {
      const next = selectedNodeId === id ? null : id;
      onNodeSelect ? onNodeSelect(next) : setInternalId(next);
    },
    [selectedNodeId, onNodeSelect],
  );

  const handleDrillDown = useCallback(
    (groupKey: ThemeGroupKey) => {
      setActiveGroup(groupKey);
      onNodeSelect?.(null);
      setInternalId(null);
    },
    [onNodeSelect],
  );

  const handleBack = useCallback(() => {
    setActiveGroup(null);
    onNodeSelect?.(null);
    setInternalId(null);
  }, [onNodeSelect]);

  const handleHover = useCallback((k: ThemeGroupKey | null) => {
    setHoveredGroup(k);
  }, []);

  // Fit view whenever the active group changes
  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.15, duration: 500 }), 60);
    return () => clearTimeout(t);
  }, [activeGroup, fitView]);

  // ── Overview nodes/edges ───────────────────────────────────────────────────
  const overviewNodes = useMemo(
    () =>
      buildGroupNodes(nodes).map((n) => ({
        ...n,
        data: {
          ...n.data,
          dimmed: hoveredGroup !== null && hoveredGroup !== n.data.groupKey,
          onDrillDown: handleDrillDown,
          onHover: handleHover,
        },
      })),
    [nodes, hoveredGroup, handleDrillDown, handleHover],
  );

  const overviewEdges = useMemo(() => buildGroupEdges(), []);

  // ── Detail nodes/edges ─────────────────────────────────────────────────────
  const detailNodes = useMemo(() => {
    if (!activeGroup) return [];
    return buildGroupDetailNodes(nodes, activeGroup).map((n) => ({
      ...n,
      data: {
        ...n.data,
        dimmed: externalHighlightIds ? !externalHighlightIds.includes(n.id) : false,
        onSelect: handleNodeSelect,
      },
    }));
  }, [nodes, activeGroup, externalHighlightIds, handleNodeSelect]);

  const detailEdges = useMemo(() => {
    if (!activeGroup) return [];
    return buildGroupDetailEdges(edges, nodes, activeGroup);
  }, [edges, nodes, activeGroup]);

  // ── Active config ──────────────────────────────────────────────────────────
  const activeGroupConfig = useMemo(
    () => (activeGroup ? THEME_GROUP_CONFIG.find((c) => c.key === activeGroup) : null),
    [activeGroup],
  );

  const flowNodes = activeGroup ? detailNodes : overviewNodes;
  const flowEdges = activeGroup ? detailEdges : overviewEdges;

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        className="bg-gray-50"
      >
        <Background color="#e2e8f0" gap={28} size={1} variant={BackgroundVariant.Dots} />
      </ReactFlow>

      {/* Back button — shown in detail view */}
      {activeGroup && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2.5">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Groups
          </button>
          {activeGroupConfig && (
            <div
              className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm"
              style={{ borderColor: `${activeGroupConfig.color}40` }}
            >
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: activeGroupConfig.color }}
              />
              <span className="text-xs font-semibold text-gray-800">{activeGroupConfig.label}</span>
              <span className="text-[10px] text-gray-400">
                {detailNodes.length} nodes
              </span>
            </div>
          )}
        </div>
      )}

      {/* Overview hint */}
      {!activeGroup && (
        <div className="absolute top-4 left-4 z-10">
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-[11px] text-gray-500">
              <span className="font-semibold text-gray-700">8 theme groups</span>
              {' · '}Click any group to explore
            </p>
          </div>
        </div>
      )}

      {/* Stats pill */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] text-gray-500 shadow-sm font-mono">
          {activeGroup
            ? `${detailNodes.length} nodes · ${detailEdges.length} edges`
            : `${nodes.length} nodes · ${edges.length} edges · 60 days context`}
        </div>
      </div>
    </div>
  );
}

export function LPMGraph(props: LPMGraphProps) {
  return (
    <ReactFlowProvider>
      <LPMGraphInner {...props} />
    </ReactFlowProvider>
  );
}
