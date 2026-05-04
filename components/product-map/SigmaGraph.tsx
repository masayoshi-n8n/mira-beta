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

const TYPE_BADGE: Record<NodeType, string> = {
  feedback: 'FB',
  decision: 'DC',
  feature: 'FT',
  metric: 'MT',
  persona: 'PS',
  competitor: 'CP',
  epic: 'EP',
  note: 'NT',
};

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
  const badgesRef = useRef<HTMLCanvasElement>(null);
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

        const baseSize = data.size ?? 12;

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
          return { ...data, color: '#6366f1', size: 3 };
        }

        if (selected) {
          const connected = src === selected || tgt === selected;
          return {
            ...data,
            color: connected ? '#6366f1' : '#e2e8f040',
            size: connected ? 3 : 0.5,
          };
        }

        return data;
      });

      // Draw type badge abbreviations on top of each visible node
      function drawBadges() {
        const canvas = badgesRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = container.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        sigma.getGraph().forEachNode((node, attrs) => {
          const displayData = sigma.getNodeDisplayData(node);
          if (!displayData) return;
          // Skip faded nodes
          if (displayData.color === '#e2e8f0') return;

          // Convert graph-space coords to screen pixels
          const viewport = sigma.graphToViewport({ x: attrs.x, y: attrs.y });
          const screenSize = displayData.size / sigma.getCamera().ratio;
          const fontSize = Math.max(6, Math.min(screenSize * 0.5, 12));

          const badge = TYPE_BADGE[attrs.nodeType as NodeType] ?? '??';

          ctx.save();
          ctx.font = `bold ${fontSize}px monospace`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badge, viewport.x, viewport.y);
          ctx.restore();
        });
      }

      sigma.on('afterRender', drawBadges);

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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', background: '#f8fafc' }}
      />
      <canvas
        ref={badgesRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
