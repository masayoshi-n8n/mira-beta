'use client';

import { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Monitor, ArrowUp, Square, FileText, X, ChevronRight, Map } from 'lucide-react';
import { getChatSessionById } from '@/lib/data';
import { useStore } from '@/lib/store';
import type { ChatSession, ChatMessage, DecisionTraceNode } from '@/lib/types';

export interface ChatInterfaceProps {
  session?: ChatSession;
  initialMessages?: ChatMessage[];
  sessionTitle?: string;
}

const NODE_COLORS: Record<string, string> = {
  feedback: 'bg-purple-500',
  decision: 'bg-blue-600',
  feature: 'bg-green-500',
  metric: 'bg-orange-500',
  persona: 'bg-pink-500',
  competitor: 'bg-red-500',
  epic: 'bg-indigo-500',
  note: 'bg-yellow-400',
};

function matchSession(query: string): ChatMessage | null {
  const lower = query.toLowerCase();
  let sessionId: string | null = null;

  if (lower.includes('q3') || lower.includes('build first') || lower.includes('prioriti') || lower.includes('what should')) {
    sessionId = 'cs-001';
  } else if ((lower.includes('analytics') && (lower.includes('demand') || lower.includes('know'))) || lower.includes('creator analytics')) {
    sessionId = 'cs-002';
  } else if (lower.includes('roadmap') || lower.includes('q1') || lower.includes('what changed') || lower.includes('changed in')) {
    sessionId = 'cs-003';
  }

  if (!sessionId) return null;
  const s = getChatSessionById(sessionId);
  return s?.messages.find((m) => m.role === 'mira') ?? null;
}

function ArtifactCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 my-3">
      <FileText className="h-5 w-5 text-[#4F3DD5] shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
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

function DecisionTraceViz({ nodes }: { nodes: DecisionTraceNode[] }) {
  const [selectedNode, setSelectedNode] = useState<DecisionTraceNode | null>(null);

  return (
    <div className="my-4 border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Decision Trace</p>
      </div>
      <div className="p-4 flex flex-wrap gap-2">
        {nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              selectedNode?.id === node.id
                ? 'border-[#4F3DD5] bg-indigo-50 text-[#4F3DD5]'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className={`h-2 w-2 rounded-full shrink-0 ${NODE_COLORS[node.type] ?? 'bg-gray-400'}`} />
            {node.label}
          </button>
        ))}
      </div>
      {selectedNode && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2 mb-1">
            <div className={`h-2 w-2 rounded-full ${NODE_COLORS[selectedNode.type] ?? 'bg-gray-400'}`} />
            <p className="text-xs font-semibold text-gray-900">{selectedNode.label}</p>
            <span className="text-xs text-gray-400">· {selectedNode.source}</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{selectedNode.detail}</p>
          <div className="flex items-center gap-1 mt-2">
            <div className="h-1 rounded-full bg-gray-200 flex-1">
              <div className="h-1 rounded-full bg-[#4F3DD5]" style={{ width: `${selectedNode.confidence * 100}%` }} />
            </div>
            <span className="text-xs text-gray-400">{Math.round(selectedNode.confidence * 100)}% confidence</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MsgBubble({ message }: { message: ChatMessage }) {
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
                  <X className="h-2.5 w-2.5 text-gray-400" />
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

      {message.decisionTrace && <DecisionTraceViz nodes={message.decisionTrace.nodes} />}

      {message.role === 'mira' && message.content.includes('artifact') && (
        <>
          <ArtifactCard
            title="Q3 Prioritization Brief"
            description="A recommendation brief for Q3 with supporting signals, competitive context, and exec framing."
          />
          <LPMBanner />
        </>
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

const FALLBACK_RESPONSE = "I've searched your product context and found relevant signals. Based on the 28 nodes in your knowledge graph, this touches on decisions from your Q2 planning, creator interview feedback, and competitive intelligence.\n\nWant me to dig deeper into any specific aspect? You can also try asking about Q3 prioritization, creator analytics demand, or what changed in your Q1 roadmap.";

export function ChatInterface({ session, initialMessages, sessionTitle }: ChatInterfaceProps) {
  const startMessages = session?.messages ?? initialMessages ?? [];
  const title = session?.title ?? sessionTitle ?? 'New Chat';

  const [messages, setMessages] = useState<ChatMessage[]>(startMessages);
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
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

  const materialsCount = messages.filter((m) => m.role === 'mira' && m.decisionTrace).length + 1;

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button className="hover:text-gray-700 transition-colors">Chats</button>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <FileText className="h-4 w-4" />
            <span>{materialsCount} Materials</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 max-w-3xl mx-auto w-full">
          {messages.map((msg) => (
            <MsgBubble key={msg.id} message={msg} />
          ))}

          {showProcessing && (
            <ProcessingState files={attachedFiles.length > 0 ? attachedFiles : ['NPS_Report_Q1.pdf', 'Creator_Interviews.docx']} />
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
    </div>
  );
}
