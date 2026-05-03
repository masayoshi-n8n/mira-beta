'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { useStore } from '@/lib/store';
import { getChatSessionById, getChatSessions } from '@/lib/data';
import type { ChatMessage } from '@/lib/types';
import Link from 'next/link';

interface ChatInterfaceProps {
  initialMessages?: ChatMessage[];
  sessionTitle?: string;
}

function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mt-0.5">
        M
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-muted/50 px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function matchSession(query: string): ChatMessage | null {
  const lower = query.toLowerCase();
  let sessionId: string | null = null;

  if (
    lower.includes('q3') ||
    lower.includes('build first') ||
    lower.includes('prioriti') ||
    lower.includes('what should')
  ) {
    sessionId = 'cs-001';
  } else if (
    (lower.includes('analytics') && (lower.includes('demand') || lower.includes('know'))) ||
    lower.includes('creator analytics')
  ) {
    sessionId = 'cs-002';
  } else if (
    lower.includes('roadmap') ||
    lower.includes('q1') ||
    lower.includes('what changed') ||
    lower.includes('changed in')
  ) {
    sessionId = 'cs-003';
  }

  if (!sessionId) return null;
  const session = getChatSessionById(sessionId);
  return session?.messages.find((m) => m.role === 'mira') ?? null;
}

const FALLBACK_RESPONSE: ChatMessage = {
  id: 'fallback',
  role: 'mira',
  content:
    "I've searched your product context and found relevant signals. Based on the 28 nodes in your knowledge graph, this touches on decisions from your Q2 planning, creator interview feedback, and competitive intelligence.\n\nWant me to dig deeper into any specific aspect? You can also try asking about Q3 prioritization, creator analytics demand, or what changed in your Q1 roadmap.",
  timestamp: new Date().toISOString(),
  confidence: 'inferred',
  provenance: [
    {
      layer: 'knowledge-graph',
      source: 'LPM Knowledge Graph',
      excerpt: '28 nodes and 25 connections searched across all signal types.',
    },
  ],
};

export function ChatInterface({ initialMessages = [], sessionTitle }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sessions = getChatSessions();

  const preloadedPrompt = useStore((s) => s.preloadedPrompt);
  const setPreloadedPrompt = useStore((s) => s.setPreloadedPrompt);

  useEffect(() => {
    if (preloadedPrompt) {
      setInput(preloadedPrompt);
      setPreloadedPrompt(null);
      textareaRef.current?.focus();
    }
  }, [preloadedPrompt, setPreloadedPrompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  async function handleSubmit() {
    const text = input.trim();
    if (!text || isThinking) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    await new Promise((r) => setTimeout(r, 1600));

    const matched = matchSession(text);
    const miraMsg: ChatMessage = matched
      ? { ...matched, id: `m-${Date.now()}`, timestamp: new Date().toISOString() }
      : { ...FALLBACK_RESPONSE, id: `m-${Date.now()}`, timestamp: new Date().toISOString() };

    setIsThinking(false);
    setMessages((prev) => [...prev, miraMsg]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r lg:flex">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Chats</span>
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="flex flex-col gap-0.5 overflow-y-auto p-2">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/chat/${s.id}`}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors line-clamp-2"
            >
              {s.title}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main chat */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Title bar */}
        {sessionTitle && (
          <div className="border-b px-6 py-3">
            <h1 className="text-sm font-semibold truncate">{sessionTitle}</h1>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.length === 0 && !isThinking && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600">
                <span className="text-2xl font-bold text-white">M</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Ask Mira anything</h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  Mira has 60 days of your product context — decisions, feedback,
                  metrics, and competitor signals.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {['What should we build first in Q3?', 'What do we know about creator analytics demand?', 'What changed in our roadmap in Q1?'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="rounded-lg border px-4 py-2.5 text-sm text-left text-muted-foreground hover:border-indigo-300 hover:text-foreground hover:bg-indigo-50/50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isThinking && <ThinkingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-background px-6 py-4">
          <div className="flex items-end gap-3 rounded-xl border bg-muted/30 px-4 py-3 focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-200 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Mira about your product context…"
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground max-h-40"
              style={{ minHeight: '24px' }}
            />
            <Button
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
              onClick={handleSubmit}
              disabled={!input.trim() || isThinking}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Mira grounds every answer in your actual product context.
          </p>
        </div>
      </div>
    </div>
  );
}
