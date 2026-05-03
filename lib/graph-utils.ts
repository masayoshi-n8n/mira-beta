import type { Node, Edge } from 'reactflow';
import type { LPMNode, LPMEdge, NodeType } from './types';

const NODE_COLOR_MAP: Record<NodeType, string> = {
  feedback:   '#a855f7',
  decision:   '#2563eb',
  feature:    '#22c55e',
  metric:     '#f97316',
  persona:    '#ec4899',
  competitor: '#ef4444',
  epic:       '#6366f1',
  note:       '#eab308',
};

export interface LPMGroupData {
  label: string;
  color: string;
  bgColor: string;
  width: number;
  height: number;
}

interface ZoneDef {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  bgColor: string;
  order: string[];
}

// Zone layout: left = signals/inputs, right = outputs/outcomes
// Column 0 (x=20):  Feedback, Personas
// Column 1 (x=300): Decisions, Competitors, Notes
// Column 2 (x=580): Features, Epics
// Column 3 (x=860): Metrics
const ZONES: Record<NodeType, ZoneDef> = {
  feedback:   { x: 20,  y: 20,  w: 240, h: 580, label: 'Feedback Signals', bgColor: 'rgba(168,85,247,0.06)',  order: ['fb-001','fb-002','fb-003','fb-004','fb-005'] },
  persona:    { x: 20,  y: 620, w: 240, h: 280, label: 'Personas',         bgColor: 'rgba(236,72,153,0.06)',  order: ['ps-001','ps-002'] },
  decision:   { x: 300, y: 20,  w: 240, h: 480, label: 'Decisions',        bgColor: 'rgba(37,99,235,0.06)',   order: ['dc-001','dc-002','dc-003','dc-004'] },
  competitor: { x: 300, y: 530, w: 240, h: 380, label: 'Competitors',      bgColor: 'rgba(239,68,68,0.06)',   order: ['cp-001','cp-002','cp-003'] },
  note:       { x: 300, y: 940, w: 240, h: 380, label: 'Notes',            bgColor: 'rgba(234,179,8,0.06)',   order: ['nt-001','nt-002','nt-003'] },
  feature:    { x: 580, y: 20,  w: 240, h: 480, label: 'Features',         bgColor: 'rgba(34,197,94,0.06)',   order: ['ft-001','ft-002','ft-003','ft-004'] },
  epic:       { x: 580, y: 530, w: 240, h: 480, label: 'Epics',            bgColor: 'rgba(99,102,241,0.06)',  order: ['ep-001','ep-002','ep-003','ep-004'] },
  metric:     { x: 860, y: 120, w: 240, h: 380, label: 'Metrics',          bgColor: 'rgba(249,115,22,0.06)',  order: ['mt-001','mt-002','mt-003'] },
};

const NODE_W = 200;
const NODE_H = 80;
const GAP_Y  = 22;
// Vertical offset to leave room for the zone label at top
const LABEL_OFFSET = 44;

function getZonePositions(zone: ZoneDef): Record<string, { x: number; y: number }> {
  const n = zone.order.length;
  const totalH = n * NODE_H + (n - 1) * GAP_Y;
  const contentH = zone.h - LABEL_OFFSET - 16;
  const startX = zone.x + (zone.w - NODE_W) / 2;
  const startY = zone.y + LABEL_OFFSET + Math.max(0, (contentH - totalH) / 2);
  const result: Record<string, { x: number; y: number }> = {};
  zone.order.forEach((id, i) => {
    result[id] = { x: startX, y: startY + i * (NODE_H + GAP_Y) };
  });
  return result;
}

export function lpmNodesToFlowNodes(nodes: LPMNode[]): Node[] {
  // Build position map once
  const posMap: Record<string, { x: number; y: number }> = {};
  for (const zone of Object.values(ZONES)) {
    Object.assign(posMap, getZonePositions(zone));
  }

  // Group annotation nodes rendered as background rectangles (non-interactive)
  const groupNodes: Node[] = (Object.entries(ZONES) as [NodeType, ZoneDef][]).map(([type, zone]) => ({
    id: `group-${type}`,
    type: 'lpmGroup',
    position: { x: zone.x, y: zone.y },
    data: {
      label: zone.label,
      color: NODE_COLOR_MAP[type],
      bgColor: zone.bgColor,
      width: zone.w,
      height: zone.h,
    },
    draggable: false,
    selectable: false,
    connectable: false,
    focusable: false,
    zIndex: -1,
  }));

  // Data nodes
  const dataNodes: Node[] = nodes.map((node, index) => {
    const pos = posMap[node.id] ?? {
      x: (index % 5) * 260 + 50,
      y: Math.floor(index / 5) * 130 + 50,
    };
    return {
      id: node.id,
      type: 'lpmNode',
      position: pos,
      data: {
        label: node.label,
        nodeType: node.type,
        confidence: node.confidence,
        source: node.source,
        description: node.description,
        color: NODE_COLOR_MAP[node.type],
        highlighted: false,
        faded: false,
      },
      zIndex: 1,
    };
  });

  return [...groupNodes, ...dataNodes];
}

export function lpmEdgesToFlowEdges(edges: LPMEdge[]): Edge[] {
  return edges.map((edge) => {
    const isStrong = edge.confidence > 0.8;
    const isAnimated = edge.type === 'caused' || edge.type === 'influenced';
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.type.replace(/_/g, ' '),
      type: 'smoothstep',
      animated: isAnimated,
      style: {
        stroke: isStrong ? '#818cf8' : '#d1d5db',
        strokeWidth: isStrong ? 1.5 : 1,
        strokeDasharray: edge.confidence < 0.7 ? '5 4' : undefined,
      },
      labelStyle: {
        fontSize: 9,
        fill: '#94a3b8',
        fontWeight: 600,
      },
      labelBgStyle: {
        fill: 'rgba(255,255,255,0.92)',
        stroke: 'none',
      },
      labelBgPadding: [3, 6] as [number, number],
      labelBgBorderRadius: 4,
      data: {
        edgeType: edge.type,
        confidence: edge.confidence,
      },
    };
  });
}

export function getNodeColor(type: NodeType): string {
  return NODE_COLOR_MAP[type];
}
