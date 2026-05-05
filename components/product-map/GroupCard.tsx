'use client';

import { Handle, Position, type NodeProps } from 'reactflow';
import type { GroupCardData } from '@/lib/graph-utils';
import type { NodeType } from '@/lib/types';
import { NODE_TYPE_COLORS } from '@/lib/graph-utils';

const TYPE_ORDER: NodeType[] = ['feedback', 'decision', 'feature', 'metric', 'persona', 'competitor', 'epic', 'note'];

export function GroupCardNode({ data }: NodeProps<GroupCardData>) {
  const { label, description, color, nodeCount, typeCounts, dimmed, onDrillDown, onHover, groupKey } = data;

  const presentTypes = TYPE_ORDER.filter((t) => (typeCounts[t] ?? 0) > 0);

  return (
    <div
      onMouseEnter={() => onHover(groupKey)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onDrillDown(groupKey)}
      className="cursor-pointer select-none"
      style={{
        width: 280,
        opacity: dimmed ? 0.35 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />

      <div
        className="rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        style={{
          border: `1.5px solid #e5e7eb`,
          borderLeft: `4px solid ${color}`,
        }}
      >
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-[13px] font-semibold text-gray-900 leading-snug">{label}</h3>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ background: color }}
            >
              {nodeCount}
            </span>
          </div>

          <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{description}</p>

          <div className="flex flex-wrap gap-1.5">
            {presentTypes.map((t) => (
              <div key={t} className="flex items-center gap-1">
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: NODE_TYPE_COLORS[t] }}
                />
                <span className="text-[10px] text-gray-400 capitalize">{t} ({typeCounts[t]})</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="px-4 py-2 border-t border-gray-100 flex items-center justify-between"
        >
          <span className="text-[10px] text-gray-400">Click to explore</span>
          <svg className="h-3 w-3 text-gray-400" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2.5L8.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
