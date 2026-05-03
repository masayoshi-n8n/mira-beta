'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepTwoProps {
  onNext: (connectedTools: string[]) => void;
  onSkip: () => void;
}

const TOOLS = [
  {
    id: 'jira',
    name: 'Jira',
    description: 'Sync epics, stories, and decisions from your project boards.',
    logo: 'J',
    color: 'bg-blue-600',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Ingest strategy docs, meeting notes, and product specs.',
    logo: 'N',
    color: 'bg-black',
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Pull in roadmap milestones and engineering context.',
    logo: 'L',
    color: 'bg-violet-600',
  },
];

export function StepTwo({ onNext, onSkip }: StepTwoProps) {
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [connecting, setConnecting] = useState<string | null>(null);

  function handleConnect(toolId: string) {
    if (connected.has(toolId)) return;
    setConnecting(toolId);
    setTimeout(() => {
      setConnected((prev) => new Set([...prev, toolId]));
      setConnecting(null);
    }, 1200);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Connect your tools</h2>
        <p className="text-sm text-muted-foreground">
          Mira will start ingesting your product context immediately.
          You can connect more integrations later.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {TOOLS.map((tool) => {
          const isConnected = connected.has(tool.id);
          const isConnecting = connecting === tool.id;
          return (
            <div
              key={tool.id}
              className={cn(
                'flex items-center justify-between rounded-lg border p-4 transition-colors',
                isConnected && 'border-green-200 bg-green-50/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold text-white',
                    tool.color
                  )}
                >
                  {tool.logo}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{tool.name}</span>
                    {isConnected && (
                      <Badge
                        variant="secondary"
                        className="h-5 bg-green-100 text-green-700 text-xs"
                      >
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={isConnected ? 'secondary' : 'outline'}
                onClick={() => handleConnect(tool.id)}
                disabled={isConnected || isConnecting}
                className="shrink-0"
              >
                {isConnecting ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Connecting
                  </span>
                ) : isConnected ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    Connected
                  </span>
                ) : (
                  'Connect'
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={() => onNext([...connected])}
          className="gap-2"
        >
          {connected.size > 0 ? 'Continue' : 'Continue without connecting'}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
          Skip this step
        </Button>
      </div>
    </div>
  );
}
