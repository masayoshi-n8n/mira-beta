'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Handle,
  Position,
  type NodeTypes,
  type Node,
  type Edge,
  type NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getNodeColor } from '@/lib/graph-utils';
import type { DecisionTrace as DecisionTraceType, DecisionTraceNode, NodeType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DecisionTraceProps {
  trace: DecisionTraceType;
}

interface TraceNodeData {
  label: string;
  nodeType: NodeType;
  source: string;
  confidence: number;
  detail: string;
  color: string;
  onClick: (node: DecisionTraceNode) => void;
  raw: DecisionTraceNode;
}

function TraceNodeComponent({ data }: NodeProps<TraceNodeData>) {
  return (
    <div
      className="cursor-pointer rounded-lg border-2 bg-background p-2.5 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: data.color, maxWidth: 155 }}
      onClick={() => data.onClick(data.raw)}
    >
      <Handle type="target" position={Position.Left} style={{ background: data.color }} />
      <div className="flex items-center gap-1 mb-1.5">
        <div className="h-2 w-2 rounded-full shrink-0" style={{ background: data.color }} />
        <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
          {data.nodeType}
        </span>
      </div>
      <p className="text-[11px] font-semibold leading-tight text-foreground">{data.label}</p>
      <p className="mt-1 text-[10px] text-muted-foreground leading-tight">{data.source}</p>
      <p className="mt-1.5 text-[10px] text-emerald-600 font-medium">
        {Math.round(data.confidence * 100)}% confidence
      </p>
      <Handle type="source" position={Position.Right} style={{ background: data.color }} />
    </div>
  );
}

const NODE_TYPES: NodeTypes = { traceNode: TraceNodeComponent };

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  'dt-001': { x: 0, y: 0 },
  'dt-002': { x: 0, y: 105 },
  'dt-003': { x: 0, y: 210 },
  'dt-004': { x: 0, y: 315 },
  'dt-005': { x: 230, y: 140 },
  'dt-006': { x: 470, y: 140 },
};

function buildFlowNodes(
  traceNodes: DecisionTraceNode[],
  onClickNode: (n: DecisionTraceNode) => void
): Node[] {
  return traceNodes.map((n, i) => ({
    id: n.id,
    type: 'traceNode',
    position: NODE_POSITIONS[n.id] ?? { x: (i % 3) * 220, y: Math.floor(i / 3) * 110 },
    data: {
      label: n.label,
      nodeType: n.type,
      source: n.source,
      confidence: n.confidence,
      detail: n.detail,
      color: getNodeColor(n.type),
      onClick: onClickNode,
      raw: n,
    },
  }));
}

function buildFlowEdges(traceEdges: DecisionTraceType['edges']): Edge[] {
  return traceEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: 'smoothstep',
    animated: e.label === 'caused' || e.label === 'influenced',
    style: { stroke: '#6366f1', strokeWidth: 1.5 },
    labelStyle: { fontSize: 9, fill: '#94a3b8' },
    labelBgStyle: { fill: 'transparent' },
  }));
}

export function DecisionTrace({ trace }: DecisionTraceProps) {
  const [selectedNode, setSelectedNode] = useState<DecisionTraceNode | null>(null);

  const handleNodeClick = useCallback((node: DecisionTraceNode) => {
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const flowNodes = buildFlowNodes(trace.nodes, handleNodeClick);
  const flowEdges = buildFlowEdges(trace.edges);

  return (
    <div className="mt-3 rounded-xl border bg-muted/20 overflow-hidden">
      <div className="border-b bg-background/80 px-3 py-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">Decision trace</p>
        <p className="text-[10px] text-muted-foreground">Click any node to inspect</p>
      </div>

      <div style={{ height: 420 }} className="relative">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.5}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e2e8f0" gap={20} size={1} />
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className="border-t bg-background p-3 space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: getNodeColor(selectedNode.type) }}
            />
            <p className="text-xs font-semibold">{selectedNode.label}</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{selectedNode.detail}</p>
          <p className="text-[10px] text-muted-foreground">
            Source: {selectedNode.source} · {new Date(selectedNode.timestamp).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
