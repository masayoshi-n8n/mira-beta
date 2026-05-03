'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';

type View = 'main' | 'email-form' | 'signin';

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, hasCompletedOnboarding, login, completeOnboarding } = useStore();
  const [view, setView] = useState<View>('main');
  const [loading, setLoading] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      router.push(hasCompletedOnboarding ? '/dashboard' : '/onboarding');
    }
  }, [isLoggedIn, hasCompletedOnboarding, router]);

  function handleDemo() {
    setLoading('demo');
    setTimeout(() => {
      login({ name: 'Alex Chen', email: 'alex.chen@linkedin.com', role: 'Product Manager', company: 'LinkedIn' });
      completeOnboarding();
      router.push('/dashboard');
    }, 800);
  }

  function handleOAuth(provider: string) {
    setLoading(provider);
    setTimeout(() => {
      login({ name: 'Alex Chen', email: 'alex.chen@linkedin.com', role: 'Product Manager', company: 'LinkedIn' });
      router.push('/onboarding');
    }, 1000);
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    login({ name: name || 'Alex Chen', email: email || 'alex.chen@linkedin.com' });
    router.push('/onboarding');
  }

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    login({ name: 'Alex Chen', email: email || 'alex.chen@linkedin.com', role: 'Product Manager', company: 'LinkedIn' });
    completeOnboarding();
    router.push('/dashboard');
  }

  if (view === 'email-form') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-sm px-6 flex flex-col items-center gap-5">
          <h1 className="text-4xl font-bold" style={{ color: '#4F3DD5' }}>Mira</h1>
          <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
          <form onSubmit={handleEmailSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-sm text-gray-600">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Chen"
                className="h-12 rounded-xl border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email-form" className="text-sm text-gray-600">Your Email</Label>
              <Input
                id="email-form"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="h-12 rounded-xl border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password-form" className="text-sm text-gray-600">Create a Password</Label>
              <Input
                id="password-form"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="h-12 rounded-xl border-gray-300"
              />
              <p className="text-xs text-gray-400">At least 8 characters. You can change this later.</p>
            </div>
            <button
              type="submit"
              className="w-full h-12 rounded-full font-semibold text-white text-sm mt-1"
              style={{ backgroundColor: '#4F3DD5' }}
            >
              Create My Account
            </button>
          </form>
          <p className="text-sm text-gray-500">
            Already registered?{' '}
            <button onClick={() => setView('signin')} className="font-semibold" style={{ color: '#4F3DD5' }}>
              Sign In
            </button>
          </p>
          <p className="text-xs text-gray-400 text-center">
            By continuing you agree to Mira&apos;s{' '}
            <span style={{ color: '#4F3DD5' }} className="cursor-pointer">Terms</span>
            {' '}and{' '}
            <span style={{ color: '#4F3DD5' }} className="cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    );
  }

  if (view === 'signin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-sm px-6 flex flex-col items-center gap-5">
          <h1 className="text-4xl font-bold" style={{ color: '#4F3DD5' }}>Mira</h1>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <button
            onClick={handleDemo}
            disabled={!!loading}
            className="w-full h-12 rounded-full text-sm font-semibold border-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
            style={{ borderColor: '#4F3DD5', color: '#4F3DD5', backgroundColor: '#EEF0FF' }}
          >
            {loading === 'demo' ? 'Loading...' : '⚡ Demo — Enter as Alex Chen'}
          </button>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <form onSubmit={handleSignIn} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email-signin" className="text-sm text-gray-600">Email</Label>
              <Input
                id="email-signin"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="h-12 rounded-xl border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password-signin" className="text-sm text-gray-600">Password</Label>
              <Input
                id="password-signin"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="h-12 rounded-xl border-gray-300"
              />
            </div>
            <button
              type="submit"
              className="w-full h-12 rounded-full font-semibold text-white text-sm mt-1"
              style={{ backgroundColor: '#4F3DD5' }}
            >
              Sign In
            </button>
          </form>
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <button onClick={() => setView('main')} className="font-semibold" style={{ color: '#4F3DD5' }}>
              Sign Up
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-[480px] shrink-0">
        <h1 className="text-5xl font-bold mb-10" style={{ color: '#4F3DD5' }}>Mira</h1>
        <h2
          className="text-4xl font-bold leading-tight mb-4"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Most PMs have a deliverable done within their first conversation.
        </h2>
        <p className="text-gray-500 text-base">Create your account to get started. No setup required.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm flex flex-col gap-3">
          <div className="lg:hidden flex flex-col items-center mb-4">
            <h1 className="text-4xl font-bold" style={{ color: '#4F3DD5' }}>Mira</h1>
          </div>

          <button
            onClick={handleDemo}
            disabled={!!loading}
            className="w-full h-12 rounded-full text-sm font-semibold border-2 transition-opacity disabled:opacity-60 hover:opacity-90"
            style={{ borderColor: '#4F3DD5', color: '#4F3DD5', backgroundColor: '#EEF0FF' }}
          >
            {loading === 'demo' ? "Loading Alex's workspace..." : '⚡ Demo — Enter as Alex Chen'}
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={() => handleOAuth('google')}
            disabled={!!loading}
            className="w-full h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-3 text-sm font-medium text-gray-700 transition-colors disabled:opacity-60"
          >
            {loading === 'google' ? (
              <div className="h-4 w-4 rounded-full border-2 border-gray-400 border-t-gray-700 animate-spin" />
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuth('microsoft')}
            disabled={!!loading}
            className="w-full h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-3 text-sm font-medium text-gray-700 transition-colors disabled:opacity-60"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            Continue with Microsoft
          </button>

          <button
            onClick={() => handleOAuth('linkedin')}
            disabled={!!loading}
            className="w-full h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-3 text-sm font-medium text-gray-700 transition-colors disabled:opacity-60"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Continue with LinkedIn
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={() => setView('email-form')}
            className="w-full h-12 rounded-full border-2 flex items-center justify-center gap-2 text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ borderColor: '#4F3DD5', color: '#4F3DD5' }}
          >
            <Mail className="h-4 w-4" />
            Sign up with Email
          </button>

          <p className="text-center text-sm text-gray-500 pt-1">
            Already registered?{' '}
            <button onClick={() => setView('signin')} className="font-semibold" style={{ color: '#4F3DD5' }}>
              Sign In
            </button>
          </p>

          <p className="text-center text-xs text-gray-400">
            By continuing you agree to Mira&apos;s{' '}
            <span style={{ color: '#4F3DD5' }} className="cursor-pointer">Terms</span>
            {' '}and{' '}
            <span style={{ color: '#4F3DD5' }} className="cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
