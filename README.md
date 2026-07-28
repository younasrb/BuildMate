<div align="center">

# BuildMate AI

**A bilingual AI development assistant for Roman Urdu and English users.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-buildmate--rosy.vercel.app-black?style=for-the-badge&logo=vercel)](https://buildmate-rosy.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)

**[Live App](https://buildmate-rosy.vercel.app/) · [Source Code](https://github.com/younasrb/BuildMate)**

</div>

---

## Overview

BuildMate AI is an all-in-one AI workspace designed for students, self-taught developers, and professionals who need a reliable tool for chat, code generation, document summarization, PDF creation, and presentation building.

It supports both Roman Urdu and English, making it accessible to a wider audience while maintaining a clean and professional user experience.

---

## Screenshots

| Dashboard Home | AI Dashboard | PDF Report Studio |
|---|---|---|
| ![Dashboard Home](screenshots/dashboard-home.jpg) | ![AI Dashboard](screenshots/admin-dashboard.jpg) | ![PDF Report Studio](screenshots/pdf-report-studio.jpg) |

| Presentation Studio |
|---|
| ![Presentation Studio](screenshots/presentation-studio.jpg) |

---

## Problem Statement

Many students and independent developers rely on multiple tools to complete a single task:
- one app for chatting with AI,
- another for generating PDFs,
- another for creating presentations,
- and separate tools for summarizing documents or editing code.

In addition, free-tier AI APIs often come with strict rate limits. When one provider reaches its limit, the workflow breaks at the worst possible moment.

BuildMate AI addresses these challenges by combining essential AI-powered productivity tools into one interface and routing requests intelligently across multiple providers to improve reliability.

---

## Key Features

- **Bilingual AI Chat**  
  Communicates naturally in Roman Urdu and English with language-aware responses.

- **Smart AI Routing**  
  Automatically selects the best available provider and fails over when a provider is unavailable or rate-limited.

- **Code Generation and Editing**  
  Supports code generation and refinement across Python, React, C++, HTML, CSS, JavaScript, and more.

- **PDF Generation**  
  Converts prompts or conversations into well-formatted downloadable PDF reports.

- **Presentation Generation**  
  Generates `.pptx` slide decks from prompts with editable content and speaker notes.

- **Document Summarization**  
  Summarizes pasted or uploaded content into concise, readable summaries.

- **Live Voice Mode**  
  Enables real-time voice interaction with the assistant.

- **Admin Dashboard**  
  Provides a centralized view of usage, configuration, and system status.

- **Custom API Keys and Settings**  
  Allows users to configure their own provider keys for extended usage and control.

---

## Smart Multi-Provider Routing

The core technical strength of BuildMate AI is its routing engine, implemented in `server/routingEngine.ts`.

Instead of depending on a single provider, the application supports multiple AI providers, including:

- Google Gemini
- OpenAI
- Anthropic Claude
- Groq
- DeepSeek
- OpenRouter
- Together AI
- Local models via Ollama / LM Studio

### How it works

- The router checks which provider keys are available before sending a request.
- Requests are classified by type, allowing the system to choose appropriate models for different workloads.
- If a provider fails, times out, or returns a quota/rate-limit error, the router automatically retries with the next available provider.
- Provider priority can be configured, and advanced users can manually override provider/model selection from settings.

This design helps keep the application available even when individual free-tier quotas are exhausted.

---

## AI Behavior

The assistant’s behavior is defined through a custom system prompt in `server/app.ts`.

It is designed to:
- respond in Roman Urdu or English depending on the user’s input,
- generate clear and well-structured Markdown responses,
- assist with coding, documentation, summarization, translation, and data-related tasks,
- maintain a professional, helpful, and user-friendly tone.

The same instruction set is applied consistently across all providers through the adapter layer.

---

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- `lucide-react`
- `motion`
- `canvas-confetti`

### Backend
- Node.js
- Express
- `jsPDF`
- `pptxgenjs`

### AI Providers
- Google Gemini
- OpenAI
- Anthropic Claude
- Groq
- DeepSeek
- OpenRouter
- Together AI
- Ollama / LM Studio

### Infrastructure
- Vercel
- GitHub

---

## Local Development

### Prerequisites
- Node.js 18+

### Setup

```bash
# Clone the repository
git clone https://github.com/younasrb/BuildMate.git
cd BuildMate

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add at least GEMINI_API_KEY in .env

# Start the development server
npm run dev
```

Then open:

```bash
http://localhost:3000
```

---

## Deployment

The project is ready to deploy on Vercel.

### Steps
1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add the required environment variables in the Vercel dashboard.
4. Deploy the project.

The live app is available here:

**https://buildmate-rosy.vercel.app/**

---

## Project Structure

```text
buildmate-ai/
├── src/                      # React frontend (Vite)
│   ├── components/
│   │   ├── modals/           # PDF, Presentation, Code Editor, Voice Call, Admin modals
│   │   ├── ChatSection.tsx
│   │   ├── TopHeader.tsx
│   │   ├── LeftSidebar.tsx / RightSidebar.tsx
│   │   └── HeroBanner.tsx
│   ├── utils/                # pdfGenerator.ts, exporter.ts
│   └── App.tsx
├── server/
│   ├── app.ts                # Express app and system prompt
│   ├── routingEngine.ts      # Smart routing and failover logic
│   └── adapters/             # Provider-specific adapters
├── api/index.ts              # Vercel serverless entry point
├── server.ts                 # Local development entry point
└── .env.example              # Supported environment variables
```

---

## Security

No API keys or secrets are committed to the repository. All credentials are provided through environment variables locally and in production.

---

## Author

**Muhammad Younas Mengal**  
BUETK — Balochistan University of Engineering & Technology, Khuzdar  
ACT AI Batch 2

Built as a final project focused on creating a practical AI workspace for students and developers.
