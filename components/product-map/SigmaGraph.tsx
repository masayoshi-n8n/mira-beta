'use client';

import { useEffect, useState } from 'react';
import { SigmaContainer, useRegisterEvents, useSetSettings, useSigma } from '@react-sigma/core';
import type { SigmaGraphType, SigmaNodeAttributes, SigmaEdgeAttributes } from '@/lib/sigma-utils';
import type { NodeType } from '@/lib/types';

export interface SigmaGraphProps {
  graph: SigmaGraphType;
  selectedId: string | null;
  searchQuery: string;
  activeFilters: NodeType[];
  externalHighlightIds?: string[] | null;
  onNodeClick: (id: string) => void;
  onStageClick: () => void;
}

interface GraphEventsProps {
  selectedId: string | null;
  searchQuery: string;
  activeFilters: NodeType[];
  externalHighlightIds?: string[] | null;
  onNodeClick: (id: string) => void;
  onStageClick: () => void;
}

function GraphEvents({
  selectedId,
  searchQuery,
  activeFilters,
  externalHighlightIds,
  onNodeClick,
  onStageClick,
}: GraphEventsProps) {
  const sigma = useSigma<SigmaNodeAttributes, SigmaEdgeAttributes>();
  const registerEvents = useRegisterEvents<SigmaNodeAttributes, SigmaEdgeAttributes>();
  const setSettings = useSetSettings<SigmaNodeAttributes, SigmaEdgeAttributes>();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    registerEvents({
      clickNode: ({ node }) => onNodeClick(node),
      clickStage: () => onStageClick(),
      enterNode: ({ node }) => setHoveredNode(node),
      leaveNode: () => setHoveredNode(null),
    });
  }, [registerEvents, onNodeClick, onStageClick]);

  useEffect(() => {
    const graph = sigma.getGraph();
    const hasSearch = searchQuery.length > 0;
    const hasFilter = activeFilters.length > 0;
    const hasExternal = externalHighlightIds != null;

    setSettings({
      nodeReducer: (node, data) => {
        const labelLower = data.label.toLowerCase();
        const descLower = (data.description ?? '').toLowerCase();
        const query = searchQuery.toLowerCase();
        const nodeType = data.nodeType as NodeType;

        const matchesSearch = !hasSearch || labelLower.includes(query) || descLower.includes(query);
        const matchesFilter = !hasFilter || activeFilters.includes(nodeType);
        const matchesExternal = !hasExternal || (externalHighlightIds?.includes(node) ?? false);

        const isSelected = node === selectedId;
        const isHovered = node === hoveredNode;
        const isNeighbor =
          hoveredNode !== null &&
          graph.hasNode(hoveredNode) &&
          graph.areNeighbors(hoveredNode, node);
        const isActive = hoveredNode !== null ? isHovered || isNeighbor : true;

        const shouldFade =
          !matchesSearch ||
          !matchesFilter ||
          !matchesExternal ||
          (hoveredNode !== null && !isActive);

        return {
          ...data,
          highlighted: isSelected || isHovered,
          size: isSelected ? data.size * 1.5 : isHovered ? data.size * 1.2 : data.size,
          color: shouldFade ? '#e2e8f0' : data.color,
          zIndex: isSelected ? 2 : isHovered ? 1 : 0,
          label: shouldFade ? '' : data.label,
        };
      },

      edgeReducer: (edge, data) => {
        const graph = sigma.getGraph();
        const src = graph.source(edge);
        const tgt = graph.target(edge);

        if (hoveredNode) {
          const connected = src === hoveredNode || tgt === hoveredNode;
          if (!connected) return { ...data, hidden: true };
          return { ...data, color: '#6366f1', size: 2 };
        }

        if (selectedId) {
          const connected = src === selectedId || tgt === selectedId;
          return {
            ...data,
            color: connected ? '#6366f1' : '#e2e8f040',
            size: connected ? 2 : 0.5,
          };
        }

        return data;
      },
    });
  }, [sigma, setSettings, hoveredNode, selectedId, searchQuery, activeFilters, externalHighlightIds]);

  return null;
}

export function SigmaGraph({
  graph,
  selectedId,
  searchQuery,
  activeFilters,
  externalHighlightIds,
  onNodeClick,
  onStageClick,
}: SigmaGraphProps) {
  return (
    <SigmaContainer<SigmaNodeAttributes, SigmaEdgeAttributes>
      graph={graph}
      style={{ width: '100%', height: '100%', background: '#f8fafc' }}
      settings={{
        renderEdgeLabels: false,
        defaultEdgeType: 'arrow',
        labelSize: 12,
        labelWeight: '500',
        labelColor: { color: '#374151' },
        zIndex: true,
        minCameraRatio: 0.15,
        maxCameraRatio: 4,
      }}
    >
      <GraphEvents
        selectedId={selectedId}
        searchQuery={searchQuery}
        activeFilters={activeFilters}
        externalHighlightIds={externalHighlightIds}
        onNodeClick={onNodeClick}
        onStageClick={onStageClick}
      />
    </SigmaContainer>
  );
}
