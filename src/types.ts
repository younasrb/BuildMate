export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  fileAttachment?: {
    name: string;
    size: string;
    type: string;
    content?: string;
  };
  actionType?: 'pdf' | 'presentation' | 'code' | 'summarize' | 'fix' | 'translate' | 'general';
  structuredData?: any;
  providerUsed?: string;
  modelUsed?: string;
  categoryUsed?: ModelCategory;
  latencyMs?: number;
  tokensUsed?: { input: number; output: number; total: number };
  estimatedCostUsd?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  isAutoTitled?: boolean;
}

export interface RecentFile {
  id: string;
  name: string;
  type: 'pdf' | 'pptx' | 'docx' | 'code' | 'txt';
  date: string;
  size: string;
  content?: string;
  pdfData?: PDFData;
  presentationData?: PresentationData;
}

export interface QuickAction {
  id: 'pdf' | 'presentation' | 'code' | 'summarize' | 'fix' | 'translate';
  title: string;
  iconName: string;
  badgeBg: string;
  badgeTextColor: string;
  badgeText: string;
  description: string;
  accentColor: string;
}

export interface AIModelOption {
  id: string;
  name: string;
  contextWindow: string;
  temperature: number;
  description: string;
  badge: string;
  isOnline: boolean;
}

export interface PDFSection {
  heading: string;
  content: string;
  bulletPoints?: string[];
}

export interface PDFData {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  summary: string;
  sections: PDFSection[];
  conclusion: string;
}

export interface Slide {
  slideNumber: number;
  title: string;
  layout: string;
  bulletPoints: string[];
  speakerNotes: string;
  visualPrompt?: string;
}

export interface PresentationData {
  presentationTitle: string;
  presentationSubtitle: string;
  slides: Slide[];
}

export interface ProjectFile {
  path: string;
  content: string;
  language?: string;
}

export interface ProjectData {
  projectName: string;
  description?: string;
  files: ProjectFile[];
}

export interface SummaryData {
  documentTitle: string;
  executiveSummary: string;
  keyTakeaways: string[];
  mainTopics: { topic: string; details: string }[];
  actionItems: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  badge: string;
  avatarText: string;
  isPro: boolean;
}

export interface CommandShortcut {
  command: string;
  description: string;
}

/* ==========================================================================
   CUSTOM API & INTELLIGENT ROUTER TYPES
   ========================================================================== */

export type ProviderId =
  | 'gemini'
  | 'openai'
  | 'anthropic'
  | 'groq'
  | 'deepseek'
  | 'openrouter'
  | 'together'
  | 'ollama'
  | 'lmstudio'
  | 'custom_openai';

export type ModelCategory = 'Fast' | 'Balanced' | 'Premium' | 'Reasoning' | 'Coding' | 'Vision';

export type RoutingStrategy =
  | 'auto'
  | 'cheapest'
  | 'fastest'
  | 'quality'
  | 'round-robin'
  | 'priority'
  | 'manual';

export interface ProviderInfo {
  id: ProviderId;
  name: string;
  description: string;
  isConfigured: boolean;
  isEnabled: boolean;
  priority: number;
  hasCustomKey: boolean;
  baseUrl?: string;
  status: 'online' | 'degraded' | 'offline' | 'untested';
  latencyMs?: number;
  models: {
    id: string;
    name: string;
    category: ModelCategory;
    costPer1kInputTokenUsd: number;
    costPer1kOutputTokenUsd: number;
  }[];
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  category: ModelCategory;
  provider: ProviderId;
  model: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  status: 'success' | 'failed' | 'fallback';
  fallbackChain?: ProviderId[];
  errorMessage?: string;
}

export interface AnalyticsMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  fallbackCount: number;
  totalTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  activeProvidersCount: number;
  topUsedModels: { model: string; provider: string; count: number }[];
  providerHealth: Record<ProviderId, { status: string; latencyMs: number; successRate: number }>;
  recentLogs: ApiLogEntry[];
}

export interface ProviderTestResult {
  providerId: ProviderId;
  success: boolean;
  latencyMs: number;
  message: string;
  testedAt: string;
}
