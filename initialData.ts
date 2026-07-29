import React from 'react';
import { AIModelOption, RecentFile, CommandShortcut } from '../types';
import { Cpu, FileText, Presentation, FileCode, MoreVertical, Lightbulb, ExternalLink, X, Activity } from 'lucide-react';

interface RightSidebarProps {
  model: AIModelOption;
  recentFiles: RecentFile[];
  shortcuts: CommandShortcut[];
  onChangeModelClick: () => void;
  onSelectRecentFile: (file: RecentFile) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  model,
  recentFiles,
  shortcuts,
  onChangeModelClick,
  onSelectRecentFile,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 xl:hidden transition-opacity animate-in fade-in"
        />
      )}

      <aside
        className={`fixed xl:static top-0 right-0 bottom-0 z-50 xl:z-auto w-80 bg-slate-950 border-l border-indigo-900/30 p-3 space-y-4 overflow-y-auto flex-shrink-0 select-none transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full xl:translate-x-0'
        }`}
      >
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between xl:hidden pb-2 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-xs text-white">System Info & History</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. AI Status Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-900/50 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                AI Status
              </h4>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Online</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] mb-3">
            <div>
              <span className="text-[10px] text-slate-500 block">Model</span>
              <span className="font-bold text-slate-200 text-[10px] line-clamp-1">{model.name}</span>
            </div>
            <div className="border-x border-slate-800 px-1">
              <span className="text-[10px] text-slate-500 block">Context</span>
              <span className="font-bold text-indigo-300 font-mono text-[10px]">{model.contextWindow}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Temp</span>
              <span className="font-bold text-purple-300 font-mono text-[10px]">{model.temperature}</span>
            </div>
          </div>

          <button
            onClick={() => {
              onChangeModelClick();
              onCloseMobile?.();
            }}
            className="w-full py-2 px-3 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/50 text-xs font-medium transition-all flex items-center justify-center gap-2 min-h-[38px]"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Change Model</span>
          </button>
        </div>

        {/* 2. Recent Files Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-900/50 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Recent Files
              </h4>
            </div>
            <span className="text-[10px] text-indigo-400 hover:underline cursor-pointer font-medium">
              View All
            </span>
          </div>

          <div className="space-y-2">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => {
                  onSelectRecentFile(file);
                  onCloseMobile?.();
                }}
                className="group p-2 rounded-xl bg-slate-950/60 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex items-center justify-between cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {/* File Type Badge */}
                  {file.type === 'pdf' && (
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      PDF
                    </div>
                  )}
                  {file.type === 'pptx' && (
                    <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      PPTX
                    </div>
                  )}
                  {file.type === 'docx' && (
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      DOCX
                    </div>
                  )}
                  {file.type === 'code' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0">
                      &lt;/&gt;
                    </div>
                  )}

                  <div className="overflow-hidden">
                    <h5 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                      {file.name}
                    </h5>
                    <span className="text-[10px] text-slate-500 block">
                      {file.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-500 opacity-80 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-3.5 h-3.5 hover:text-indigo-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Tips & Shortcuts Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-900/50 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Tips & Shortcuts
            </h4>
          </div>

          <div className="space-y-1.5 font-sans">
            {shortcuts.map((sc) => (
              <div
                key={sc.command}
                className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-950/50 border border-slate-800/60"
              >
                <code className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px] border border-indigo-800/50">
                  {sc.command}
                </code>
                <span className="text-slate-400 text-[10px] text-right">
                  {sc.description}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 mt-3 text-center border-t border-slate-800 pt-2">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </aside>
    </>
  );
};

