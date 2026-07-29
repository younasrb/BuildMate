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
  | 'custom_openai'
  | (string & {}); // also allow arbitrary ids for user-added custom providers

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

/**
 * A user-added custom OpenAI-compatible API endpoint. A user can add any
 * number of these (their own proxy, a self-hosted model, any provider that
 * speaks the OpenAI /chat/completions format).
 */
export interface CustomProviderConfig {
  id: string;         // unique id, e.g. "custom_1706000000000"
  name: string;        // display name the user gave it
  apiKey: string;
  baseUrl: string;
  modelId?: string;    // model id to send in requests; defaults to a generic chat model id
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
  customProviders?: CustomProviderConfig[];
  pexelsKey?: string;
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
  noProviderAvailable?: boolean;
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
