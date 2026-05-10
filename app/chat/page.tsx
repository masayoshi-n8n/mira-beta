import { getChatSessionById } from '@/lib/data';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ChatPage() {
  const session = getChatSessionById('cs-001');
  return <ChatInterface session={session ?? undefined} />;
}
