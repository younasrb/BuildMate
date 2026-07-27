import { BaseAdapter } from './baseAdapter.js';
import { ProviderId, ModelSpec, RouterRequest, UserKeys } from '../types/routerTypes.js';

export class AnthropicAdapter extends BaseAdapter {
  readonly id: ProviderId = 'anthropic';
  readonly name = 'Anthropic Claude';
  readonly defaultBaseUrl = 'https://api.anthropic.com/v1';

  readonly models: ModelSpec[] = [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      category: 'Balanced',
      contextWindow: '200K Tokens',
      costPer1kInputTokenUsd: 0.003,
      costPer1kOutputTokenUsd: 0.015,
      benchmarkScore: 98,
    },
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      category: 'Fast',
      contextWindow: '200K Tokens',
      costPer1kInputTokenUsd: 0.0008,
      costPer1kOutputTokenUsd: 0.004,
      benchmarkScore: 92,
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      category: 'Premium',
      contextWindow: '200K Tokens',
      costPer1kInputTokenUsd: 0.015,
      costPer1kOutputTokenUsd: 0.075,
      benchmarkScore: 97,
    }
  ];

  async testConnection(userKeys?: UserKeys): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const apiKey = this.getApiKey(userKeys);
    if (!apiKey) {
      return { success: false, latencyMs: 0, error: 'No Anthropic API Key provided.' };
    }

    const start = Date.now();
    try {
      const res = await fetch(`${this.defaultBaseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Ping' }],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return { success: false, latencyMs: Date.now() - start, error: err.substring(0, 150) };
      }

      return { success: true, latencyMs: Date.now() - start };
    } catch (err: any) {
      return { success: false, latencyMs: Date.now() - start, error: err?.message || 'Anthropic connection failed' };
    }
  }

  async executeChat(req: RouterRequest, modelId: string, userKeys?: UserKeys): Promise<{
    reply: string;
    inputTokens: number;
    outputTokens: number;
  }> {
    const apiKey = this.getApiKey(userKeys);
    if (!apiKey) {
      throw new Error('Anthropic API key is not configured.');
    }

    const systemPrompt = req.systemPrompt || `You are "BuildMate AI", an expert AI Assistant designed by Younas Mengal. Respond in friendly Roman Urdu and English.`;

    const messages: { role: string; content: string }[] = [];

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

    const res = await fetch(`${this.defaultBaseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        system: systemPrompt,
        max_tokens: 4096,
        messages,
        temperature: req.temperature || 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic returned HTTP ${res.status}: ${err.substring(0, 200)}`);
    }

    const data = await res.json();
    const reply = data.content?.[0]?.text || 'No response text received from Claude.';

    const inputTokens = data.usage?.input_tokens || Math.ceil(userText.length / 4);
    const outputTokens = data.usage?.output_tokens || Math.ceil(reply.length / 4);

    return {
      reply,
      inputTokens,
      outputTokens,
    };
  }
}
