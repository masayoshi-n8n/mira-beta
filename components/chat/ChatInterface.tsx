'use client';

import { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Monitor, ArrowUp, Square, FileText, X, ChevronRight, Map } from 'lucide-react';
import { getChatSessionById } from '@/lib/data';
import { useStore } from '@/lib/store';
import { DecisionTrace } from '@/components/chat/DecisionTrace';
import { ArtifactPanel } from '@/components/chat/ArtifactPanel';
import type { ChatSession, ChatMessage, Artifact } from '@/lib/types';

export interface ChatInterfaceProps {
  session?: ChatSession;
  initialMessages?: ChatMessage[];
  sessionTitle?: string;
}

function matchSession(query: string): ChatMessage | null {
  const lower = query.toLowerCase();
  let sessionId: string | null = null;
  let messageId: string | null = null;

  if (lower.includes('activation') || lower.includes('12%') || lower.includes('organic') || lower.includes('gate') || lower.includes('sign-up') || lower.includes('signup')) {
    sessionId = 'cs-001';
    messageId = 'msg-001-04';
  } else if (lower.includes('deliverable') || lower.includes('leadership') || lower.includes('make it') || (lower.includes('yes') && lower.length < 40)) {
    sessionId = 'cs-001';
    messageId = 'msg-001-10';
  } else if (lower.includes('experiment') || lower.includes('what should') || lower.includes('what do we do')) {
    sessionId = 'cs-001';
    messageId = 'msg-001-06';
  } else if (lower.includes('q3') || lower.includes('build first') || lower.includes('prioriti')) {
    sessionId = 'cs-001';
    messageId = 'msg-001-08';
  } else if ((lower.includes('analytics') && (lower.includes('demand') || lower.includes('know'))) || lower.includes('creator analytics')) {
    sessionId = 'cs-002';
  } else if (lower.includes('roadmap') || lower.includes('q1') || lower.includes('what changed')) {
    sessionId = 'cs-003';
  }

  if (!sessionId) return null;
  const s = getChatSessionById(sessionId);
  if (!s) return null;
  if (messageId) return s.messages.find((m) => m.id === messageId) ?? null;
  return s.messages.find((m) => m.role === 'mira') ?? null;
}

