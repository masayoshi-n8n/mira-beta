'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { getProjects } from '@/lib/data';

export default function ProjectsPage() {
  const projects = getProjects();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Scoped workspaces for Mira-assisted analysis and deliverables.
          </p>
        </div>
        <Button
          onClick={() => setShowNew(true)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      {showNew && (
        <div className="rounded-xl border bg-background p-4 space-y-3">
          <p className="text-sm font-medium">Project name</p>
          <Input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Q3 Prioritization Brief"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={!newName.trim()}
              onClick={() => setShowNew(false)}
            >
              Create project
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}
