import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Cpu, Zap, Lightbulb, RefreshCw, GraduationCap, CheckCircle2 } from 'lucide-react';
import logoIcon from '../assets/logo-icon.png';

interface AIGeneratorLoaderProps {
  title?: string;
  subtitle?: string;
  type?: 'presentation' | 'pdf' | 'summary' | 'general';
}

const FUN_FACTS = [
  {
    icon: '🎓',
    tag: 'BUET Khuzdar Pride',
    text: 'BUET Khuzdar is Balochistan’s premier engineering institution, training top engineers and tech innovators!'
  },
  {
    icon: '💡',
    tag: 'AI Power Tip',
    text: 'You can export these slides directly into Python (.py) or Java (.java) scripts to generate PPTX programmatically!'
  },
  {
    icon: '⚡',
    tag: 'Did You Know?',
    text: 'Gemini AI models process multimodal text, code, and images seamlessly in a unified neural context.'
  },
  {
    icon: '🧠',
    tag: 'Study Hack',
    text: 'Teaching a concept to someone else (the Feynman Technique) is the fastest way to master complex subjects.'
  },
  {
    icon: '🚀',
    tag: 'Tech Fact',
    text: 'Python’s python-pptx and Java’s Apache POI allow you to automate slide deck creation with pure code!'
  },
  {
    icon: '✨',
    tag: 'Unlimited Access',
    text: 'Enjoy 100% free AI generation with no daily query limits for students and researchers!'
  }
];

const STAGES = {
  presentation: [
    '🧠 Analyzing topic structure & slide count...',
    '⚡ Synthesizing key bullet points & speaker notes...',
    '🎨 Applying modern slide theme & gradient styling...',
    '✨ Preparing Google Slides, Python & Java export links...'
  ],
  pdf: [
    '📄 Parsing document guidelines & outline...',
    '🧠 Formatting executive summary & core sections...',
    '🎨 Polishing layout for PDF & Google Docs export...',
    '✨ Generating structured document report...'
  ],
  summary: [
    '🔍 Scanning text for key arguments & takeaways...',
    '⚡ Synthesizing critical bullet points & main insights...',
    '🎯 Structuring clean, actionable summary points...',
    '✨ Finalizing summary report...'
  ],
  general: [
    '🧠 Connecting to Gemini AI engine...',
    '⚡ Processing data & context vectors...',
    '🎨 Formatting output with high-precision layout...',
    '✨ Finalizing response...'
  ]
};

export const AIGeneratorLoader: React.FC<AIGeneratorLoaderProps> = ({
  title = 'Crafting Your AI Content...',
  subtitle = 'Please wait a moment while our AI designs high-quality slides and documents.',
  type = 'presentation'
}) => {
  const [factIndex, setFactIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  const stagesList = STAGES[type] || STAGES.general;

  // Rotate fun facts every 3.5 seconds
  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
    }, 3500);

    return () => clearInterval(factInterval);
  }, []);

  // Advance simulated progress & stages
  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStageIndex((prev) => {
        if (prev < stagesList.length - 1) return prev + 1;
        return prev;
      });
    }, 2200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 92) return prev + Math.floor(Math.random() * 8) + 4;
        return prev;
      });
    }, 400);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [stagesList.length]);

  const currentFact = FUN_FACTS[factIndex];

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-slate-950/90 border border-indigo-500/40 shadow-2xl text-center space-y-6 relative overflow-hidden my-4 animate-in fade-in">
      {/* Background Animated Glow Effects */}
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      {/* Main Spinner & Orb Visual */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        {/* Outer Orbiting Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-400/40 animate-spin [animation-duration:8s]"></div>
        {/* Inner Glowing Gradient Ring */}
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-amber-400 border-r-pink-500 border-b-indigo-500 border-l-cyan-400 animate-spin [animation-duration:2s]"></div>
        
        {/* Center Glowing AI Core */}
        <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-bounce p-1.5 overflow-hidden">
          <img src={logoIcon} alt="BuildMate AI" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h4 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <span>{title}</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] uppercase font-mono tracking-widest">
            {progress}%
          </span>
        </h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{subtitle}</p>
      </div>

      {/* Animated Step Progress Bar */}
      <div className="max-w-md mx-auto space-y-2">
        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-indigo-900/50 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-300 shadow-md shadow-indigo-500/50"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Current Active Stage Text */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-300 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>{stagesList[stageIndex]}</span>
        </div>
      </div>

      {/* Fun Facts & Tips Card (To Keep User Engaged) */}
      <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-left relative group">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
            <span>{currentFact.icon}</span>
            <span>{currentFact.tag}</span>
          </span>
          <button
            type="button"
            onClick={() => setFactIndex((prev) => (prev + 1) % FUN_FACTS.length)}
            className="text-[10px] font-bold text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Next Fact</span>
          </button>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          "{currentFact.text}"
        </p>
      </div>

      <div className="text-[10px] text-slate-500 font-mono tracking-wide">
        BUET KHUZDAR • ACT AI COURSE • MUHAMMAD YOUNAS
      </div>
    </div>
  );
};
