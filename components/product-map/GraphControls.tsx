'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getNodeColor } from '@/lib/graph-utils';
import type { NodeType } from '@/lib/types';
import { cn } from '@/lib/utils';

const NODE_TYPES: NodeType[] = [
  'feedback', 'decision', 'feature', 'metric', 'persona', 'competitor', 'epic', 'note',
];

interface GraphControlsProps {
  onSearch: (query: string) => void;
  onFilter: (types: NodeType[]) => void;
}

export function GraphControls({ onSearch, onFilter }: GraphControlsProps) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<NodeType>>(new Set());

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onSearch(e.target.value);
  }

  function toggleFilter(type: NodeType) {
    const next = new Set(activeFilters);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    setActiveFilters(next);
    onFilter([...next]);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-background/95 backdrop-blur p-3 shadow-md w-64">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={handleSearch}
          placeholder="Search nodes…"
          className="pl-8 h-8 text-xs"
        />
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Filter by type
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {NODE_TYPES.map((type) => {
            const active = activeFilters.has(type);
            const color = getNodeColor(type);
            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={cn(
                  'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors',
                  active
                    ? 'border-transparent text-white'
                    : 'border-border text-muted-foreground hover:border-border/80'
                )}
                style={active ? { background: color, borderColor: color } : {}}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: active ? 'white' : color }}
                />
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Legend</p>
        <div className="grid grid-cols-2 gap-1">
          {NODE_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-1.5 text-[10px]">
              <div className="h-2 w-2 rounded-full shrink-0" style={{ background: getNodeColor(type) }} />
              <span className="capitalize text-muted-foreground">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
