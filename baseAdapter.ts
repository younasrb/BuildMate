import { BaseAdapter } from './adapters/baseAdapter.js';
import { GeminiAdapter } from './adapters/geminiAdapter.js';
import { OpenAICompatibleAdapter } from './adapters/openaiCompatibleAdapter.js';
import { AnthropicAdapter } from './adapters/anthropicAdapter.js';
import {
  ProviderId,
  ModelCategory,
  RoutingStrategy,
  RouterRequest,
  RouterResponse,
  ApiLogEntry,
  ModelSpec,
  UserKeys,
} from './types/routerTypes.js';

export class IntelligentRoutingEngine {
  private adapters: Map<ProviderId, BaseAdapter> = new Map();
  private roundRobinIndex = 0;
  private apiLogs: ApiLogEntry[] = [];
  private healthCache: Map<ProviderId, { status: string; latencyMs: number; lastChecked: number }> = new Map();

  constructor() {
    this.registerAdapters();
  }

  private registerAdapters() {
    // 1. Gemini
    this.adapters.set('gemini', new GeminiAdapter());

    // 2. OpenAI
    this.adapters.set(
      'openai',
      new OpenAICompatibleAdapter('openai', 'OpenAI', 'https://api.openai.com/v1', [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', category: 'Fast', contextWindow: '128K', costPer1kInputTokenUsd: 0.00015, costPer1kOutputTokenUsd: 0.0006, benchmarkScore: 91 },
        { id: 'gpt-4o', name: 'GPT-4o', category: 'Balanced', contextWindow: '128K', costPer1kInputTokenUsd: 0.0025, costPer1kOutputTokenUsd: 0.01, benchmarkScore: 97 },
        { id: 'o3-mini', name: 'o3-mini Reasoning', category: 'Reasoning', contextWindow: '200K', costPer1kInputTokenUsd: 0.0011, costPer1kOutputTokenUsd: 0.0044, benchmarkScore: 98 },
      ])
    );

    // 3. Anthropic
    this.adapters.set('anthropic', new AnthropicAdapter());

    // 4. Groq
    this.adapters.set(
      'groq',
      new OpenAICompatibleAdapter('groq', 'Groq LPU', 'https://api.groq.com/openai/v1', [
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', category: 'Fast', contextWindow: '128K', costPer1kInputTokenUsd: 0.00059, costPer1kOutputTokenUsd: 0.00079, benchmarkScore: 93 },
        { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B', category: 'Reasoning', contextWindow: '128K', costPer1kInputTokenUsd: 0.00075, costPer1kOutputTokenUsd: 0.00099, benchmarkScore: 95 },
      ])
    );

    // 5. DeepSeek
    this.adapters.set(
      'deepseek',
      new OpenAICompatibleAdapter('deepseek', 'DeepSeek AI', 'https://api.deepseek.com/v1', [
        { id: 'deepseek-chat', name: 'DeepSeek V3', category: 'Balanced', contextWindow: '64K', costPer1kInputTokenUsd: 0.00014, costPer1kOutputTokenUsd: 0.00028, benchmarkScore: 95 },
        { id: 'deepseek-reasoner', name: 'DeepSeek R1', category: 'Reasoning', contextWindow: '64K', costPer1kInputTokenUsd: 0.00055, costPer1kOutputTokenUsd: 0.00219, benchmarkScore: 98 },
      ])
    );

    // 6. OpenRouter
    this.adapters.set(
      'openrouter',
      new OpenAICompatibleAdapter('openrouter', 'OpenRouter Aggregator', 'https://openrouter.ai/api/v1', [
        { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash via OpenRouter', category: 'Fast', contextWindow: '1M', costPer1kInputTokenUsd: 0.000075, costPer1kOutputTokenUsd: 0.0003, benchmarkScore: 92 },
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet via OpenRouter', category: 'Premium', contextWindow: '200K', costPer1kInputTokenUsd: 0.003, costPer1kOutputTokenUsd: 0.015, benchmarkScore: 98 },
      ])
    );

    // 7. Together AI
    this.adapters.set(
      'together',
      new OpenAICompatibleAdapter('together', 'Together AI', 'https://api.together.xyz/v1', [
        { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B Turbo', category: 'Fast', contextWindow: '128K', costPer1kInputTokenUsd: 0.00088, costPer1kOutputTokenUsd: 0.00088, benchmarkScore: 92 },
        { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B', category: 'Coding', contextWindow: '32K', costPer1kInputTokenUsd: 0.0008, costPer1kOutputTokenUsd: 0.0008, benchmarkScore: 94 },
      ])
    );

    // 8. Ollama Local
    this.adapters.set(
      'ollama',
      new OpenAICompatibleAdapter('ollama', 'Ollama (Local)', 'http://localhost:11434/v1', [
        { id: 'llama3', name: 'Llama 3 Local', category: 'Fast', contextWindow: '8K', costPer1kInputTokenUsd: 0, costPer1kOutputTokenUsd: 0, benchmarkScore: 85 },
        { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder Local', category: 'Coding', contextWindow: '16K', costPer1kInputTokenUsd: 0, costPer1kOutputTokenUsd: 0, benchmarkScore: 88 },
      ])
    );

    // 9. LM Studio Local
    this.adapters.set(
      'lmstudio',
      new OpenAICompatibleAdapter('lmstudio', 'LM Studio (Local)', 'http://localhost:1234/v1', [
        { id: 'local-model', name: 'LM Studio Model', category: 'Balanced', contextWindow: '8K', costPer1kInputTokenUsd: 0, costPer1kOutputTokenUsd: 0, benchmarkScore: 86 },
      ])
    );

    // 10. Custom OpenAI Endpoint
    this.adapters.set(
      'custom_openai',
      new OpenAICompatibleAdapter('custom_openai', 'Custom OpenAI Endpoint', 'https://api.openai.com/v1', [
        { id: 'custom-model', name: 'Custom OpenAI Model', category: 'Balanced', contextWindow: '32K', costPer1kInputTokenUsd: 0.001, costPer1kOutputTokenUsd: 0.002, benchmarkScore: 90 },
      ])
    );
  }

  public getAdapter(id: ProviderId): BaseAdapter | undefined {
    return this.adapters.get(id);
  }

  public getAllAdapters(): BaseAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Build a fresh (non-registered, per-request) adapter for each custom
   * provider the user has added. These aren't stored in `this.adapters`
   * because the engine is a shared singleton across all users/requests —
   * each user can have a completely different set of custom providers.
   */
  public buildCustomAdapters(req: RouterRequest): BaseAdapter[] {
    const configs = req.userKeys?.customProviders;
    if (!configs || configs.length === 0) return [];

    return configs
      .filter((c) => c && c.id && c.apiKey && c.baseUrl)
      .map(
        (c) =>
          new OpenAICompatibleAdapter(
            c.id,
            c.name || 'Custom API',
            c.baseUrl,
            [
              {
                id: c.modelId || 'gpt-4o-mini',
                name: c.modelId || 'Custom Model',
                category: 'Balanced',
                contextWindow: 'Unknown',
                costPer1kInputTokenUsd: 0,
                costPer1kOutputTokenUsd: 0,
                benchmarkScore: 85,
              },
            ],
            c.apiKey,
            c.baseUrl
          )
      );
  }

  /**
   * Filter available adapters matching enabled state and user keys
   */
  public getEligibleAdapters(req: RouterRequest): BaseAdapter[] {
    const list: BaseAdapter[] = [];
    for (const [id, adapter] of this.adapters.entries()) {
      if (req.enabledProviders && req.enabledProviders[id] === false) {
        continue;
      }
      if (adapter.isAvailable(req.userKeys)) {
        list.push(adapter);
      }
    }
    for (const adapter of this.buildCustomAdapters(req)) {
      if (req.enabledProviders && req.enabledProviders[adapter.id] === false) {
        continue;
      }
      if (adapter.isAvailable(req.userKeys)) {
        list.push(adapter);
      }
    }
    return list;
  }

  /**
   * Select best model for a provider and requested logical category
   */
  public selectModelForProvider(adapter: BaseAdapter, category: ModelCategory, req: RouterRequest): ModelSpec {
    if (req.manualModel && adapter.models.some((m) => m.id === req.manualModel)) {
      return adapter.models.find((m) => m.id === req.manualModel)!;
    }

    const matchingCategory = adapter.models.filter((m) => m.category === category);
    if (matchingCategory.length > 0) {
      return matchingCategory[0];
    }

    return adapter.models[0];
  }

  /**
   * Determine candidate provider order based on strategy
   */
  public determineCandidateOrder(req: RouterRequest): BaseAdapter[] {
    const eligible = this.getEligibleAdapters(req);

    if (eligible.length === 0) {
      // Fallback: use Gemini if registered
      const gemini = this.adapters.get('gemini');
      return gemini ? [gemini] : Array.from(this.adapters.values());
    }

    const strategy = req.strategy || 'auto';
    const category = req.category || 'Balanced';

    // 1. Manual Provider
    if (strategy === 'manual' && req.manualProvider) {
      const manualAdapter = this.adapters.get(req.manualProvider);
      if (manualAdapter) {
        const remaining = eligible.filter((a) => a.id !== req.manualProvider);
        return [manualAdapter, ...remaining];
      }
    }

    // 2. User Priority Order
    if (strategy === 'priority' && req.providerPriorities && req.providerPriorities.length > 0) {
      const ordered: BaseAdapter[] = [];
      for (const pId of req.providerPriorities) {
        const found = eligible.find((a) => a.id === pId);
        if (found) ordered.push(found);
      }
      for (const a of eligible) {
        if (!ordered.includes(a)) ordered.push(a);
      }
      return ordered;
    }

    // 3. Cheapest Provider Strategy
    if (strategy === 'cheapest') {
      return [...eligible].sort((a, b) => {
        const modelA = this.selectModelForProvider(a, category, req);
        const modelB = this.selectModelForProvider(b, category, req);
        return modelA.costPer1kInputTokenUsd - modelB.costPer1kInputTokenUsd;
      });
    }

    // 4. Best Quality Strategy
    if (strategy === 'quality') {
      return [...eligible].sort((a, b) => {
        const modelA = this.selectModelForProvider(a, category, req);
        const modelB = this.selectModelForProvider(b, category, req);
        return modelB.benchmarkScore - modelA.benchmarkScore;
      });
    }

    // 5. Fastest Strategy
    if (strategy === 'fastest') {
      return [...eligible].sort((a, b) => {
        const latA = this.healthCache.get(a.id)?.latencyMs || 200;
        const latB = this.healthCache.get(b.id)?.latencyMs || 200;
        return latA - latB;
      });
    }

    // 6. Round Robin Strategy
    if (strategy === 'round-robin') {
      this.roundRobinIndex = (this.roundRobinIndex + 1) % eligible.length;
      const primary = eligible[this.roundRobinIndex];
      const others = eligible.filter((_, idx) => idx !== this.roundRobinIndex);
      return [primary, ...others];
    }

    // Default: Auto Smart Strategy
    // Gemini, OpenAI, Claude, Groq in healthy priority
    const priorityList: ProviderId[] = ['gemini', 'openai', 'anthropic', 'groq', 'deepseek', 'openrouter', 'together', 'ollama'];
    return [...eligible].sort((a, b) => {
      const idxA = priorityList.indexOf(a.id);
      const idxB = priorityList.indexOf(b.id);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }

  /**
   * Main Route Chat execution with Intelligent Fallback & Retries
   */
  public async routeChat(req: RouterRequest): Promise<RouterResponse> {
    const candidates = this.determineCandidateOrder(req);
    const category = req.category || 'Balanced';
    const strategy = req.strategy || 'auto';

    const startTime = Date.now();
    const fallbackChain: ProviderId[] = [];
    let lastError: string | null = null;

    for (let i = 0; i < candidates.length; i++) {
      const adapter = candidates[i];
      const selectedModel = this.selectModelForProvider(adapter, category, req);

      try {
        const execStart = Date.now();
        const result = await adapter.executeChat(req, selectedModel.id, req.userKeys);
        const latencyMs = Date.now() - execStart;

        // Calculate Cost
        const costInput = (result.inputTokens / 1000) * selectedModel.costPer1kInputTokenUsd;
        const costOutput = (result.outputTokens / 1000) * selectedModel.costPer1kOutputTokenUsd;
        const totalCostUsd = parseFloat((costInput + costOutput).toFixed(6));

        // Cache positive health status
        this.healthCache.set(adapter.id, {
          status: 'online',
          latencyMs,
          lastChecked: Date.now(),
        });

        // Log entry
        const logEntry: ApiLogEntry = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          category,
          provider: adapter.id,
          model: selectedModel.id,
          latencyMs,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          totalTokens: result.inputTokens + result.outputTokens,
          estimatedCostUsd: totalCostUsd,
          status: fallbackChain.length > 0 ? 'fallback' : 'success',
          fallbackChain: fallbackChain.length > 0 ? [...fallbackChain] : undefined,
        };
        this.apiLogs.unshift(logEntry);
        if (this.apiLogs.length > 500) this.apiLogs.pop();

        return {
          reply: result.reply,
          providerUsed: adapter.id,
          modelUsed: selectedModel.id,
          category,
          strategyUsed: strategy,
          latencyMs,
          tokensUsed: {
            input: result.inputTokens,
            output: result.outputTokens,
            total: result.inputTokens + result.outputTokens,
          },
          estimatedCostUsd: totalCostUsd,
          fallbackChain: fallbackChain.length > 0 ? fallbackChain : undefined,
          isFallback: fallbackChain.length > 0,
          status: 'success',
        };
      } catch (err: any) {
        console.warn(`[Router Engine] Provider ${adapter.id} failed: ${err?.message || err}. Attempting failover...`);
        fallbackChain.push(adapter.id);
        lastError = err?.message || 'Unknown provider execution error';

        this.healthCache.set(adapter.id, {
          status: 'degraded',
          latencyMs: 9999,
          lastChecked: Date.now(),
        });

        // Continue to next candidate in failover chain
      }
    }

    // If all candidates failed, record error log
    const errLog: ApiLogEntry = {
      id: `err-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category,
      provider: candidates[0]?.id || 'gemini',
      model: 'unknown',
      latencyMs: Date.now() - startTime,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      status: 'failed',
      errorMessage: lastError || 'All AI Providers failed or timed out.',
    };
    this.apiLogs.unshift(errLog);

    // If all candidates failed (or none were configured/eligible at all), return a real
    // error instead of a fabricated "successful" reply — the caller needs to know no
    // provider actually handled the request.
    const noneConfigured = candidates.length === 0;
    return {
      reply: '',
      providerUsed: candidates[0]?.id || 'gemini',
      modelUsed: 'none',
      category,
      strategyUsed: strategy,
      latencyMs: Date.now() - startTime,
      tokensUsed: { input: 0, output: 0, total: 0 },
      estimatedCostUsd: 0,
      fallbackChain: fallbackChain.length > 0 ? fallbackChain : undefined,
      status: 'error',
      errorMessage: noneConfigured
        ? 'No AI provider is configured. Please add an API key in Settings.'
        : lastError || 'All configured AI providers failed to respond.',
      noProviderAvailable: true,
    };
  }

  /**
   * Run health test for single provider
   */
  public async testProviderConnection(providerId: ProviderId, userKeys?: UserKeys) {
    let adapter = this.adapters.get(providerId);
    if (!adapter && userKeys?.customProviders) {
      adapter = this.buildCustomAdapters({ message: '', userKeys } as RouterRequest).find((a) => a.id === providerId);
    }
    if (!adapter) {
      return { providerId, success: false, latencyMs: 0, message: 'Provider adapter not found.', testedAt: new Date().toISOString() };
    }

    const res = await adapter.testConnection(userKeys);
    this.healthCache.set(providerId, {
      status: res.success ? 'online' : 'degraded',
      latencyMs: res.latencyMs,
      lastChecked: Date.now(),
    });

    return {
      providerId,
      success: res.success,
      latencyMs: res.latencyMs,
      message: res.success ? 'Connected successfully' : res.error || 'Connection failed',
      testedAt: new Date().toISOString(),
    };
  }

  /**
   * Returns Analytics Metrics for Admin Dashboard
   */
  public getAnalyticsMetrics(userKeys?: UserKeys) {
    const totalRequests = this.apiLogs.length;
    const successfulRequests = this.apiLogs.filter((l) => l.status === 'success' || l.status === 'fallback').length;
    const failedRequests = this.apiLogs.filter((l) => l.status === 'failed').length;
    const fallbackCount = this.apiLogs.filter((l) => l.status === 'fallback').length;

    let totalTokens = 0;
    let totalCostUsd = 0;
    let totalLatency = 0;

    const modelCounts: Record<string, { count: number; provider: string }> = {};

    for (const log of this.apiLogs) {
      totalTokens += log.totalTokens;
      totalCostUsd += log.estimatedCostUsd;
      totalLatency += log.latencyMs;

      const key = `${log.provider}:${log.model}`;
      if (!modelCounts[key]) {
        modelCounts[key] = { count: 0, provider: log.provider };
      }
      modelCounts[key].count += 1;
    }

    const topUsedModels = Object.entries(modelCounts)
      .map(([key, val]) => ({
        model: key.split(':')[1] || key,
        provider: val.provider,
        count: val.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const providerHealth: Record<string, any> = {};
    let activeProvidersCount = 0;

    for (const [id, adapter] of this.adapters.entries()) {
      const isAvail = adapter.isAvailable(userKeys);
      if (isAvail) activeProvidersCount++;

      const cache = this.healthCache.get(id);
      providerHealth[id] = {
        status: isAvail ? cache?.status || 'online' : 'untested',
        latencyMs: cache?.latencyMs || 0,
        configured: isAvail,
      };
    }

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      fallbackCount,
      totalTokens,
      totalCostUsd: parseFloat(totalCostUsd.toFixed(5)),
      avgLatencyMs: totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 0,
      activeProvidersCount,
      topUsedModels,
      providerHealth,
      recentLogs: this.apiLogs.slice(0, 50),
    };
  }

  /**
   * Reset analytics logs
   */
  public resetAnalytics() {
    this.apiLogs = [];
  }
}

// Export singleton instance
export const routingEngine = new IntelligentRoutingEngine();
