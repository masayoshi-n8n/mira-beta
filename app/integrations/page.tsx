import { getIntegrations } from '@/lib/data';
import { IntegrationCard } from '@/components/integrations/IntegrationCard';
import { Plug } from 'lucide-react';

export default function IntegrationsPage() {
  const integrations = getIntegrations();
  const connected = integrations.filter((i) => i.status === 'connected').length;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {connected} of {integrations.length} integrations connected
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
          <Plug className="h-5 w-5 text-indigo-600" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {integrations.map((i) => (
          <IntegrationCard key={i.id} integration={i} />
        ))}
      </div>
    </div>
  );
}
