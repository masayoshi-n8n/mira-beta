'use client';

import { Download, X } from 'lucide-react';
import type { Artifact } from '@/lib/types';

interface ArtifactPanelProps {
  artifact: Artifact;
  onClose: () => void;
}

function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line === '') {
      elements.push(<div key={i} className="h-3" />);
      return;
    }

    if (line.startsWith('○ Provisional')) {
      const text = line.slice(2).trim();
      elements.push(
        <div key={i} className="flex items-start gap-2 mt-2">
          <span className="mt-1 h-3 w-3 shrink-0 rounded-full border border-gray-400" />
          <p className="text-sm text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-600">Provisional</span>
            {text.replace(/^Provisional\s*—?\s*/, ' — ')}
          </p>
        </div>
      );
      return;
    }

    if (line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1">
          <span className="mt-2 h-1 w-1 rounded-full bg-gray-400 shrink-0" />
          <p className="text-sm text-gray-700 leading-relaxed">{line.slice(2)}</p>
        </div>
      );
      return;
    }

    // Parse **label:** value or **label** (standalone bold)
    const boldLabelMatch = line.match(/^\*\*(.+?)\*\*:?\s*(.*)/);
    if (boldLabelMatch) {
      const [, label, rest] = boldLabelMatch;
      elements.push(
        <p key={i} className="text-sm text-gray-800 leading-relaxed">
          <span className="font-semibold">{label}{rest ? ':' : ''}</span>
          {rest ? ` ${rest}` : ''}
        </p>
      );
      return;
    }

    elements.push(
      <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>
    );
  });

  return elements;
}

export function ArtifactPanel({ artifact, onClose }: ArtifactPanelProps) {
  function handleDownload() {
    const blob = new Blob([artifact.content.replace(/\*\*/g, '').replace(/○ /g, '◦ ')], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-[380px] shrink-0 border-l border-gray-200 flex flex-col h-full bg-white">
      <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 leading-tight pr-4">
          {artifact.title}
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-0.5">
        {renderContent(artifact.content)}
      </div>
    </div>
  );
}
