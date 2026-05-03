# CLAUDE.md — Mira Beta Master Instruction File

> **Read this file at the start of every session before writing any code.**
> This is the single source of truth for the Mira Beta build. All decisions must align with this document.

---

## 1. Project Identity

**Product name:** Mira
**What it is:** An AI-native product intelligence system that eliminates institutional memory loss for product teams.
**Core feature:** The Living Product Map (LPM) — a continuously updated knowledge graph that ingests every signal shaping a product (customer feedback, decisions, metrics, roadmap, competitor moves), connects them into a queryable graph, and makes the full context accessible in natural language.
**How users interact:** Through Mira — an AI agent that sits on top of the LPM. You ask it questions. It gives grounded, traceable answers with full source provenance.

### The problem being solved
Product managers spend more time reconstructing context than acting on it. Signals are scattered across Jira, Slack, NPS surveys, interviews, and executive notes. Within months, nobody can explain why anything was built. Mira captures that reasoning as it happens and keeps it alive.

### Primary demo user
**Alex Chen** — Senior Product Manager, Creator Tools at LinkedIn.
- Manages 4 active feature tracks
- Struggling to synthesize signals across customer feedback, product metrics, roadmap pressure, and executive priorities
- Core question Mira needs to answer: **"What should we build first in Q3 and why?"**
- Mira has been ingesting Alex's product context for 60 days: Jira epics, NPS feedback, engagement metrics, competitor signals, and executive notes

Every design decision, every piece of seed data, every UI copy choice should serve this user and this demo scenario.

---

## 2. Beta Scope — What This Is and Is Not

### What the beta IS
- A fully interactive frontend prototype
- Demo-ready for investor and user research sessions
- Populated with realistic seed data representing Alex's product context
- Powered by a static JSON data layer — no real backend required
- Deployed to Vercel with a shareable URL from day one

### What the beta IS NOT
- A production system with a real backend
- Connected to real Jira, Notion, or Linear APIs
- Running real LLM inference at query time
- Multi-user or team-collaborative
- Handling real authentication or real user data

### Hard rules
- **No real API calls.** All data comes from `/data` as static JSON.
- **No real OAuth.** Integration connect flows are UI-only — simulate the connected state.
- **No real LLM inference.** Mira's responses are pre-written, realistic, and stored in JSON.
- **No backend required.** The app must build and run with `next build` and deploy to Vercel without any server-side database or API.
- **No deviation from the tech stack.** See Section 4.

---

## 3. The LPM — Concept Reference for Code Decisions

The LPM is built on three conceptual storage layers. In the beta, all three are simulated with static JSON. Understand these layers so that seed data, node types, and UI copy reflect the real architecture.

### Layer 1 — Vector Database (Discovery Layer)
Stores semantic chunks from unstructured sources. Finds relevant context by meaning. In the beta, simulate this by returning pre-written relevant chunks when a query matches a known pattern.

### Layer 2 — Knowledge Graph (Causality Layer)
Stores nodes (entities) and typed edges (relationships) between them. This is what powers the decision trace visualization. Node types: `feedback`, `decision`, `feature`, `metric`, `persona`, `competitor`, `epic`, `note`. Edge types: `influenced`, `caused`, `preceded`, `contradicts`, `relates_to`, `is_child_of`, `was_deprioritized_by`.

### Layer 3 — LLM Wiki (Ground Truth Layer)
Stores curated, stable facts — persona definitions, metric definitions, product principles. In the beta, this is a static JSON file that Mira always references when answering questions about core product context.

### Confidence scoring
Every node and edge carries a confidence score. Thresholds:
- Above `0.8` → auto-accepted (shown as high confidence)
- `0.5–0.8` → flagged (shown as inferred)
- Below `0.5` → discarded (not shown)

---

## 4. Tech Stack — Final, Do Not Deviate

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Use App Router only. No Pages Router. |
| Language | TypeScript | Strict mode. No `any` types. |
| Styling | Tailwind CSS | Utility classes only. No inline styles. No CSS modules. |
| Components | shadcn/ui | Use shadcn primitives for all UI elements. Install via CLI. |
| Graph | React Flow (`reactflow`) | All graph and decision trace visualizations. |
| State | Zustand | UI state only. No Redux. No Context API for global state. |
| Icons | Lucide React | No other icon libraries. |
| Data | Static JSON in `/data` | All demo content. No database. No API routes that hit external services. |
| Deployment | Vercel + GitHub | Auto-deploy on every push to `main`. |

