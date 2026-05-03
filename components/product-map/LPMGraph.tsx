'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type NodeTypes,
  type Node,
  type NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getNodeColor, lpmNodesToFlowNodes, lpmEdgesToFlowEdges } from '@/lib/graph-utils';
import { getNodeById } from '@/lib/data';
import { NodeSidePanel } from './NodeSidePanel';
import { GraphControls } from './GraphControls';
import type { LPMNode, NodeType } from '@/lib/types';

interface LPMGraphProps {
  nodes: LPMNode[];
  edges: import('@/lib/types').LPMEdge[];
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

function LPMNodeComponent({ data, selected }: NodeProps<LPMNodeData>) {
  return (
    <div
      className="transition-all duration-200 cursor-pointer"
      style={{
        opacity: data.faded ? 0.3 : 1,
        transform: selected ? 'scale(1.08)' : 'scale(1)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: data.color, width: 8, height: 8 }} />
      <div
        className="rounded-xl border-2 bg-background px-3 py-2 shadow-sm hover:shadow-md transition-shadow"
        style={{
          borderColor: selected ? data.color : data.highlighted ? data.color : '#e2e8f0',
          maxWidth: 170,
          boxShadow: selected ? `0 0 0 3px ${data.color}40` : undefined,
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: data.color }} />
          <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
            {data.nodeType}
          </span>
        </div>
        <p className="text-[11px] font-semibold leading-tight text-foreground">{data.label}</p>
        <div className="mt-1.5 flex items-center gap-1">
          <div
            className="h-1 rounded-full"
            style={{ width: `${data.confidence * 40}px`, background: data.color, opacity: 0.6 }}
          />
          <span className="text-[9px] text-muted-foreground">{Math.round(data.confidence * 100)}%</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: data.color, width: 8, height: 8 }} />
    </div>
  );
}

const NODE_TYPES: NodeTypes = { lpmNode: LPMNodeComponent };

export function LPMGraph({ nodes, edges }: LPMGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilters, setActiveTypeFilters] = useState<NodeType[]>([]);

  const selectedLPMNode = selectedNodeId ? getNodeById(selectedNodeId) : null;

  function getNodeHighlight(nodeId: string): { highlighted: boolean; faded: boolean } {
    if (!searchQuery && activeTypeFilters.length === 0) {
      return { highlighted: false, faded: false };
    }
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { highlighted: false, faded: true };

    const matchesSearch =
      !searchQuery ||
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeTypeFilters.length === 0 || activeTypeFilters.includes(node.type);

    if (matchesSearch && matchesFilter) return { highlighted: true, faded: false };
    return { highlighted: false, faded: true };
  }

  const flowNodes: Node[] = lpmNodesToFlowNodes(nodes).map((fn) => {
    const { highlighted, faded } = getNodeHighlight(fn.id);
    return {
      ...fn,
      selected: fn.id === selectedNodeId,
      data: { ...fn.data, highlighted, faded },
    };
  });

  const flowEdges = lpmEdgesToFlowEdges(edges);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  return (
    <div className="relative flex h-full w-full">
      <div className="flex-1" style={{ height: '100%' }}>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={NODE_TYPES}
          onNodeClick={handleNodeClick}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#f1f5f9" gap={24} size={1} />
          <Controls
            className="!shadow-md !rounded-xl !border !bg-background"
            showInteractive={false}
          />
          <MiniMap
            className="!rounded-xl !border !shadow-md"
            nodeColor={(node) => (node.data as LPMNodeData).color}
            maskColor="rgba(241,245,249,0.7)"
          />
        </ReactFlow>
      </div>

      {/* Controls overlay */}
      <div className="absolute left-4 top-4 z-10">
        <GraphControls onSearch={setSearchQuery} onFilter={setActiveTypeFilters} />
      </div>

      {/* Node count badge */}
      <div className="absolute bottom-20 left-4 z-10">
        <div className="rounded-lg border bg-background/95 backdrop-blur px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
          {nodes.length} nodes · {edges.length} connections
        </div>
      </div>

      {/* Side panel */}
      {selectedLPMNode && (
        <div className="w-80 shrink-0 border-l bg-background overflow-hidden animate-in slide-in-from-right duration-200">
          <NodeSidePanel
            node={selectedLPMNode}
            onClose={() => setSelectedNodeId(null)}
          />
        </div>
      )}
    </div>
  );
}
