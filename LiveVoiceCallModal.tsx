import express, { Express } from 'express';
import dotenv from 'dotenv';
import { routingEngine } from './routingEngine.js';
import { ProviderId, ModelCategory, RoutingStrategy } from './types/routerTypes.js';

dotenv.config();

/**
 * Looks up a relevant stock photo for a slide's visual prompt using the Pexels API
 * (free, no attribution required). Returns a direct image URL, or null if no key is
 * configured or the search fails — callers must treat this as a soft/optional feature,
 * never block presentation generation on it.
 */
async function searchPexelsImage(query: string, apiKey?: string): Promise<string | null> {
  const key = apiKey || process.env.PEXELS_API_KEY;
  if (!key || !query || !query.trim()) return null;

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query.trim())}&per_page=1&orientation=landscape`;
    const res = await fetch(url, { headers: { Authorization: key } });
    if (!res.ok) return null;
    const data: any = await res.json();
    const photo = data?.photos?.[0];
    return photo?.src?.large || photo?.src?.landscape || photo?.src?.original || null;
  } catch (err: any) {
    console.warn('[Pexels Image Search] Failed:', err?.message || err);
    return null;
  }
}

/**
 * Builds and returns the fully configured Express app with every
 * BuildMate AI API route registered. Shared by:
 *  - server.ts        (local `npm run dev` / traditional Node hosting)
 *  - api/index.ts      (Vercel Serverless Function entry point)
 *
 * No `app.listen()` or Vite/static middleware is attached here so this
 * module stays runtime-agnostic (works in both a long-running Node
 * process and a stateless serverless function).
 */
export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Simple admin-only guard for the analytics dashboard (view usage logs / reset them).
  // This has nothing to do with AI usage limits — it only stops random visitors from
  // viewing or wiping the operator's analytics data. If ADMIN_PASSWORD isn't set, the
  // dashboard stays open (dev-friendly default) but a warning is logged once at boot.
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) {
    console.warn('[Security] ADMIN_PASSWORD is not set — the /api/v1/analytics dashboard is currently open to anyone. Set ADMIN_PASSWORD in your environment to protect it.');
  }
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!ADMIN_PASSWORD) return next(); // no password configured -> leave as-is
    const provided = req.header('x-admin-key');
    if (provided && provided === ADMIN_PASSWORD) return next();
    return res.status(401).json({ error: 'Unauthorized. Admin password required.' });
  };

  // Health check API
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'BuildMate AI Enterprise Custom API & Router',
      timestamp: new Date().toISOString(),
      hasKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  /* ==========================================================================
     V1 ENTERPRISE CUSTOM API & INTELLIGENT ROUTER ENDPOINTS
     ========================================================================== */

  // 1. Primary Chat Router Proxy
  app.post('/api/v1/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        systemPrompt,
        fileContext,
        category = 'Balanced',
        strategy = 'auto',
        manualProvider,
        manualModel,
        userKeys,
        enabledProviders,
        providerPriorities,
        temperature = 0.7,
      } = req.body;

      if (!message && (!fileContext || fileContext.length === 0)) {
        return res.status(400).json({ error: 'Message or file content is required.' });
      }

      const defaultSystemPrompt = `You are "BuildMate AI", an expert AI Development Assistant designed by Younas Mengal.