---

## 5. Project File Structure

Every file Claude Code creates must follow this structure. Do not create files outside this layout without a strong reason.

```
/mira-beta
├── CLAUDE.md                  ← This file
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
│
├── /app                       ← Next.js App Router pages
│   ├── layout.tsx             ← Root layout (global nav, header)
│   ├── page.tsx               ← Redirects to /dashboard
│   ├── /dashboard
│   │   └── page.tsx
│   ├── /chat
│   │   ├── page.tsx           ← New chat
│   │   └── /[sessionId]
│   │       └── page.tsx       ← Resumed chat session
│   ├── /product-map
│   │   └── page.tsx
│   ├── /knowledge-base
│   │   └── page.tsx
│   ├── /projects
│   │   ├── page.tsx           ← Projects list
│   │   └── /[projectId]
│   │       └── page.tsx       ← Individual project
│   ├── /integrations
│   │   └── page.tsx
│   ├── /settings
│   │   └── page.tsx
│   └── /onboarding
│       └── page.tsx
│
├── /components
│   ├── /layout                ← GlobalHeader, GlobalNav, NotificationBell, UploadButton
│   ├── /dashboard             ← ActivityFeed, MiraSuggestions, LPMStatsSummary, RecentChats
│   ├── /chat                  ← ChatInterface, MessageBubble, DecisionTrace, ProvenanceBar, ConfidenceIndicator
│   ├── /product-map           ← LPMGraph, NodeSidePanel, EdgeDetail, GraphControls
│   ├── /knowledge-base        ← SourceList, SourceItem, ProcessingStatus, AnnotationPanel
│   ├── /upload                ← UploadModal, DropZone, NoteInput, UploadProgress
│   ├── /projects              ← ProjectCard, ProjectChat, DeliverablePanel
│   ├── /integrations          ← IntegrationCard, SyncStatus
│   ├── /onboarding            ← OnboardingOverlay, StepOne, StepTwo, StepThree
│   └── /ui                    ← shadcn/ui components (auto-generated)
│
├── /data                      ← All static JSON seed data
│   ├── nodes.json             ← LPM graph nodes
│   ├── edges.json             ← LPM graph edges
│   ├── chat-sessions.json     ← Pre-written Mira chat sessions
│   ├── activity-feed.json     ← Dashboard activity feed items
│   ├── suggestions.json       ← Proactive Mira suggestions
│   ├── knowledge-base.json    ← Source/knowledge base items
│   ├── projects.json          ← Demo projects
│   ├── integrations.json      ← Integration status data
│   ├── notifications.json     ← Notification items
│   └── wiki.json              ← LLM Wiki ground truth facts
│
├── /lib
│   ├── data.ts                ← Data fetching helpers (reads from /data JSON)
│   ├── graph-utils.ts         ← React Flow graph transformation helpers
│   ├── store.ts               ← Zustand store definitions
│   └── types.ts               ← All shared TypeScript types
│
└── /public
    └── /images
```

---

## 6. TypeScript Types — Define These First

Before building any component, these core types must exist in `/lib/types.ts`.

