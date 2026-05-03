'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { Database, Plug, User, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user, login } = useStore();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (user) login({ ...user, name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8 space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      {/* Profile */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Profile</h2>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
              {name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <Button type="button" variant="outline" size="sm">Change photo</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              {saved ? 'Saved!' : 'Save changes'}
            </Button>
          </div>
        </form>
      </section>

      <Separator />

      {/* Password */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Security</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pw">New password</Label>
            <Input id="pw" type="password" placeholder="••••••••" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" placeholder="••••••••" />
          </div>
        </div>
        <Button size="sm" variant="outline">Update password</Button>
      </section>

      <Separator />

      {/* Links to knowledge base + integrations */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Data & Integrations</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/knowledge-base">
            <div className="flex items-center gap-3 rounded-lg border bg-background p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors cursor-pointer">
              <Database className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm font-medium">Knowledge Base</p>
                <p className="text-xs text-muted-foreground">Manage your sources</p>
              </div>
            </div>
          </Link>
          <Link href="/integrations">
            <div className="flex items-center gap-3 rounded-lg border bg-background p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors cursor-pointer">
              <Plug className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm font-medium">Integrations</p>
                <p className="text-xs text-muted-foreground">Jira, Notion, Linear</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <Separator />

      {/* Notifications */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Notifications</h2>
        </div>
        {[
          { label: 'Conflict detected', desc: 'When Mira finds conflicting signals in your knowledge map' },
          { label: 'Sync completed', desc: 'When an integration sync finishes' },
          { label: 'Extraction failed', desc: 'When a document fails to process' },
        ].map(({ label, desc }) => (
          <div key={label} className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-indigo-600" />
          </div>
        ))}
      </section>
    </div>
  );
}
