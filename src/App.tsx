import React, { useState, useEffect } from 'react';
import {
  Message,
  RecentFile,
  AIModelOption,
  PDFData,
  PresentationData,
  SummaryData,
  ModelCategory,
  ChatSession,
} from './types';
import { INITIAL_USER, AI_MODELS, QUICK_ACTIONS, INITIAL_RECENT_FILES, COMMAND_SHORTCUTS } from './data/initialData';
import { TopHeader } from './components/TopHeader';
import { LeftSidebar } from './components/LeftSidebar';
import { HeroBanner } from './components/HeroBanner';
import { QuickActionsGrid } from './components/QuickActionsGrid';
import { ChatSection } from './components/ChatSection';
import { RightSidebar } from './components/RightSidebar';
import { PDFGeneratorModal } from './components/modals/PDFGeneratorModal';
import { PresentationModal } from './components/modals/PresentationModal';
import { CodeEditorModal } from './components/modals/CodeEditorModal';
import { SummarizerModal } from './components/modals/SummarizerModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AdminDashboardModal } from './components/modals/AdminDashboardModal';
import { WelcomeNoteModal } from './components/modals/WelcomeNoteModal';
import { MessageSquare, Plus, Cpu, Activity, Folder, ArrowDown, Sparkles, History, Search, Trash2, Edit3, Clock, Check, X } from 'lucide-react';

