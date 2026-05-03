'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';

const OPTIONS = [
  {
    id: 'signals',
    title: 'Making sense of signals',
    description: 'Turn metric drops, customer feedback, and research into a prioritised action plan.',
  },
  {
    id: 'build',
    title: 'Deciding what to build',
    description: 'Evaluate competing requests and opportunities and commit to what moves the needle.',
  },
  {
    id: 'writing',
    title: 'Writing something up',
    description: 'Draft specs, PRDs, and briefs that give your team everything they need to act.',
  },
  {
    id: 'impact',
    title: 'Communicating product impact',
    description: 'Turn shipped work and release data into impact stories your stakeholders actually care about.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoggedIn, hasCompletedOnboarding, completeOnboarding, user } = useStore();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    } else if (hasCompletedOnboarding) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, hasCompletedOnboarding, router]);

  function handleStart() {
    completeOnboarding();
    router.push('/dashboard');
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AC';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <span className="text-2xl font-bold" style={{ color: '#4F3DD5' }}>Mira</span>
        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
          {initials}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <h1
            className="text-4xl font-bold text-center mb-3 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EC4899 60%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            What&apos;s taking up most of your PM headspace right now?
          </h1>
          <p className="text-center text-gray-500 mb-12 text-base">
            This shapes what Mira surfaces first — not what you&apos;re limited to. You can explore all workflows from day one.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            {OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className="flex items-start gap-4 rounded-xl border p-4 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/30"
                style={{
                  borderColor: selected === option.id ? '#4F3DD5' : '#E5E7EB',
                  backgroundColor: selected === option.id ? '#EEF0FF' : 'white',
                }}
              >
                <div
                  className="h-10 w-10 rounded-full shrink-0 mt-0.5"
                  style={{ backgroundColor: selected === option.id ? '#C7D2FE' : '#E8E9F0' }}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{option.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{option.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleStart}
              className="flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: selected ? '#4F3DD5' : '#9CA3AF' }}
            >
              Start with Mira
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
