'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepThreeProps {
  onNext: () => void;
  onSkip: () => void;
}

export function StepThree({ onNext, onSkip }: StepThreeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) simulateUpload(file.name);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) simulateUpload(file.name);
  }

  function simulateUpload(name: string) {
    setUploadedFile(name);
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Add your first context</h2>
        <p className="text-sm text-muted-foreground">
          Upload a doc, NPS export, or meeting notes. Mira will extract the key
          signals and map them to your product graph.
        </p>
      </div>

      <div
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer',
          isDragging
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30'
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.csv,.md,.txt"
          onChange={handleFileChange}
        />

        {uploadedFile ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{uploadedFile}</p>
              {isProcessing ? (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 justify-center">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                  Processing...
                </p>
              ) : (
                <p className="text-xs text-green-600 mt-1">Ready to ingest</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Drop a file here</p>
              <p className="text-xs text-muted-foreground">
                PDF, Word, CSV, Markdown — max 25MB
              </p>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Great options: NPS reports, interview notes, product specs, Notion exports
      </p>

      <div className="flex flex-col gap-2">
        <Button
          onClick={onNext}
          disabled={isProcessing}
          className="gap-2"
        >
          {uploadedFile ? 'Build my product map' : 'Continue'}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground"
        >
          I&apos;ll add context later
        </Button>
      </div>
    </div>
  );
}
