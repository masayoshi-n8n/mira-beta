'use client';

import { useState } from 'react';
import { ArrowUp, X, Sparkles, ChevronRight } from 'lucide-react';
import { getNodeColor } from '@/lib/graph-utils';
import { getEdgesForNode, getNodeById } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import type { LPMNode } from '@/lib/types';

interface QueryResult {
  summary: string;
  alignmentScore: number;
  matchedNodeIds: string[];
  insights: string[];
}

interface GraphQueryPanelProps {
  allNodes: LPMNode[];
  selectedNode: LPMNode | null;
  onHighlight: (nodeIds: string[] | null) => void;
  onCloseNode: () => void;
}

const SUGGESTED_QUERIES = [
  'How aligned are we with business vision and strategy?',
  'What is the state of creator satisfaction and retention?',
  'How does our roadmap respond to competitive pressure?',
  'What should we prioritize for Q3?',
  'How are our key metrics trending?',
];

interface QueryDef {
  keywords: string[];
  result: QueryResult;
}

const QUERY_DEFINITIONS: QueryDef[] = [
  {
    keywords: ['business', 'vision', 'strateg', 'alignment', 'align', 'direction', 'goal', 'objective', 'corporate'],
    result: {
      summary:
        'Your product direction shows **moderate-to-strong alignment** with LinkedIn\'s platform growth goals. The 4 tracked decisions in Q1–Q2 connect to two primary strategic threads: creator retention (WAC target: 3.1M) and revenue generation (Creator Revenue: $0 → $120/mo). The core tension — exec mandate for Newsletter Monetization vs. market demand for Creator Analytics — is a strategic sequencing problem, not a misalignment. Both bets advance the vision. The question is which unlocks the other.',
      alignmentScore: 74,
      matchedNodeIds: ['dc-001', 'dc-002', 'dc-003', 'dc-004', 'mt-001', 'mt-002', 'mt-003', 'nt-001', 'ep-001', 'ep-002', 'ep-003', 'ep-004'],
      insights: [
        '4 of 4 active decisions tie back to Q3 platform revenue or retention goals',
        'WAC target (3.1M) is the north star metric connecting all active features',
        'Newsletter Monetization aligns with exec revenue mandate (nt-001)',
        'Creator Analytics aligns with WAC growth and churn reduction',
        'Post Scheduling v2 is a pre-condition for Creator Analytics engagement',
      ],
    },
  },
  {
    keywords: ['creator', 'customer', 'user', 'satisf', 'feedback', 'retention', 'churn', 'interview', 'nps', 'pain'],
    result: {
      summary:
        'Creator satisfaction signals cluster around **one theme: lack of visibility**. 68 NPS requests, 14 interviews, and 41 support tickets all describe the same gap — creators post and have no idea what\'s working. Power Creators (10K+ followers) are your highest-churn segment: 34% cited analytics absence as the primary exit reason. The monetization interest signal is emerging (fb-005) but remains secondary to the visibility problem. Retention is the highest-leverage lever right now.',
      alignmentScore: 81,
      matchedNodeIds: ['fb-001', 'fb-002', 'fb-003', 'fb-004', 'fb-005', 'ps-001', 'ps-002', 'mt-001', 'nt-002'],
      insights: [
        '68 NPS requests explicitly named analytics as top missing feature',
        '34% of churned Power Creators cited analytics absence as primary reason',
        'Quote from interview: "I\'m flying blind. I post and hope."',
        'Power Creator churn is 8% YoY accelerating — analytics is the unlock',
        'Casual Users have low churn risk; focus efforts on Power Creator segment',
      ],
    },
  },
  {
    keywords: ['competitor', 'competit', 'substack', 'beehiiv', 'tiktok', 'market', 'benchmark', 'vs ', 'versus'],
    result: {
      summary:
        'Competitive pressure is **real and accelerating**. Substack launched creator dashboards in April — directly targeting your Power Creator segment\'s pain point. Beehiiv\'s native monetization ($340/mo avg) is the benchmark LinkedIn Creator Revenue is measured against. TikTok\'s creator fund is drawing casual creators with direct payment signals. The Q3 window is critical: each month of delay raises creator switching costs as competitor platforms mature and network effects compound.',
      alignmentScore: 62,
      matchedNodeIds: ['cp-001', 'cp-002', 'cp-003', 'dc-002', 'fb-002', 'ft-001', 'ft-003', 'nt-001'],
      insights: [
        'Substack launched creator dashboards in April 2026 — closing your differentiation window',
        'Beehiiv benchmark: $340/mo avg creator revenue vs LinkedIn\'s current $0',
        'Creator churn interviews mention Substack and Beehiiv by name (fb-002)',
        'Exec priority for monetization is partly a response to Substack revenue signal',
        'TikTok threat is directionally real but lower urgency for LinkedIn\'s PM audience',
      ],
    },
  },
  {
    keywords: ['q3', 'prioriti', 'roadmap', 'build first', 'what should', 'ship', 'next', 'focus', 'sequence'],
    result: {
      summary:
        'Three signals converge on the same recommendation: **build Creator Analytics first**. NPS demand (+40% over 6 weeks, 68 requests), competitor urgency (Substack\'s April launch closes the differentiation window), and churn data (34% of Power Creator exits) all point to analytics as the highest-leverage Q3 bet. Newsletter Monetization is strategically important — but it\'s a revenue signal, not a retention signal. Recommended sequence: Analytics (6-week build) → Monetization (10-week build, Q4).',
      alignmentScore: 89,
      matchedNodeIds: ['ep-001', 'ep-002', 'ep-003', 'ep-004', 'dc-001', 'dc-003', 'dc-004', 'mt-001', 'fb-001', 'cp-001', 'nt-001'],
      insights: [
        'Creator Analytics has 68 NPS requests (+40% 6-week growth) — highest demand signal',
        'Substack launched dashboards in April — Q3 is the differentiation window',
        'Post Scheduling v2 ships in Q2 to free Q3 capacity for analytics',
        'Newsletter Monetization can follow in Q4 without material user loss',
        'Creator Fund Beta stays deprioritized to H2 — lowest urgency signal',
      ],
    },
  },
  {
    keywords: ['metric', 'kpi', 'performance', 'data', 'number', 'measure', 'wac', 'completion', 'revenue', 'follower', 'trend'],
    result: {
      summary:
        'Your **3 key metrics tell a coherent story**: WAC is flat (2.3M vs 3.1M target, +0% QoQ), Post Completion Rate is declining (61%, was 67% last quarter), and Creator Revenue is $0 vs Substack\'s $340/mo benchmark. All three metric gaps share the same root cause — creators can\'t optimize without visibility. The analytics dashboard directly addresses all three threads: visibility drives posting frequency (WAC), reduces friction in completion (PCR), and enables monetization confidence (Revenue).',
      alignmentScore: 68,
      matchedNodeIds: ['mt-001', 'mt-002', 'mt-003', 'fb-001', 'fb-004', 'ft-001', 'dc-004', 'nt-002', 'nt-003'],
      insights: [
        'WAC flat at 2.3M — 800K creators short of Q3 target with no growth levers active',
        'Post Completion Rate fell 6 points in one quarter (67% → 61%)',
        'Creator Revenue: $0 vs Substack $340/mo and Year 1 target of $120/mo',
        'Follower Growth Rate declining 8% YoY for Power Creators (nt-003)',
        'All three metrics are expected to improve with analytics visibility unlocked',
      ],
    },
  },
];

