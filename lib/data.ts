import type {
  LPMNode,
  LPMEdge,
  ChatSession,
  ActivityItem,
  MiraSuggestion,
  KnowledgeBaseItem,
  Project,
  Integration,
  Notification,
  WikiEntry,
} from './types';

import nodesData from '@/data/nodes.json';
import edgesData from '@/data/edges.json';
import chatSessionsData from '@/data/chat-sessions.json';
import activityFeedData from '@/data/activity-feed.json';
import suggestionsData from '@/data/suggestions.json';
import knowledgeBaseData from '@/data/knowledge-base.json';
import projectsData from '@/data/projects.json';
import integrationsData from '@/data/integrations.json';
import notificationsData from '@/data/notifications.json';
import wikiData from '@/data/wiki.json';

export function getNodes(): LPMNode[] {
  return nodesData as unknown as LPMNode[];
}

export function getNodeById(id: string): LPMNode | undefined {
  return (nodesData as unknown as LPMNode[]).find((n) => n.id === id);
}

export function getEdges(): LPMEdge[] {
  return edgesData as unknown as LPMEdge[];
}

export function getEdgesForNode(nodeId: string): LPMEdge[] {
  return (edgesData as unknown as LPMEdge[]).filter(
    (e) => e.source === nodeId || e.target === nodeId
  );
}

export function getChatSessions(): ChatSession[] {
  return chatSessionsData as ChatSession[];
}

export function getChatSessionById(id: string): ChatSession | undefined {
  return (chatSessionsData as ChatSession[]).find((s) => s.id === id);
}

export function getActivityFeed(): ActivityItem[] {
  return activityFeedData as ActivityItem[];
}

export function getSuggestions(): MiraSuggestion[] {
  return suggestionsData as MiraSuggestion[];
}

export function getKnowledgeBaseItems(): KnowledgeBaseItem[] {
  return knowledgeBaseData as KnowledgeBaseItem[];
}

export function getKnowledgeBaseItemById(id: string): KnowledgeBaseItem | undefined {
  return (knowledgeBaseData as KnowledgeBaseItem[]).find((k) => k.id === id);
}

export function getProjects(): Project[] {
  return projectsData as Project[];
}

export function getProjectById(id: string): Project | undefined {
  return (projectsData as Project[]).find((p) => p.id === id);
}

export function getIntegrations(): Integration[] {
  return integrationsData as Integration[];
}

export function getNotifications(): Notification[] {
  return notificationsData as Notification[];
}

export function getUnreadNotificationCount(): number {
  return (notificationsData as Notification[]).filter((n) => !n.read).length;
}

export function getWiki(): WikiEntry[] {
  return wikiData as WikiEntry[];
}

export function getWikiByCategory(category: WikiEntry['category']): WikiEntry[] {
  return (wikiData as WikiEntry[]).filter((w) => w.category === category);
}
