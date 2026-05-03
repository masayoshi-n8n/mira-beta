import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEMO_DELIVERABLE = {
  title: 'Q3 Prioritization Brief',
  generatedAt: '2026-04-10T10:30:00Z',
  content: `# Q3 Prioritization Brief — Creator Tools

**Prepared by Mira · April 10, 2026**

## Recommendation

Ship **Creator Analytics Dashboard** first in Q3 (target: end of August), followed by **Newsletter Monetization** in Q4.

## Signal Summary

| Signal | Strength |
|---|---|
| NPS demand for analytics | 68 requests (+40% in 6 weeks) |
| Creator churn citing analytics gap | 34% of exit surveys |
| Substack analytics launch | April 2026 |
| Exec mandate for revenue signal | Q3 deadline |

## Rationale

The creator analytics demand signal is unusually strong and time-sensitive. Substack's April dashboard launch accelerates the urgency — every week without analytics increases the risk of losing power creators who can't optimize their content.

The exec mandate for a Q3 revenue signal is real, but Newsletter Monetization (10-week build) can start immediately after Analytics ships in mid-Q3, still landing a Q4 revenue signal that demonstrates momentum.

## Recommended Sequence

1. **Q3 (now → August 30):** Creator Analytics Dashboard — 6-week build
2. **Q4 (September start):** Newsletter Monetization — 10-week build
3. **Q2 ongoing:** Post Scheduling v2 shipping May 30 — on track
4. **H2 2026:** Creator Fund Beta — pending legal clearance`,
};

export function DeliverablePanel() {
  return (
    <div className="rounded-xl border bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-semibold">Deliverables</span>
        </div>
      </div>
      <div className="p-4">
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{DEMO_DELIVERABLE.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generated {new Date(DEMO_DELIVERABLE.generatedAt).toLocaleDateString()}
              </p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0 h-7 text-xs">
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
          <div className="mt-3 max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-sans leading-relaxed">
              {DEMO_DELIVERABLE.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
