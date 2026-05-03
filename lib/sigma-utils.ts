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

export function buildSigmaGraph(nodes: LPMNode[], edges: LPMEdge[]): SigmaGraphType {
  const graph = new Graph<SigmaNodeAttributes, SigmaEdgeAttributes>({ type: 'directed', multi: false });

  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    graph.addNode(node.id, {
      label: node.label,
      size: 8 + node.confidence * 8,
      color: NODE_COLOR_MAP[node.type],
      x: Math.cos(angle),
      y: Math.sin(angle),
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
        size: edge.confidence > 0.8 ? 2 : 1,
        color: edge.confidence > 0.8 ? '#818cf880' : '#cbd5e180',
        edgeType: edge.type,
        confidence: edge.confidence,
      });
    }
  });

  forceAtlas2.assign(graph, {
    iterations: 150,
    settings: forceAtlas2.inferSettings(graph),
  });

  return graph;
}
