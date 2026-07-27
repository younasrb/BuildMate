# BuildMate AI

Enterprise-style multi-provider AI assistant with an automatic smart router,
PDF/presentation generation, code generation, and document summarization —
bilingual in Roman Urdu & English.

The AI backend is **fully automatic**: there is no "choose a provider"
screen. You configure API keys once as environment variables, and the
built-in Smart Router silently picks the best available provider for each
request (with automatic failover if one is unavailable).

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and add at least `GEMINI_API_KEY`
   (get a free key at https://aistudio.google.com/app/apikey). Add any of
   the other provider keys listed in `.env.example` if you want the router
   to have more fallback options.
3. Run the app:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Deploy to GitHub + Vercel

1. Push this project to a new GitHub repository.
2. Go to https://vercel.com/new and import that repository. Vercel
   auto-detects the Vite frontend and the `/api` serverless function —
   no extra configuration needed (a `vercel.json` is already included).
3. In the Vercel project settings, add the environment variables from
   `.env.example` (at minimum `GEMINI_API_KEY`).
4. Deploy. Vercel builds the frontend with `npm run vercel-build` and
   serves `/api/*` requests through a single serverless function.

## Project Structure

- `src/` — React frontend (Vite)
- `server/app.ts` — Express app with all API routes (shared by local dev and Vercel)
- `server/routingEngine.ts` — Smart Router: picks a provider/model per request
- `server/adapters/` — One adapter per AI provider (Gemini, OpenAI-compatible, Anthropic)
- `api/index.ts` — Vercel Serverless Function entry point (wraps `server/app.ts`)
- `server.ts` — Local dev / traditional Node hosting entry point (wraps `server/app.ts` + Vite/static serving)

## Supported Providers

Gemini, OpenAI, Anthropic, Groq, DeepSeek, OpenRouter, Together AI, Ollama
(local), LM Studio (local), and any custom OpenAI-compatible endpoint. See
`.env.example` for the full list of environment variables.
