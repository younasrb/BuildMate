import React, { useState } from 'react';
import { SummaryData } from '../../types';
import { X, FileSearch, Sparkles, RefreshCw, CheckCircle2, ListChecks, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AIGeneratorLoader } from '../AIGeneratorLoader';

interface SummarizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSummary?: SummaryData | null;
  onSummarizeDocument: (text: string, filename: string) => Promise<SummaryData | void>;
}

export const SummarizerModal: React.FC<SummarizerModalProps> = ({
  isOpen,
  onClose,
  initialSummary,
  onSummarizeDocument,
}) => {
  const [docText, setDocText] = useState('');
  const [filename, setFilename] = useState('My Document');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(initialSummary || null);

  if (!isOpen) return null;

  const handleSummarize = async () => {
    if (!docText.trim()) return;
    setIsSummarizing(true);
    try {
      const res = await onSummarizeDocument(docText, filename);
      if (res) {
        setSummary(res);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilename(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setDocText((evt.target?.result as string) || '');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-indigo-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-indigo-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Document Summarizer
              </h3>
              <p className="text-xs text-slate-400">
                Analyze documents, articles, or notes and extract key insights
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Input Box */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-indigo-900/30">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-semibold">
                Paste Document Text or Upload File
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-sky-600 file:text-white file:font-semibold"
                accept=".txt,.md,.py,.js,.json,.doc"
              />
            </div>

            <textarea
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder="Paste article, report, or notes text here..."
              rows={5}
              className="w-full bg-slate-900 border border-indigo-900/60 rounded-lg p-3 text-slate-200 focus:border-indigo-500 focus:outline-none resize-none font-sans"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSummarize}
                disabled={!docText.trim() || isSummarizing}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                {isSummarizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isSummarizing ? 'Analyzing Document...' : 'Summarize Document'}</span>
              </button>
            </div>
          </div>

          {/* Results View or Engaging Loader */}
          {isSummarizing ? (
            <AIGeneratorLoader
              type="summary"
              title="Analyzing & Summarizing Document..."
              subtitle="Reading document content, extracting key takeaways & structuring executive summary."
            />
          ) : summary ? (
            <div className="bg-slate-950 p-6 rounded-xl border border-sky-500/30 space-y-5 text-slate-200">
              <div className="border-b border-sky-900/50 pb-3">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                  Summary Report
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{summary.documentTitle}</h3>
              </div>

              {/* Executive Summary */}
              <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/20">
                <h4 className="font-bold text-sky-300 uppercase tracking-wide text-[11px] mb-1">
                  Executive Summary
                </h4>
                <p className="text-slate-300 leading-relaxed text-xs">{summary.executiveSummary}</p>
              </div>

              {/* Key Takeaways */}
              {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
                <div>
                  <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Key Takeaways
                  </h4>
                  <ul className="space-y-1.5 pl-2">
                    {summary.keyTakeaways.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main Topics Breakdown */}
              {summary.mainTopics && summary.mainTopics.length > 0 && (
                <div>
                  <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-sky-400" />
                    Topics Breakdown
                  </h4>
                  <div className="space-y-2">
                    {summary.mainTopics.map((top, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="font-bold text-indigo-300 block">{top.topic}</span>
                        <p className="text-slate-400 mt-0.5">{top.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-xl">
              <FileText className="w-12 h-12 mx-auto text-slate-700 mb-2" />
              <p className="text-xs">Paste or upload a document above to generate a summary.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
