'use client';

import { useEffect, useRef } from 'react';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import type { SigmaGraphType, SigmaNodeAttributes, SigmaEdgeAttributes } from '@/lib/sigma-utils';
import type { NodeType } from '@/lib/types';

export interface SigmaGraphProps {
  graph: SigmaGraphType;
  selectedId: string | null;
  searchQuery: string;
  activeFilters: NodeType[];
  depth: number;
  externalHighlightIds?: string[] | null;
  onNodeClick: (id: string) => void;
  onStageClick: () => void;
}

type SigmaInstance = import('sigma').Sigma<SigmaNodeAttributes, SigmaEdgeAttributes>;

const TYPE_BADGE: Record<NodeType, string> = {
  feedback: 'FB', decision: 'DC', feature: 'FT', metric: 'MT',
  persona: 'PS', competitor: 'CP', epic: 'EP', note: 'NT',
};

const FADED_COLOR = '#0f1623';

function bfsVisible(graph: SigmaGraphType, fromId: string, hops: number): Set<string> {
  const visited = new Set<string>([fromId]);
  let frontier = [fromId];
  for (let d = 0; d < hops; d++) {
    const next: string[] = [];
    frontier.forEach((n) => {
      if (graph.hasNode(n)) {
        graph.neighbors(n).forEach((nb) => {
          if (!visited.has(nb)) { visited.add(nb); next.push(nb); }
        });
      }
    });
    frontier = next;
    if (frontier.length === 0) break;
  }
  return visited;
}

