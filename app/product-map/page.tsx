import { getEdges, getNodes } from '@/lib/data';
import { LPMGraph } from '@/components/product-map/LPMGraph';

export default function ProductMapPage() {
  const nodes = getNodes();
  const edges = getEdges();

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Product Map</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {nodes.length} nodes · {edges.length} connections · 60 days of context
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <LPMGraph nodes={nodes} edges={edges} />
      </div>
    </div>
  );
}
