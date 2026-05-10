'use client';

import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Handle,
  MarkerType,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import type {
  DecisionTrace as DecisionTraceType,
  DecisionTraceNode,
  NodeType,
  EdgeType,
} from '@/lib/types';
import { cn } from '@/lib/utils';

// ── Category mapping ──────────────────────────────────────────────────────────

type Category = 'input' | 'confirmation' | 'output';

const TYPE_TO_CAT: Record<NodeType, Category> = {
  feedback:   'input',
  metric:     'input',
  competitor: 'input',
  note:       'input',
  persona:    'confirmation',
  decision:   'confirmation',
  feature:    'output',
  epic:       'output',
};

const CAT_CFG: Record<Category, { bg: string; border: string; title: string; sub: string }> = {
  input:        { bg: '#fff1f2', border: '#fca5a5', title: '#be123c', sub: '#9f1239' },
  confirmation: { bg: '#eff6ff', border: '#93c5fd', title: '#1d4ed8', sub: '#1e40af' },
  output:       { bg: '#eef2ff', border: '#a5b4fc', title: '#4338ca', sub: '#3730a3' },
};

const EDGE_LABEL: Partial<Record<EdgeType, string>> = {
  caused:              'TRIGGERED',
  contradicts:         'TRIGGERED',
  preceded:            'TRIGGERED',
  influenced:          'INFORMED',
  relates_to:          'INFORMED',
  is_child_of:         'INFORMED',
  was_deprioritized_by:'INFORMED',
};

// ── Layout constants ──────────────────────────────────────────────────────────

const NODE_W = 195;
const NODE_H = 76;
const COL_GAP = 72;
const ROW_GAP = 14;

// ── Topological layout ────────────────────────────────────────────────────────

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

  const cols: Record<number, string[]> = {};
  for (const n of nodes) {
    const c = depth[n.id];
    if (!cols[c]) cols[c] = [];
    cols[c].push(n.id);
  }

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

// ── Node card ─────────────────────────────────────────────────────────────────

interface TraceNodeData {
  label: string;
  detail: string;
  source: string;
  category: Category;
  isSelected: boolean;
  onSelect: (node: DecisionTraceNode) => void;
  raw: DecisionTraceNode;
}

function TraceNode({ data }: NodeProps<TraceNodeData>) {
  const cfg = CAT_CFG[data.category];

  return (
    <div style={{ width: NODE_W }}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0, width: 6, height: 6 }} />

      <div
        onClick={() => data.onSelect(data.raw)}
        className="cursor-pointer rounded-xl px-3 py-2.5 transition-all duration-150 hover:shadow-md"
        style={{
          background: cfg.bg,
          border: `1.5px solid ${data.isSelected ? cfg.border : cfg.border + 'cc'}`,
          boxShadow: data.isSelected
            ? `0 0 0 3px ${cfg.border}44, 0 2px 8px rgba(0,0,0,0.06)`
            : '0 1px 3px rgba(0,0,0,0.05)',
          minHeight: NODE_H,
        }}
      >
        <p className="text-[12px] font-semibold leading-snug mb-1" style={{ color: cfg.title }}>
          {data.label}
        </p>
        <p className="text-[11px] leading-snug mb-1.5" style={{ color: cfg.sub + 'cc' }}>
          {data.detail}
        </p>
        <p className="text-[10px] text-gray-400 truncate font-mono">{data.source}</p>
      </div>

      <Handle type="source" position={Position.Right} style={{ opacity: 0, width: 6, height: 6 }} />
    </div>
  );
}

const NODE_TYPES: NodeTypes = { trace: TraceNode };

// ── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({ node, onClose }: { node: DecisionTraceNode; onClose: () => void }) {
  const cat = TYPE_TO_CAT[node.type];
  const cfg = CAT_CFG[cat];
  const pct = Math.round(node.confidence * 100);
  const date = new Date(node.timestamp).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const confLabel =
    node.confidence >= 0.8 ? 'High confidence'
    : node.confidence >= 0.5 ? 'Inferred'
    : 'Low confidence';
  const confCls =
    node.confidence >= 0.8 ? 'text-emerald-700 bg-emerald-50'
    : node.confidence >= 0.5 ? 'text-amber-700 bg-amber-50'
    : 'text-red-700 bg-red-50';

  return (
    <div className="border-t border-gray-100 bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: cfg.title }}>
          {cat}
        </p>
        <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-[13px] font-semibold text-gray-900 mb-1.5">{node.label}</p>
      <p className="text-xs leading-relaxed text-gray-600 mb-4">{node.detail}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', confCls)}>
          {pct}% · {confLabel}
        </span>
        <span className="text-[10px] text-gray-400">{node.source} · {date}</span>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface DecisionTraceProps {
  trace: DecisionTraceType;
}

export function DecisionTrace({ trace }: DecisionTraceProps) {
  const [selected, setSelected] = useState<DecisionTraceNode | null>(null);
  const [expanded, setExpanded] = useState(true);

  const handleSelect = useCallback((node: DecisionTraceNode) => {
    setSelected((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const positions = useMemo(
    () => computePositions(trace.nodes, trace.edges),
    [trace.nodes, trace.edges],
  );

  const signalCount = trace.nodes.filter((n) => TYPE_TO_CAT[n.type] === 'input').length;
  const decisionCount = trace.nodes.filter((n) => TYPE_TO_CAT[n.type] === 'confirmation').length;

  const flowNodes = useMemo<Node[]>(
    () =>
      trace.nodes.map((n) => ({
        id: n.id,
        type: 'trace',
        position: positions[n.id] ?? { x: 0, y: 0 },
        data: {
          label: n.label,
          detail: n.detail,
          source: n.source,
          category: TYPE_TO_CAT[n.type] ?? 'input',
          isSelected: selected?.id === n.id,
          onSelect: handleSelect,
          raw: n,
        } as TraceNodeData,
      })),
    [trace.nodes, positions, selected?.id, handleSelect],
  );

  const flowEdges = useMemo<Edge[]>(
    () =>
      trace.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        animated: false,
        label: EDGE_LABEL[e.label] ?? 'INFORMED',
        labelStyle: { fontSize: 8, fontWeight: 700, fill: '#9ca3af', letterSpacing: '0.06em' },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 3,
        style: { stroke: '#d1d5db', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#d1d5db', width: 12, height: 12 },
      })),
    [trace.edges],
  );

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <p className="text-xs font-medium text-gray-700">
            LPM updated — {signalCount} signal{signalCount !== 1 ? 's' : ''} and {decisionCount} decision{decisionCount !== 1 ? 's' : ''} added.
          </p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          View Map
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Canvas */}
      {expanded && (
        <div className="relative bg-white" style={{ height: 340 }}>
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={NODE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.22 }}
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            className="bg-white"
          >
            <Background color="#f3f4f6" gap={20} size={1} variant={BackgroundVariant.Dots} />
          </ReactFlow>
        </div>
      )}

      {/* Detail panel */}
      {selected && expanded && (
        <DetailPanel node={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
