<div align="center">

# 🛠️ BuildMate AI

**A bilingual (Roman Urdu + English) AI development assistant that never lets you hit a wall.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-buildmate--rosy.vercel.app-black?style=for-the-badge&logo=vercel)](https://buildmate-rosy.vercel.app/)
[![Made with React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)

**[🔗 Live App](https://buildmate-rosy.vercel.app/) · [📦 Source Code](https://github.com/younasrb/BuildMate)**

</div>

---

## 📌 The Problem

Most students and self-taught developers don't have a budget for ChatGPT Plus,
Canva Pro, and a separate PDF/report-writing tool. Instead, they hop between
four or five different apps to get one assignment done — one tab for a
chatbot, another to make a PDF look presentable, another for slides.

On top of that, free-tier AI APIs (Gemini, Groq, OpenRouter, DeepSeek, etc.)
all have **daily/per-minute rate limits**. The moment your free quota on one
provider runs out mid-task, the app just breaks — right when you need it
most, usually the night before a deadline.

**BuildMate AI solves both problems in one app:**

1. It bundles chat, code generation, PDF export, presentation generation,
   and document summarization into a single bilingual interface.
2. It never dies when one AI provider's free tier runs out — see the
   **Smart Routing Engine** below.

**Built for:** students, self-taught developers, and anyone doing
assignment/report/presentation work in Roman Urdu or English who needs a
free, reliable, all-in-one AI workspace.

---

## 🔗 Live App

### 👉 **https://buildmate-rosy.vercel.app/**

---

## ⚡ The Core Innovation — Smart Multi-Provider Routing

This is the technical heart of the project, and the direct answer to the
"free AI APIs always hit a limit" problem.

Instead of hard-wiring the app to one AI provider (which fails the second
that provider throttles you), BuildMate AI implements a **Smart Router**
(`server/routingEngine.ts`) that sits between the frontend and *eight*
supported providers: **Gemini, OpenAI, Anthropic Claude, Groq, DeepSeek,
OpenRouter, Together AI**, plus local **Ollama / LM Studio**.

**How the routing technique works:**

- On every request, the router checks which provider API keys are actually
  configured and available (no dead calls to providers with no key).
- Requests are classified into categories (e.g. *Fast* vs *Balanced*) so
  lightweight requests go to quick, low-cost models and heavier requests go
  to stronger models.
- If the chosen provider **fails, times out, or returns a rate-limit /
  quota error**, the router automatically **fails over to the next
  available provider in priority order** — the same request is retried
  transparently. The user never sees an error, just a working response.
- Provider priority is configurable (`providerPriorities`), and a manual
  override (`manualProvider` / `manualModel`) is available for power users
  via Settings — but by default, everything is fully automatic. There is
  no "choose a provider" screen.

**Result:** even on 100% free-tier API keys, the app effectively gets a
combined, much larger quota by spreading load across multiple providers —
so a single exhausted free tier never takes the whole app down.

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 **Bilingual AI Chat** | Converses fluently in Roman Urdu and English, auto-detecting the input language |
| 🔀 **Smart AI Router** | Auto-selects the best available provider per request, with automatic failover (see above) |
| 💻 **Code Generator/Editor** | Generates and edits code in Python, React, C++, HTML/CSS, JS, and more |
| 📄 **PDF Generator** | Converts a prompt or conversation into a formatted, downloadable PDF report |
| 📊 **Presentation Generator** | Builds slide decks (`.pptx`) directly from a prompt |
| 📝 **Document Summarizer** | Summarizes uploaded/pasted documents concisely |
| 🎙️ **Live Voice Call Mode** | Real-time voice conversation with the assistant |
| 🛠️ **Admin Dashboard** | Overview panel for usage and configuration |
| ⚙️ **Custom API Keys & Settings** | Users can plug in their own provider keys to extend/override the default router |

---

## 🤖 The AI Feature — System Prompt & Behavior

The assistant's personality and behavior are driven by a custom system
prompt written specifically for this app, defined in `server/app.ts`:

```
You are "BuildMate AI", an expert AI Development Assistant designed by Younas Mengal.
You are fluent in both Roman Urdu (e.g. "Assalam-o-Alaikum, main aap ki kya madad kar sakta hun?") and English.
You assist developers, students, and professionals with:
- Generating clean reports, PDFs, presentations, and code in Python, React, C++, HTML/CSS, JS, etc.
- Document summarization, bug fixing, text translation, and data analysis.
- Always provide clear, beautifully formatted Markdown responses.
- When asked in Roman Urdu, respond primarily in helpful, friendly Roman Urdu mixed with clear technical English terms.
- When asked in English, respond in polished professional English with optional friendly greetings.
```

This prompt is combined with the routing logic in
`server/routingEngine.ts` and per-provider adapters in `server/adapters/`
(`geminiAdapter.ts`, `anthropicAdapter.ts`, `openaiCompatibleAdapter.ts`),
so the same instructions and persona are applied consistently **no matter
which underlying provider actually answers the request**.

---

## 🧰 Tools, Services & Models Used

**Frontend**
- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- `lucide-react` (icons), `motion` (animations), `canvas-confetti`

**Backend**
- Node.js + Express (shared app powering both local dev and Vercel serverless functions)
- `jsPDF` — PDF generation
- `pptxgenjs` — presentation generation

**AI Providers (via Smart Router)**
- Google Gemini
- OpenAI
- Anthropic Claude
- Groq
- DeepSeek
- OpenRouter
- Together AI
- Local: Ollama / LM Studio

**Hosting / Infra**
- Vercel (frontend + serverless API)
- GitHub (version control)

---

## 📸 Screenshots

| Dashboard Home | Enterprise Router Admin Dashboard |
|---|---|
| ![Dashboard Home](screenshots/dashboard-home.jpg) | ![Admin Dashboard](screenshots/admin-dashboard.jpg) |

| PowerPoint Studio |
|---|
| ![Presentation Studio](screenshots/presentation-studio.jpg) |

*Dashboard Home* — the main workspace with quick actions, recent files, and
live AI status. *Admin Dashboard* — real-time request volume, cost
tracking, token usage, and provider health across all 8 routed providers.
*PowerPoint Studio* — AI-generated `.pptx` slide decks with theme
selection and speaker notes, editable per slide.

---

## 🚀 How to Run Locally

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repo
git clone https://github.com/younasrb/BuildMate.git
cd BuildMate

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# then open .env and add at least GEMINI_API_KEY
# (free key: https://aistudio.google.com/app/apikey)

# 4. Run the dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## ☁️ Deployment (GitHub + Vercel)

1. Push the project to a public GitHub repository.
2. Import the repo at [vercel.com/new](https://vercel.com/new) — Vercel
   auto-detects the Vite frontend and the `/api` serverless function
   (`vercel.json` is already included, no extra config needed).
3. In **Project Settings → Environment Variables**, add the keys from
   `.env.example` (minimum: `GEMINI_API_KEY`).
4. Deploy. Vercel runs `npm run vercel-build` for the frontend and serves
   `/api/*` through a single serverless function.

**This project is already live at:** https://buildmate-rosy.vercel.app/

---

## 📁 Project Structure

```
buildmate-ai/
├── src/                          # React frontend (Vite)
│   ├── components/
│   │   ├── modals/                # PDF, Presentation, Code Editor, Voice Call, Admin modals
│   │   ├── ChatSection.tsx
│   │   ├── TopHeader.tsx
│   │   ├── LeftSidebar.tsx / RightSidebar.tsx
│   │   └── HeroBanner.tsx
│   ├── utils/                     # pdfGenerator.ts, exporter.ts
│   └── App.tsx
├── server/
│   ├── app.ts                     # Express app — all API routes + system prompt
│   ├── routingEngine.ts           # Smart Router — provider/model selection + failover
│   └── adapters/                  # One adapter per AI provider
├── api/index.ts                   # Vercel serverless entry point
├── server.ts                      # Local dev entry point
└── .env.example                   # All supported provider API keys
```

---

## 🔒 Security Note

No API keys or secrets are committed to this repository. All provider keys
are supplied via environment variables (`.env` locally, Vercel Project
Settings in production), and `.env` is git-ignored.

---

## 👤 Author

**Muhammad Younas Mengal**
BUETK — Balochistan University of Engineering & Technology, Khuzdar
ACT AI Batch 2

Built as a final project — solving a real, everyday problem for students
and developers who rely on free-tier AI tools.
