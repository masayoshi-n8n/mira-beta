'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { OnboardingOverlay } from '@/components/onboarding/OnboardingOverlay';
import { useStore } from '@/lib/store';

type AuthMode = 'signin' | 'signup';

export default function OnboardingPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingName, setPendingName] = useState('');

  const router = useRouter();
  const { isLoggedIn, hasCompletedOnboarding, login, completeOnboarding } = useStore();

  useEffect(() => {
    if (isLoggedIn && hasCompletedOnboarding) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, hasCompletedOnboarding, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const displayName = mode === 'signup' ? name : email.split('@')[0];
    setPendingEmail(email);
    setPendingName(displayName);
    setShowOnboarding(true);
  }

  function handleGoogleAuth() {
    setPendingEmail('alex.chen@linkedin.com');
    setPendingName('Alex Chen');
    setShowOnboarding(true);
  }

  function handleDemoLogin() {
    login({
      name: 'Alex Chen',
      email: 'alex.chen@linkedin.com',
      role: 'Product Manager',
      company: 'LinkedIn',
    });
    completeOnboarding();
    router.push('/dashboard');
  }

  if (isLoggedIn && !hasCompletedOnboarding) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      {showOnboarding && (
        <OnboardingOverlay
          initialName={pendingName}
          initialEmail={pendingEmail}
        />
      )}

      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <span className="text-lg font-bold text-white">M</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Mira</h1>
          <p className="text-sm text-center text-muted-foreground">
            The living intelligence layer for your product team
          </p>
        </div>

        {/* Auth card */}
        <div className="rounded-xl border bg-background p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold">
            {mode === 'signin' ? 'Sign in to Mira' : 'Create your account'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={mode === 'signin'}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="mt-1 bg-indigo-600 hover:bg-indigo-700">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleAuth}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {mode === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="underline hover:text-foreground"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="underline hover:text-foreground"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Demo shortcut */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-indigo-900">Try the demo</p>
            <p className="text-xs text-indigo-700 mt-0.5">
              Sign in as Alex Chen — Senior PM at LinkedIn with 60 days of product
              context already loaded.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50"
            onClick={handleDemoLogin}
          >
            Enter demo as Alex Chen
          </Button>
        </div>
      </div>
    </div>
  );
}
