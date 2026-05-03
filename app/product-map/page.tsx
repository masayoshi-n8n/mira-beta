import { getEdges, getNodes } from '@/lib/data';
import { LPMGraph } from '@/components/product-map/LPMGraph';

export default function ProductMapPage() {
  const nodes = getNodes();
  const edges = getEdges();
  return <LPMGraph nodes={nodes} edges={edges} />;
}
