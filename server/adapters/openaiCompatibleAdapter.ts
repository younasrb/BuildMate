import { BaseAdapter } from './baseAdapter.js';
import { ProviderId, ModelSpec, RouterRequest, UserKeys } from '../types/routerTypes.js';

export class OpenAICompatibleAdapter extends BaseAdapter {
  readonly id: ProviderId;
  readonly name: string;
  readonly defaultBaseUrl?: string;
  readonly models: ModelSpec[];

  constructor(id: ProviderId, name: string, defaultBaseUrl: string | undefined, models: ModelSpec[]) {
    super();
    this.id = id;
    this.name = name;
    this.defaultBaseUrl = defaultBaseUrl;
    this.models = models;
  }

  async testConnection(userKeys?: UserKeys): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const apiKey = this.getApiKey(userKeys);
    const baseUrl = this.getBaseUrl(userKeys);

    if (!apiKey && this.id !== 'ollama' && this.id !== 'lmstudio') {
      return { success: false, latencyMs: 0, error: `No API key provided for ${this.name}.` };
    }

    const start = Date.now();
    try {
      const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
      const testModel = this.models[0]?.id || 'gpt-4o-mini';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Special headers for OpenRouter
      if (this.id === 'openrouter') {
        headers['HTTP-Referer'] = 'https://buildmate.ai';
        headers['X-Title'] = 'BuildMate AI Studio';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: 'user', content: 'Ping test' }],
          max_tokens: 5,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return {
          success: false,
          latencyMs: Date.now() - start,
          error: `HTTP ${res.status}: ${errorText.substring(0, 150)}`,
        };
      }

      return { success: true, latencyMs: Date.now() - start };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        error: err?.message || `Connection failed to ${this.name}`,
      };
    }
  }

  async executeChat(req: RouterRequest, modelId: string, userKeys?: UserKeys): Promise<{
    reply: string;
    inputTokens: number;
    outputTokens: number;
  }> {
    const apiKey = this.getApiKey(userKeys);
    const baseUrl = this.getBaseUrl(userKeys);

    if (!apiKey && this.id !== 'ollama' && this.id !== 'lmstudio') {
      throw new Error(`API Key for ${this.name} is missing.`);
    }

    const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

    const systemPrompt = req.systemPrompt || `You are "BuildMate AI", an expert AI Assistant designed by Younas Mengal. You respond in friendly Roman Urdu and English.`;

    const messages: { role: string; content: string }[] = [];
    messages.push({ role: 'system', content: systemPrompt });

    if (req.history && Array.isArray(req.history)) {
      for (const item of req.history) {
        if (item.text) {
          messages.push({
            role: item.role === 'user' ? 'user' : 'assistant',
            content: item.text,
          });
        }
      }
    }

    let userText = req.message || '';
    if (req.fileContext && req.fileContext.length > 0) {
      userText += '\n\n--- Attached Files ---\n';
      for (const f of req.fileContext) {
        userText += `File: ${f.name}\n${f.content}\n`;
      }
    }

    messages.push({ role: 'user', content: userText });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    if (this.id === 'openrouter') {
      headers['HTTP-Referer'] = 'https://buildmate.ai';
      headers['X-Title'] = 'BuildMate AI Studio';
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelId,
        messages,
        temperature: req.temperature || 0.7,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Provider ${this.name} returned HTTP ${res.status}: ${errBody.substring(0, 200)}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || 'No response text received.';

    const inputTokens = data.usage?.prompt_tokens || Math.ceil(userText.length / 4);
    const outputTokens = data.usage?.completion_tokens || Math.ceil(reply.length / 4);

    return {
      reply,
      inputTokens,
      outputTokens,
    };
  }
}
