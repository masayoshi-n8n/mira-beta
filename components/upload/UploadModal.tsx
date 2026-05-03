'use client';

import { useRef, useState } from 'react';
import { Upload, FileText, X, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface UploadedFile {
  name: string;
  size: number;
  progress: number;
  done: boolean;
}

export function UploadModal() {
  const { isUploadModalOpen, setUploadModalOpen } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [note, setNote] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function simulateUpload(fileList: FileList) {
    const newFiles: UploadedFile[] = Array.from(fileList)
      .slice(0, 10 - files.length)
      .map((f) => ({ name: f.name, size: f.size, progress: 0, done: false }));

    setFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((_, i) => {
      const idx = files.length + i;
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 25 + 10;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f, fi) => (fi === idx ? { ...f, progress: 100, done: true } : f))
          );
        } else {
          setFiles((prev) =>
            prev.map((f, fi) => (fi === idx ? { ...f, progress: p } : f))
          );
        }
      }, 200);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) simulateUpload(e.dataTransfer.files);
  }

  function handleClose() {
    setUploadModalOpen(false);
    setTimeout(() => {
      setFiles([]);
      setNote('');
    }, 300);
  }

  return (
    <Dialog open={isUploadModalOpen} onOpenChange={setUploadModalOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add context to Mira</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            className={cn(
              'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors',
              isDragging
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20'
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.csv,.md,.txt,.json"
              onChange={(e) => e.target.files && simulateUpload(e.target.files)}
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
              <Upload className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                PDF, Word, CSV, Markdown — max 25MB each, up to 10 files
              </p>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{f.name}</p>
                    {!f.done && (
                      <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${f.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  {f.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {Math.round(f.progress)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Note input */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Or add a free-text note</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Paste meeting notes, exec decisions, or any context Mira should know about…"
              rows={3}
              className="w-full resize-none rounded-lg border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition-all placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleClose}
              disabled={files.length === 0 && !note.trim()}
            >
              {files.length > 0 || note.trim() ? 'Add to knowledge map' : 'Add context'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