function findQueryMatch(query: string): QueryResult | null {
  const lower = query.toLowerCase();
  for (const def of QUERY_DEFINITIONS) {
    if (def.keywords.some((kw) => lower.includes(kw))) {
      return def.result;
    }
  }
  return null;
}

const FALLBACK_RESULT: QueryResult = {
  summary:
    'I searched across all 28 nodes in your product context. The signals most relevant to your query are distributed across feedback, decision, and metric nodes. Try refining your question around strategy alignment, creator satisfaction, competitive positioning, Q3 prioritization, or metric trends for a more targeted analysis.',
  alignmentScore: 55,
  matchedNodeIds: ['fb-001', 'dc-004', 'mt-001', 'cp-001', 'ep-001', 'nt-001'],
  insights: [
    'Q3 decisions are the most active signal cluster in your product context',
    'Creator Analytics is the most frequently referenced feature across all signal types',
    'Competitive signals (Substack, Beehiiv) are connected to 6 other nodes',
  ],
};

const EDGE_TYPE_COLORS: Record<string, string> = {
  influenced: 'bg-purple-100 text-purple-700',
  caused: 'bg-blue-100 text-blue-700',
  preceded: 'bg-gray-100 text-gray-700',
  contradicts: 'bg-red-100 text-red-700',
  relates_to: 'bg-gray-100 text-gray-600',
  is_child_of: 'bg-indigo-100 text-indigo-700',
  was_deprioritized_by: 'bg-orange-100 text-orange-700',
};