You are fluent in both Roman Urdu (e.g. "Assalam-o-Alaikum, main aap ki kya madad kar sakta hun?") and English.
You assist developers, students, and professionals with:
- Generating clean reports, PDFs, presentations, and code in Python, React, C++, HTML/CSS, JS, etc.
- Document summarization, bug fixing, text translation, and data analysis.
- Always provide clear, beautifully formatted Markdown responses.
- When asked in Roman Urdu, respond primarily in helpful, friendly Roman Urdu mixed with clear technical English terms.
- When asked in English, respond in polished professional English with optional friendly greetings.`;

      const result = await routingEngine.routeChat({
        message,
        history,
        systemPrompt: systemPrompt || defaultSystemPrompt,
        fileContext,
        category: category as ModelCategory,
        strategy: strategy as RoutingStrategy,
        manualProvider: manualProvider as ProviderId,
        manualModel,
        userKeys,
        enabledProviders,
        providerPriorities,
        temperature,
      });

      if (result.status === 'error' || result.noProviderAvailable) {
        return res.status(503).json({
          error: result.errorMessage || 'No AI provider is configured or all providers failed.',
          noProviderAvailable: true,
        });
      }

      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/v1/chat:', error);
      res.status(500).json({
        error: error?.message || 'An error occurred in Custom API Router Proxy.',
      });
    }
  });

  // 2. Backward Compatibility Chat Proxy
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history = [], systemPrompt, fileContext, userKeys, model } = req.body;

      // Determine model category based on model string if provided
      let category: ModelCategory = 'Balanced';
      if (model?.includes('flash')) category = 'Fast';

      const result = await routingEngine.routeChat({
        message,
        history,
        systemPrompt,
        fileContext,
        category,
        strategy: 'auto',
        userKeys,
      });

      if (result.status === 'error' || result.noProviderAvailable) {
        return res.status(503).json({
          error: result.errorMessage || 'No AI provider is configured or all providers failed.',
          noProviderAvailable: true,
        });
      }

      res.json({
        reply: result.reply,
        modelUsed: result.modelUsed,
        providerUsed: result.providerUsed,
        status: 'success',
        latencyMs: result.latencyMs,
        tokensUsed: result.tokensUsed,
        estimatedCostUsd: result.estimatedCostUsd,
      });
    } catch (error: any) {
      console.error('Error in /api/chat:', error);
      res.status(500).json({
        error: error?.message || 'An error occurred while generating response.',
      });
    }
  });

  // 3. Provider List & Status Endpoint
  // POST (not GET+query) so any userKeys passed in aren't leaked into URLs,
  // server access logs, browser history, or proxy logs.
  app.post('/api/v1/providers', (req, res) => {
    const userKeys = req.body?.userKeys;
    const adapters = routingEngine.getAllAdapters();
    const customAdapters = routingEngine.buildCustomAdapters({ message: '', userKeys } as any);

    const providerList = [...adapters, ...customAdapters].map((a) => ({
      id: a.id,
      name: a.name,
      isConfigured: a.isAvailable(userKeys),
      models: a.models,
      custom: customAdapters.includes(a),
    }));

    res.json({ success: true, providers: providerList });
  });

  // Back-compat: GET without keys (env-configured providers only, no key leakage risk)
  app.get('/api/v1/providers', (_req, res) => {
    const adapters = routingEngine.getAllAdapters();
    const providerList = adapters.map((a) => ({
      id: a.id,
      name: a.name,
      isConfigured: a.isAvailable(undefined),
      models: a.models,
    }));
    res.json({ success: true, providers: providerList });
  });

  // 4. Test Single Provider Connection
  app.post('/api/v1/providers/test', async (req, res) => {
    try {
      const { providerId, userKeys } = req.body;
      if (!providerId) {
        return res.status(400).json({ error: 'providerId is required' });
      }

      const result = await routingEngine.testProviderConnection(providerId as ProviderId, userKeys);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to test provider connection.' });
    }
  });

  // 5. Admin Analytics Metrics Endpoint
  app.get('/api/v1/analytics', requireAdmin, (req, res) => {
    const userKeys = req.query.userKeys ? JSON.parse(req.query.userKeys as string) : undefined;
    const analytics = routingEngine.getAnalyticsMetrics(userKeys);
    res.json({ success: true, analytics });
  });

  // 6. Admin Analytics Reset
  app.post('/api/v1/analytics/reset', requireAdmin, (_req, res) => {
    routingEngine.resetAnalytics();
    res.json({ success: true, message: 'Analytics logs reset successfully.' });
  });

  // Shared helper: pull a clean JSON object out of a raw LLM reply that may be
  // wrapped in markdown fences or have stray text around it.
  function extractJson(raw: string): any {
    let text = (raw || '').trim();
    text = text.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.slice(firstBrace, lastBrace + 1);
    }
    return JSON.parse(text);
  }

  /* ==========================================================================
     SPECIALIZED FEATURES (PDF, Presentation, Summarizer)
     ========================================================================== */

  // Specialized API: Structured PDF Content Generation
  app.post('/api/generate-pdf-content', async (req, res) => {
    const { topic = 'Report', instructions, language = 'English', userKeys } = req.body;
    const prompt = `Generate a structured document report for topic: "${topic}".
Instructions: ${instructions || 'Comprehensive report with executive summary, key findings, analysis, and recommendations.'}
Language preference: ${language}

