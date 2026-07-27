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
  const [modelDropdownOpen, setModelDropdownOpen] = React.useState(false);

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

      {/* Center: Smart Router & Model Selector */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-xs font-bold text-indigo-200 shadow"
          title="AI provider is selected automatically"
        >
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          <span>⚡ Auto AI Routing</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900/80 border border-indigo-900/50 hover:border-indigo-500/50 text-xs text-slate-200 transition-all shadow-inner max-w-[160px] sm:max-w-xs"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
            <span className="font-medium truncate text-[11px] sm:text-xs">{selectedModel.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 sm:w-72 bg-slate-900 border border-indigo-800/60 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider flex items-center justify-between">
                <span>Select AI Engine</span>
                <button onClick={() => setModelDropdownOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model);
                    setModelDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors my-0.5 ${
                    selectedModel.id === model.id
                      ? 'bg-indigo-600/30 border border-indigo-500/50 text-white'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-medium flex items-center gap-1.5">
                      {model.name}
                      <span className="text-[8px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {model.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {model.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
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