export default function App() {
  const [user] = useState(INITIAL_USER);
  const [selectedModel, setSelectedModel] = useState<AIModelOption>(AI_MODELS[0]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Responsive Drawer States
  const [isMobileLeftSidebarOpen, setIsMobileLeftSidebarOpen] = useState(false);
  const [isMobileRightSidebarOpen, setIsMobileRightSidebarOpen] = useState(false);

  // Logical response category (Fast/Balanced/Premium/Reasoning/Coding/Vision).
  // The backend Smart Router automatically picks the best configured AI
  // provider for this category from server-side environment API keys -
  // there is no manual provider/key selection in the UI.
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory>('Balanced');

  // Sessions state with localStorage persistence
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('buildmate_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'session-default',
        title: 'Welcome & Enterprise Router',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'm-1',
            role: 'assistant',
            content: 'Assalam-o-Alaikum Younas! 😊\n\nBuildMate AI Enterprise Proxy & Intelligent Router set up! Kis tarah madad kar sakta hun aaj? Aap koi report, presentation, code ya analysis banwana chahte hain?',
            timestamp: '10:30 AM',
            providerUsed: 'gemini',
            modelUsed: 'gemini-3.6-flash',
            latencyMs: 85,
          },
        ],
        isAutoTitled: true,
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('buildmate_active_session_id');
      if (saved) return saved;
    } catch (e) {}
    return 'session-default';
  });

  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('buildmate_chat_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('buildmate_active_session_id', activeSessionId);
    } catch (e) {
      console.error(e);
    }
  }, [activeSessionId]);

  // Derived active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || {
    id: 'session-default',
    title: 'New Chat',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    isAutoTitled: false,
  };

  const activeMessages = activeSession.messages;

  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(INITIAL_RECENT_FILES);

  // Modal visibility states
  const [welcomeNoteModalOpen, setWelcomeNoteModalOpen] = useState(true);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [presentationModalOpen, setPresentationModalOpen] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [summarizerModalOpen, setSummarizerModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [adminDashboardModalOpen, setAdminDashboardModalOpen] = useState(false);

  // Active data for modals
  const [activePdfData, setActivePdfData] = useState<PDFData | null>(null);
  const [activePresentationData, setActivePresentationData] = useState<PresentationData | null>(null);
  const [activeCodeData, setActiveCodeData] = useState<{ code: string; language: string } | null>(null);
  const [activeSummaryData, setActiveSummaryData] = useState<SummaryData | null>(null);

  // Auto Generate Title for Session based on first few messages
  const generateTitleForSession = async (sessionId: string, sessionMessages: Message[]) => {
    try {
      const userMsgs = sessionMessages.filter((m) => m.role === 'user');
      if (userMsgs.length === 0) return;

      const res = await fetch('/api/v1/generate-session-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: sessionMessages,
        }),
      });
      const data = await res.json();
      if (data.title && data.title.trim()) {
        const generatedTitle = data.title.trim();
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, title: generatedTitle, isAutoTitled: true, updatedAt: new Date().toISOString() }
              : s
          )
        );
      }
    } catch (err) {
      console.error('Failed to generate session title:', err);
    }
  };

  // Send message to Custom API Chat Router Proxy
  const handleSendMessage = async (
    text: string,
    fileAttachment?: { name: string; size: string; type: string; content?: string },
    categoryOverride?: ModelCategory
  ) => {
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileAttachment,
    };

    const currentSessId = activeSession.id;
    const updatedMessagesWithUser = [...activeMessages, userMsg];

    // Update session state with user message immediately
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessId
          ? { ...s, messages: updatedMessagesWithUser, updatedAt: new Date().toISOString() }
          : s
      )
    );

    setIsLoading(true);

    // Trigger title generation if not auto-titled yet or default title
    const targetSession = sessions.find((s) => s.id === currentSessId);
    const userMsgCount = updatedMessagesWithUser.filter((m) => m.role === 'user').length;

    if (
      targetSession &&
      (!targetSession.isAutoTitled ||
        targetSession.title === 'New Chat' ||
        targetSession.title === 'New Conversation' ||
        userMsgCount === 1)
    ) {
      generateTitleForSession(currentSessId, updatedMessagesWithUser);
    }

    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          category: categoryOverride || selectedCategory || 'Balanced',
          fileContext: fileAttachment ? [fileAttachment] : undefined,
          history: updatedMessagesWithUser.map((m) => ({ role: m.role, text: m.content })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with BuildMate AI Router.');
      }

      const botReply = data.reply || 'Mujhy aap ke request ki samajh agayi hai!';

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        providerUsed: data.providerUsed,
        modelUsed: data.modelUsed,
        categoryUsed: data.category,
        latencyMs: data.latencyMs,
        tokensUsed: data.tokensUsed,
        estimatedCostUsd: data.estimatedCostUsd,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessId
            ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: new Date().toISOString() }
            : s
        )
      );
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Aap ke query par processing karte waqt chota masla aya: ${err.message || 'Server response delayed'}. Thodi dair baad dobara try karein.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessId
            ? { ...s, messages: [...s.messages, errorMsg], updatedAt: new Date().toISOString() }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action Handler
  const handleSelectQuickAction = (actionId: string) => {
    if (actionId === 'pdf') {
      setPdfModalOpen(true);
    } else if (actionId === 'presentation') {
      setPresentationModalOpen(true);
    } else if (actionId === 'code' || actionId === 'fix') {
      setCodeModalOpen(true);
    } else if (actionId === 'summarize') {
      setSummarizerModalOpen(true);
    } else if (actionId === 'translate') {
      handleSendMessage('Please assist me with translating between Roman Urdu and English.');
    }
  };

  // Generate PDF Content via API
  const handleGeneratePDF = async (topic: string, instructions: string): Promise<PDFData | void> => {
    const res = await fetch('/api/generate-pdf-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, instructions }),
    });
    const data = await res.json();
    if (data.success && data.pdfData) {
      const newFile: RecentFile = {
        id: `rf-${Date.now()}`,
        name: `${topic}.pdf`,
        type: 'pdf',
        date: 'Just now',
        size: '1.4 MB',
        pdfData: data.pdfData,
      };
      setRecentFiles((prev) => [newFile, ...prev]);
      return data.pdfData;
    }
  };

  // Generate Presentation via API
  const handleGeneratePresentation = async (topic: string, slideCount: number): Promise<PresentationData | void> => {
    const res = await fetch('/api/generate-presentation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, slideCount }),
    });
    const data = await res.json();
    if (data.success && data.presentation) {
      const newFile: RecentFile = {
        id: `rf-${Date.now()}`,
        name: `${topic} Presentation.pptx`,
        type: 'pptx',
        date: 'Just now',
        size: '2.8 MB',
        presentationData: data.presentation,
      };
      setRecentFiles((prev) => [newFile, ...prev]);
      return data.presentation;
    }
  };

  // Generate Code via API
  const handleGenerateCode = async (prompt: string, language: string) => {
    const res = await fetch('/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Write clean production-ready ${language} code for: ${prompt}. Provide code inside markdown backticks and explain how it works.`,
        category: 'Coding',
      }),
    });
    const data = await res.json();
    const reply = data.reply || '';

    const codeMatch = reply.match(/```(?:\w+)?\n([\s\S]*?)```/);
    const extractedCode = codeMatch ? codeMatch[1] : reply;

    const newFile: RecentFile = {
      id: `rf-${Date.now()}`,
      name: `script.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'ts'}`,
      type: 'code',
      date: 'Just now',
      size: '12 KB',
      content: extractedCode,
    };
    setRecentFiles((prev) => [newFile, ...prev]);

    return {
      code: extractedCode,
      explanation: 'Code generated successfully via Custom API Router.',
    };
  };

  // Summarize Document via API
  const handleSummarizeDocument = async (textContent: string, filename: string): Promise<SummaryData | void> => {
    const res = await fetch('/api/summarize-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textContent, filename }),
    });
    const data = await res.json();
    if (data.success && data.summary) {
      return data.summary;
    }
  };

  // Select Recent File to view
  const handleSelectRecentFile = (file: RecentFile) => {
    if (file.type === 'pdf' && file.pdfData) {
      setActivePdfData(file.pdfData);
      setPdfModalOpen(true);
    } else if (file.type === 'pptx' && file.presentationData) {
      setActivePresentationData(file.presentationData);
      setPresentationModalOpen(true);
    } else if (file.type === 'code') {
      setActiveCodeData({ code: file.content || '# Python Script', language: 'python' });
      setCodeModalOpen(true);
    } else {
      handleSendMessage(`Can you review the file "${file.name}"?`);
    }
  };

  const handleNewChat = () => {
    const newSessId = `session-${Date.now()}`;
    const newSess: ChatSession = {
      id: newSessId,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `m-${Date.now()}`,
          role: 'assistant',
          content: 'Assalam-o-Alaikum Younas! 😊 Naye chat mein aap ka khushamdeed! Aaj kis topic par kaam karna hai?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      isAutoTitled: false,
    };

    setSessions((prev) => [newSess, ...prev]);
    setActiveSessionId(newSessId);
    setActiveTab('chat');
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setActiveTab('chat');
  };

  const handleDeleteSession = (sessionId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fallback: ChatSession = {
          id: `session-${Date.now()}`,
          title: 'New Chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: `m-${Date.now()}`,
              role: 'assistant',
              content: 'Assalam-o-Alaikum! Naye session mein xushamdeed.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
          isAutoTitled: false,
        };
        setActiveSessionId(fallback.id);
        return [fallback];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle.trim(), isAutoTitled: true } : s))
    );
  };

  const handleOpenDirectChat = () => {
    setActiveTab('chat');
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} flex flex-col antialiased selection:bg-indigo-500 selection:text-white`}>
      {/* Top Bar Header */}
      <TopHeader
        selectedModel={selectedModel}
        models={AI_MODELS}
        onSelectModel={setSelectedModel}
        user={user}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenDocs={() => handleSendMessage('Explain all features of BuildMate AI in Roman Urdu and English.')}
        onOpenAdmin={() => setAdminDashboardModalOpen(true)}
        onOpenWelcomeNote={() => setWelcomeNoteModalOpen(true)}
        onToggleMobileLeftSidebar={() => setIsMobileLeftSidebarOpen(!isMobileLeftSidebarOpen)}
        onToggleMobileRightSidebar={() => setIsMobileRightSidebarOpen(!isMobileRightSidebarOpen)}
      />

      {/* Main Workspace Layout (Fluid Responsive Grid) */}
      <div className="flex-1 flex overflow-hidden max-w-[1920px] w-full mx-auto relative pb-16 lg:pb-0">
        {/* Left Sidebar (Desktop + Mobile Drawer) */}
        <LeftSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNewChat={handleNewChat}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenAccount={() => setSettingsModalOpen(true)}
          onOpenAdmin={() => setAdminDashboardModalOpen(true)}
          isMobileOpen={isMobileLeftSidebarOpen}
          onCloseMobile={() => setIsMobileLeftSidebarOpen(false)}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
        />

        {/* Center Canvas View Area */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 flex flex-col justify-between max-w-7xl mx-auto w-full">
          <div className="flex-1 flex flex-col min-h-0">
            {/* 1. DEDICATED FULL CHAT PAGE VIEW */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col h-full animate-in fade-in duration-200">
                <div className="mb-2 flex items-center justify-between bg-slate-900/80 p-2.5 px-4 rounded-2xl border border-indigo-900/40 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-none truncate max-w-[200px] sm:max-w-xs">
                        {activeSession.title}
                      </h2>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        Auto-titled session ({activeMessages.length} messages)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleNewChat}
                      className="text-xs text-emerald-300 hover:text-white bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1.5 rounded-xl transition-all hover:bg-emerald-900 flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Chat</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="text-xs text-indigo-300 hover:text-white bg-slate-950/80 border border-indigo-800/40 px-3 py-1.5 rounded-xl transition-all hover:bg-indigo-950 flex items-center gap-1.5 font-medium"
                    >
                      <span>← Dashboard</span>
                    </button>
                  </div>
                </div>

                {/* Dedicated Full Height Chat Section */}
                <ChatSection
                  messages={activeMessages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  user={user}
                  onTriggerAction={handleSelectQuickAction}
                  onViewStructuredData={(msg) => {
                    if (msg.actionType === 'pdf') setPdfModalOpen(true);
                    if (msg.actionType === 'presentation') setPresentationModalOpen(true);
                  }}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  sessionTitle={activeSession.title}
                  onRenameSessionTitle={(title) => handleRenameSession(activeSession.id, title)}
                />
              </div>
            )}

            {/* 2. DASHBOARD HOME VIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Hero Greeting Banner */}
                <HeroBanner user={user} onOpenDirectChat={() => setActiveTab('chat')} />

                {/* Big Prominent Direct Chat Launch Button */}
                <div className="my-3">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="w-full py-3.5 px-5 sm:px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-between shadow-xl shadow-indigo-600/30 border border-indigo-400/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
                        <MessageSquare className="w-5 h-5 text-amber-300 animate-bounce" />
                      </div>
                      <div className="text-left">
                        <div className="font-extrabold text-white text-sm sm:text-base leading-tight flex items-center gap-2">
                          <span>💬 Dedicated Chat Page Open Karein</span>
                          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider font-bold">
                            Separate Page
                          </span>
                        </div>
                        <div className="text-[11px] sm:text-xs text-indigo-100 font-medium mt-0.5">
                          Bina scroll kiye naye chat screen par jaane ke liye click karein
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-2 rounded-xl border border-white/20 group-hover:bg-slate-950/70 transition-colors flex-shrink-0 ml-2">
                      <span className="text-xs font-extrabold text-amber-300">Open Chat View →</span>
                    </div>
                  </button>
                </div>

                {/* 6 Quick Action Grid Cards */}
                <QuickActionsGrid
                  actions={QUICK_ACTIONS}
                  onSelectAction={handleSelectQuickAction}
                />
              </div>
            )}

            {/* 3. HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="p-4 sm:p-6 bg-slate-900/70 rounded-2xl border border-indigo-900/40 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-400" />
                      <span>Chat Session History</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Auto-generated descriptive session titles based on conversation topics.
                    </p>
                  </div>

                  <button
                    onClick={handleNewChat}
                    className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Chat Session</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    placeholder="Search history sessions by title or message content..."
                    className="w-full bg-slate-950 border border-indigo-900/50 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {historySearchQuery && (
                    <button
                      onClick={() => setHistorySearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Session List */}
                <div className="space-y-2.5 pt-1">
                  {sessions
                    .filter((s) => {
                      if (!historySearchQuery.trim()) return true;
                      const q = historySearchQuery.toLowerCase();
                      const matchesTitle = s.title.toLowerCase().includes(q);
                      const matchesMessage = s.messages.some((m) => m.content.toLowerCase().includes(q));
                      return matchesTitle || matchesMessage;
                    })
                    .map((sess) => {
                      const isCurrent = sess.id === activeSessionId;
                      const firstUserMsg = sess.messages.find((m) => m.role === 'user')?.content;
                      const lastMsg = sess.messages[sess.messages.length - 1]?.content;

                      return (
                        <div
                          key={sess.id}
                          className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isCurrent
                              ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                              : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-md">
                                {sess.title}
                              </h4>
                              {isCurrent && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold uppercase">
                                  Active Session
                                </span>
                              )}
                              {sess.isAutoTitled && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-medium">
                                  Auto-Titled AI
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                              "{firstUserMsg || lastMsg || 'No user messages yet'}"
                            </p>

                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium pt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {new Date(sess.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span>•</span>
                              <span>{sess.messages.length} messages</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => handleSelectSession(sess.id)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              Resume Chat
                            </button>

                            <button
                              onClick={(e) => handleDeleteSession(sess.id, e)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                              title="Delete Session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  {sessions.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No chat session history found. Start a new chat!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. FILES TAB */}
            {activeTab === 'files' && (
              <div className="p-6 bg-slate-900/60 rounded-2xl border border-indigo-900/40 space-y-4 animate-in fade-in duration-200">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Folder className="w-5 h-5 text-indigo-400" />
                  <span>Files & Generated Artifacts</span>
                </h2>
                <p className="text-xs text-slate-400">
                  All created documents, PDFs, slide decks, and code files.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentFiles.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => handleSelectRecentFile(f)}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-200">{f.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono">
                        {f.type.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar Footer */}
          <footer className="pt-3 pb-2 border-t border-indigo-900/30 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-medium gap-2">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Proxy Active & Secure</span>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <span>BuildMate AI - OpenRouter / LiteLLM Engine</span>
            </div>

            <div className="flex items-center gap-4 text-[10px] sm:text-[11px]">
              <a href="#privacy" className="hover:text-indigo-400 transition-colors">Privacy</a>
              <a href="#terms" className="hover:text-indigo-400 transition-colors">Terms</a>
              <a href="#support" className="hover:text-indigo-400 transition-colors">Support</a>
              <span className="text-slate-700">© 2026 Younas Mengal</span>
            </div>
          </footer>
        </main>

        {/* Right Sidebar (Desktop + Mobile Drawer) */}
        <RightSidebar
          model={selectedModel}
          recentFiles={recentFiles}
          shortcuts={COMMAND_SHORTCUTS}
          onChangeModelClick={() => setSettingsModalOpen(true)}
          onSelectRecentFile={handleSelectRecentFile}
          isMobileOpen={isMobileRightSidebarOpen}
          onCloseMobile={() => setIsMobileRightSidebarOpen(false)}
        />
      </div>

      {/* Touch-Friendly Mobile Quick Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-indigo-900/50 backdrop-blur-md px-3 py-1.5 flex items-center justify-around lg:hidden">
        <button
          onClick={() => {
            setActiveTab('chat');
            setIsMobileLeftSidebarOpen(false);
            setIsMobileRightSidebarOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'chat' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>

        <button
          onClick={handleNewChat}
          className="flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>New Chat</span>
        </button>

        <button
          onClick={() => setAdminDashboardModalOpen(true)}
          className="flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Activity className="w-4 h-4 text-amber-400" />
          <span>Admin</span>
        </button>

        <button
          onClick={() => setIsMobileRightSidebarOpen(!isMobileRightSidebarOpen)}
          className="flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Folder className="w-4 h-4 text-sky-400" />
          <span>Files</span>
        </button>
      </nav>

      {/* Feature Modals */}
      <WelcomeNoteModal
        isOpen={welcomeNoteModalOpen}
        onClose={() => setWelcomeNoteModalOpen(false)}
      />

      <PDFGeneratorModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        initialData={activePdfData}
        onGeneratePDF={handleGeneratePDF}
      />

      <PresentationModal
        isOpen={presentationModalOpen}
        onClose={() => setPresentationModalOpen(false)}
        initialData={activePresentationData}
        onGeneratePresentation={handleGeneratePresentation}
      />

      <CodeEditorModal
        isOpen={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        initialCode={activeCodeData?.code}
        initialLanguage={activeCodeData?.language}
        onGenerateCode={handleGenerateCode}
      />

      <SummarizerModal
        isOpen={summarizerModalOpen}
        onClose={() => setSummarizerModalOpen(false)}
        initialSummary={activeSummaryData}
        onSummarizeDocument={handleSummarizeDocument}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        user={user}
        models={AI_MODELS}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
      />

      <AdminDashboardModal
        isOpen={adminDashboardModalOpen}
        onClose={() => setAdminDashboardModalOpen(false)}
      />
    </div>
  );
}

