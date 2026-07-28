import React from 'react';
import { Sparkles, Sun, Moon, BookOpen, Settings, ChevronDown, Activity, Menu, PanelRight, X } from 'lucide-react';
import { AIModelOption, UserProfile } from '../types';
import logoIcon from '../assets/logo-icon.png';

interface TopHeaderProps {
  selectedModel: AIModelOption;
  models: AIModelOption[];
  onSelectModel: (model: AIModelOption) => void;
  user: UserProfile;
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenDocs: () => void;
  onOpenAdmin: () => void;
  onOpenWelcomeNote?: () => void;
  onToggleMobileLeftSidebar: () => void;
  onToggleMobileRightSidebar: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  selectedModel,
  models,
  onSelectModel,
  user,
  darkMode,
  onToggleTheme,
  onOpenSettings,
  onOpenDocs,
  onOpenAdmin,
  onOpenWelcomeNote,
  onToggleMobileLeftSidebar,
  onToggleMobileRightSidebar,
}) => {
  return (
    <header className="h-14 bg-slate-950/90 border-b border-indigo-900/40 px-3 sm:px-4 flex items-center justify-between text-slate-200 select-none backdrop-blur-md sticky top-0 z-40">
      {/* Left: Hamburger + Brand Identity */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Left Sidebar Toggle */}
        <button
          onClick={onToggleMobileLeftSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5 text-indigo-400" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0 overflow-hidden">
            <img src={logoIcon} alt="BuildMate AI Logo" className="w-full h-full object-contain" />
          </div>
          <div className="hidden min-[380px]:block">
            <h1 className="font-bold text-xs sm:text-sm tracking-tight text-white font-sans leading-none">
              BuildMate AI
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 tracking-wide font-medium mt-0.5 truncate max-w-[140px] sm:max-w-none">
              Enterprise AI Router
            </p>
          </div>
        </div>
      </div>

      {/* Center: Smart Router Status (fully automatic - no manual selection needed) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-xs font-bold text-indigo-200 shadow"
          title="AI engine, model & API key are all selected and managed automatically"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
          <Activity className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span className="hidden sm:inline">⚡ Auto AI Routing Active</span>
          <span className="sm:hidden">⚡ Auto AI</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* ACT AI Course Badge Notice */}
        {onOpenWelcomeNote && (
          <button
            onClick={onOpenWelcomeNote}
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/50 text-amber-300 hover:text-white hover:border-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md min-h-[36px]"
            title="View Course Notice"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden md:inline text-xs font-black">ACT AI BATCH 2</span>
          </button>
        )}

        {/* Admin Dashboard Button */}
        <button
          onClick={onOpenAdmin}
          className="px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
          title="Open Admin Dashboard"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline text-xs">Admin</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          title="General Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Mobile Right Sidebar Drawer Toggle */}
        <button
          onClick={onToggleMobileRightSidebar}
          className="xl:hidden p-2 rounded-lg text-indigo-300 hover:text-white hover:bg-slate-800 border border-indigo-900/40 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          title="Toggle Info Panel"
          aria-label="Toggle Info Panel"
        >
          <PanelRight className="w-4 h-4 text-indigo-400" />
        </button>

        {/* User Profile Badge */}
        <div className="hidden min-[480px]:flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-600/30 flex-shrink-0">
            {user.avatarText}
          </div>
        </div>
      </div>
    </header>
  );
};

