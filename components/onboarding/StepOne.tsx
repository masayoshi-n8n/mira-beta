'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';

interface StepOneProps {
  initialName: string;
  initialEmail: string;
  onNext: (data: { name: string; role: string; company: string }) => void;
}

const ROLES = [
  'Product Manager',
  'Product Lead / Director',
  'VP Product',
  'CPO',
  'Engineering Manager',
  'Designer',
  'Other',
];

export function StepOne({ initialName, initialEmail, onNext }: StepOneProps) {
  const [name, setName] = useState(initialName);
  const [role, setRole] = useState('Product Manager');
  const [company, setCompany] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onNext({ name: name.trim(), role, company: company.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Tell us about yourself</h2>
        <p className="text-sm text-muted-foreground">
          Mira uses this to personalize your experience.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Chen"
            required
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">Your role</Label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="LinkedIn"
          />
        </div>

        <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">Signing in as</p>
          <p className="text-sm">{initialEmail}</p>
        </div>
      </div>

      <Button type="submit" className="mt-2 gap-2">
        Continue
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
