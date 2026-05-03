'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, TrendingUp, Globe, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import type { MiraSuggestion } from '@/lib/types';

interface MiraSuggestionsProps {
  suggestions: MiraSuggestion[];
}

const SUGGESTION_META = [
  {
    icon: <TrendingUp className="h-5 w-5" />,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    tag: 'Demand spike',
    tagColor: 'bg-purple-100 text-purple-700',
    highlight: '40%',
  },
  {
    icon: <Globe className="h-5 w-5" />,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    tag: 'Competitor move',
    tagColor: 'bg-red-100 text-red-700',
    highlight: 'Substack',
  },
  {
    icon: <AlertCircle className="h-5 w-5" />,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-700',
    tag: 'Action needed',
    tagColor: 'bg-yellow-100 text-yellow-700',
    highlight: '3 tickets',
  },
];

export function MiraSuggestions({ suggestions }: MiraSuggestionsProps) {
  const router = useRouter();
  const setPreloadedPrompt = useStore((s) => s.setPreloadedPrompt);

  function handleAskMira(suggestion: MiraSuggestion) {
    setPreloadedPrompt(suggestion.preloadedPrompt);
    router.push('/chat');
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Mira noticed
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {suggestions.map((suggestion, i) => {
          const meta = SUGGESTION_META[i] ?? SUGGESTION_META[0];
          return (
            <div
              key={suggestion.id}
              className="group flex flex-col justify-between rounded-xl border bg-background p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.iconBg} ${meta.iconColor}`}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                    <Badge
                      variant="secondary"
                      className={`text-xs ${meta.tagColor} border-0`}
                    >
                      {meta.tag}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-foreground">
                  {suggestion.summary}
                </p>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="mt-4 w-full justify-between gap-2 border border-dashed text-muted-foreground hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 group-hover:border-indigo-200"
                onClick={() => handleAskMira(suggestion)}
              >
                Ask Mira
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
