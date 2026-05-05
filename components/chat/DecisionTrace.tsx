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
import { MoreHorizontal, Sparkles, X } from 'lucide-react';
import type {
  DecisionTrace as DecisionTraceType,
  DecisionTraceNode,
  NodeType,
} from '@/lib/types';
import { cn } from '@/lib/utils';

// ── Category mapping ──────────────────────────────────────────────────────────

type Category = 'signal' | 'decision' | 'goal' | 'epic';

const TYPE_TO_CAT: Record<NodeType, Category> = {
  feedback:   'signal',
  metric:     'signal',
  competitor: 'signal',
  note:       'signal',
  decision:   'decision',
  feature:    'epic',
  epic:       'epic',
  persona:    'goal',
};

const CAT: Record<Category, { border: string; text: string; label: string }> = {
  signal:   { border: '#3b82f6', text: '#2563eb', label: 'Signal' },
  decision: { border: '#7c3aed', text: '#6d28d9', label: 'Decision' },
  goal:     { border: '#22c55e', text: '#16a34a', label: 'Goal' },
  epic:     { border: '#f59e0b', text: '#d97706', label: 'Epic' },
};

// ── Layout constants ──────────────────────────────────────────────────────────

const NODE_W = 220;
const NODE_H = 90;
const COL_GAP = 80;
const ROW_GAP = 18;

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

// The "outcome" is the decision node most downstream — it's what Mira concluded.
function findOutcomeId(
  nodes: DecisionTraceNode[],
  edges: DecisionTraceType['edges'],
): string | null {
  const decisionNodes = nodes.filter((n) => n.type === 'decision');
  if (!decisionNodes.length) return null;
  const inc: Record<string, number> = {};
  for (const e of edges) inc[e.target] = (inc[e.target] ?? 0) + 1;
  return decisionNodes.reduce((best, n) =>
    (inc[n.id] ?? 0) > (inc[best.id] ?? 0) ? n : best,
  ).id;
}

// ── Node card ─────────────────────────────────────────────────────────────────

interface TraceNodeData {
  label: string;
  source: string;
  timestamp: string;
  category: Category;
  isSelected: boolean;
  isOutcome: boolean;
  onSelect: (node: DecisionTraceNode) => void;
  raw: DecisionTraceNode;
}

function TraceNode({ data }: NodeProps<TraceNodeData>) {
  const cfg = CAT[data.category];
  const date = new Date(data.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative" style={{ width: NODE_W }}>
      {/* Outcome badge */}
      {data.isOutcome && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-[10px] font-medium text-white shadow-lg whitespace-nowrap">
          <Sparkles className="h-2.5 w-2.5 text-purple-300" />
          Mira&apos;s recommendation
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 bg-gray-900" />
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, width: 6, height: 6 }}
      />

      <div
        onClick={() => data.onSelect(data.raw)}
        className="relative cursor-pointer overflow-hidden rounded-xl bg-white transition-all duration-150 hover:shadow-md"
        style={{
          border: data.isSelected
            ? `1.5px solid ${cfg.border}`
            : '1.5px solid #e5e7eb',
          boxShadow: data.isSelected
            ? `0 0 0 3px ${cfg.border}22, 0 4px 14px rgba(0,0,0,0.08)`
            : '0 1px 3px rgba(0,0,0,0.06)',
          minHeight: NODE_H,
        }}
      >
        {/* Left accent */}
        <div
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ background: cfg.border }}
        />

        <div className="pl-4 pr-3 py-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p
              className="text-[12.5px] font-semibold leading-snug"
              style={{ color: cfg.text }}
            >
              {data.label}
            </p>
            <button
              className="mt-0.5 shrink-0 rounded p-0.5 text-gray-300 hover:bg-gray-100 hover:text-gray-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-gray-500 leading-snug line-clamp-2 mb-2">
            {data.source}
          </p>

          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
            {cfg.label} · {date}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, width: 6, height: 6 }}
      />
    </div>
  );
}

const NODE_TYPES: NodeTypes = { trace: TraceNode };

// ── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({
  node,
  onClose,
}: {
  node: DecisionTraceNode;
  onClose: () => void;
}) {
  const cat = TYPE_TO_CAT[node.type];
  const cfg = CAT[cat];
  const pct = Math.round(node.confidence * 100);
  const date = new Date(node.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
    <div className="border-t bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: cfg.border }} />
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: cfg.text }}
          >
            {cfg.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-[13px] font-semibold text-gray-900 mb-2">{node.label}</p>
      <p className="text-xs leading-relaxed text-gray-600 mb-4">{node.detail}</p>

      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', confCls)}>
          {pct}% · {confLabel}
        </span>
        <span className="text-[10px] text-gray-400">
          {node.source} · {date}
        </span>
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

  const handleSelect = useCallback((node: DecisionTraceNode) => {
    setSelected((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const outcomeId = useMemo(
    () => findOutcomeId(trace.nodes, trace.edges),
    [trace.nodes, trace.edges],
  );

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
          label: n.label,
          source: n.source,
          timestamp: n.timestamp,
          category: TYPE_TO_CAT[n.type] ?? 'signal',
          isSelected: selected?.id === n.id,
          isOutcome: n.id === outcomeId,
          onSelect: handleSelect,
          raw: n,
        } as TraceNodeData,
      })),
    [trace.nodes, positions, selected?.id, outcomeId, handleSelect],
  );

  const flowEdges = useMemo<Edge[]>(
    () =>
      trace.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#9ca3af', strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#9ca3af',
          width: 14,
          height: 14,
        },
      })),
    [trace.edges],
  );

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
        <div>
          <p className="text-xs font-semibold text-gray-900">Decision Trace</p>
          <p className="mt-0.5 text-[10px] text-gray-400">
            {trace.nodes.length} nodes · {trace.edges.length} connections · click any node to inspect
          </p>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative" style={{ height: 380 }}>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.28 }}
          minZoom={0.25}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          className="bg-[#f3f4f6]"
        >
          <Background
            color="#d1d5db"
            gap={24}
            size={1}
            variant={BackgroundVariant.Dots}
          />
        </ReactFlow>

        {/* Legend */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex items-center gap-3 rounded-full border border-gray-200 bg-white/95 px-3.5 py-2 shadow-sm">
          {(Object.entries(CAT) as [Category, (typeof CAT)[Category]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ background: cfg.border }} />
              <span className="text-[10px] text-gray-500">{cfg.label}</span>
            </div>
          ))}
        </div>

        {/* Ask Mira */}
        <div className="absolute bottom-4 right-4 z-10">
          <button className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 text-[11px] font-medium text-purple-700 shadow-sm transition-all hover:border-purple-300 hover:shadow-md">
            <Sparkles className="h-3 w-3" />
            Ask Mira
          </button>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel node={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