function ArtifactCard({
  artifact,
  onOpen,
}: {
  artifact: Artifact;
  onOpen: (a: Artifact) => void;
}) {
  return (
    <button
      onClick={() => onOpen(artifact)}
      className="w-full flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 my-2 text-left hover:bg-gray-100 hover:border-gray-300 transition-colors group"
    >
      <FileText className="h-5 w-5 text-[#4F3DD5] shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-[#4F3DD5] transition-colors">{artifact.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{artifact.description}</p>
      </div>
    </button>
  );
}

function LPMBanner() {
  return (
    <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 my-3 text-xs text-indigo-700">
      <Map className="h-3.5 w-3.5 shrink-0" />
      <span>LPM updated — 4 signals and 2 decisions added.</span>
      <button className="font-semibold underline hover:no-underline ml-1">View Map</button>
    </div>
  );
}

function MsgBubble({
  message,
  onOpenArtifact,
}: {
  message: ChatMessage;
  onOpenArtifact: (a: Artifact) => void;
}) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-3">
          {message.provenance && message.provenance.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {message.provenance.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-0.5 text-xs text-gray-600">
                  <FileText className="h-2.5 w-2.5" />
                  {p.source}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  const lines = message.content.split('\n');

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-800 leading-relaxed">
        {lines.map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={i} className="font-bold mt-3 mb-1">{line.slice(2, -2)}</p>;
          }
          const boldLabelMatch = line.match(/^\*\*(.+?)\*\*:?\s*(.*)/);
          if (boldLabelMatch) {
            const [, label, rest] = boldLabelMatch;
            return (
              <p key={i} className="mt-2 mb-0.5">
                <span className="font-semibold">{label}{rest ? ':' : ''}</span>
                {rest ? ` ${rest}` : ''}
              </p>
            );
          }
          if (line.startsWith('- ') || line.match(/^\d+\./)) {
            return (
              <div key={i} className="flex gap-2 ml-2 mb-1">
                <span className="text-gray-400 shrink-0">{line.startsWith('- ') ? '·' : line.match(/^(\d+)\./)?.[1] + '.'}</span>
                <span>{line.startsWith('- ') ? line.slice(2) : line.replace(/^\d+\.\s/, '')}</span>
              </div>
            );
          }
          if (line === '') return <div key={i} className="h-2" />;
          return <p key={i} className="mb-1">{line}</p>;
        })}
      </div>

      {message.artifacts && message.artifacts.length > 0 && (
        <div className="mt-3">
          {message.artifacts.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} onOpen={onOpenArtifact} />
          ))}
        </div>
      )}

      {message.decisionTrace && <DecisionTrace trace={message.decisionTrace} />}

      {message.role === 'mira' && !message.artifacts && message.content.includes('artifact') && (
        <LPMBanner />
      )}

      {message.provenance && message.provenance.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {message.provenance.map((p, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 text-xs text-gray-500">
              <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                p.layer === 'knowledge-graph' ? 'bg-indigo-400' : p.layer === 'vector-db' ? 'bg-purple-400' : 'bg-green-400'
              }`} />
              {p.source}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProcessingState({ files }: { files: string[] }) {
  return (
    <div className="mb-6 space-y-2">
      {files.map((file, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-green-500 text-xs mt-0.5">✓</span>
          <div>
            <p className="text-sm font-medium text-gray-800">{file} read</p>
            <p className="text-xs text-gray-400">Extracting signals and mapping to LPM...</p>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300 border-t-[#4F3DD5] animate-spin" />
        Pulling this together...
      </div>
    </div>
  );
}

const FALLBACK_RESPONSE = "I've searched your product context and found relevant signals. Based on the nodes in your knowledge graph, this touches on your activation funnel, recent sprint changes, and customer interview data.\n\nWant me to dig deeper into any specific aspect? You can also try asking about the activation drop, what we should do next, or what changed in the roadmap.";

export function ChatInterface({ session, initialMessages, sessionTitle }: ChatInterfaceProps) {
  const startMessages = session?.messages ?? initialMessages ?? [];
  const title = session?.title ?? sessionTitle ?? 'New Chat';

  const [messages, setMessages] = useState<ChatMessage[]>(startMessages);
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [openArtifact, setOpenArtifact] = useState<Artifact | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preloadedPrompt = useStore((s) => s.preloadedPrompt);
  const setPreloadedPrompt = useStore((s) => s.setPreloadedPrompt);

  useEffect(() => {
    if (preloadedPrompt) {
      setInput(preloadedPrompt);
      setPreloadedPrompt(null);
    }
  }, [preloadedPrompt, setPreloadedPrompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showProcessing]);

  function handleSend() {
    if (!input.trim() && attachedFiles.length === 0) return;
    if (isGenerating) { setIsGenerating(false); return; }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      provenance: attachedFiles.map((f) => ({ layer: 'vector-db', source: f, excerpt: '' })),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = input;
    setInput('');
    setAttachedFiles([]);
    setIsGenerating(true);

    if (attachedFiles.length > 0) {
      setShowProcessing(true);
      setTimeout(() => {
        setShowProcessing(false);
        addMiraResponse(query);
      }, 3000);
    } else {
      setTimeout(() => addMiraResponse(query), 1500);
    }
  }

  function addMiraResponse(query: string) {
    const matched = matchSession(query);
    const miraMsg: ChatMessage = matched
      ? { ...matched, id: `m-${Date.now()}`, timestamp: new Date().toISOString() }
      : {
          id: `m-${Date.now()}`,
          role: 'mira',
          content: FALLBACK_RESPONSE,
          timestamp: new Date().toISOString(),
          confidence: 'inferred',
        };
    setMessages((prev) => [...prev, miraMsg]);
    setIsGenerating(false);
  }

  function handleFileAttach() { fileInputRef.current?.click(); }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setAttachedFiles((prev) => [...prev, ...files.map((f) => f.name)]);
    e.target.value = '';
  }

  const uploadedFileCount = messages.reduce((acc, m) => {
    return acc + (m.provenance?.filter((p) => p.layer === 'vector-db' && p.excerpt === '').length ?? 0);
  }, 0);
  const materialsCount = Math.max(uploadedFileCount, attachedFiles.length);

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button className="hover:text-gray-700 transition-colors">Chats</button>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          {materialsCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>{materialsCount} Material{materialsCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 max-w-3xl mx-auto w-full">
          {messages.map((msg) => (
            <MsgBubble key={msg.id} message={msg} onOpenArtifact={setOpenArtifact} />
          ))}

          {showProcessing && (
            <ProcessingState files={attachedFiles.length > 0 ? attachedFiles : ['Amplitude_Funnel_WoW.csv', 'Gong_Transcripts_May.pdf', 'Sprint_Retro_Apr28.md']} />
          )}

          {isGenerating && !showProcessing && (
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300 border-t-[#4F3DD5] animate-spin" />
              Reading your situation — identifying the right structure.
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="px-10 pb-6 max-w-3xl mx-auto w-full shrink-0">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachedFiles.map((file, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700">
                  {file}
                  <button onClick={() => setAttachedFiles((prev) => prev.filter((_, j) => j !== i))}>
                    <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className={focused ? 'gradient-border-wrap' : 'border-2 border-gray-200 rounded-xl'}>
            <div className={focused ? 'gradient-border-inner p-4' : 'p-4'}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder={messages.length > 1 ? 'Type your follow up...' : "Tell Mira what you're trying to figure out."}
                rows={3}
                className="w-full resize-none outline-none text-sm text-gray-800 placeholder:text-gray-400 bg-transparent"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-gray-400">
                  <button onClick={handleFileAttach} className="hover:text-gray-600 transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button className="hover:text-gray-600 transition-colors"><Mic className="h-4 w-4" /></button>
                  <button className="hover:text-gray-600 transition-colors"><Monitor className="h-4 w-4" /></button>
                </div>
                <button
                  onClick={handleSend}
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
                    isGenerating ? 'bg-[#4F3DD5] text-white'
                    : input.trim() || attachedFiles.length > 0 ? 'bg-[#4F3DD5] hover:bg-[#3d2fb8] text-white'
                    : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isGenerating ? <Square className="h-3.5 w-3.5" fill="white" /> : <ArrowUp className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {openArtifact && (
        <ArtifactPanel artifact={openArtifact} onClose={() => setOpenArtifact(null)} />
      )}
    </div>
  );
}
