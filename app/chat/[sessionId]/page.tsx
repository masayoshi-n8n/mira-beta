import { notFound } from 'next/navigation';
import { getChatSessionById } from '@/lib/data';
import { ChatInterface } from '@/components/chat/ChatInterface';

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function ChatSessionPage({ params }: Props) {
  const { sessionId } = await params;
  const session = getChatSessionById(sessionId);

  if (!session) notFound();

  return (
    <ChatInterface
      initialMessages={session.messages}
      sessionTitle={session.title}
    />
  );
}
