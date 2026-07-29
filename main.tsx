import React from 'react';
import { MessageSquare, Plus, History, Folder, Key, User, Zap, Sparkles, Activity, X, LayoutDashboard } from 'lucide-react';
import { ChatSession } from '../types';

interface LeftSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
  onOpenAdmin?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  sessions?: ChatSession[];
  activeSessionId?: string;
  onSelectSession?: (sessionId: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  setActiveTab,
  onNewChat,
  onOpenSettings,
  onOpenAccount,
  onOpenAdmin,
  isMobileOpen = false,
  onCloseMobile,
  sessions = [],
  activeSessionId,
  onSelectSession,
}) => {
  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden transition-opacity animate-in fade-in"
        />
      )}

      {/* Left Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 lg:z-auto w-64 lg:w-60 bg-slate-950 border-r border-indigo-900/30 flex flex-col justify-between p-3 select-none flex-shrink-0 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-4 overflow-y-auto">
          {/* Mobile Header Close Row */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-xs text-white">BuildMate Menu</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="space-y-1.5">
            {/* Dashboard / Home Tab */}
            <button
              onClick={() => {
                setActiveTab('dashboard');
                onCloseMobile?.();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all shadow-md ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Dashboard Home</span>
            </button>

            {/* Chat Assistant Active Tab */}
            <button
              onClick={() => {
                setActiveTab('chat');
                onCloseMobile?.();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all shadow-md ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-purple-300" />
              <span>Full Chat Page</span>
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile?.();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-900/40 bg-slate-900/60 hover:bg-indigo-950/40 text-slate-300 hover:text-white text-xs font-medium transition-all group"
          >
            <Plus className="w-4 h-4 text-indigo-400 group-hover:rotate-90 transition-transform" />
            <span>New Chat</span>
          </button>

          {/* Section Navigation Links */}
          <div className="space-y-1 pt-2">
            <button
              onClick={() => {
                setActiveTab('history');
                onCloseMobile?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'history' ? 'bg-slate-800 text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>History ({sessions.length})</span>
            </button>

            {/* Recent Sessions List */}
            {sessions.length > 0 && (
              <div className="pl-3 pr-1 py-1 space-y-1 border-l border-slate-800 ml-3">
                <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider px-2 py-0.5">
                  Recent Sessions
                </div>
                {sessions.slice(0, 5).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectSession?.(s.id);
                      setActiveTab('chat');
                      onCloseMobile?.();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium truncate flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeSessionId === s.id && activeTab === 'chat'
                        ? 'bg-indigo-950/80 text-indigo-300 font-bold border border-indigo-800/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                    title={s.title}
                  >
                    <MessageSquare className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setActiveTab('files');
                onCloseMobile?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'files' ? 'bg-slate-800 text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <Folder className="w-4 h-4 text-slate-400" />
              <span>Files & Documents</span>
            </button>
          </div>

          {/* Enterprise Router Navigation */}
          <div className="pt-3 border-t border-slate-900">
            <div className="text-[10px] uppercase font-bold text-slate-500 px-3 pb-1 tracking-wider">
              Custom API & Router
            </div>

            <button
              onClick={() => {
                onOpenAdmin?.();
                onCloseMobile?.();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-indigo-950/50 transition-colors"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Admin Analytics</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                onCloseMobile?.();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 transition-colors"
            >
              <Key className="w-4 h-4 text-slate-400" />
              <span>General Settings</span>
            </button>
          </div>
        </div>

        {/* Upgrade Promo Card */}
        <div className="space-y-3 pt-4 border-t border-slate-900/80">
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-purple-950/40 border border-indigo-800/40 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>

            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </div>

            <h4 className="font-semibold text-xs text-white">
              BuildMate Enterprise API
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Intelligent Routing, Failover, & Multi-Provider Support.
            </p>

            <button
              onClick={() => {
                onOpenAccount();
                onCloseMobile?.();
              }}
              className="mt-3 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 min-h-[38px]"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Pro Account</span>
            </button>
          </div>

          {/* Footer Credit */}
          <div className="text-center text-[10px] text-slate-500 space-y-0.5">
            <p>BuildMate AI v2.0 Enterprise</p>
          </div>
        </div>
      </aside>
    </>
  );
};

