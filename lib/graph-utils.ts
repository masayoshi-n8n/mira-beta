import type { Node, Edge } from 'reactflow';
import type { LPMNode, LPMEdge, NodeType } from './types';

const NODE_COLOR_MAP: Record<NodeType, string> = {
  feedback: '#a855f7',
  decision: '#2563eb',
  feature: '#22c55e',
  metric: '#f97316',
  persona: '#ec4899',
  competitor: '#ef4444',
  epic: '#6366f1',
  note: '#facc15',
};

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  'fb-001': { x: 100, y: 50 },
  'fb-002': { x: 100, y: 200 },
  'fb-003': { x: 100, y: 350 },
  'fb-004': { x: 100, y: 500 },
  'fb-005': { x: 100, y: 650 },
  'dc-001': { x: 400, y: 150 },
  'dc-002': { x: 400, y: 350 },
  'dc-003': { x: 400, y: 550 },
  'dc-004': { x: 700, y: 300 },
  'ft-001': { x: 1000, y: 100 },
  'ft-002': { x: 1000, y: 300 },
  'ft-003': { x: 1000, y: 500 },
  'ft-004': { x: 1000, y: 700 },
  'mt-001': { x: 700, y: 50 },
  'mt-002': { x: 700, y: 500 },
  'mt-003': { x: 700, y: 650 },
  'ps-001': { x: 400, y: 750 },
  'ps-002': { x: 100, y: 800 },
  'cp-001': { x: 700, y: 150 },
  'cp-002': { x: 700, y: 750 },
  'cp-003': { x: 400, y: 850 },
  'ep-001': { x: 1300, y: 100 },
  'ep-002': { x: 1300, y: 300 },
  'ep-003': { x: 1300, y: 500 },
  'ep-004': { x: 1300, y: 700 },
  'nt-001': { x: 100, y: 950 },
  'nt-002': { x: 400, y: 650 },
  'nt-003': { x: 400, y: 950 },
};

export function lpmNodesToFlowNodes(nodes: LPMNode[]): Node[] {
  return nodes.map((node, index) => {
    const pos = NODE_POSITIONS[node.id] ?? {
      x: (index % 5) * 300 + 50,
      y: Math.floor(index / 5) * 200 + 50,
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
      },
    };
  });
}

export function lpmEdgesToFlowEdges(edges: LPMEdge[]): Edge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.type,
    type: 'smoothstep',
    animated: edge.type === 'caused' || edge.type === 'influenced',
    style: {
      stroke: edge.confidence > 0.8 ? '#6366f1' : '#94a3b8',
      strokeWidth: edge.confidence > 0.8 ? 2 : 1,
      strokeDasharray: edge.confidence < 0.8 ? '4 4' : undefined,
    },
    labelStyle: { fontSize: 10, fill: '#64748b' },
    data: {
      edgeType: edge.type,
      confidence: edge.confidence,
      inferredSource: edge.inferredSource,
    },
  }));
}

export function getNodeColor(type: NodeType): string {
  return NODE_COLOR_MAP[type];
}
