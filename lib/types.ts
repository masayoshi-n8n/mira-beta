export type ThemeGroupKey =
  | 'pmf'
  | 'satisfaction'
  | 'revenue'
  | 'retention'
  | 'competitive'
  | 'compliance'
  | 'performance'
  | 'roadmap';

export interface ThemeGroupConfig {
  key: ThemeGroupKey;
  label: string;
  description: string;
  color: string;
  position: { x: number; y: number };
}

export type NodeType =
  | 'feedback'
  | 'decision'
  | 'feature'
  | 'metric'
  | 'persona'
  | 'competitor'
  | 'epic'
  | 'note';

export type EdgeType =
  | 'influenced'
  | 'caused'
  | 'preceded'
  | 'contradicts'
  | 'relates_to'
  | 'is_child_of'
  | 'was_deprioritized_by';

export type ConfidenceLevel = 'high' | 'inferred' | 'discarded';

export interface LPMNode {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  source: string;
  sourceItemId: string;
  timestamp: string;
  confidence: number;
  projectId?: string;
  themeGroup?: ThemeGroupKey;
  metadata: Record<string, string | number | boolean>;
}

export interface LPMEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  confidence: number;
  inferredSource: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'mira';
  content: string;
  timestamp: string;
  provenance?: ProvenanceItem[];
  confidence?: ConfidenceLevel;
  decisionTrace?: DecisionTrace;
}

export interface ProvenanceItem {
  layer: 'vector-db' | 'knowledge-graph' | 'llm-wiki';
  source: string;
  excerpt: string;
}

export interface DecisionTrace {
  nodes: DecisionTraceNode[];
  edges: DecisionTraceEdge[];
}

export interface DecisionTraceNode {
  id: string;
  label: string;
  type: NodeType;
  timestamp: string;
  source: string;
  confidence: number;
  detail: string;
}

export interface DecisionTraceEdge {
  id: string;
  source: string;
  target: string;
  label: EdgeType;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  messages: ChatMessage[];
}

export interface ActivityItem {
  id: string;
  type: 'node_added' | 'conflict_detected' | 'sync_completed' | 'extraction_failed';
  description: string;
  timestamp: string;
  nodeId?: string;
}

export interface MiraSuggestion {
  id: string;
  summary: string;
  preloadedPrompt: string;
  relatedNodeIds: string[];
  timestamp: string;
}

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  source: 'upload' | 'jira' | 'notion' | 'linear' | 'note';
  status: 'queued' | 'processing' | 'ready' | 'failed';
  uploadedAt: string;
  extractedNodeIds: string[];
  annotations: string[];
  errorMessage?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
  chatSessionIds: string[];
  deliverableIds: string[];
}

export interface Integration {
  id: string;
  name: 'jira' | 'notion' | 'linear';
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  lastSyncedAt?: string;
  errorMessage?: string;
  nodeCount: number;
}

export interface Notification {
  id: string;
  type: 'sync_completed' | 'extraction_failed' | 'conflict_detected';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface WikiEntry {
  id: string;
  category: 'persona' | 'metric' | 'principle' | 'strategic_bet';
  title: string;
  body: string;
  lastUpdated: string;
}
