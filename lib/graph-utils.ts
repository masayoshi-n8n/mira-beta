import { MarkerType, type Edge } from 'reactflow';
import type { LPMNode, LPMEdge, NodeType, ThemeGroupKey, ThemeGroupConfig } from './types';

// ── Muted professional color palette ─────────────────────────────────────────

export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  feedback:   '#6b82d4',
  decision:   '#5b95c4',
  feature:    '#4da88a',
  metric:     '#c4924d',
  persona:    '#c46b8e',
  competitor: '#b35c5c',
  epic:       '#7b72b8',
  note:       '#b8a24d',
};

export const THEME_GROUP_COLORS: Record<ThemeGroupKey, string> = {
  pmf:         '#5b8fde',
  satisfaction:'#5ba8d4',
  revenue:     '#4da88a',
  retention:   '#d4884a',
  competitive: '#d46b6b',
  compliance:  '#9b7fd4',
  performance: '#64748b',
  roadmap:     '#7c8adc',
};

// Backward-compat alias used by NodeSidePanel and GraphQueryPanel
export function getNodeColor(type: NodeType): string {
  return NODE_TYPE_COLORS[type];
}

// ── Theme group config ────────────────────────────────────────────────────────

export const THEME_GROUP_CONFIG: ThemeGroupConfig[] = [
  // Row 1
  { key: 'pmf',          label: 'Product-Market Fit',     description: 'Personas, user fit signals, and market validation',         color: '#5b8fde', position: { x: 0,    y: 0   } },
  { key: 'satisfaction', label: 'User Satisfaction',      description: 'Feedback, UX signals, and creator experience metrics',      color: '#5ba8d4', position: { x: 420,  y: 0   } },
  { key: 'competitive',  label: 'Competitive Landscape',  description: 'Competitor analysis and market positioning',                 color: '#d46b6b', position: { x: 840,  y: 0   } },
  { key: 'performance',  label: 'Platform Performance',   description: 'Engineering reliability, latency, and SLA commitments',     color: '#64748b', position: { x: 1260, y: 0   } },
  // Row 2
  { key: 'retention',    label: 'Retention & Churn',      description: 'Churn signals, cohort analysis, and retention features',    color: '#d4884a', position: { x: 0,    y: 280 } },
  { key: 'revenue',      label: 'Revenue & Monetization', description: 'Monetization features, MRR metrics, and pricing decisions', color: '#4da88a', position: { x: 420,  y: 280 } },
  { key: 'compliance',   label: 'Compliance & Trust',     description: 'Legal blockers, identity verification, and GDPR',           color: '#9b7fd4', position: { x: 840,  y: 280 } },
  { key: 'roadmap',      label: 'Q3 Roadmap & Decisions', description: 'Active epics, sprint decisions, and Q3 OKRs',               color: '#7c8adc', position: { x: 1260, y: 280 } },
];

// ── Overview: group card node shape ──────────────────────────────────────────

export interface GroupCardData {
  groupKey: ThemeGroupKey;
  label: string;
  description: string;
  color: string;
  nodeCount: number;
  typeCounts: Partial<Record<NodeType, number>>;
  onDrillDown: (key: ThemeGroupKey) => void;
  onHover: (key: ThemeGroupKey | null) => void;
  dimmed: boolean;
}

export function buildGroupNodes(allNodes: LPMNode[]) {
  return THEME_GROUP_CONFIG.map((cfg) => {
    const groupNodes = allNodes.filter((n) => n.themeGroup === cfg.key);
    const typeCounts = groupNodes.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] ?? 0) + 1;
      return acc;
    }, {} as Partial<Record<NodeType, number>>);

    return {
      id: `group-${cfg.key}`,
      type: 'groupCard',
      position: cfg.position,
      data: {
        groupKey: cfg.key,
        label: cfg.label,
        description: cfg.description,
        color: cfg.color,
        nodeCount: groupNodes.length,
        typeCounts,
        dimmed: false,
        onDrillDown: (_k: ThemeGroupKey) => {},
        onHover: (_k: ThemeGroupKey | null) => {},
      } as GroupCardData,
      draggable: false,
    };
  });
}

