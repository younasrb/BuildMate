import React from 'react';
import { UserProfile, AIModelOption } from '../../types';
import { X, Key, User, ShieldCheck, Sparkles, Check, Cpu, Zap, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  models: AIModelOption[];
  selectedModel: AIModelOption;
  onSelectModel: (m: AIModelOption) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  userKeys?: Record<string, string>;
  onUpdateUserKeys?: (keys: Record<string, string>) => void;
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
  userKeys = {},
  onUpdateUserKeys,
}) => {
  const [activeTab, setActiveTab] = React.useState<'models' | 'account' | 'api'>('models');
  const [customGeminiKey, setCustomGeminiKey] = React.useState(userKeys.gemini || '');
  const [customOpenaiKey, setCustomOpenaiKey] = React.useState(userKeys.openai || '');
  const [customGroqKey, setCustomGroqKey] = React.useState(userKeys.groq || '');
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    setCustomGeminiKey(userKeys.gemini || '');
    setCustomOpenaiKey(userKeys.openai || '');
    setCustomGroqKey(userKeys.groq || '');
  }, [userKeys, isOpen]);

  const handleSaveKeys = () => {
    const updated: Record<string, string> = { ...userKeys };
    if (customGeminiKey.trim()) updated.gemini = customGeminiKey.trim();
    else delete updated.gemini;
    if (customOpenaiKey.trim()) updated.openai = customOpenaiKey.trim();
    else delete updated.openai;
    if (customGroqKey.trim()) updated.groq = customGroqKey.trim();
    else delete updated.groq;
    onUpdateUserKeys?.(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Fully Automatic Engine Selection</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Aapko koi engine manually select nahi karna — BuildMate Smart Router har request ke liye khud best available AI model choose karta hai, aur agar ek provider limit hit ho jaye to automatically doosre provider par switch ho jata hai. Neeche list sirf informational hai.
                  </p>
                </div>
              </div>
              {models.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border bg-slate-950/60 border-slate-800 text-slate-300"
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
                </div>
              ))}
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Multi-Provider Smart Router Active</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    BuildMate AI automatically routes requests across multiple AI providers with instant failover — koi limit ya error aaye tab bhi aapko kuch karne ki zaroorat nahi, sab kuch background mein handle ho jata hai.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Routing Mode:</span>
                  <span className="text-emerald-400 font-bold">Auto (Multi-Provider Failover)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Language Processing:</span>
                  <span className="text-purple-300">Roman Urdu & English Multilingual</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <h5 className="font-bold text-white text-xs flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Free API Key Kahan Se Milegi?
                </h5>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Agar shared quota khatam ho jaye ya AI kaam na kare, to neeche diye gaye providers se <strong>bilkul free</strong> apni API key bana kar yahan add kar dein — chand minutes ka kaam hai:
                </p>
                <ul className="text-[11px] text-slate-300 space-y-1.5 pl-1">
                  <li>
                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-indigo-200 font-bold underline underline-offset-2">
                      Google AI Studio (Gemini)
                    </a> — free tier, sign in with Google, "Create API Key" par click karein.
                  </li>
                  <li>
                    <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-indigo-200 font-bold underline underline-offset-2">
                      Groq
                    </a> — bilkul free aur bohat fast, sirf email se signup karein.
                  </li>
                  <li>
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-indigo-200 font-bold underline underline-offset-2">
                      OpenRouter
                    </a> — kai free models available hain, signup free hai.
                  </li>
                </ul>
                <p className="text-[10px] text-slate-500">
                  Key milne ke baad neeche wale box mein paste karke "Save Keys" dabayein.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 space-y-3">
                <h5 className="font-bold text-white text-xs flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-indigo-300" />
                  Add Your Own API Key (Optional)
                </h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ye bilkul optional hai — agar aap apni personal Gemini, OpenAI, ya Groq key add karte hain, to aapki requests us key se jayengi aur shared server quota par pressure nahi padega. Blank chor dein to sab kuch pehle jaisa automatic rahega.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Gemini API Key</label>
                  <input
                    type="password"
                    value={customGeminiKey}
                    onChange={(e) => setCustomGeminiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">OpenAI API Key</label>
                  <input
                    type="password"
                    value={customOpenaiKey}
                    onChange={(e) => setCustomOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Groq API Key (Free)</label>
                  <input
                    type="password"
                    value={customGroqKey}
                    onChange={(e) => setCustomGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <button
                  onClick={handleSaveKeys}
                  className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saved ? 'Saved!' : 'Save Keys'}</span>
                </button>
                <p className="text-[10px] text-slate-500">
                  Keys is device par securely save hoti hain aur sirf aapki apni requests ke liye use hoti hain.
                </p>
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