```typescript
// Node types matching the LPM ontology
export type NodeType =
  | 'feedback'
  | 'decision'
  | 'feature'
  | 'metric'
  | 'persona'
  | 'competitor'
  | 'epic'
  | 'note';

// Edge relationship types
export type EdgeType =
  | 'influenced'
  | 'caused'
  | 'preceded'
  | 'contradicts'
  | 'relates_to'
  | 'is_child_of'
  | 'was_deprioritized_by';

// Confidence levels derived from score
export type ConfidenceLevel = 'high' | 'inferred' | 'discarded';

// A node in the LPM knowledge graph
export interface LPMNode {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  source: string;           // e.g. "Jira", "NPS Survey", "Interview Notes"
  sourceItemId: string;     // links back to knowledge-base.json item
  timestamp: string;        // ISO date string
  confidence: number;       // 0.0 to 1.0
  projectId?: string;       // set if created inside a project
  metadata: Record<string, string | number | boolean>;
}

// A directed edge between two LPM nodes
export interface LPMEdge {
  id: string;
  source: string;           // LPMNode id
  target: string;           // LPMNode id
  type: EdgeType;
  confidence: number;
  inferredSource: string;   // what caused this edge to be inferred
  timestamp: string;
}

// A single message in a Mira chat session
export interface ChatMessage {
  id: string;
  role: 'user' | 'mira';
  content: string;
  timestamp: string;
  provenance?: ProvenanceItem[];
  confidence?: ConfidenceLevel;
  decisionTrace?: DecisionTrace;
}

// Provenance shown below every Mira response
export interface ProvenanceItem {
  layer: 'vector-db' | 'knowledge-graph' | 'llm-wiki';
  source: string;
  excerpt: string;
}

// A decision trace rendered as a ReactFlow diagram inside chat
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

// A full chat session
export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  messages: ChatMessage[];
}

// Dashboard activity feed item
export interface ActivityItem {
  id: string;
  type: 'node_added' | 'conflict_detected' | 'sync_completed' | 'extraction_failed';
  description: string;
  timestamp: string;
  nodeId?: string;
}

// Proactive Mira suggestion on the dashboard
export interface MiraSuggestion {
  id: string;
  summary: string;
  preloadedPrompt: string;
  relatedNodeIds: string[];
  timestamp: string;
}

// A knowledge base / source item
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

// A project workspace
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

// An integration connection
export interface Integration {
  id: string;
  name: 'jira' | 'notion' | 'linear';
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  lastSyncedAt?: string;
  errorMessage?: string;
  nodeCount: number;
}

// A notification
export interface Notification {
  id: string;
  type: 'sync_completed' | 'extraction_failed' | 'conflict_detected';
  message: string;
  timestamp: string;
  read: boolean;
}
```

---

## 7. Seed Data — The Demo Scenario

All seed data must reflect Alex Chen's 60-day ingested product context. Use these specifics to write realistic JSON files in `/data`.

### Context about Alex's product
- **Product area:** LinkedIn Creator Tools
- **Active epics:** Creator Analytics Dashboard, Post Scheduling v2, Newsletter Monetization, Creator Fund Beta
- **Key metrics:** Weekly Active Creators (WAC), Post Completion Rate, Follower Growth Rate, Creator Revenue per User
- **Competitors tracked:** Substack, Beehiiv, TikTok Creator Tools
- **Key Q3 decision tension:** Push Creator Analytics (high user demand, 68 NPS requests) vs. Newsletter Monetization (exec priority, revenue signal)
- **Key signal:** NPS feedback volume for analytics has increased 40% in 6 weeks. Competitor Substack launched creator dashboards in April.

### Required seed data files

**`nodes.json`** — Minimum 25 nodes across all types. Must include:
- 5 feedback nodes (NPS requests, interview notes, support tickets)
- 4 decision nodes (Q2 planning decision, exec priority shift, etc.)
- 4 feature nodes (the 4 active epics as features)
- 3 metric nodes (WAC, Post Completion Rate, Creator Revenue)
- 2 persona nodes (Creator persona, Casual User persona)
- 3 competitor nodes (Substack, Beehiiv, TikTok)
- 4 epic nodes (the 4 active epics)

**`edges.json`** — Minimum 20 edges connecting the above nodes with typed relationships and confidence scores.

**`chat-sessions.json`** — 3 pre-written sessions:
1. **"What should we build first in Q3?"** — Mira's response includes a decision trace diagram showing the causal chain from NPS feedback → competitor signal → exec note → prioritization recommendation. This is the signature demo moment.
2. **"What do we know about creator analytics demand?"** — Mira synthesizes NPS data, interview notes, and usage metrics into a clear answer with provenance.
3. **"What changed in our roadmap in Q1 and why?"** — Mira reconstructs the sequence of signals that drove a roadmap shift.

