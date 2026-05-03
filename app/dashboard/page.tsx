import { getActivityFeed, getChatSessions, getEdges, getIntegrations, getNodes, getSuggestions } from '@/lib/data';
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting';
import { LPMStatsSummary } from '@/components/dashboard/LPMStatsSummary';
import { MiraSuggestions } from '@/components/dashboard/MiraSuggestions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { RecentChats } from '@/components/dashboard/RecentChats';

export default function DashboardPage() {
  const nodes = getNodes();
  const edges = getEdges();
  const integrations = getIntegrations();
  const suggestions = getSuggestions();
  const activityFeed = getActivityFeed();
  const chatSessions = getChatSessions();

  return (
    <div className="mx-auto w-full max-w-screen-xl px-6 py-8 space-y-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <DashboardGreeting />
      </div>

      {/* LPM stats */}
      <LPMStatsSummary
        nodeCount={nodes.length}
        edgeCount={edges.length}
        integrationCount={integrations.filter((i) => i.status === 'connected').length}
        daysOfContext={60}
      />

      {/* Mira suggestions — the hero moment */}
      <MiraSuggestions suggestions={suggestions} />

      {/* Activity + Recent chats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivityFeed items={activityFeed} />
        <RecentChats sessions={chatSessions} />
      </div>
    </div>
  );
}
