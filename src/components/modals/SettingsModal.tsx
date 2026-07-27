import React from 'react';
import { UserProfile, AIModelOption } from '../../types';
import { X, Key, User, ShieldCheck, Sparkles, Check, Cpu } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  models: AIModelOption[];
  selectedModel: AIModelOption;
  onSelectModel: (m: AIModelOption) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  models,
  selectedModel,
  onSelectModel,
  darkMode,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = React.useState<'models' | 'account' | 'api'>('models');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-indigo-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-indigo-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                BuildMate AI Settings
              </h3>
              <p className="text-xs text-slate-400">
                Manage AI models, API configuration, and user account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-indigo-900/40 bg-slate-950/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'models'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Models</span>
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'api'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Status</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'account'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Account</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'models' && (
            <div className="space-y-3">
              <p className="text-slate-400">
                Select your preferred default model for generating PDFs, presentations, and code in Roman Urdu or English:
              </p>
              {models.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectModel(m)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedModel.id === m.id
                      ? 'bg-indigo-950/80 border-indigo-500/80 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      {m.name}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{m.description}</p>
                    <div className="flex gap-4 mt-2 text-[10px] text-slate-500 font-mono">
                      <span>Context: {m.contextWindow}</span>
                      <span>Temperature: {m.temperature}</span>
                    </div>
                  </div>
                  {selectedModel.id === m.id && (
                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Server-side Gemini Integration Active</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    BuildMate AI uses secure server-side proxy routes with full support for Roman Urdu & English models. Your API key is loaded safely from environment secrets.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>API Connection:</span>
                  <span className="text-emerald-400 font-bold">Connected (Port 3000)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Primary Engine:</span>
                  <span className="text-indigo-300">@google/genai (Gemini 3.6 Flash)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Language Processing:</span>
                  <span className="text-purple-300">Roman Urdu & English Multilingual</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-lg">
                  {user.avatarText}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{user.name}</h4>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    ⚡ {user.badge}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-2">
                <h5 className="font-bold text-white text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Pro Membership Active
                </h5>
                <p className="text-slate-300 text-xs leading-relaxed">
                  You have unlimited access to PDF Report creation, Presentation slide building, Code generation, and Document summarization.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