**`suggestions.json`** — 3 proactive suggestions:
1. "Creator analytics feedback spiked 40% in the last 6 weeks. Want a prioritization brief?"
2. "Substack launched creator dashboards last week. Want a competitive impact summary?"
3. "3 open Jira tickets are linked to your Creator Fund epic. Want a status summary?"

**`activity-feed.json`** — 10 items covering: new nodes added from Jira sync, a conflict detected between two prioritization decisions, a Notion sync completing, an extraction failing on a PDF.

**`knowledge-base.json`** — 8 source items: 3 uploaded PDFs (NPS Report Q1, Creator Interview Notes, Competitive Analysis), 2 Jira syncs, 1 Notion sync, 1 Linear sync, 1 free-text note.

**`wiki.json`** — Ground truth facts including: persona definitions for Creator and Casual User, metric definitions for all 4 key metrics, north star metric definition, Q3 strategic bets.

---

## 8. Node Color Coding

Use these colors consistently across the product map and decision trace:

| Node Type | Color | Tailwind Class |
|---|---|---|
| feedback | Purple | `bg-purple-500` |
| decision | Blue | `bg-blue-600` |
| feature | Green | `bg-green-500` |
| metric | Orange | `bg-orange-500` |
| persona | Pink | `bg-pink-500` |
| competitor | Red | `bg-red-500` |
| epic | Indigo | `bg-indigo-500` |
| note | Yellow | `bg-yellow-400` |

---

## 9. Build Sequence — Epics in Order

Build one epic at a time. Complete all stories in an epic before starting the next. Do not skip ahead.

| # | Epic | Key stories | Status |
|---|---|---|---|
| EP-01 | Account Registration & Onboarding | Email signup UI, Google OAuth UI (simulated), 3-step onboarding overlay, first context prompt modal, skip option, first node confirmation screen | **DONE** |
| EP-02 | Home / Dashboard | LPM stats summary, live activity feed, 2–3 proactive Mira suggestions with pre-loaded prompts, recent chat sessions with one-click resume, empty state | **DONE** |
| EP-03 | Mira Chat | Natural language Q&A interface, decision trace ReactFlow diagram inside chat (this is the signature feature), provenance bar on every response, confidence indicator, in-chat upload, chat history, generate deliverable | **DONE** |
| EP-04 | Global LPM / Product Map | Full interactive React Flow graph, node color coding + legend, real-time node propagation simulation, node side panel (properties/source/confidence/edges), source provenance link, NL graph query + highlight, edge detail, zoom/pan/filter controls | **DONE** |
| EP-05 | Knowledge Base | Searchable/filterable source list, processing status per item, item detail preview (extracted entities + graph connections), manual annotation, delete with retain/remove choice | **DONE** |
| EP-06 | Global Upload Affordance | Persistent upload button in global header, upload modal with drag-and-drop, bulk upload (max 10 files, 25MB each), free-text note, upload trigger from product map empty state | **DONE** |
| EP-07 | Projects | Create project (free-form name), empty project state, scoped Mira chat, Mira generates deliverables, save + download deliverables, projects list, archive/delete | **DONE** |
| EP-08 | Integrations | Connect Jira/Notion/Linear UI (simulated OAuth), integration status page, disconnect with retain/remove choice, background sync simulation | **DONE** |
| EP-09 | Settings & Notifications | Profile edit (name, email, avatar), password change, notification bell with badge count, notification dropdown (last 20 items) | **DONE** |
| EP-10 | LPM Extraction & Enrichment | Simulated extraction pipeline on upload (show progress states), confidence scoring display, conflict detection UI, project attribution tagging, background enrichment simulation, proactive suggestion generation | **DONE** |

---

## 10. Coding Rules — Always Follow These

### TypeScript
- Strict mode enabled in `tsconfig.json` — `"strict": true`
- No `any` types — use `unknown` and narrow, or define proper types in `/lib/types.ts`
- All props must have explicit TypeScript interfaces
- Export types from `/lib/types.ts` — do not define types inside component files

### Components
- One component per file
- File name matches component name in PascalCase (e.g. `ActivityFeed.tsx`)
- Use shadcn/ui primitives for all standard UI elements (Button, Card, Dialog, Sheet, Badge, etc.)
- No inline styles — Tailwind classes only
- All interactive elements must be keyboard accessible