Return ONLY a valid JSON object (no markdown fences, no commentary) with this exact shape:
{
  "title": "string", "subtitle": "string", "author": "string", "date": "string",
  "summary": "string",
  "sections": [ { "heading": "string", "content": "string", "bulletPoints": ["string"] } ],
  "conclusion": "string"
}
Include at least 3 sections. Escape all special characters correctly so the JSON parses cleanly.`;

    let pdfData: any = null;
    let noProviderAvailable = false;

    try {
      const result = await routingEngine.routeChat({ message: prompt, category: 'Balanced', strategy: 'auto', userKeys });
      if (result.status === 'error' || result.noProviderAvailable) {
        noProviderAvailable = true;
      } else {
        pdfData = extractJson(result.reply);
      }
    } catch (err: any) {
      console.warn('[PDF Generator] Failed:', err?.message || err);
    }

    // If generation truly failed (no key / all attempts failed), tell the truth
    // instead of silently returning generic placeholder content as a "success".
    if (!pdfData) {
      return res.status(503).json({
        success: false,
        noProviderAvailable,
        error: noProviderAvailable
          ? 'PDF content generate nahi ho saka — hamari taraf se shared/default API is waqt update nahi ki gayi hai. Apni khud ki API key bilkul free mein add kar ke enjoy karein.'
          : 'PDF content generate nahi ho saka. Dobara koshish karein.',
      });
    }

    res.json({ success: true, pdfData });
  });

  // Specialized API: Structured Presentation Generator
  app.post('/api/generate-presentation', async (req, res) => {
    const { topic = 'Presentation', slideCount = 5, audience = 'General', userKeys } = req.body;
    const prompt = `Create a professional presentation outline with ${slideCount} slides for topic: "${topic}". Target audience: ${audience}.

