import { Database, Share2, BookOpen, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProvenanceItem } from '@/lib/types';
import { useState } from 'react';

interface ProvenanceBarProps {
  items: ProvenanceItem[];
}

const LAYER_CONFIG = {
  'vector-db': { icon: <Database className="h-3 w-3" />, label: 'Document', color: 'text-purple-600 bg-purple-50' },
  'knowledge-graph': { icon: <Share2 className="h-3 w-3" />, label: 'Graph', color: 'text-blue-600 bg-blue-50' },
  'llm-wiki': { icon: <BookOpen className="h-3 w-3" />, label: 'Wiki', color: 'text-emerald-600 bg-emerald-50' },
};

export function ProvenanceBar({ items }: ProvenanceBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-3 rounded-lg border border-dashed bg-muted/30 p-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground"
      >
        <span className="flex items-center gap-1.5">
          <Database className="h-3 w-3" />
          <span className="font-medium">{items.length} sources</span>
          <span className="text-muted-foreground/60">·</span>
          <span>{items.map(i => LAYER_CONFIG[i.layer].label).join(', ')}</span>
        </span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-2">
          {items.map((item, i) => {
            const cfg = LAYER_CONFIG[item.layer];
            return (
              <div key={i} className="flex items-start gap-2">
                <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px]', cfg.color)}>
                  {cfg.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-foreground">{item.source}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.excerpt}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
