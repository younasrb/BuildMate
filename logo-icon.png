import React from 'react';
import { UserProfile } from '../types';
import { MessageSquare, ArrowDown } from 'lucide-react';

interface HeroBannerProps {
  user: UserProfile;
  onOpenDirectChat?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ user, onOpenDirectChat }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-900/50 p-5 sm:p-6 shadow-xl my-2">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 left-10 w-60 h-60 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Info Column */}
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 w-full md:w-auto">
          {/* Glowing Purple Mascot Bot Orb */}
          <div className="relative flex-shrink-0 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950 border border-purple-500/40 flex items-center justify-center text-2xl sm:text-3xl shadow-2xl">
              <span className="animate-bounce">🤖</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full"></div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Hello {user.name.split(' ')[0]}! <span className="animate-pulse">👋</span>
            </h2>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent mt-0.5">
              I'm your AI Assistant
            </h3>
            <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed font-normal">
              Describe your task in <span className="text-indigo-300 font-semibold">Roman Urdu</span> or <span className="text-indigo-300 font-semibold">English</span>.
              I can help you create PDFs, presentations, write code, analyze data, and much more!
            </p>

            {onOpenDirectChat && (
              <button
                onClick={onOpenDirectChat}
                className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4 text-amber-300" />
                <span>Chat Direct Launch</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Visual Floating 3D Badge Card Stack */}
        <div className="hidden lg:flex items-center justify-center relative w-52 h-28">
          {/* PDF Badge */}
          <div className="absolute top-0 right-16 px-3 py-2 rounded-xl bg-gradient-to-br from-rose-900/90 to-rose-950/90 border border-rose-500/50 shadow-lg shadow-rose-950/50 text-rose-300 flex items-center gap-2 text-xs font-bold transform -rotate-12 hover:rotate-0 transition-transform">
            <div className="w-6 h-6 rounded-md bg-rose-500/30 flex items-center justify-center text-[10px]">PDF</div>
            <span>Report</span>
          </div>

          {/* PPTX Badge */}
          <div className="absolute top-6 right-4 px-3 py-2 rounded-xl bg-gradient-to-br from-orange-900/90 to-orange-950/90 border border-orange-500/50 shadow-lg shadow-orange-950/50 text-orange-300 flex items-center gap-2 text-xs font-bold transform rotate-6 hover:rotate-0 transition-transform z-10">
            <div className="w-6 h-6 rounded-md bg-orange-500/30 flex items-center justify-center text-[10px]">PPTX</div>
            <span>Slide Deck</span>
          </div>

          {/* DOCX Badge */}
          <div className="absolute top-12 right-24 px-3 py-2 rounded-xl bg-gradient-to-br from-sky-900/90 to-sky-950/90 border border-sky-500/50 shadow-lg shadow-sky-950/50 text-sky-300 flex items-center gap-2 text-xs font-bold transform -rotate-6 hover:rotate-0 transition-transform z-20">
            <div className="w-6 h-6 rounded-md bg-sky-500/30 flex items-center justify-center text-[10px]">DOCX</div>
            <span>Summary</span>
          </div>

          {/* CODE Badge */}
          <div className="absolute top-16 right-8 px-3.5 py-2 rounded-xl bg-gradient-to-br from-emerald-900/90 to-emerald-950/90 border border-emerald-500/50 shadow-xl shadow-emerald-950/50 text-emerald-300 flex items-center gap-2 text-xs font-bold transform rotate-12 hover:rotate-0 transition-transform z-30">
            <div className="w-6 h-6 rounded-md bg-emerald-500/30 flex items-center justify-center font-mono text-[10px]">&lt;/&gt;</div>
            <span>Python / JS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
