'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paperclip, Mic, Monitor, ArrowUp } from 'lucide-react';
import { useStore } from '@/lib/store';

const QUICK_CHIPS = [
  'Suggest me a Playbook',
  'Plan a sprint',
  'Diagnose a metric drop',
  'Synthesise feedback',
  'Design an experiment',
];

const MARKETPLACE_CARDS = [
  {
    name: 'Colin Zhou',
    company: 'Life360',
    title: 'Onboarding funnel to experiment',
    artifacts: ['Funnel Insight', 'Opportunity Assessment', 'Experiment Brief'],
    initials: 'CZ',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    sessionLink: null,
  },
  {
    name: 'Alex Chen',
    company: 'LinkedIn',
    title: 'KPI Signal to Action Plan',
    artifacts: ['Diagnostic Summary', 'Root Cause Assessment', 'Focused Bets'],
    initials: 'AC',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    sessionLink: '/chat/cs-001',
  },
  {
    name: 'Ying Ge',
    company: 'Intuit',
    title: 'Customer voice to thematic roadmap',
    artifacts: ['Insight Map', 'RICE list', 'Thematic Roadmap'],
    initials: 'YG',
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    sessionLink: null,
  },
];

export function DashboardHome() {
  const [input, setInput] = useState('');
  const router = useRouter();
  const setPreloadedPrompt = useStore((s) => s.setPreloadedPrompt);

  function handleSubmit() {
    const text = input.trim();
    if (!text) return;
    setPreloadedPrompt(text);
    router.push('/chat');
  }

  function handleChip(chip: string) {
    setPreloadedPrompt(chip);
    router.push('/chat');
  }

  return (
    <div className="flex flex-col items-center w-full px-6 pt-16 pb-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-7 text-center">
        How can{' '}
        <em
          className="not-italic font-bold"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #EC4899 50%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Mira
        </em>
        {' '}help you today?
      </h1>

      {/* Gradient-border textarea */}
      <div
        className="w-full max-w-2xl mb-4 rounded-2xl"
        style={{ padding: '2px', background: 'linear-gradient(135deg, #F97316, #EC4899, #8B5CF6)' }}
      >
        <div className="bg-white rounded-[14px] flex flex-col">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Our activation rate dropped last sprint, help me diagnose why"
            rows={4}
            className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            <div className="flex items-center gap-4 text-gray-400">
              <button className="hover:text-gray-600 transition-colors" aria-label="Attach file">
                <Paperclip className="h-4 w-4" />
              </button>
              <button className="hover:text-gray-600 transition-colors" aria-label="Voice input">
                <Mic className="h-4 w-4" />
              </button>
              <button className="hover:text-gray-600 transition-colors" aria-label="Screen share">
                <Monitor className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-opacity disabled:opacity-40"
              style={{ backgroundColor: '#1F2937' }}
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick chips */}
      <div className="flex flex-wrap gap-2 mb-12 max-w-2xl justify-center">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChip(chip)}
            className="rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-500 hover:border-indigo-200 hover:text-[#4F3DD5] hover:bg-indigo-50/50 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Marketplace section */}
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Where PMs like you start</h2>
          <button
            className="text-sm font-semibold hover:opacity-75 transition-opacity"
            style={{ color: '#4F3DD5' }}
            onClick={() => router.push('/marketplace')}
          >
            Browse Marketplace
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MARKETPLACE_CARDS.map((card) => (
            <div
              key={card.name}
              onClick={() => card.sessionLink && router.push(card.sessionLink)}
              className={`rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all ${card.sessionLink ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${card.bg} ${card.text}`}
                >
                  {card.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 leading-tight">{card.name}</p>
                  <p className="text-xs text-gray-400">{card.company}</p>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">{card.title}</h3>

              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                  3 ARTIFACTS:
                </p>
                <p className="text-xs text-gray-500">{card.artifacts.join(' · ')}</p>
              </div>

              <div className="flex items-center gap-3 pt-2.5 border-t border-gray-100">
                <button
                  className="rounded-full border px-3 py-1 text-xs font-medium hover:opacity-80 transition-opacity"
                  style={{ borderColor: '#4F3DD5', color: '#4F3DD5' }}
                >
                  Add to Workspace
                </button>
                <button
                  className="text-xs font-medium hover:opacity-75 transition-opacity"
                  style={{ color: '#4F3DD5' }}
                >
                  Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
