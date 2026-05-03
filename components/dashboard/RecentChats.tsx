'use client';

import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChatSession } from '@/lib/types';

interface RecentChatsProps {
  sessions: ChatSession[];
}

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function RecentChats({ sessions }: RecentChatsProps) {
  return (
    <div className="flex flex-col rounded-xl border bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Recent chats</h2>
        <Link href="/chat">
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
            New chat
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      <div className="flex flex-col divide-y">
        {sessions.map((session) => {
          const lastMsg = session.messages[session.messages.length - 1];
          const preview =
            lastMsg?.role === 'mira'
              ? lastMsg.content.slice(0, 100).replace(/\*\*/g, '') + '…'
              : null;

          return (
            <Link key={session.id} href={`/chat/${session.id}`} className="group block">
              <div className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{session.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {relativeTime(session.updatedAt)}
                    </span>
                  </div>
                  {preview && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {preview}
                    </p>
                  )}
                </div>
                <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          );
        })}
      </div>

      {sessions.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">No chats yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ask Mira anything about your product.
            </p>
          </div>
          <Link href="/chat">
            <Button size="sm">Start a chat</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
