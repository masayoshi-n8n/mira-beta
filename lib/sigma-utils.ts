import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import type { LPMNode, LPMEdge, NodeType } from './types';

export interface SigmaNodeAttributes {
  label: string;
  size: number;
  color: string;
  x: number;
  y: number;
  nodeType: NodeType;
  confidence: number;
  source: string;
  description: string;
}

export interface SigmaEdgeAttributes {
  label: string;
  size: number;
  color: string;
  edgeType: string;
  confidence: number;
}

export type SigmaGraphType = Graph<SigmaNodeAttributes, SigmaEdgeAttributes>;

// Brighter, more luminous colors that look great on dark background
const NODE_COLOR_MAP: Record<NodeType, string> = {
  feedback: '#c084fc',
  decision: '#60a5fa',
  feature: '#4ade80',
  metric: '#fb923c',
  persona: '#f472b6',
  competitor: '#f87171',
  epic: '#818cf8',
  note: '#fbbf24',
};

const EDGE_COLOR_MAP: Record<string, string> = {
  influenced: '#c084fc66',
  caused:     '#818cf877',
  preceded:   '#94a3b844',
  contradicts: '#f8717177',
  relates_to: '#64748b55',
  is_child_of: '#4ade8066',
  was_deprioritized_by: '#fb923c66',
};

export const NODE_COLOR_MAP_EXPORT = NODE_COLOR_MAP;

export function buildSigmaGraph(nodes: LPMNode[], edges: LPMEdge[]): SigmaGraphType {
  const graph = new Graph<SigmaNodeAttributes, SigmaEdgeAttributes>({ type: 'directed', multi: false });

  // Spread nodes in a rough circle with jitter
  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    const r = 8 + Math.random() * 4;
    graph.addNode(node.id, {
      label: node.label,
      size: 6,
      color: NODE_COLOR_MAP[node.type],
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
      nodeType: node.type,
      confidence: node.confidence,
      source: node.source,
      description: node.description,
    });
  });

  edges.forEach((edge) => {
    if (
      graph.hasNode(edge.source) &&
      graph.hasNode(edge.target) &&
      !graph.hasEdge(edge.source, edge.target)
    ) {
      graph.addEdge(edge.source, edge.target, {
        label: edge.type.replace(/_/g, ' '),
        size: 0.8 + edge.confidence * 1.2,
        color: EDGE_COLOR_MAP[edge.type] ?? '#64748b44',
        edgeType: edge.type,
        confidence: edge.confidence,
      });
    }
  });

  // Hub nodes (more connections) are larger — mimics Obsidian behavior
  graph.forEachNode((node, attrs) => {
    const degree = graph.degree(node);
    const hubBoost = Math.min(degree * 1.2, 10);
    graph.setNodeAttribute(node, 'size', 5 + hubBoost + attrs.confidence * 3);
  });

  // Quick initial layout — animation continues in SigmaGraph component
  const settings = forceAtlas2.inferSettings(graph);
  forceAtlas2.assign(graph, {
    iterations: 80,
    settings: { ...settings, gravity: 1, scalingRatio: 4, barnesHutOptimize: true },
  });

  return graph;
}