export function SigmaGraph({
  graph, selectedId, searchQuery, activeFilters, depth,
  externalHighlightIds, onNodeClick, onStageClick,
}: SigmaGraphProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const glowRef       = useRef<HTMLCanvasElement>(null);
  const badgesRef     = useRef<HTMLCanvasElement>(null);
  const sigmaRef      = useRef<SigmaInstance | null>(null);

  const selectedIdRef   = useRef(selectedId);
  const searchQueryRef  = useRef(searchQuery);
  const activeFiltersRef= useRef(activeFilters);
  const externalRef     = useRef(externalHighlightIds);
  const depthRef        = useRef(depth);
  const depthSetRef     = useRef<Set<string> | null>(null);
  const hoveredRef      = useRef<string | null>(null);
  const onNodeClickRef  = useRef(onNodeClick);
  const onStageClickRef = useRef(onStageClick);

  function recomputeDepth() {
    const id  = selectedIdRef.current;
    const hop = depthRef.current;
    depthSetRef.current = (id && hop > 0) ? bfsVisible(graph, id, hop) : null;
  }

  useEffect(() => {
    selectedIdRef.current = selectedId;
    recomputeDepth();
    sigmaRef.current?.refresh();
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    depthRef.current = depth;
    recomputeDepth();
    sigmaRef.current?.refresh();
  }, [depth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { searchQueryRef.current  = searchQuery;          sigmaRef.current?.refresh(); }, [searchQuery]);
  useEffect(() => { activeFiltersRef.current = activeFilters;        sigmaRef.current?.refresh(); }, [activeFilters]);
  useEffect(() => { externalRef.current      = externalHighlightIds; sigmaRef.current?.refresh(); }, [externalHighlightIds]);
  useEffect(() => { onNodeClickRef.current   = onNodeClick; },  [onNodeClick]);
  useEffect(() => { onStageClickRef.current  = onStageClick; }, [onStageClick]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let killed = false;
    let animFrame: number | null = null;

    import('sigma').then(({ Sigma }) => {
      if (killed || !container) return;

      const sigma = new Sigma<SigmaNodeAttributes, SigmaEdgeAttributes>(graph, container, {
        renderEdgeLabels: false,
        defaultEdgeType: 'line',
        labelSize: 11,
        labelWeight: '500',
        labelColor: { color: '#94a3b8' },
        zIndex: true,
        minCameraRatio: 0.08,
        maxCameraRatio: 6,
        labelRenderedSizeThreshold: 6,
      });

      // ── Node reducer ────────────────────────────────────────────────────────
      sigma.setSetting('nodeReducer', (node, data) => {
        const g = sigma.getGraph();
        const query    = searchQueryRef.current.toLowerCase();
        const nodeType = data.nodeType as NodeType;

        const matchesSearch  = !query || (data.label ?? '').toLowerCase().includes(query) || (data.description ?? '').toLowerCase().includes(query);
        const matchesFilter  = activeFiltersRef.current.length === 0 || activeFiltersRef.current.includes(nodeType);
        const matchesExt     = externalRef.current == null || (externalRef.current?.includes(node) ?? false);
        const matchesDepth   = depthSetRef.current == null || depthSetRef.current.has(node);

        const hovered    = hoveredRef.current;
        const isSelected = node === selectedIdRef.current;
        const isHovered  = node === hovered;
        const isNeighbor = hovered != null && g.hasNode(hovered) && g.areNeighbors(hovered, node);
        const isActive   = hovered != null ? isHovered || isNeighbor : true;

        const shouldFade = !matchesSearch || !matchesFilter || !matchesExt || !matchesDepth || (hovered != null && !isActive);

        const baseSize = data.size ?? 8;
        return {
          ...data,
          highlighted: isSelected || isHovered,
          size:  isSelected ? baseSize * 1.5 : isHovered ? baseSize * 1.25 : baseSize,
          color: shouldFade ? FADED_COLOR : data.color,
          zIndex: isSelected ? 2 : isHovered ? 1 : 0,
          label: shouldFade ? '' : data.label,
        };
      });

      // ── Edge reducer ─────────────────────────────────────────────────────────
      sigma.setSetting('edgeReducer', (edge, data) => {
        const g        = sigma.getGraph();
        const src      = g.source(edge);
        const tgt      = g.target(edge);
        const hovered  = hoveredRef.current;
        const selected = selectedIdRef.current;
        const depthSet = depthSetRef.current;

        if (depthSet && (!depthSet.has(src) || !depthSet.has(tgt))) return { ...data, hidden: true };

        if (hovered) {
          const connected = src === hovered || tgt === hovered;
          if (!connected) return { ...data, hidden: true };
          return { ...data, color: '#a78bfacc', size: 2 };
        }
        if (selected) {
          const connected = src === selected || tgt === selected;
          return connected
            ? { ...data, color: '#a78bfacc', size: 2 }
            : { ...data, color: '#1e2a3a', size: 0.5 };
        }
        return data;
      });

      // ── Overlay: glow + type badges ──────────────────────────────────────────
      function drawOverlay() {
        const glowCanvas   = glowRef.current;
        const badgesCanvas = badgesRef.current;
        if (!glowCanvas || !badgesCanvas) return;
        const glowCtx   = glowCanvas.getContext('2d');
        const badgesCtx = badgesCanvas.getContext('2d');
        if (!glowCtx || !badgesCtx) return;

        const rect = container.getBoundingClientRect();
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        if (!w || !h) return;

        for (const c of [glowCanvas, badgesCanvas]) {
          if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
        }
        glowCtx.clearRect(0, 0, w, h);
        badgesCtx.clearRect(0, 0, w, h);

        const cameraRatio = sigma.getCamera().ratio;

        sigma.getGraph().forEachNode((node, attrs) => {
          const displayData = sigma.getNodeDisplayData(node);
          if (!displayData || displayData.color === FADED_COLOR) return;

          const pos = sigma.graphToViewport({ x: attrs.x, y: attrs.y });
          const nodeColor = displayData.color;
          const screenSize = displayData.size / cameraRatio;

          // Glow halo (rendered with screen blend mode)
          const glowR = Math.max(screenSize * 2.8, 14);
          const grad = glowCtx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowR);
          grad.addColorStop(0,   nodeColor + 'cc');
          grad.addColorStop(0.3, nodeColor + '66');
          grad.addColorStop(1,   nodeColor + '00');
          glowCtx.beginPath();
          glowCtx.arc(pos.x, pos.y, glowR, 0, Math.PI * 2);
          glowCtx.fillStyle = grad;
          glowCtx.fill();

          // Type badge — only when node is large enough on screen
          if (screenSize < 7) return;
          const badge    = TYPE_BADGE[attrs.nodeType as NodeType] ?? '??';
          const fontSize = Math.max(5, Math.min(screenSize * 0.48, 11));
          badgesCtx.save();
          badgesCtx.font = `bold ${fontSize}px monospace`;
          badgesCtx.fillStyle = 'rgba(255,255,255,0.85)';
          badgesCtx.textAlign = 'center';
          badgesCtx.textBaseline = 'middle';
          badgesCtx.fillText(badge, pos.x, pos.y);
          badgesCtx.restore();
        });
      }

      sigma.on('afterRender', drawOverlay);
      sigmaRef.current = sigma;

      // ── Live physics — nodes settle over ~4 s ────────────────────────────────
      const fa2Settings = forceAtlas2.inferSettings(graph);
      let frame = 0;

      function animate() {
        if (killed || frame >= 250) return;
        forceAtlas2.assign(sigma.getGraph(), {
          iterations: 3,
          settings: { ...fa2Settings, gravity: 1, scalingRatio: 4, barnesHutOptimize: frame > 40 },
        });
        if (!killed) sigma.refresh();
        frame++;
        animFrame = requestAnimationFrame(animate);
      }
      animFrame = requestAnimationFrame(animate);

      // ── Events ───────────────────────────────────────────────────────────────
      sigma.on('clickNode',  ({ node }) => onNodeClickRef.current(node));
      sigma.on('clickStage', ()          => onStageClickRef.current());
      sigma.on('enterNode',  ({ node }) => { hoveredRef.current = node; sigma.refresh(); });
      sigma.on('leaveNode',  ()          => { hoveredRef.current = null; sigma.refresh(); });
    });

    return () => {
      killed = true;
      if (animFrame) cancelAnimationFrame(animFrame);
      sigmaRef.current?.kill();
      sigmaRef.current = null;
    };
  }, [graph]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', isolation: 'isolate' }}>
      {/* Sigma renders into this div — background shows through WebGL alpha */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', background: '#080b10' }}
      />
      {/* Glow halos — screen blend adds luminance on dark bg */}
      <canvas
        ref={glowRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', mixBlendMode: 'screen' }}
      />
      {/* Type badges — normal blend, on top */}
      <canvas
        ref={badgesRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />
    </div>
  );
}
