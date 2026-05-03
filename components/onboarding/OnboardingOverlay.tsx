'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { StepOne } from './StepOne';
import { StepTwo } from './StepTwo';
import { StepThree } from './StepThree';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface OnboardingOverlayProps {
  initialName: string;
  initialEmail: string;
}

type Step = 1 | 2 | 3 | 'confirmation';

const STEP_LABELS = ['About you', 'Connect tools', 'Add context'];

const CONFIRMATION_NODES = [
  { label: 'Product Strategy Q3', type: 'decision', color: '#2563eb', delay: 0 },
  { label: 'Creator Analytics demand', type: 'feedback', color: '#a855f7', delay: 200 },
  { label: 'Weekly Active Creators', type: 'metric', color: '#f97316', delay: 400 },
  { label: 'Post Scheduling v2', type: 'epic', color: '#6366f1', delay: 600 },
  { label: 'Power Creator persona', type: 'persona', color: '#ec4899', delay: 800 },
];

function FirstNodeConfirmation({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="space-y-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 mx-auto">
          <span className="text-2xl font-bold text-white">M</span>
        </div>
        <h2 className="text-xl font-semibold">Your product map is ready</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Mira has started mapping your product context. Your knowledge graph is live.
        </p>
      </div>

      <div className="relative w-full h-48 rounded-xl bg-muted/40 border overflow-hidden">
        {CONFIRMATION_NODES.map((node, i) => (
          <NodeDot key={i} node={node} index={i} />
        ))}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1="30%" y1="40%" x2="55%" y2="55%"
            stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4"
          />
          <line
            x1="55%" y1="55%" x2="75%" y2="35%"
            stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4"
          />
          <line
            x1="20%" y1="70%" x2="55%" y2="55%"
            stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Button onClick={onEnter} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          Open Mira
        </Button>
      </div>
    </div>
  );
}

interface NodeDotProps {
  node: { label: string; color: string; delay: number };
  index: number;
}

function NodeDot({ node, index }: NodeDotProps) {
  const positions = [
    { left: '25%', top: '30%' },
    { left: '50%', top: '50%' },
    { left: '70%', top: '25%' },
    { left: '15%', top: '62%' },
    { left: '80%', top: '65%' },
  ];
  const pos = positions[index] ?? { left: '50%', top: '50%' };

  return (
    <div
      className="absolute flex items-center gap-1.5 animate-in fade-in zoom-in-50"
      style={{
        left: pos.left,
        top: pos.top,
        transform: 'translate(-50%, -50%)',
        animationDelay: `${node.delay}ms`,
        animationFillMode: 'both',
      }}
    >
      <div
        className="h-3 w-3 rounded-full ring-2 ring-white shadow"
        style={{ backgroundColor: node.color }}
      />
      <span className="text-xs font-medium whitespace-nowrap">{node.label}</span>
    </div>
  );
}

export function OnboardingOverlay({ initialName, initialEmail }: OnboardingOverlayProps) {
  const [step, setStep] = useState<Step>(1);
  const router = useRouter();
  const { login, completeOnboarding } = useStore();

  function handleStepOne(data: { name: string; role: string; company: string }) {
    login({ name: data.name, email: initialEmail, role: data.role, company: data.company });
    setStep(2);
  }

  function handleStepTwo() {
    setStep(3);
  }

  function handleStepThree() {
    setStep('confirmation');
  }

  function handleEnterDashboard() {
    completeOnboarding();
    router.push('/dashboard');
  }

  const stepNumber = step === 'confirmation' ? 3 : step;
  const progress = step === 'confirmation' ? 100 : ((stepNumber - 1) / 3) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-background shadow-2xl">
        {step !== 'confirmation' && (
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
                  <span className="text-xs font-bold text-white">M</span>
                </div>
                <span className="text-sm font-semibold">Set up Mira</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Step {stepNumber} of 3
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
            <div className="flex mt-2 gap-0">
              {STEP_LABELS.map((label, i) => (
                <span
                  key={label}
                  className={cn(
                    'flex-1 text-center text-xs',
                    i + 1 <= stepNumber ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="p-6">
          {step === 1 && (
            <StepOne
              initialName={initialName}
              initialEmail={initialEmail}
              onNext={handleStepOne}
            />
          )}
          {step === 2 && (
            <StepTwo onNext={handleStepTwo} onSkip={() => setStep(3)} />
          )}
          {step === 3 && (
            <StepThree onNext={handleStepThree} onSkip={() => setStep('confirmation')} />
          )}
          {step === 'confirmation' && (
            <FirstNodeConfirmation onEnter={handleEnterDashboard} />
          )}
        </div>
      </div>
    </div>
  );
}
