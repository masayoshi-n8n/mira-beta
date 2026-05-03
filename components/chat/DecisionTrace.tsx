'use client';

import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  MessageSquare,
  GitBranch,
  Layers,
  TrendingUp,
  User,
  Shield,
  Flag,
  FileText,
  X,
} from 'lucide-react';
import { getNodeColor } from '@/lib/graph-utils';
import type {
  DecisionTrace as DecisionTraceType,
  DecisionTraceNode,
  NodeType,
} from '@/lib/types';
import { cn } from '@/lib/utils';

// ── Constants ────────────────────────────────────────────────────────────────

const NODE_W = 210;
const NODE_H = 108;
const COL_GAP = 80;
const ROW_GAP = 28;

// ── Node type icons ──────────────────────────────────────────────────────────

const TYPE_ICON: Record<NodeType, React.ReactNode> = {
  feedback:   <MessageSquare className="h-2.5 w-2.5" />,
  decision:   <GitBranch     className="h-2.5 w-2.5" />,
  feature:    <Layers        className="h-2.5 w-2.5" />,
  metric:     <TrendingUp    className="h-2.5 w-2.5" />,
  persona:    <User          className="h-2.5 w-2.5" />,
  competitor: <Shield        className="h-2.5 w-2.5" />,
  epic:       <Flag          className="h-2.5 w-2.5" />,
  note:       <FileText      className="h-2.5 w-2.5" />,
};

// ── Edge styles per relationship type ───────────────────────────────────────

interface EdgeCfg {
  color: string;
  width: number;
  animated: boolean;
  dash?: string;
  displayLabel: string;
}

const EDGE_CFG: Record<string, EdgeCfg> = {
  influenced:          { color: '#a855f7', width: 2,   animated: true,  displayLabel: 'influenced' },
  caused:              { color: '#6366f1', width: 2.5, animated: true,  displayLabel: 'caused' },
  preceded:            { color: '#64748b', width: 1.5, animated: false, dash: '4 4', displayLabel: 'preceded' },
  contradicts:         { color: '#ef4444', width: 2,   animated: false, displayLabel: 'contradicts' },
  relates_to:          { color: '#94a3b8', width: 1.5, animated: false, displayLabel: 'relates to' },
  is_child_of:         { color: '#64748b', width: 1.5, animated: false, dash: '4 2', displayLabel: 'child of' },
  was_deprioritized_by:{ color: '#f97316', width: 1.5, animated: false, dash: '6 3', displayLabel: 'deprioritized by' },
};

// ── Auto-layout: topological depth → columns ─────────────────────────────────

function computePositions(
  nodes: DecisionTraceNode[],
  edges: DecisionTraceType['edges'],
): Record<string, { x: number; y: number }> {
  const ids = new Set(nodes.map((n) => n.id));
  const inDeg: Record<string, number> = {};
  const outs: Record<string, string[]> = {};

  for (const n of nodes) { inDeg[n.id] = 0; outs[n.id] = []; }
  for (const e of edges) {
    if (ids.has(e.source) && ids.has(e.target)) {
      inDeg[e.target]++;
      outs[e.source].push(e.target);
    }
  }

  // Kahn's algorithm — assign each node a column depth
  const depth: Record<string, number> = {};
  const rem = { ...inDeg };
  const queue: string[] = [];

  for (const n of nodes) {
    if (inDeg[n.id] === 0) { depth[n.id] = 0; queue.push(n.id); }
  }

  while (queue.length) {
    const id = queue.shift()!;
    for (const next of outs[id]) {
      const d = (depth[id] ?? 0) + 1;
      if (depth[next] === undefined || depth[next] < d) depth[next] = d;
      if (--rem[next] === 0) queue.push(next);
    }
  }

  for (const n of nodes) {
    if (depth[n.id] === undefined) depth[n.id] = 0;
  }

  // Group into columns
  const cols: Record<number, string[]> = {};
  for (const n of nodes) {
    const c = depth[n.id];
    if (!cols[c]) cols[c] = [];
    cols[c].push(n.id);
  }

  // Position: x = column × stride, y = centred within column
  const pos: Record<string, { x: number; y: number }> = {};
  for (const [cStr, colIds] of Object.entries(cols)) {
    const col = Number(cStr);
    const x = col * (NODE_W + COL_GAP);
    const totalH = colIds.length * NODE_H + (colIds.length - 1) * ROW_GAP;
    const startY = -totalH / 2;
    colIds.forEach((id, i) => {
      pos[id] = { x, y: startY + i * (NODE_H + ROW_GAP) };
    });
  }

  return pos;
}

// ── Trace Node card ──────────────────────────────────────────────────────────

interface TraceNodeData {
  nodeType: NodeType;
  label: string;
  source: string;
  confidence: number;
  color: string;
  isSelected: boolean;
  onClick: (raw: DecisionTraceNode) => void;
  raw: DecisionTraceNode;
}

