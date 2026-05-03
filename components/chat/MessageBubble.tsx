'use client';

import { ConfidenceIndicator } from './ConfidenceIndicator';
import { ProvenanceBar } from './ProvenanceBar';
import { DecisionTrace } from './DecisionTrace';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
}

function formatContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mt-0.5">
        M
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold text-foreground">Mira</span>
          {message.confidence && (
            <ConfidenceIndicator level={message.confidence} />
          )}
        </div>

        <div className="rounded-2xl rounded-tl-sm bg-muted/50 px-4 py-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={cn(line === '' ? 'h-3' : '')}>
              {formatContent(line)}
            </p>
          ))}
        </div>

        {message.decisionTrace && (
          <DecisionTrace trace={message.decisionTrace} />
        )}

        {message.provenance && message.provenance.length > 0 && (
          <ProvenanceBar items={message.provenance} />
        )}
      </div>
    </div>
  );
}
