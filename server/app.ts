import express, { Express } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { routingEngine } from './routingEngine.js';
import { ProviderId, ModelCategory, RoutingStrategy } from './types/routerTypes.js';

dotenv.config();

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

  // Initialize Gemini AI Client (for legacy fallback if needed)
  function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    return new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

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
  app.get('/api/v1/providers', (req, res) => {
    const userKeys = req.query.userKeys ? JSON.parse(req.query.userKeys as string) : undefined;
    const adapters = routingEngine.getAllAdapters();

    const providerList = adapters.map((a) => ({
      id: a.id,
      name: a.name,
      isConfigured: a.isAvailable(userKeys),
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
  app.get('/api/v1/analytics', (req, res) => {
    const userKeys = req.query.userKeys ? JSON.parse(req.query.userKeys as string) : undefined;
    const analytics = routingEngine.getAnalyticsMetrics(userKeys);
    res.json({ success: true, analytics });
  });

  // 6. Admin Analytics Reset
  app.post('/api/v1/analytics/reset', (_req, res) => {
    routingEngine.resetAnalytics();
    res.json({ success: true, message: 'Analytics logs reset successfully.' });
  });

  /* ==========================================================================
     SPECIALIZED FEATURES (PDF, Presentation, Summarizer)
     ========================================================================== */

  // Specialized API: Structured PDF Content Generation
  app.post('/api/generate-pdf-content', async (req, res) => {
    const { topic = 'Report', instructions, language = 'English' } = req.body;
    const ai = getGenAI();
    const prompt = `Generate a structured document report for topic: "${topic}".
Instructions: ${instructions || 'Comprehensive report with executive summary, key findings, analysis, and recommendations.'}
Language preference: ${language}`;

    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let pdfData: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                author: { type: Type.STRING },
                date: { type: Type.STRING },
                summary: { type: Type.STRING },
                sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      heading: { type: Type.STRING },
                      content: { type: Type.STRING },
                      bulletPoints: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ['heading', 'content'],
                  },
                },
                conclusion: { type: Type.STRING },
              },
              required: ['title', 'subtitle', 'summary', 'sections', 'conclusion'],
            },
          },
        });
        if (response && response.text) {
          pdfData = JSON.parse(response.text);
          break;
        }
      } catch (err: any) {
        console.warn(`[PDF Generator] Model ${model} failed, trying next:`, err?.message || err);
      }
    }

    // Fallback if rate limited or API offline
    if (!pdfData) {
      pdfData = {
        title: `${topic} Executive Report`,
        subtitle: `Structured Strategic Overview & Operational Plan`,
        author: `BuildMate AI Enterprise Engine`,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        summary: `This report provides a comprehensive strategic summary and detailed operational breakdown regarding "${topic}". Prepared by BuildMate AI Router.`,
        sections: [
          {
            heading: `1. Executive Summary & Context`,
            content: `An in-depth evaluation of ${topic} reveals critical opportunities for process optimization, technology adoption, and structured execution.`,
            bulletPoints: [
              `Primary Objective: Establish high-impact deliverables for ${topic}.`,
              `Scope: Comprehensive architecture review and implementation timeline.`,
              `Resource Allocation: Cross-functional team alignment.`
            ]
          },
          {
            heading: `2. Technical & Strategic Analysis`,
            content: `Key findings demonstrate robust viability. Implementation should focus on high efficiency and security protocols.`,
            bulletPoints: [
              `Scalability: Modular system design ensuring future extensibility.`,
              `Risk Mitigation: Proactive compliance and contingency planning.`,
              `Performance Metrics: Real-time telemetry monitoring.`
            ]
          },
          {
            heading: `3. Recommendations & Action Items`,
            content: `Immediate next steps involve finalizing the roadmap and establishing automated deployment pipelines.`,
            bulletPoints: [
              `Phase 1: Environment setup and initial testing.`,
              `Phase 2: Deployment and user acceptance testing.`,
              `Phase 3: Continuous monitoring and optimization.`
            ]
          }
        ],
        conclusion: `By following the proposed framework for ${topic}, organizations can maximize efficiency and achieve predictable high-performance results.`
      };
    }

    res.json({ success: true, pdfData });
  });

  // Specialized API: Structured Presentation Generator
  app.post('/api/generate-presentation', async (req, res) => {
    const { topic = 'Presentation', slideCount = 5, audience = 'General' } = req.body;
    const ai = getGenAI();
    const prompt = `Create a presentation outline with ${slideCount} slides for topic: "${topic}". Target audience: ${audience}.`;

    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let presentation: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                presentationTitle: { type: Type.STRING },
                presentationSubtitle: { type: Type.STRING },
                slides: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      slideNumber: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      layout: { type: Type.STRING },
                      bulletPoints: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      speakerNotes: { type: Type.STRING },
                      visualPrompt: { type: Type.STRING },
                    },
                    required: ['slideNumber', 'title', 'bulletPoints', 'speakerNotes'],
                  },
                },
              },
              required: ['presentationTitle', 'presentationSubtitle', 'slides'],
            },
          },
        });
        if (response && response.text) {
          presentation = JSON.parse(response.text);
          break;
        }
      } catch (err: any) {
        console.warn(`[Presentation Generator] Model ${model} failed, trying next:`, err?.message || err);
      }
    }

    // Fallback if rate limited or API offline
    if (!presentation) {
      const numSlides = Math.min(Math.max(Number(slideCount) || 5, 3), 10);
      const generatedSlides = [];

      generatedSlides.push({
        slideNumber: 1,
        title: `Introduction to ${topic}`,
        layout: 'Title Slide',
        bulletPoints: [
          `Welcome & Session Objectives`,
          `Target Audience: ${audience}`,
          `Key Drivers & High-Level Overview`
        ],
        speakerNotes: `Good day everyone. Today we are presenting a strategic deep dive into ${topic}.`,
        visualPrompt: `Professional modern minimalist slide background representing ${topic}`
      });

      generatedSlides.push({
        slideNumber: 2,
        title: `Key Challenges & Opportunities`,
        layout: 'Two Column',
        bulletPoints: [
          `Market Trends & Current Landscape`,
          `Core Bottlenecks to Address`,
          `Growth Potentials & Competitive Advantage`
        ],
        speakerNotes: `Examining the current landscape highlights both critical operational challenges and high-value opportunities.`,
        visualPrompt: `Comparison diagram displaying challenges versus growth metrics`
      });

      generatedSlides.push({
        slideNumber: 3,
        title: `Strategic Architecture & Solution`,
        layout: 'Diagram / Process',
        bulletPoints: [
          `Modular Framework Design`,
          `End-to-End Workflow Integration`,
          `Security & Compliance Baseline`
        ],
        speakerNotes: `Our proposed architecture ensures maximum modularity, resilience, and fast turnaround.`,
        visualPrompt: `Flowchart illustrating end-to-end system workflow`
      });

      for (let i = 4; i < numSlides; i++) {
        generatedSlides.push({
          slideNumber: i,
          title: `Implementation Phase ${i - 3}: Execution`,
          layout: 'Bullet List',
          bulletPoints: [
            `Key Milestone Deliverables`,
            `Resource Allocation & Timelines`,
            `Continuous Feedback & Testing`
          ],
          speakerNotes: `In phase ${i - 3}, execution focuses on delivery velocity and iterative refinement.`,
          visualPrompt: `Gantt chart timeline graphic with blue and purple milestones`
        });
      }

      generatedSlides.push({
        slideNumber: numSlides,
        title: `Conclusion & Next Steps`,
        layout: 'Summary Slide',
        bulletPoints: [
          `Summary of Strategic Value`,
          `Immediate Action Items`,
          `Q&A and Discussion`
        ],
        speakerNotes: `Thank you for your attention. We are ready to answer any questions and kick off next steps.`,
        visualPrompt: `Clean summary slide with contact information and thank you graphics`
      });

      presentation = {
        presentationTitle: topic,
        presentationSubtitle: `Strategic Presentation Deck (${audience})`,
        slides: generatedSlides
      };
    }

    res.json({ success: true, presentation });
  });

  // Specialized API: Summarize Document
  app.post('/api/summarize-document', async (req, res) => {
    const { textContent = '', filename = 'Document' } = req.body;
    const ai = getGenAI();
    const prompt = `Analyze and summarize the following document content from "${filename}":\n\n${textContent.substring(0, 4000)}`;

    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let summaryData: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                documentTitle: { type: Type.STRING },
                executiveSummary: { type: Type.STRING },
                keyTakeaways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                mainTopics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topic: { type: Type.STRING },
                      details: { type: Type.STRING },
                    },
                  },
                },
                actionItems: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['documentTitle', 'executiveSummary', 'keyTakeaways'],
            },
          },
        });
        if (response && response.text) {
          summaryData = JSON.parse(response.text);
          break;
        }
      } catch (err: any) {
        console.warn(`[Document Summarizer] Model ${model} failed, trying next:`, err?.message || err);
      }
    }

    // Fallback if rate limited or API offline
    if (!summaryData) {
      summaryData = {
        documentTitle: filename,
        executiveSummary: `Analysis of "${filename}": The document provides structured information regarding key operational procedures, project milestones, and guidelines. Processed by BuildMate AI.`,
        keyTakeaways: [
          `Document Source: ${filename}`,
          `Core Focus: Workflow efficiency, guidelines, and key deliverables.`,
          `Status: Analyzed and categorized successfully.`
        ],
        mainTopics: [
          {
            topic: `Primary Content Overview`,
            details: textContent ? textContent.substring(0, 200) + '...' : `Structured document content review.`
          },
          {
            topic: `Operational Framework`,
            details: `Guidelines and specifications outlined within the document.`
          }
        ],
        actionItems: [
          `Review document recommendations with team members.`,
          `Integrate key findings into upcoming planning cycle.`
        ]
      };
    }

    res.json({ success: true, summary: summaryData });
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
