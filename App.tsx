import React from 'react';
import { Sparkles, GraduationCap, User, Zap, CheckCircle2, ArrowRight, Landmark } from 'lucide-react';

interface WelcomeNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeNoteModal: React.FC<WelcomeNoteModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md sm:max-w-lg max-h-[92vh] bg-slate-900 border border-indigo-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col transform transition-all scale-100 my-auto">
        
        {/* Top Decorative Gradient Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 sm:p-5 text-center relative overflow-hidden flex-shrink-0">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl"></div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-amber-300 font-extrabold text-[11px] sm:text-xs mb-2 border border-white/30 shadow-inner tracking-wide uppercase">
            <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
            <span>Official Welcome Notice</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md">
            ACT AI COURSE
          </h2>
          <p className="text-indigo-100 text-xs font-medium mt-0.5">
            Empowering Next-Generation AI Developers
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-3.5 bg-slate-900 overflow-y-auto">
          
          {/* Key Info Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-indigo-900/50 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Batch</p>
                <p className="text-xs sm:text-sm font-black text-amber-400 truncate">BATCH 2</p>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-indigo-900/50 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">STUDENT NAME</p>
                <p className="text-xs sm:text-sm font-black text-white truncate">MUHAMMAD YOUNAS</p>
              </div>
            </div>
          </div>

          {/* University Card */}
          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-emerald-900/50 flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
              <Landmark className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">UNIVERSITY</p>
              <p className="text-xs sm:text-sm font-black text-emerald-400 truncate">
                BUET KHUZDAR BALOCHISTAN
              </p>
            </div>
          </div>

          {/* Special Access Highlights */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-950/80 to-slate-950 border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs sm:text-sm">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>USE FREE AI — NO LIMITS</span>
            </div>

            <ul className="space-y-1 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Unlimited Queries & Multi-Model Smart Router</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Live Voice Call in Roman Urdu & English</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Automated PDF Reports & Slide Deck Generator</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 sm:py-3.5 px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-indigo-400/40 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer group"
          >
            <span>Open Website & Start Free AI</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer Note */}
        <div className="px-4 py-2 bg-slate-950 border-t border-indigo-900/40 text-center flex-shrink-0">
          <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate">
            ACT AI COURSE • BATCH 2 • MUHAMMAD YOUNAS • BUET KHUZDAR BALOCHISTAN
          </p>
        </div>

      </div>
    </div>
  );
};

