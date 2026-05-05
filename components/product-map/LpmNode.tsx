'use client';

import { Handle, Position, type NodeProps } from 'reactflow';
import type { LpmNodeData } from '@/lib/graph-utils';

export function LpmNodeCard({ data }: NodeProps<LpmNodeData>) {
  const { label, nodeType, source, timestamp, confidence, color, nodeId, dimmed, onSelect } = data;

  const date = new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const confLabel =
    confidence >= 0.8 ? 'High'
    : confidence >= 0.5 ? 'Inferred'
    : 'Low';

  return (
    <div
      onClick={() => onSelect(nodeId)}
      className="cursor-pointer select-none"
      style={{
        width: 220,
        opacity: dimmed ? 0.3 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0, width: 6, height: 6 }} />

      <div
        className="rounded-xl bg-white overflow-hidden hover:shadow-md transition-shadow"
        style={{
          border: '1.5px solid #e5e7eb',
          borderLeft: `3px solid ${color}`,
          minHeight: 90,
        }}
      >
        <div className="pl-3 pr-3 py-3">
          <p
            className="text-[11.5px] font-semibold leading-snug mb-1 line-clamp-2"
            style={{ color }}
          >
            {label}
          </p>
          <p className="text-[10px] text-gray-500 leading-snug mb-2">{source}</p>
          <p className="text-[9.5px] text-gray-400 uppercase tracking-wide">
            {nodeType} · {date} · {confLabel}
          </p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} style={{ opacity: 0, width: 6, height: 6 }} />
    </div>
  );
}
