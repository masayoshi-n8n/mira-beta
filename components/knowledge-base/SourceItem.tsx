'use client';

import { useState } from 'react';
import { FileText, Trash2, ChevronDown, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProcessingStatus } from './ProcessingStatus';
import type { KnowledgeBaseItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SourceItemProps {
  item: KnowledgeBaseItem;
}

const SOURCE_ICON: Record<KnowledgeBaseItem['source'], string> = {
  upload: '📄',
  jira: 'J',
  notion: 'N',
  linear: 'L',
  note: '📝',
};

const SOURCE_COLOR: Record<KnowledgeBaseItem['source'], string> = {
  upload: 'bg-slate-100 text-slate-700',
  jira: 'bg-blue-600 text-white',
  notion: 'bg-black text-white',
  linear: 'bg-violet-600 text-white',
  note: 'bg-yellow-100 text-yellow-700',
};

export function SourceItem({ item }: SourceItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn('rounded-xl border bg-background transition-shadow hover:shadow-sm', item.status === 'failed' && 'border-red-200 bg-red-50/30')}>
      <div className="flex items-start gap-3 p-4">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold', SOURCE_COLOR[item.source])}>
          {SOURCE_ICON[item.source]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug">{item.title}</p>
            <ProcessingStatus status={item.status} className="shrink-0" />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{item.source}</span>
            <span>·</span>
            <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
            {item.extractedNodeIds.length > 0 && (
              <>
                <span>·</span>
                <span>{item.extractedNodeIds.length} nodes extracted</span>
              </>
            )}
          </div>
          {item.errorMessage && (
            <p className="mt-1 text-xs text-red-600">{item.errorMessage}</p>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-1 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Expand"
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
        </button>
      </div>

      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3">
          {item.annotations.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Annotations</span>
              </div>
              <div className="flex flex-col gap-1">
                {item.annotations.map((a, i) => (
                  <p key={i} className="text-xs text-muted-foreground leading-relaxed">· {a}</p>
                ))}
              </div>
            </div>
          )}

          {item.extractedNodeIds.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Extracted nodes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.extractedNodeIds.map((id) => (
                  <Badge key={id} variant="secondary" className="text-[10px] h-5 font-mono">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700">
              <Trash2 className="h-3 w-3" />
              Remove source
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
