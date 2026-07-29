import { GoogleGenAI } from '@google/genai';
import { BaseAdapter } from './baseAdapter.js';
import { ProviderId, ModelSpec, RouterRequest, UserKeys } from '../types/routerTypes.js';

export class GeminiAdapter extends BaseAdapter {
  readonly id: ProviderId = 'gemini';
  readonly name = 'Google Gemini AI';
  readonly defaultBaseUrl = 'https://generativelanguage.googleapis.com';

  readonly models: ModelSpec[] = [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      category: 'Fast',
      contextWindow: '1M Tokens',
      costPer1kInputTokenUsd: 0.000075,
      costPer1kOutputTokenUsd: 0.0003,
      benchmarkScore: 92,
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      category: 'Balanced',
      contextWindow: '2M Tokens',
      costPer1kInputTokenUsd: 0.00125,
      costPer1kOutputTokenUsd: 0.005,
      benchmarkScore: 96,
    },
    {
      id: 'gemini-2.5-flash-lite',
      name: 'Gemini 2.5 Flash Lite',
      category: 'Fast',
      contextWindow: '1M Tokens',
      costPer1kInputTokenUsd: 0.0000375,
      costPer1kOutputTokenUsd: 0.00015,
      benchmarkScore: 88,
    },
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      category: 'Coding',
      contextWindow: '1M Tokens',
      costPer1kInputTokenUsd: 0.000075,
      costPer1kOutputTokenUsd: 0.0003,
      benchmarkScore: 91,
    }
  ];

  async testConnection(userKeys?: UserKeys): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const apiKey = this.getApiKey(userKeys);
    if (!apiKey) {
      return { success: false, latencyMs: 0, error: 'No Gemini API Key provided.' };
    }

    const start = Date.now();
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Ping',
      });
      const latencyMs = Date.now() - start;
      return { success: true, latencyMs };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        error: err?.message || 'Failed to ping Gemini API',
      };
    }
  }

  async executeChat(req: RouterRequest, modelId: string, userKeys?: UserKeys): Promise<{
    reply: string;
    inputTokens: number;
    outputTokens: number;
  }> {
    const apiKey = this.getApiKey(userKeys);
    if (!apiKey) {
      throw new Error('Gemini API key is not configured.');
    }

    const systemPrompt = req.systemPrompt || `You are "BuildMate AI", an expert AI Assistant designed by Younas Mengal. You respond in friendly Roman Urdu and English.`;

    const contents: any[] = [];

    if (req.history && Array.isArray(req.history)) {
      for (const item of req.history) {
        if (item.text) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
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

    contents.push({
      role: 'user',
      parts: [{ text: userText }],
    });

    let responseText = '';
    const modelsToTry = [modelId, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastModelError: string | null = null;

    const geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    for (const mId of modelsToTry) {
      try {
        const res = await geminiClient.models.generateContent({
          model: mId,
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: req.temperature || 0.7,
          },
        });
        if (res && res.text) {
          responseText = res.text;
          break;
        }
      } catch (mErr: any) {
        lastModelError = mErr?.message || String(mErr);
        console.warn(`[GeminiAdapter] Model ${mId} attempt failed: ${lastModelError}`);
      }
    }

    // Every model attempt failed (or returned empty) — surface a real error instead of
    // faking a "successful" reply, so the router's failover/error handling actually runs.
    if (!responseText) {
      throw new Error(lastModelError || 'Gemini API did not return a response.');
    }

    const inputEstimate = Math.ceil(userText.length / 4) + 100;
    const outputEstimate = Math.ceil(responseText.length / 4);

    return {
      reply: responseText,
      inputTokens: inputEstimate,
      outputTokens: outputEstimate,
    };
  }
}


