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
  note: '#eab308',
};

const EDGE_COLOR_MAP: Record<string, string> = {
  influenced: '#a855f7cc',
  caused: '#6366f1cc',
  preceded: '#94a3b8cc',
  contradicts: '#ef4444cc',
  relates_to: '#64748bcc',
  is_child_of: '#22c55ecc',
  was_deprioritized_by: '#f97316cc',
};

export function buildSigmaGraph(nodes: LPMNode[], edges: LPMEdge[]): SigmaGraphType {
  const graph = new Graph<SigmaNodeAttributes, SigmaEdgeAttributes>({ type: 'directed', multi: false });

  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    graph.addNode(node.id, {
      label: node.label,
      size: 10 + node.confidence * 10,
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
      const edgeColor = EDGE_COLOR_MAP[edge.type] ?? '#94a3b8cc';
      graph.addEdge(edge.source, edge.target, {
        label: edge.type.replace(/_/g, ' '),
        size: 1.5 + edge.confidence * 2.5,
        color: edgeColor,
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
