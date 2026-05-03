'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SourceItem } from './SourceItem';
import type { KnowledgeBaseItem } from '@/lib/types';

interface SourceListProps {
  items: KnowledgeBaseItem[];
}

const FILTERS = ['All', 'Ready', 'Processing', 'Failed'] as const;
type Filter = (typeof FILTERS)[number];

export function SourceList({ items }: SourceListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = items.filter((item) => {
    const matchSearch =
      !search || item.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'All' ||
      item.status === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search + filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sources…"
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3">
        {filtered.map((item) => (
          <SourceItem key={item.id} item={item} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border bg-muted/30 py-12 text-center text-sm text-muted-foreground">
            No sources match your filter.
          </div>
        )}
      </div>
    </div>
  );
}