// ── Overview: cross-group edges ───────────────────────────────────────────────

const CROSS_GROUP: Array<{ source: ThemeGroupKey; target: ThemeGroupKey; label: string }> = [
  { source: 'pmf',         target: 'roadmap',      label: 'drives roadmap' },
  { source: 'satisfaction',target: 'retention',    label: 'impacts churn' },
  { source: 'satisfaction',target: 'pmf',          label: 'validates fit' },
  { source: 'competitive', target: 'pmf',          label: 'reveals gaps' },
  { source: 'competitive', target: 'roadmap',      label: 'accelerates decisions' },
  { source: 'revenue',     target: 'roadmap',      label: 'shapes Q3 plan' },
  { source: 'retention',   target: 'revenue',      label: 'reduces pool' },
  { source: 'performance', target: 'satisfaction', label: 'affects UX' },
  { source: 'compliance',  target: 'revenue',      label: 'gates features' },
];

export function buildGroupEdges(): Edge[] {
  return CROSS_GROUP.map((e) => ({
    id: `cross-${e.source}-${e.target}`,
    source: `group-${e.source}`,
    target: `group-${e.target}`,
    type: 'smoothstep',
    animated: false,
    label: e.label,
    style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
    labelStyle: { fontSize: 9, fill: '#94a3b8', fontWeight: 500 },
    labelBgStyle: { fill: 'white', fillOpacity: 0.85 },
    labelBgPadding: [3, 5] as [number, number],
    labelBgBorderRadius: 4,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1', width: 12, height: 12 },
  }));
}

// ── Group detail: individual node card shape ──────────────────────────────────

export interface LpmNodeData {
  label: string;
  nodeType: NodeType;
  source: string;
  timestamp: string;
  confidence: number;
  color: string;
  nodeId: string;
  onSelect: (nodeId: string) => void;
  dimmed: boolean;
}

const CARD_W = 220;
const CARD_H = 90;
const GAP_X  = 30;
const GAP_Y  = 20;
const COLS   = 3;

export function buildGroupDetailNodes(nodes: LPMNode[], groupKey: ThemeGroupKey) {
  const groupNodes = nodes.filter((n) => n.themeGroup === groupKey);
  return groupNodes.map((node, i) => ({
    id: node.id,
    type: 'lpmNode',
    position: {
      x: (i % COLS) * (CARD_W + GAP_X),
      y: Math.floor(i / COLS) * (CARD_H + GAP_Y),
    },
    data: {
      label: node.label,
      nodeType: node.type,
      source: node.source,
      timestamp: node.timestamp,
      confidence: node.confidence,
      color: NODE_TYPE_COLORS[node.type],
      nodeId: node.id,
      dimmed: false,
      onSelect: (_id: string) => {},
    } as LpmNodeData,
    draggable: false,
  }));
}

export function buildGroupDetailEdges(
  edges: LPMEdge[],
  nodes: LPMNode[],
  groupKey: ThemeGroupKey,
): Edge[] {
  const ids = new Set(nodes.filter((n) => n.themeGroup === groupKey).map((n) => n.id));
  return lpmEdgesToFlowEdges(edges.filter((e) => ids.has(e.source) && ids.has(e.target)));
}

// ── Shared edge builder ───────────────────────────────────────────────────────

export function lpmEdgesToFlowEdges(edges: LPMEdge[]): Edge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: false,
    style: {
      stroke: edge.confidence > 0.8 ? '#94a3b8' : '#d1d5db',
      strokeWidth: edge.confidence > 0.8 ? 1.5 : 1,
      strokeDasharray: edge.confidence < 0.7 ? '5 4' : undefined,
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8', width: 12, height: 12 },
    label: edge.type.replace(/_/g, ' '),
    labelStyle: { fontSize: 9, fill: '#94a3b8', fontWeight: 500 },
    labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
    labelBgPadding: [3, 5] as [number, number],
    labelBgBorderRadius: 4,
  }));
}