Each slide must use one of these exact layout values, chosen to fit the content (use variety, don't repeat the same layout every slide):
- "section_header": a divider slide with just a short section title, no bullets (use bulletPoints: [] or one subtitle-like line) — good for the 1st slide of a new section
- "bullet_list": standard title + 3-5 concise bullet points — the default for most content slides
- "two_column": title + bullet points that naturally split into two related groups (e.g. pros/cons, before/after) — put all points in bulletPoints, they'll be split evenly
- "quote": a single short powerful statement or quote as the only item in bulletPoints — good for emphasis slides
- "stat_highlight": bulletPoints[0] is a short bold number/stat (e.g. "73%"), bulletPoints[1] is a one-line caption explaining it

Return ONLY a valid JSON object (no markdown fences, no commentary) with this exact shape:
{
  "presentationTitle": "string", "presentationSubtitle": "string",
  "slides": [ { "slideNumber": 1, "title": "string", "layout": "section_header|bullet_list|two_column|quote|stat_highlight", "bulletPoints": ["string"], "speakerNotes": "string", "visualPrompt": "string" } ]
}
Include exactly ${slideCount} slides, starting with a "section_header" slide. Escape all special characters correctly so the JSON parses cleanly.`;

    let presentation: any = null;
    let noProviderAvailable = false;

    try {
      const result = await routingEngine.routeChat({ message: prompt, category: 'Balanced', strategy: 'auto', userKeys });
      if (result.status === 'error' || result.noProviderAvailable) {
        noProviderAvailable = true;
      } else {
        presentation = extractJson(result.reply);
      }
    } catch (err: any) {
      console.warn('[Presentation Generator] Failed:', err?.message || err);
    }

    // If generation truly failed, tell the truth instead of returning canned slides as "success".
    if (!presentation) {
      return res.status(503).json({
        success: false,
        noProviderAvailable,
        error: noProviderAvailable
          ? 'Presentation generate nahi ho saki — hamari taraf se shared/default API is waqt update nahi ki gayi hai. Apni khud ki API key bilkul free mein add kar ke enjoy karein.'
          : 'Presentation generate nahi ho saki. Dobara koshish karein.',
      });
    }

    // Best-effort: attach a real stock photo per slide from its visualPrompt.
    // Purely optional — if no Pexels key is configured (env or user's own), slides
    // just render without an image, exactly like before. Never blocks the response.
    const pexelsKey = userKeys?.pexelsKey;
    if (Array.isArray(presentation.slides) && (pexelsKey || process.env.PEXELS_API_KEY)) {
      await Promise.all(
        presentation.slides.map(async (slide: any) => {
          if (slide?.visualPrompt) {
            const imageUrl = await searchPexelsImage(slide.visualPrompt, pexelsKey);
            if (imageUrl) slide.imageUrl = imageUrl;
          }
        })
      );
    }

    res.json({ success: true, presentation });
  });

  // Specialized API: Summarize Document
  app.post('/api/summarize-document', async (req, res) => {
    const { textContent = '', filename = 'Document', userKeys } = req.body;
    const prompt = `Analyze and summarize the following document content from "${filename}":\n\n${textContent.substring(0, 4000)}

Return ONLY a valid JSON object (no markdown fences, no commentary) with this exact shape:
{
  "documentTitle": "string", "executiveSummary": "string",
  "keyTakeaways": ["string"],
  "mainTopics": [ { "topic": "string", "details": "string" } ],
  "actionItems": ["string"]
}
Escape all special characters correctly so the JSON parses cleanly.`;

    let summaryData: any = null;
    let noProviderAvailable = false;

    try {
      const result = await routingEngine.routeChat({ message: prompt, category: 'Balanced', strategy: 'auto', userKeys });
      if (result.status === 'error' || result.noProviderAvailable) {
        noProviderAvailable = true;
      } else {
        summaryData = extractJson(result.reply);
      }
    } catch (err: any) {
      console.warn('[Document Summarizer] Failed:', err?.message || err);
    }

    // If generation truly failed, tell the truth instead of returning a canned summary as "success".
    if (!summaryData) {
      return res.status(503).json({
        success: false,
        noProviderAvailable,
        error: noProviderAvailable
          ? 'Document summarize nahi ho saka — hamari taraf se shared/default API is waqt update nahi ki gayi hai. Apni khud ki API key bilkul free mein add kar ke enjoy karein.'
          : 'Document summarize nahi ho saka. Dobara koshish karein.',
      });
    }

    res.json({ success: true, summary: summaryData });
  });

  // Specialized API: Full Multi-File Project Generation
  app.post('/api/generate-project', async (req, res) => {
    const { topic = 'New Project', language = 'javascript', description = '', userKeys } = req.body;

    const prompt = `Generate a small, complete, working ${language} project for: "${topic}".
${description ? `Additional requirements: ${description}` : ''}
Return ONLY a valid JSON object (no markdown fences, no commentary) with this exact shape:
{
  "projectName": "short-kebab-case-name",
  "description": "one sentence summary of the project",
  "files": [
    { "path": "relative/file/path.ext", "content": "full file content as a string" }
  ]
}
Rules:
- Include 3 to 8 files that together form a working, runnable project (entry file, config/package file if relevant, README.md).
- Use realistic, production-quality code with comments.
- Escape all special characters correctly so the JSON parses cleanly.`;

    let project: any = null;
    let noProviderAvailable = false;

    try {
      const result = await routingEngine.routeChat({
        message: prompt,
        category: 'Coding',
        strategy: 'auto',
        userKeys,
      });

      if (result.status === 'error' || result.noProviderAvailable) {
        noProviderAvailable = true;
      } else {
        let raw = (result.reply || '').trim();
        // Strip markdown code fences if the model wrapped the JSON anyway
        raw = raw.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();

        const firstBrace = raw.indexOf('{');
        const lastBrace = raw.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          raw = raw.slice(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.files) && parsed.files.length > 0) {
          project = parsed;
        }
      }
    } catch (err: any) {
      console.warn('[Project Generator] Failed to parse structured project:', err?.message || err);
    }

    // If generation truly failed, tell the truth instead of returning a fake scaffold as "success".
    if (!project) {
      return res.status(503).json({
        success: false,
        noProviderAvailable,
        error: noProviderAvailable
          ? 'Project generate nahi ho saka — hamari taraf se shared/default API is waqt update nahi ki gayi hai. Apni khud ki API key bilkul free mein add kar ke enjoy karein.'
          : 'Project generate nahi ho saka. Dobara koshish karein.',
      });
    }

    res.json({ success: true, project });
  });

  // Auto Session Title Generation Endpoint
  app.post('/api/v1/generate-session-title', async (req, res) => {
    try {
      const { messages = [], userKeys } = req.body;
      const userText = messages
        .filter((m: any) => m.role === 'user')
        .map((m: any) => m.content)
        .slice(0, 3)
        .join(' | ');

      if (!userText || userText.trim().length === 0) {
        return res.json({ title: 'New Conversation' });
      }

      try {
        const result = await routingEngine.routeChat({
          message: `Generate a short, concise 3 to 5 word title for a chat session starting with this user prompt: "${userText.substring(0, 300)}". Rules: Return ONLY plain text title without quotes, colons, markdown, or period at the end.`,
          category: 'Fast',
          strategy: 'auto',
          userKeys,
        });

        const titleCandidate = (result.reply || '').replace(/["'#*`:.]/g, '').trim();
        if (titleCandidate && titleCandidate.length >= 3 && titleCandidate.length <= 60) {
          return res.json({ title: titleCandidate });
        }
      } catch (err) {
        console.warn('Session title LLM generation failed, using fallback:', err);
      }

      // Fallback title generation from user text
      const cleanFirstMsg = userText.split('|')[0].replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
      const words = cleanFirstMsg.split(/\s+/).filter(Boolean).slice(0, 5);
      const fallbackTitle = words.length > 0 
        ? words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
        : 'New Chat Session';

      res.json({ title: fallbackTitle });
    } catch (error: any) {
      res.json({ title: 'New Chat Session' });
    }
  });

  return app;
}
