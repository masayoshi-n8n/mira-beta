'use client';

import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

export function UploadButton() {
  const setUploadModalOpen = useStore((s) => s.setUploadModalOpen);

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 text-sm"
      onClick={() => setUploadModalOpen(true)}
    >
      <Upload className="h-3.5 w-3.5" />
      Upload
    </Button>
  );
}
