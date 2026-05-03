'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, X, Sparkles, ChevronRight, ArrowLeft } from 'lucide-react';
import { getNodeColor } from '@/lib/graph-utils';
import { getEdgesForNode, getNodeById } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import type { LPMNode } from '@/lib/types';

interface QueryResult {
  summary: string;
  alignmentScore: number;
  matchedNodeIds: string[];
  insights: string[];
  noOverlap?: boolean;
}

interface ThreadMessage {
  id: string;
  role: 'user' | 'mira';
  text?: string;
  result?: QueryResult;
  nodeIds?: string[];
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
  'What are the risks and blockers for Q3?',
  'What signals led to building Creator Analytics?',
  'What does the exec team care about?',
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
        "Your product direction shows **moderate-to-strong alignment** with LinkedIn's platform growth goals. The 4 tracked decisions in Q1–Q2 connect to two primary strategic threads: creator retention (WAC target: 3.1M) and revenue generation (Creator Revenue: $0 → $120/mo). The core tension — exec mandate for Newsletter Monetization vs. market demand for Creator Analytics — is a strategic sequencing problem, not a misalignment. Both bets advance the vision. The question is which unlocks the other.",
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
        "Creator satisfaction signals cluster around **one theme: lack of visibility**. 68 NPS requests, 14 interviews, and 41 support tickets all describe the same gap — creators post and have no idea what's working. Power Creators (10K+ followers) are your highest-churn segment: 34% cited analytics absence as the primary exit reason. The monetization interest signal is emerging (fb-005) but remains secondary to the visibility problem. Retention is the highest-leverage lever right now.",
      alignmentScore: 81,
      matchedNodeIds: ['fb-001', 'fb-002', 'fb-003', 'fb-004', 'fb-005', 'ps-001', 'ps-002', 'mt-001', 'nt-002'],
      insights: [
        '68 NPS requests explicitly named analytics as top missing feature',
        '34% of churned Power Creators cited analytics absence as primary reason',
        "Quote from interview: \"I'm flying blind. I post and hope.\"",
        'Power Creator churn is 8% YoY accelerating — analytics is the unlock',
        'Casual Users have low churn risk; focus efforts on Power Creator segment',
      ],
    },
  },
  {
    keywords: ['competitor', 'competit', 'substack', 'beehiiv', 'tiktok', 'market', 'benchmark', 'vs ', 'versus'],
    result: {
      summary:
        "Competitive pressure is **real and accelerating**. Substack launched creator dashboards in April — directly targeting your Power Creator segment's pain point. Beehiiv's native monetization ($340/mo avg) is the benchmark LinkedIn Creator Revenue is measured against. TikTok's creator fund is drawing casual creators with direct payment signals. The Q3 window is critical: each month of delay raises creator switching costs as competitor platforms mature and network effects compound.",
      alignmentScore: 62,
      matchedNodeIds: ['cp-001', 'cp-002', 'cp-003', 'dc-002', 'fb-002', 'ft-001', 'ft-003', 'nt-001'],
      insights: [
        'Substack launched creator dashboards in April 2026 — closing your differentiation window',
        "Beehiiv benchmark: $340/mo avg creator revenue vs LinkedIn's current $0",
        'Creator churn interviews mention Substack and Beehiiv by name (fb-002)',
        'Exec priority for monetization is partly a response to Substack revenue signal',
        "TikTok threat is directionally real but lower urgency for LinkedIn's PM audience",
      ],
    },
  },
  {
    keywords: ['q3', 'prioriti', 'roadmap', 'build first', 'what should', 'ship', 'next', 'focus', 'sequence'],
    result: {
      summary:
        "Three signals converge on the same recommendation: **build Creator Analytics first**. NPS demand (+40% over 6 weeks, 68 requests), competitor urgency (Substack's April launch closes the differentiation window), and churn data (34% of Power Creator exits) all point to analytics as the highest-leverage Q3 bet. Newsletter Monetization is strategically important — but it's a revenue signal, not a retention signal. Recommended sequence: Analytics (6-week build) → Monetization (10-week build, Q4).",
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
        "Your **3 key metrics tell a coherent story**: WAC is flat (2.3M vs 3.1M target, +0% QoQ), Post Completion Rate is declining (61%, was 67% last quarter), and Creator Revenue is $0 vs Substack's $340/mo benchmark. All three metric gaps share the same root cause — creators can't optimize without visibility. The analytics dashboard directly addresses all three threads: visibility drives posting frequency (WAC), reduces friction in completion (PCR), and enables monetization confidence (Revenue).",
      alignmentScore: 68,
      matchedNodeIds: ['mt-001', 'mt-002', 'mt-003', 'fb-001', 'fb-004', 'ft-001', 'dc-004', 'nt-002', 'nt-003'],
      insights: [
        'WAC flat at 2.3M — 800K creators short of Q3 target with no growth levers active',
        'Post Completion Rate fell 6 points in one quarter (67% → 61%)',
        "Creator Revenue: $0 vs Substack $340/mo and Year 1 target of $120/mo",
        'Follower Growth Rate declining 8% YoY for Power Creators (nt-003)',
        'All three metrics are expected to improve with analytics visibility unlocked',
      ],
    },
  },
  {
    keywords: ['risk', 'blocker', 'block', 'conflict', 'depend', 'concern', 'threat', 'tension', 'deprioritize', 'challenge', 'problem'],
    result: {
      summary:
        "Two active risk signals need attention. The exec mandate for Newsletter Monetization (nt-001) **directly conflicts** with the highest-demand user signal (analytics, fb-001) — this is the primary strategic tension. Creator Fund Beta was deprioritized (dc-003) but has no clear re-entry criteria. Substack's Q2 dashboard launch (cp-001) tightens the competitive window to Q3.",
      alignmentScore: 61,
      matchedNodeIds: ['dc-002', 'dc-003', 'dc-004', 'cp-001', 'cp-002', 'cp-003', 'nt-001', 'fb-004'],
      insights: [
        'Primary tension: exec revenue mandate (nt-001) contradicts top user demand signal (fb-001)',
        'Creator Fund Beta has no re-entry criteria after Q1 deprioritization (dc-003)',
        "Substack's April launch closes Q3 differentiation window — delay is highest-risk scenario",
        '3 low-confidence edges in the graph suggest inferred connections that need validation',
        '41 open support tickets (fb-004) represent a leading churn indicator — unresolved for 6+ weeks',
      ],
    },
  },
  {
    keywords: ['led to', 'trace', 'impact', 'why', 'behind', 'reason', 'drove', 'cause', 'signal', 'analytics dashboard', 'post scheduling', 'newsletter', 'creator fund'],
    result: {
      summary:
        "The signal chain from user feedback to feature decisions is **clearly traceable**. Creator Analytics (ft-001) is backed by 3 distinct feedback signals (NPS + interviews + support tickets) and connects to 2 key decisions. Post Scheduling v2 originated from a single NPS cluster with lower confidence. Newsletter Monetization is primarily exec-driven (nt-001), not user-pull.",
      alignmentScore: 82,
      matchedNodeIds: ['fb-001', 'fb-002', 'fb-003', 'fb-004', 'fb-005', 'dc-001', 'dc-004', 'ft-001', 'ft-002', 'ft-003', 'ep-001', 'ep-002'],
      insights: [
        'Creator Analytics traces back to fb-001 (68 NPS), fb-002 (14 interviews), fb-004 (41 tickets)',
        'Post Scheduling v2 has one primary signal: fb-003 (32 NPS) — lower multi-signal confidence',
        'Newsletter Monetization: 1 user signal (fb-005) vs 2 exec signals (nt-001, dc-002) — exec-led',
        'Creator Fund Beta has no current active user signal — decision to deprioritize was data-driven',
        'All 4 features have traceable origins — institutional memory intact for this context window',
      ],
    },
  },
  {
    keywords: ['exec', 'stakeholder', 'leadership', 'team', 'ceo', 'vp', 'executive', 'mandate', 'management', 'who owns', 'owner'],
    result: {
      summary:
        "Executive context is concentrated in two nodes: the Q3 revenue mandate (nt-001) and the exec priority shift to Newsletter Monetization (dc-002). Both nodes carry **high confidence (>0.85)** and are the primary drivers of the monetization track. The creator team signal (nt-002) represents a bottom-up counter-narrative that hasn't fully reached exec visibility.",
      alignmentScore: 71,
      matchedNodeIds: ['nt-001', 'dc-002', 'dc-004', 'mt-003', 'ft-003', 'ep-003', 'nt-002'],
      insights: [
        "CEO mandate (nt-001): \"Creator Tools needs a revenue signal in Q3 or risk budget cuts\"",
        'VP Revenue drove monetization timeline acceleration — triggered by Substack $180M ARR',
        'Revenue target: $120/mo per creator (Year 1) vs Substack $340/mo benchmark',
        'Bottom-up signal (nt-002): analytics churn data not yet in exec-level discussion',
        'Exec layer has no nodes representing Creator Analytics — potential blind spot',
      ],
    },
  },
];

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'what', 'how', 'does', 'do', 'did', 'will', 'would', 'could', 'should',
  'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'that',
  'this', 'it', 'its', 'and', 'or', 'but', 'not', 'our', 'we', 'i',
  'my', 'me', 'us', 'they', 'them', 'their', 'has', 'have', 'had',
  'about', 'which', 'when', 'where', 'who', 'why', 'all', 'any', 'some',
  'most', 'more', 'than', 'so', 'up', 'out', 'if', 'then', 'there',
  'get', 'can', 'just', 'into', 'over', 'also', 'as', 'show', 'tell',
]);

