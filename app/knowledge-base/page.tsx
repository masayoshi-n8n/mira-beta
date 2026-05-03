import { getKnowledgeBaseItems } from '@/lib/data';
import { SourceList } from '@/components/knowledge-base/SourceList';
import { Database } from 'lucide-react';

export default function KnowledgeBasePage() {
  const items = getKnowledgeBaseItems();
  const ready = items.filter((i) => i.status === 'ready').length;
  const totalNodes = items.reduce((acc, i) => acc + i.extractedNodeIds.length, 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ready} of {items.length} sources processed · {totalNodes} nodes extracted
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
          <Database className="h-5 w-5 text-indigo-600" />
        </div>
      </div>
      <SourceList items={items} />
    </div>
  );
}