### State management
- Use Zustand for all global UI state (upload modal open, selected node, notification count, current chat session)
- Do not use React Context API for global state
- Local component state (`useState`) is fine for purely local UI (e.g. hover states, accordion open/close)

### Data access
- Never import JSON files directly in page or component files
- All data access goes through `/lib/data.ts` helper functions
- Helper functions must be typed — they return the correct TypeScript types, never `any`

### Routing
- Use Next.js App Router file-based routing
- All navigation uses Next.js `Link` component — no `window.location`
- Dynamic routes use bracket notation: `/app/chat/[sessionId]/page.tsx`

### Performance
- Use `'use client'` only where necessary (interactive components, React Flow, Zustand)
- Server Components by default for all page files and non-interactive layout components
- No unnecessary `useEffect` calls — derive state from data where possible

### File and folder names
- Pages: `page.tsx` in the appropriate `/app` subfolder
- Components: PascalCase `.tsx` files in the appropriate `/components` subfolder
- Utilities: camelCase `.ts` files in `/lib`
- Data files: kebab-case `.json` files in `/data`

---

## 11. Global Navigation Structure

The global header is visible on every page after onboarding. It contains:

**Left:** Mira logo (links to `/dashboard`)

**Center nav links:** Dashboard · Chat · Product Map · Projects

**Right:** Upload button (global affordance) · Notification bell with badge · User avatar (links to `/settings`)

The Knowledge Base and Integrations pages are accessible via Settings — they are not primary nav items.

---

## 12. Key UX Moments — Build These Right

These are the moments that determine whether the demo lands. Prioritize their quality above everything else.

### 1. The "Mira gets me" moment (EP-02, Dashboard)
When Alex opens the dashboard, Mira has already been thinking. The 3 proactive suggestions feel personally relevant — specific enough to feel uncanny. Bad: "You have new nodes." Good: "Creator analytics feedback spiked 40% in the last 6 weeks — want me to build a prioritization brief?"

### 2. The decision trace (EP-03, Mira Chat)
When Alex asks "What should we build first in Q3?", Mira's response includes an interactive ReactFlow diagram showing the full causal chain: NPS feedback node → competitor signal node → exec note node → prioritization recommendation. Each node is clickable and reveals its source. This must feel like magic — the most technically impressive moment in the demo.

### 3. The graph comes alive (EP-04, Product Map)
The product map page must be visually impressive on first load. A rich, interconnected graph of 25+ nodes in multiple colors. Zoom in on a node, click it, see the side panel animate in. This is the moment a viewer understands what the LPM is without explanation.

### 4. The "aha" moment (EP-01, Onboarding)
When the first document is processed and nodes appear on the graph for the first time — the empty graph becomes alive. This transition must be animated and feel significant.

---

## 13. Demo Flow Reference

When showing Mira to investors or users, the intended demo sequence is:

1. Login as Alex Chen → skip onboarding (already set up)
2. Land on Dashboard → see proactive suggestions → click "Creator analytics brief" suggestion
3. Enter chat → Mira answers with decision trace diagram → click through nodes in the trace
4. Navigate to Product Map → full graph loads → zoom in → click a node → see side panel
5. Ask a natural language query in the side panel → relevant nodes highlight
6. Navigate to Integrations → show Jira connected, syncing
7. Click upload → drag in a document → watch new nodes propagate onto the graph
8. Navigate to Projects → show a pre-built "Q3 Prioritization" project with a generated deliverable

Total demo time: approximately 5 minutes.

---

## 14. Session Start Protocol

At the start of every Claude Code session:
1. Read this file (`CLAUDE.md`) in full
2. Check the build sequence table in Section 9 to identify the current epic (`TODO` → in progress)
3. Check what files already exist in the project to understand current state
4. Build the current epic's stories in the order they are listed
5. Update the build sequence table when an epic is complete (change status to `DONE`)
6. Never start a new epic without completing the current one

---

*Mira Beta · CLAUDE.md · v1.0 · May 2026*
