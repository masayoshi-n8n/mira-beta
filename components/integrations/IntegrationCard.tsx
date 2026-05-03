'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SyncStatus } from './SyncStatus';
import type { Integration } from '@/lib/types';

interface IntegrationCardProps {
  integration: Integration;
}

const META: Record<string, { logo: string; color: string; description: string }> = {
  jira: {
    logo: 'J',
    color: 'bg-blue-600',
    description: 'Sync epics, stories, decisions, and roadmap items from your Jira boards.',
  },
  notion: {
    logo: 'N',
    color: 'bg-black',
    description: 'Ingest strategy docs, meeting notes, and product specs from Notion pages.',
  },
  linear: {
    logo: 'L',
    color: 'bg-violet-600',
    description: 'Pull roadmap milestones, cycles, and engineering context from Linear.',
  },
};

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const [status, setStatus] = useState(integration.status);
  const [isConnecting, setIsConnecting] = useState(false);
  const meta = META[integration.name];

  function handleConnect() {
    setIsConnecting(true);
    setTimeout(() => {
      setStatus('syncing');
      setIsConnecting(false);
      setTimeout(() => setStatus('connected'), 2000);
    }, 1500);
  }

  function handleDisconnect() {
    setStatus('disconnected');
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border bg-background p-5">
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${meta.color}`}>
          {meta.logo}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold capitalize">{integration.name}</h3>
            <SyncStatus status={status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">{meta.description}</p>
          {status === 'connected' && integration.lastSyncedAt && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {integration.nodeCount} nodes · Last synced {new Date(integration.lastSyncedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {status === 'connected' || status === 'syncing' ? (
          <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-xs">
            Disconnect
          </Button>
        ) : (
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-xs"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Connecting
              </span>
            ) : (
              'Connect'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
