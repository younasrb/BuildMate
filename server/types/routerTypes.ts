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

export interface ModelSpec {
  id: string;
  name: string;
  category: ModelCategory;
  contextWindow: string;
  costPer1kInputTokenUsd: number;
  costPer1kOutputTokenUsd: number;
  benchmarkScore: number; // 0-100 quality indicator
}

export interface ProviderDefinition {
  id: ProviderId;
  name: string;
  description: string;
  defaultBaseUrl?: string;
  defaultModel: string;
  models: ModelSpec[];
}

export interface UserKeys {
  gemini?: string;
  openai?: string;
  anthropic?: string;
  groq?: string;
  deepseek?: string;
  openrouter?: string;
  together?: string;
  ollamaBaseUrl?: string;
  lmstudioBaseUrl?: string;
  customOpenaiKey?: string;
  customOpenaiBaseUrl?: string;
}

export interface RouterRequest {
  message: string;
  history?: { role: 'user' | 'assistant' | 'model'; text: string }[];
  systemPrompt?: string;
  fileContext?: { name: string; content: string }[];
  category?: ModelCategory;
  strategy?: RoutingStrategy;
  manualProvider?: ProviderId;
  manualModel?: string;
  userKeys?: UserKeys;
  enabledProviders?: Record<ProviderId, boolean>;
  providerPriorities?: ProviderId[];
  temperature?: number;
}

export interface RouterResponse {
  reply: string;
  providerUsed: ProviderId;
  modelUsed: string;
  category: ModelCategory;
  strategyUsed: RoutingStrategy;
  latencyMs: number;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  estimatedCostUsd: number;
  fallbackChain?: ProviderId[];
  isFallback?: boolean;
  status: 'success' | 'error';
  errorMessage?: string;
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
