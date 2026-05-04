'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronLeft } from 'lucide-react';
import { NODE_COLOR_MAP_EXPORT } from '@/lib/sigma-utils';
import type { NodeType } from '@/lib/types';
import { cn } from '@/lib/utils';

const NODE_TYPES: NodeType[] = [
  'feedback', 'decision', 'feature', 'metric', 'persona', 'competitor', 'epic', 'note',
];

const TYPE_LABEL: Record<NodeType, string> = {
  feedback: 'Feedback', decision: 'Decision', feature: 'Feature', metric: 'Metric',
  persona: 'Persona', competitor: 'Competitor', epic: 'Epic', note: 'Note',
};

interface GraphControlsProps {
  collapsed: boolean;
  depth: number;
  onToggleCollapse: () => void;
  onSearch: (query: string) => void;
  onFilter: (types: NodeType[]) => void;
  onDepthChange: (depth: number) => void;
}

export function GraphControls({
  collapsed, depth, onToggleCollapse, onSearch, onFilter, onDepthChange,
}: GraphControlsProps) {
  const [query, setQuery]               = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<NodeType>>(new Set());

  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#0f1623]/90 backdrop-blur-md shadow-lg hover:bg-[#161e2e] transition-colors"
        title="Show controls"
      >
        <SlidersHorizontal className="h-4 w-4 text-slate-400" />
      </button>
    );
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onSearch(e.target.value);
  }

  function toggleFilter(type: NodeType) {
    const next = new Set(activeFilters);
    if (next.has(type)) next.delete(type); else next.add(type);
    setActiveFilters(next);
    onFilter([...next]);
  }

  const depthLabel = depth === 0 ? 'All' : `${depth} hop${depth > 1 ? 's' : ''}`;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0f1623]/90 backdrop-blur-md p-3 shadow-xl w-60">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Graph Controls
        </span>
        <button
          onClick={onToggleCollapse}
          className="flex h-5 w-5 items-center justify-center rounded hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5 text-slate-500" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
        <input
          value={query}
          onChange={handleSearch}
          placeholder="Search nodes…"
          className="w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-0 transition-colors"
        />
      </div>

      {/* Depth filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Depth
          </span>
          <span className="text-[10px] font-mono text-indigo-400">{depthLabel}</span>
        </div>
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={depth}
          onChange={(e) => onDepthChange(Number(e.target.value))}
          className="w-full h-1 appearance-none rounded-full cursor-pointer"
          style={{
            background: depth === 0
              ? '#1e2a3a'
              : `linear-gradient(to right, #818cf8 0%, #818cf8 ${(depth / 5) * 100}%, #1e2a3a ${(depth / 5) * 100}%, #1e2a3a 100%)`,
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-slate-600">All</span>
          <span className="text-[9px] text-slate-600">5</span>
        </div>
        {depth > 0 && (
          <p className="text-[9px] text-slate-600 mt-1">
            Select a node to see its neighborhood
          </p>
        )}
      </div>

      {/* Node type filter */}
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2 block">
          Filter by type
        </span>
        <div className="flex flex-col gap-0.5">
          {NODE_TYPES.map((type) => {
            const active = activeFilters.has(type);
            const color  = NODE_COLOR_MAP_EXPORT[type];
            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors text-left',
                  active ? 'bg-white/8 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                )}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0 transition-opacity"
                  style={{ background: color, opacity: active ? 1 : 0.4 }}
                />
                {TYPE_LABEL[type]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