function freeFormSearch(query: string, allNodes: LPMNode[]): string[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

  if (tokens.length === 0) return [];

  return allNodes
    .filter((node) => {
      const text = `${node.label} ${node.description}`.toLowerCase();
      return tokens.some((token) => text.includes(token));
    })
    .map((n) => n.id);
}

function findQueryMatch(query: string, allNodes: LPMNode[]): QueryResult {
  const lower = query.toLowerCase();
  for (const def of QUERY_DEFINITIONS) {
    if (def.keywords.some((kw) => lower.includes(kw))) {
      return def.result;
    }
  }

  const matchedIds = freeFormSearch(query, allNodes);
  if (matchedIds.length > 0) {
    return {
      summary: `${matchedIds.length} nodes matched on your search terms. Showing all signals with context matching your query.`,
      alignmentScore: 55,
      matchedNodeIds: matchedIds,
      insights: [
        `Found ${matchedIds.length} nodes containing your search terms`,
        'Results are based on text matching across node labels and descriptions',
        "Try a more specific query to get Mira's deeper analysis and insights",
      ],
    };
  }

  return {
    summary:
      'I searched across all nodes in your product context but found no strong matches. Try refining your question around strategy alignment, creator satisfaction, competitive positioning, Q3 prioritization, or metric trends.',
    alignmentScore: 55,
    matchedNodeIds: ['fb-001', 'dc-004', 'mt-001', 'cp-001', 'ep-001', 'nt-001'],
    insights: [
      'Q3 decisions are the most active signal cluster in your product context',
      'Creator Analytics is the most frequently referenced feature across all signal types',
      'Competitive signals (Substack, Beehiiv) are connected to 6 other nodes',
    ],
  };
}

