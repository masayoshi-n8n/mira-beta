import { notFound } from 'next/navigation';
import { getProjectById, getChatSessionById } from '@/lib/data';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { DeliverablePanel } from '@/components/projects/DeliverablePanel';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  const project = getProjectById(projectId);
  if (!project) notFound();

  const sessions = project.chatSessionIds
    .map((id) => getChatSessionById(id))
    .filter(Boolean);

  const firstSession = sessions[0];

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Chat area */}
      <div className="flex-1 min-w-0 border-r">
        {firstSession ? (
          <ChatInterface
            initialMessages={firstSession.messages}
            sessionTitle={project.name}
          />
        ) : (
          <ChatInterface sessionTitle={project.name} />
        )}
      </div>

      {/* Deliverables sidebar */}
      <aside className="w-80 shrink-0 overflow-y-auto p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          {project.name}
        </p>
        <DeliverablePanel />
      </aside>
    </div>
  );
}
