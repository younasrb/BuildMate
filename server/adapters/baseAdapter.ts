import { ProviderId, RouterRequest, RouterResponse, ModelSpec, UserKeys } from '../types/routerTypes.js';

export abstract class BaseAdapter {
  abstract readonly id: ProviderId;
  abstract readonly name: string;
  abstract readonly defaultBaseUrl?: string;
  abstract readonly models: ModelSpec[];

  /**
   * Resolves the API key to use (User custom key or environment fallback)
   */
  protected getApiKey(userKeys?: UserKeys): string | undefined {
    if (userKeys && userKeys[this.id as keyof UserKeys]) {
      const val = userKeys[this.id as keyof UserKeys];
      if (typeof val === 'string' && val.trim()) {
        return val.trim();
      }
    }

    // Environment key fallbacks
    switch (this.id) {
      case 'gemini':
        return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      case 'openai':
        return process.env.OPENAI_API_KEY;
      case 'anthropic':
        return process.env.ANTHROPIC_API_KEY;
      case 'groq':
        return process.env.GROQ_API_KEY;
      case 'deepseek':
        return process.env.DEEPSEEK_API_KEY;
      case 'openrouter':
        return process.env.OPENROUTER_API_KEY;
      case 'together':
        return process.env.TOGETHER_API_KEY;
      case 'custom_openai':
        return userKeys?.customOpenaiKey || process.env.CUSTOM_OPENAI_API_KEY;
      default:
        return undefined;
    }
  }

  /**
   * Resolves base URL for local / custom servers like Ollama or LM Studio
   */
  protected getBaseUrl(userKeys?: UserKeys): string {
    if (this.id === 'ollama') {
      return userKeys?.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    }
    if (this.id === 'lmstudio') {
      return userKeys?.lmstudioBaseUrl || process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234';
    }
    if (this.id === 'custom_openai') {
      return userKeys?.customOpenaiBaseUrl || process.env.CUSTOM_OPENAI_BASE_URL || 'https://api.openai.com';
    }
    return this.defaultBaseUrl || '';
  }

  /**
   * Check if provider is available to take requests
   */
  public isAvailable(userKeys?: UserKeys): boolean {
    if (this.id === 'ollama') {
      return Boolean(userKeys?.ollamaBaseUrl || process.env.OLLAMA_BASE_URL);
    }
    if (this.id === 'lmstudio') {
      return Boolean(userKeys?.lmstudioBaseUrl || process.env.LMSTUDIO_BASE_URL);
    }
    const key = this.getApiKey(userKeys);
    return Boolean(key && key.length > 3);
  }

  /**
   * Test connection & measure latency
   */
  abstract testConnection(userKeys?: UserKeys): Promise<{ success: boolean; latencyMs: number; error?: string }>;

  /**
   * Execute chat completion
   */
  abstract executeChat(req: RouterRequest, modelId: string, userKeys?: UserKeys): Promise<{
    reply: string;
    inputTokens: number;
    outputTokens: number;
  }>;
}