function computeIntersection(
  previousIds: string[] | null,
  newIds: string[]
): { ids: string[]; wasEmpty: boolean } {
  if (previousIds === null) return { ids: newIds, wasEmpty: false };
  const prev = new Set(previousIds);
  const intersection = newIds.filter((id) => prev.has(id));
  if (intersection.length === 0) return { ids: newIds, wasEmpty: true };
  return { ids: intersection, wasEmpty: false };
}

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
      <span className="text-xs font-semibold shrink-0" style={{ color }}>
        {label} · {score}%
      </span>
    </div>
  );
}

function renderSummary(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function NodeDetailView({ node, onBack }: { node: LPMNode; onBack: () => void }) {
  const edges = getEdgesForNode(node.id);
  const color = getNodeColor(node.type);
  const conf = confidenceLevel(node.confidence);

  return (
    <div className="absolute inset-0 bg-white flex flex-col z-10">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#4F3DD5] hover:text-[#3d2fb8] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to analysis
        </button>
      </div>

      <div className="flex items-start gap-2.5 px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="mt-1 h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{node.type}</p>
          <h3 className="mt-0.5 text-sm font-semibold leading-snug text-gray-900">{node.label}</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <p className="text-xs text-gray-500 leading-relaxed">{node.description}</p>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Confidence</p>
            <div className="flex items-center gap-1.5">
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${conf.color}`}>
                {conf.label}
              </span>
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
                  <div
                    key={e.id}
                    className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-300 text-xs">{isSource ? '→' : '←'}</span>
                      <div
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ background: otherColor }}
                      />
                      <span className="text-xs font-medium text-gray-700 line-clamp-1">
                        {otherNode?.label ?? otherId}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className={`text-[9px] h-4 border-0 font-medium px-1.5 ${edgeClass}`}
                      >
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
                  <span className="font-medium text-right max-w-[55%] truncate text-gray-700">
                    {String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function GraphQueryPanel({ allNodes, selectedNode, onHighlight, onCloseNode }: GraphQueryPanelProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [detailNode, setDetailNode] = useState<LPMNode | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(false);

  const hasThread = thread.length > 0;
  const lastMiraMsg = [...thread].reverse().find((m) => m.role === 'mira');

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread, analyzing]);

  function handleAnalyze(text?: string) {
    const q = (text ?? query).trim();
    if (!q || analyzing) return;

    cancelRef.current = false;
    setQuery('');
    const userMsg: ThreadMessage = { id: `u-${Date.now()}`, role: 'user', text: q };
    setThread((prev) => [...prev, userMsg]);
    setAnalyzing(true);

    const previousNodeIds = lastMiraMsg?.nodeIds ?? null;

    setTimeout(() => {
      if (cancelRef.current) return;
      const raw = findQueryMatch(q, allNodes);
      const { ids, wasEmpty } = computeIntersection(previousNodeIds, raw.matchedNodeIds);

      const miraMsg: ThreadMessage = {
        id: `m-${Date.now()}`,
        role: 'mira',
        result: { ...raw, matchedNodeIds: ids, noOverlap: wasEmpty },
        nodeIds: ids,
      };

      setThread((prev) => [...prev, miraMsg]);
      onHighlight(ids);
      setAnalyzing(false);
    }, 1200);
  }

  function handleClear() {
    cancelRef.current = true;
    setAnalyzing(false);
    setThread([]);
    setQuery('');
    setDetailNode(null);
    onHighlight(null);
    onCloseNode();
  }

  function handleNodeChipClick(nodeId: string) {
    const node = allNodes.find((n) => n.id === nodeId);
    if (node) setDetailNode(node);
  }

  const activeDetailNode = detailNode ?? selectedNode;

  return (
    <div className="w-80 shrink-0 border-l border-gray-100 bg-white flex flex-col h-full relative overflow-hidden">
      {/* Node detail overlay */}
      {activeDetailNode && (
        <NodeDetailView
          node={activeDetailNode}
          onBack={() => {
            setDetailNode(null);
            onCloseNode();
          }}
        />
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0 flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-[#4F3DD5]" />
            <span className="text-xs font-semibold text-gray-900">Graph Intelligence</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {hasThread ? 'Follow-up queries narrow the graph.' : 'Ask Mira to analyze and surface what matters.'}
          </p>
        </div>
        {hasThread && (
          <button
            onClick={handleClear}
            className="p-1 rounded hover:bg-gray-100 transition-colors shrink-0 ml-2 -mt-0.5"
            title="Clear thread and reset graph"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Thread / Idle content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        {!hasThread && !analyzing && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Suggested queries
            </p>
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

        <div className="space-y-4">
          {thread.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[85%] bg-gray-100 rounded-2xl rounded-tr-sm px-3 py-2">
                    <p className="text-xs text-gray-700 leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            }

            const res = msg.result!;
            const nodeCount = msg.nodeIds?.length ?? 0;

            return (
              <div key={msg.id} className="space-y-2.5">
                {/* Mira label row */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-[#4F3DD5] flex items-center justify-center shrink-0">
                    <Sparkles className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500">Mira</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* No-overlap note */}
                {res.noOverlap && (
                  <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 leading-relaxed">
                    No overlap found — showing results for your latest query.
                  </p>
                )}

                {/* Alignment bar */}
                <AlignmentBar score={res.alignmentScore} />

                {/* Summary */}
                <p className="text-xs text-gray-600 leading-relaxed">{renderSummary(res.summary)}</p>

                {/* Insights */}
                <div className="space-y-1">
                  {res.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#4F3DD5] shrink-0 mt-1.5" />
                      <p className="text-[11px] text-gray-500 leading-snug">{insight}</p>
                    </div>
                  ))}
                </div>

                {/* Node count badge */}
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#4F3DD5]" />
                  <span className="text-[10px] text-[#4F3DD5] font-medium">
                    {nodeCount} node{nodeCount !== 1 ? 's' : ''} highlighted
                  </span>
                </div>

                {/* Clickable node chips */}
                {msg.nodeIds && msg.nodeIds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {msg.nodeIds.map((id) => {
                      const node = allNodes.find((n) => n.id === id);
                      if (!node) return null;
                      const color = getNodeColor(node.type);
                      const shortLabel =
                        node.label.length > 24 ? node.label.slice(0, 24) + '…' : node.label;
                      return (
                        <button
                          key={id}
                          onClick={() => handleNodeChipClick(id)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 hover:border-[#4F3DD5] hover:bg-indigo-50/50 transition-all"
                        >
                          <div
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ background: color }}
                          />
                          <span className="text-[9px] text-gray-600 font-medium leading-none">
                            {shortLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {analyzing && (
            <div className="flex items-center gap-2 py-1">
              <div className="h-5 w-5 rounded-full bg-[#4F3DD5] flex items-center justify-center shrink-0">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="h-1.5 w-1.5 rounded-full bg-[#4F3DD5] animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="h-1.5 w-1.5 rounded-full bg-[#4F3DD5] animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="h-1.5 w-1.5 rounded-full bg-[#4F3DD5] animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          )}

          {/* Clear thread button */}
          {hasThread && !analyzing && (
            <button
              onClick={handleClear}
              className="w-full py-2 text-[11px] text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              Clear thread + reset graph
            </button>
          )}

          <div ref={threadEndRef} />
        </div>
      </div>

      {/* Query input — pinned to bottom */}
      <div className="px-4 pt-2 pb-3 border-t border-gray-100 shrink-0">
        <div
          className={`rounded-xl transition-all duration-200 ${
            focused ? 'gradient-border-wrap' : 'border border-gray-200 rounded-xl'
          }`}
        >
          <div className={focused ? 'gradient-border-inner p-3' : 'p-3'}>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
              placeholder={
                hasThread
                  ? 'Ask a follow-up to narrow the graph…'
                  : 'How aligned are we with business vision?'
              }
              rows={2}
              className="w-full resize-none outline-none text-xs text-gray-800 placeholder:text-gray-400 bg-transparent leading-relaxed"
            />
            <div className="flex justify-end mt-1">
              <button
                onClick={() => handleAnalyze()}
                disabled={!query.trim() || analyzing}
                className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                  query.trim() && !analyzing
                    ? 'bg-[#4F3DD5] hover:bg-[#3d2fb8] text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <ArrowUp className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
