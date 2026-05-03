'use client';

import { useEffect, useRef } from 'react';
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

// Lazy type — sigma is only ever imported inside useEffect (browser only)
type SigmaInstance = import('sigma').Sigma<SigmaNodeAttributes, SigmaEdgeAttributes>;

export function SigmaGraph({
  graph,
  selectedId,
  searchQuery,
  activeFilters,
  externalHighlightIds,
  onNodeClick,
  onStageClick,
}: SigmaGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<SigmaInstance | null>(null);

  // Mutable refs — reducer closures read from these without re-initializing sigma
  const selectedIdRef = useRef(selectedId);
  const searchQueryRef = useRef(searchQuery);
  const activeFiltersRef = useRef(activeFilters);
  const externalRef = useRef(externalHighlightIds);
  const hoveredRef = useRef<string | null>(null);
  const onNodeClickRef = useRef(onNodeClick);
  const onStageClickRef = useRef(onStageClick);

  // Sync refs and trigger a sigma refresh whenever props change
  useEffect(() => { selectedIdRef.current = selectedId; sigmaRef.current?.refresh(); }, [selectedId]);
  useEffect(() => { searchQueryRef.current = searchQuery; sigmaRef.current?.refresh(); }, [searchQuery]);
  useEffect(() => { activeFiltersRef.current = activeFilters; sigmaRef.current?.refresh(); }, [activeFilters]);
  useEffect(() => { externalRef.current = externalHighlightIds; sigmaRef.current?.refresh(); }, [externalHighlightIds]);
  useEffect(() => { onNodeClickRef.current = onNodeClick; }, [onNodeClick]);
  useEffect(() => { onStageClickRef.current = onStageClick; }, [onStageClick]);

  // Initialize sigma — dynamic import ensures sigma (WebGL) never runs on the server
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let killed = false;

    import('sigma').then(({ Sigma }) => {
      if (killed || !container) return;

      const sigma = new Sigma<SigmaNodeAttributes, SigmaEdgeAttributes>(graph, container, {
        renderEdgeLabels: false,
        defaultEdgeType: 'arrow',
        labelSize: 12,
        labelWeight: '500',
        labelColor: { color: '#374151' },
        zIndex: true,
        minCameraRatio: 0.15,
        maxCameraRatio: 4,
      });

      sigma.setSetting('nodeReducer', (node, data) => {
        const g = sigma.getGraph();
        const query = searchQueryRef.current.toLowerCase();
        const hasSearch = query.length > 0;
        const hasFilter = activeFiltersRef.current.length > 0;
        const hasExternal = externalRef.current != null;
        const nodeType = data.nodeType as NodeType;

        const matchesSearch =
          !hasSearch ||
          (data.label ?? '').toLowerCase().includes(query) ||
          (data.description ?? '').toLowerCase().includes(query);
        const matchesFilter = !hasFilter || activeFiltersRef.current.includes(nodeType);
        const matchesExternal =
          !hasExternal || (externalRef.current?.includes(node) ?? false);

        const hovered = hoveredRef.current;
        const isSelected = node === selectedIdRef.current;
        const isHovered = node === hovered;
        const isNeighbor =
          hovered !== null && g.hasNode(hovered) && g.areNeighbors(hovered, node);
        const isActive = hovered !== null ? isHovered || isNeighbor : true;

        const shouldFade =
          !matchesSearch ||
          !matchesFilter ||
          !matchesExternal ||
          (hovered !== null && !isActive);

        const baseSize = data.size ?? 10;

        return {
          ...data,
          highlighted: isSelected || isHovered,
          size: isSelected ? baseSize * 1.5 : isHovered ? baseSize * 1.2 : baseSize,
          color: shouldFade ? '#e2e8f0' : data.color,
          zIndex: isSelected ? 2 : isHovered ? 1 : 0,
          label: shouldFade ? '' : data.label,
        };
      });

      sigma.setSetting('edgeReducer', (edge, data) => {
        const g = sigma.getGraph();
        const src = g.source(edge);
        const tgt = g.target(edge);
        const hovered = hoveredRef.current;
        const selected = selectedIdRef.current;

        if (hovered) {
          const connected = src === hovered || tgt === hovered;
          if (!connected) return { ...data, hidden: true };
          return { ...data, color: '#6366f1', size: 2 };
        }

        if (selected) {
          const connected = src === selected || tgt === selected;
          return {
            ...data,
            color: connected ? '#6366f1' : '#e2e8f040',
            size: connected ? 2 : 0.5,
          };
        }

        return data;
      });

      sigmaRef.current = sigma;

      sigma.on('clickNode', ({ node }) => onNodeClickRef.current(node));
      sigma.on('clickStage', () => onStageClickRef.current());
      sigma.on('enterNode', ({ node }) => {
        hoveredRef.current = node;
        sigma.refresh();
      });
      sigma.on('leaveNode', () => {
        hoveredRef.current = null;
        sigma.refresh();
      });
    });

    return () => {
      killed = true;
      sigmaRef.current?.kill();
      sigmaRef.current = null;
    };
  }, [graph]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#f8fafc' }}
    />
  );
}