function confidenceLevel(score: number) {
  if (score >= 0.8) return { label: 'High', color: 'bg-emerald-100 text-emerald-700' };
  if (score >= 0.5) return { label: 'Inferred', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Low', color: 'bg-red-100 text-red-700' };
}

function NodeDetailView({ node, onClose }: { node: LPMNode; onClose: () => void }) {
  const edges = getEdgesForNode(node.id);
  const color = getNodeColor(node.type);
  const conf = confidenceLevel(node.confidence);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-1 h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{node.type}</p>
            <h3 className="mt-0.5 text-sm font-semibold leading-snug text-gray-900">{node.label}</h3>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors shrink-0 -mt-0.5">
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <p className="text-xs text-gray-500 leading-relaxed">{node.description}</p>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Confidence</p>
            <div className="flex items-center gap-1.5">
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${conf.color}`}>{conf.label}</span>
              <span className="text-xs font-semibold text-gray-900">{Math.round(node.confidence * 100)}%</span>
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Source</p>
            <p className="text-xs font-semibold text-gray-900 leading-tight">{node.source}</p>
          </div>
        </div>

        {edges.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Connections ({edges.length})
            </p>
            <div className="flex flex-col gap-1.5">
              {edges.map((e) => {
                const isSource = e.source === node.id;
                const otherId = isSource ? e.target : e.source;
                const otherNode = getNodeById(otherId);
                const otherColor = otherNode ? getNodeColor(otherNode.type) : '#94a3b8';
                const edgeClass = EDGE_TYPE_COLORS[e.type] ?? 'bg-gray-100 text-gray-600';
                return (
                  <div key={e.id} className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-300 text-xs">{isSource ? '→' : '←'}</span>
                      <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: otherColor }} />
                      <span className="text-xs font-medium text-gray-700 line-clamp-1">{otherNode?.label ?? otherId}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className={`text-[9px] h-4 border-0 font-medium px-1.5 ${edgeClass}`}>
                        {e.type.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-[9px] text-gray-400">{Math.round(e.confidence * 100)}% conf.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {Object.keys(node.metadata).length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Metadata</p>
            <div className="flex flex-col gap-1.5">
              {Object.entries(node.metadata).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 text-xs">
                  <span className="text-gray-400 capitalize">{k.replace(/_/g, ' ')}</span>
                  <span className="font-medium text-right max-w-[55%] truncate text-gray-700">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AlignmentBar({ score }: { score: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 55 ? '#f97316' : '#ef4444';
  const label = score >= 75 ? 'Strong' : score >= 55 ? 'Moderate' : 'Weak';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-xs font-semibold shrink-0" style={{ color }}>{label} · {score}%</span>
    </div>
  );
}

function renderSummary(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function GraphQueryPanel({ allNodes, selectedNode, onHighlight, onCloseNode }: GraphQueryPanelProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [state, setState] = useState<'idle' | 'analyzing' | 'results'>('idle');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [lastQuery, setLastQuery] = useState('');

  function handleAnalyze(text?: string) {
    const q = text ?? query;
    if (!q.trim()) return;
    setLastQuery(q);
    setQuery(q);
    setState('analyzing');
    setTimeout(() => {
      const matched = findQueryMatch(q) ?? FALLBACK_RESULT;
      setResult(matched);
      onHighlight(matched.matchedNodeIds);
      setState('results');
    }, 1200);
  }

  function handleClear() {
    setState('idle');
    setResult(null);
    setQuery('');
    onHighlight(null);
    onCloseNode();
  }

  if (selectedNode) {
    return (
      <div className="w-80 shrink-0 border-l border-gray-100 bg-white flex flex-col h-full overflow-hidden">
        <NodeDetailView node={selectedNode} onClose={onCloseNode} />
      </div>
    );
  }

  return (
    <div className="w-80 shrink-0 border-l border-gray-100 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-3.5 w-3.5 text-[#4F3DD5]" />
          <span className="text-xs font-semibold text-gray-900">Graph Intelligence</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Ask Mira to analyze the graph and surface what matters.
        </p>
      </div>

      {/* Query input */}
      <div className="px-4 pt-3 pb-3 shrink-0">
        <div className={`rounded-xl transition-all duration-200 ${focused ? 'gradient-border-wrap' : 'border-2 border-gray-200 rounded-xl'}`}>
          <div className={focused ? 'gradient-border-inner p-3' : 'p-3'}>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnalyze(); }
              }}
              placeholder="How aligned are we with business vision and strategy?"
              rows={3}
              className="w-full resize-none outline-none text-xs text-gray-800 placeholder:text-gray-400 bg-transparent leading-relaxed"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleAnalyze()}
                disabled={!query.trim() || state === 'analyzing'}
                className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                  query.trim() && state !== 'analyzing'
                    ? 'bg-[#4F3DD5] hover:bg-[#3d2fb8] text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {state === 'idle' && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Suggested queries</p>
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleAnalyze(q)}
                className="w-full flex items-start gap-2 text-left px-3 py-2.5 rounded-lg border border-gray-100 hover:border-[#4F3DD5] hover:bg-indigo-50/50 transition-all group"
              >
                <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-[#4F3DD5] shrink-0 mt-0.5" />
                <span className="text-xs text-gray-600 group-hover:text-[#4F3DD5] leading-snug">{q}</span>
              </button>
            ))}
          </div>
        )}

        {state === 'analyzing' && (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-[#4F3DD5] animate-spin" />
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Scanning the graph for nodes relevant to your query...
            </p>
          </div>
        )}

        {state === 'results' && result && (
          <div className="space-y-4">
            {/* Query echo + clear */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] text-gray-400 leading-relaxed italic flex-1">"{lastQuery}"</p>
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 shrink-0 mt-0.5"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            </div>

            {/* Alignment score */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Alignment Score
                </span>
                <span className="text-[10px] text-gray-400">{result.matchedNodeIds.length} of {allNodes.length} nodes</span>
              </div>
              <AlignmentBar score={result.alignmentScore} />
            </div>

            {/* Summary */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Mira&apos;s Analysis</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {renderSummary(result.summary)}
              </p>
            </div>

            {/* Key insights */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Key Insights</p>
              <div className="space-y-1.5">
                {result.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#4F3DD5] shrink-0 mt-1.5" />
                    <p className="text-[11px] text-gray-600 leading-snug">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Matched nodes */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Highlighted Nodes
              </p>
              <div className="flex flex-col gap-1.5">
                {result.matchedNodeIds.map((id) => {
                  const node = allNodes.find((n) => n.id === id);
                  if (!node) return null;
                  const color = getNodeColor(node.type);
                  return (
                    <div key={id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-[11px] text-gray-700 font-medium line-clamp-1 flex-1">{node.label}</span>
                      <span className="text-[9px] text-gray-400 shrink-0 capitalize">{node.type}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleClear}
              className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              Clear and reset graph
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
