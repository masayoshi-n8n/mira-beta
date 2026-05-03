'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  type NodeTypes,
  type Node,
  type NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getNodeColor, lpmNodesToFlowNodes, lpmEdgesToFlowEdges, type LPMGroupData } from '@/lib/graph-utils';
import { GraphControls } from './GraphControls';
import type { LPMNode, LPMEdge, NodeType } from '@/lib/types';

interface LPMGraphProps {
  nodes: LPMNode[];
  edges: LPMEdge[];
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string | null) => void;
  externalHighlightIds?: string[] | null;
}

interface LPMNodeData {
  label: string;
  nodeType: NodeType;
  confidence: number;
  source: string;
  description: string;
  color: string;
  highlighted: boolean;
  faded: boolean;
}

// Group annotation node — rendered as background rectangle behind data nodes
function LPMGroupComponent({ data }: NodeProps) {
  const d = data as LPMGroupData;
  return (
    <div
      style={{
        width: d.width,
        height: d.height,
        background: d.bgColor,
        borderRadius: 16,
        border: `1.5px solid ${d.color}25`,
        pointerEvents: 'none',
      }}
    >
      <div
        className="flex items-center gap-1.5 px-3 pt-3"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ background: d.color }}
        />
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: d.color }}
        >
          {d.label}
        </span>
      </div>
    </div>
  );
}

// Data node — card with colored left accent, type badge, label, source
function LPMNodeComponent({ data, selected }: NodeProps<LPMNodeData>) {
  return (
    <div
      className="transition-all duration-200 cursor-pointer"
      style={{ opacity: data.faded ? 0.12 : 1 }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: data.color, width: 6, height: 6, border: 'none' }}
      />
      <div
        className="relative bg-white rounded-xl overflow-hidden transition-all duration-150"
        style={{
          width: 200,
          transform: selected || data.highlighted ? 'scale(1.04)' : 'scale(1)',
          border: `1px solid ${selected ? data.color : data.highlighted ? data.color + '60' : '#e2e8f0'}`,
          boxShadow: selected
            ? `0 0 0 3px ${data.color}28, 0 4px 12px rgba(0,0,0,0.10)`
            : data.highlighted
            ? `0 0 0 2px ${data.color}18, 0 2px 6px rgba(0,0,0,0.07)`
            : '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {/* Colored left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: data.color }}
        />

        <div className="pl-4 pr-3 py-2.5">
          {/* Type badge */}
          <span
            className="text-[8.5px] font-bold uppercase tracking-wider"
            style={{ color: data.color }}
          >
            {data.nodeType}
          </span>
          {/* Label */}
          <p className="mt-1 text-[11px] font-semibold text-gray-900 leading-tight line-clamp-2">
            {data.label}
          </p>
          {/* Source */}
          <p className="mt-1.5 text-[9px] text-gray-400 truncate">{data.source}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: data.color, width: 6, height: 6, border: 'none' }}
      />
    </div>
  );
}

const NODE_TYPES: NodeTypes = {
  lpmNode: LPMNodeComponent,
  lpmGroup: LPMGroupComponent,
};

export function LPMGraph({
  nodes,
  edges,
  selectedNodeId: controlledSelectedId,
  onNodeSelect,
  externalHighlightIds,
}: LPMGraphProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilters, setActiveTypeFilters] = useState<NodeType[]>([]);

  const selectedNodeId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;

  function getNodeHighlight(nodeId: string): { highlighted: boolean; faded: boolean } {
    const hasExternalFilter = externalHighlightIds !== null && externalHighlightIds !== undefined;
    const hasLocalFilter = searchQuery || activeTypeFilters.length > 0;

    if (!hasExternalFilter && !hasLocalFilter) {
      return { highlighted: false, faded: false };
    }

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { highlighted: false, faded: true };

    if (hasExternalFilter) {
      const inExternal = externalHighlightIds!.includes(nodeId);
      if (!hasLocalFilter) return { highlighted: inExternal, faded: !inExternal };
      const matchesSearch =
        !searchQuery ||
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeTypeFilters.length === 0 || activeTypeFilters.includes(node.type);
      const inLocal = matchesSearch && matchesFilter;
      const highlighted = inExternal && inLocal;
      return { highlighted, faded: !highlighted };
    }

    const matchesSearch =
      !searchQuery ||
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeTypeFilters.length === 0 || activeTypeFilters.includes(node.type);
    if (matchesSearch && matchesFilter) return { highlighted: true, faded: false };
    return { highlighted: false, faded: true };
  }

  const allFlowNodes = lpmNodesToFlowNodes(nodes);

  const flowNodes: Node[] = allFlowNodes.map((fn) => {
    if (fn.type === 'lpmGroup') return fn; // group annotation nodes are unaffected by highlights
    const { highlighted, faded } = getNodeHighlight(fn.id);
    return {
      ...fn,
      selected: fn.id === selectedNodeId,
      data: { ...fn.data, highlighted, faded },
    };
  });

  // Only data nodes used for edge fading calculations
  const dataFlowNodes = flowNodes.filter((n) => n.type === 'lpmNode');

  const flowEdges = lpmEdgesToFlowEdges(edges).map((e) => {
    const hasFilter =
      (externalHighlightIds !== null && externalHighlightIds !== undefined) ||
      searchQuery ||
      activeTypeFilters.length > 0;
    if (!hasFilter) return e;
    const srcVisible = !dataFlowNodes.find((n) => n.id === e.source)?.data.faded;
    const tgtVisible = !dataFlowNodes.find((n) => n.id === e.target)?.data.faded;
    return {
      ...e,
      style: {
        ...e.style,
        opacity: srcVisible && tgtVisible ? 1 : 0.06,
      },
    };
  });

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'lpmGroup') return; // ignore group annotation clicks
      const newId = selectedNodeId === node.id ? null : node.id;
      if (onNodeSelect) {
        onNodeSelect(newId);
      } else {
        setInternalSelectedId(newId);
      }
    },
    [selectedNodeId, onNodeSelect]
  );

  const handlePaneClick = useCallback(() => {
    if (onNodeSelect) {
      onNodeSelect(null);
    } else {
      setInternalSelectedId(null);
    }
  }, [onNodeSelect]);

  return (
    <div className="relative flex h-full w-full bg-[#f6f5f3]">
      <div className="flex-1" style={{ height: '100%' }}>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={NODE_TYPES}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            color="#ddd8d0"
            gap={28}
            size={1}
            variant={BackgroundVariant.Dots}
          />
          <Controls
            className="!shadow-md !rounded-xl !border !bg-white"
            showInteractive={false}
          />
          <MiniMap
            className="!rounded-xl !border !shadow-md"
            nodeColor={(node) => {
              if (node.type === 'lpmGroup') {
                return (node.data as LPMGroupData).bgColor;
              }
              return (node.data as LPMNodeData).color;
            }}
            nodeStrokeWidth={0}
            maskColor="rgba(246,245,243,0.75)"
          />
        </ReactFlow>
      </div>

      {/* Search / filter controls overlay */}
      <div className="absolute left-4 top-4 z-10">
        <GraphControls onSearch={setSearchQuery} onFilter={setActiveTypeFilters} />
      </div>

      {/* Node + connection count badge */}
      <div className="absolute bottom-20 left-4 z-10">
        <div className="rounded-lg border bg-white/95 backdrop-blur px-3 py-1.5 text-xs text-gray-400 shadow-sm">
          {nodes.length} nodes · {edges.length} connections
        </div>
      </div>
    </div>
  );
}