function TraceNode({ data }: NodeProps<TraceNodeData>) {
  return (
    <div
      onClick={() => data.onClick(data.raw)}
      className="relative cursor-pointer rounded-xl bg-white shadow-sm transition-all duration-150 hover:shadow-md"
      style={{
        width: NODE_W,
        minHeight: NODE_H,
        border: `1.5px solid ${data.isSelected ? data.color : '#e2e8f0'}`,
        boxShadow: data.isSelected
          ? `0 0 0 2px ${data.color}40, 0 4px 14px rgba(0,0,0,0.09)`
          : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: data.color, width: 8, height: 8, border: '2px solid white' }}
      />

      {/* Left accent bar */}
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-l-xl"
        style={{ background: data.color }}
      />

      <div className="pl-3.5 pr-3 pb-3 pt-2.5">
        {/* Type badge + confidence % */}
        <div className="flex items-center justify-between mb-1.5">
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-white"
            style={{ background: data.color }}
          >
            {TYPE_ICON[data.nodeType]}
            <span style={{ fontSize: 9 }} className="uppercase tracking-wider font-semibold">
              {data.nodeType}
            </span>
          </div>
          <span className="text-[10px] font-bold" style={{ color: data.color }}>
            {Math.round(data.confidence * 100)}%
          </span>
        </div>

        {/* Label */}
        <p className="text-[12px] font-semibold text-gray-900 leading-tight">{data.label}</p>

        {/* Source */}
        <p className="mt-0.5 text-[10px] text-gray-400 leading-tight truncate">{data.source}</p>

        {/* Confidence bar */}
        <div className="mt-2 h-1 w-full rounded-full bg-gray-100">
          <div
            className="h-1 rounded-full"
            style={{ width: `${data.confidence * 100}%`, background: data.color }}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: data.color, width: 8, height: 8, border: '2px solid white' }}
      />
    </div>
  );
}

const NODE_TYPES: NodeTypes = { trace: TraceNode };

// ── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  node,
  onClose,
}: {
  node: DecisionTraceNode;
  onClose: () => void;
}) {
  const color = getNodeColor(node.type);
  const pct = Math.round(node.confidence * 100);
  const confLabel =
    node.confidence >= 0.8 ? 'High confidence'
    : node.confidence >= 0.5 ? 'Inferred'
    : 'Low confidence';
  const confClass =
    node.confidence >= 0.8 ? 'text-emerald-700 bg-emerald-50'
    : node.confidence >= 0.5 ? 'text-amber-700 bg-amber-50'
    : 'text-red-700 bg-red-50';

  return (
    <div className="border-t bg-white px-4 py-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2.5">
          <div className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: color }} />
          <div>
            <div className="flex items-center gap-1 mb-0.5" style={{ color }}>
              {TYPE_ICON[node.type]}
              <span className="text-[10px] font-semibold uppercase tracking-wider">{node.type}</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{node.label}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-gray-600">{node.detail}</p>

      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', confClass)}>
          {pct}% · {confLabel}
        </span>
        <span className="text-[10px] text-gray-400">
          {node.source} ·{' '}
          {new Date(node.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}

// ── Edge legend ───────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="absolute bottom-3 left-3 z-10 rounded-lg border border-gray-200 bg-white/90 px-2.5 py-2 shadow-sm">
      {[
        { color: '#a855f7', label: 'influenced' },
        { color: '#6366f1', label: 'caused' },
        { color: '#94a3b8', label: 'relates to' },
      ].map((it) => (
        <div key={it.label} className="flex items-center gap-1.5 py-0.5">
          <div style={{ background: it.color, width: 18, height: 2, borderRadius: 1 }} />
          <span className="text-[9px] text-gray-500">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface DecisionTraceProps {
  trace: DecisionTraceType;
}

export function DecisionTrace({ trace }: DecisionTraceProps) {
  const [selected, setSelected] = useState<DecisionTraceNode | null>(null);

  const handleClick = useCallback((node: DecisionTraceNode) => {
    setSelected((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const positions = useMemo(
    () => computePositions(trace.nodes, trace.edges),
    [trace.nodes, trace.edges],
  );

  const flowNodes = useMemo<Node[]>(
    () =>
      trace.nodes.map((n) => ({
        id: n.id,
        type: 'trace',
        position: positions[n.id] ?? { x: 0, y: 0 },
        data: {
          nodeType: n.type,
          label: n.label,
          source: n.source,
          confidence: n.confidence,
          color: getNodeColor(n.type),
          isSelected: selected?.id === n.id,
          onClick: handleClick,
          raw: n,
        },
      })),
    [trace.nodes, positions, selected?.id, handleClick],
  );

  const flowEdges = useMemo<Edge[]>(
    () =>
      trace.edges.map((e) => {
        const cfg = EDGE_CFG[e.label] ?? EDGE_CFG.relates_to;
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'smoothstep',
          animated: cfg.animated,
          label: cfg.displayLabel,
          style: {
            stroke: cfg.color,
            strokeWidth: cfg.width,
            strokeDasharray: cfg.dash,
          },
          labelStyle: { fontSize: 9, fill: '#94a3b8', fontWeight: 600 },
          labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
          labelBgPadding: [3, 5] as [number, number],
          labelBgBorderRadius: 4,
        };
      }),
    [trace.edges],
  );

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border bg-slate-50 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-2.5">
        <div>
          <p className="text-xs font-semibold text-gray-900">Decision Trace</p>
          <p className="mt-0.5 text-[10px] text-gray-400">
            {trace.nodes.length} signals · {trace.edges.length} connections
          </p>
        </div>
        <p className="text-[10px] text-gray-400">Click any node to inspect</p>
      </div>

      {/* Graph canvas */}
      <div style={{ height: 440 }} className="relative">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.28 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background
            color="#d1d5db"
            gap={20}
            size={1.5}
            variant={BackgroundVariant.Dots}
          />
          <Controls showInteractive={false} style={{ bottom: 12, right: 12 }} />
          <Legend />
        </ReactFlow>
      </div>

      {/* Node detail panel */}
      {selected && <DetailPanel node={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
