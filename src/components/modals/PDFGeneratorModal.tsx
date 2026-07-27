import React, { useState } from 'react';
import { PDFData } from '../../types';
import { downloadPDF } from '../../utils/pdfGenerator';
import { downloadWordDocument } from '../../utils/exporter';
import { X, FileText, Download, Sparkles, RefreshCw, Layers, FileCode, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AIGeneratorLoader } from '../AIGeneratorLoader';

interface PDFGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PDFData | null;
  onGeneratePDF: (topic: string, instructions: string) => Promise<PDFData | void>;
}

export const PDFGeneratorModal: React.FC<PDFGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onGeneratePDF,
}) => {
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfData, setPdfData] = useState<PDFData | null>(initialData || null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const result = await onGeneratePDF(topic, instructions);
      if (result) {
        setPdfData(result);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (pdfData) {
      downloadPDF(pdfData);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-indigo-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-indigo-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                PDF Report Studio
              </h3>
              <p className="text-xs text-slate-400">
                Generate structured PDF reports with Executive Summaries & Sections
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-indigo-900/30">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Report Topic / Title
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Discrete Structures & Hasse Diagrams"
                className="w-full bg-slate-900 border border-indigo-900/60 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Custom Instructions (Optional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Include mathematical logic & graph theory examples"
                className="w-full bg-slate-900 border border-indigo-900/60 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={!topic.trim() || isGenerating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGenerating ? 'Generating PDF Content...' : 'Generate Report Content'}</span>
              </button>
            </div>
          </div>

          {/* PDF Preview Container or Engaging Loader */}
          {isGenerating ? (
            <AIGeneratorLoader
              type="pdf"
              title="Generating PDF Document Report..."
              subtitle="Writing structured sections, executive summaries & Google Docs export formatted text."
            />
          ) : pdfData ? (
            <div className="bg-slate-950 p-6 rounded-xl border border-indigo-900/50 space-y-4 font-sans text-slate-200">
              <div className="border-b border-indigo-900/50 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-white">{pdfData.title}</h2>
                  <p className="text-xs text-indigo-300 mt-0.5">{pdfData.subtitle}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    BY: {pdfData.author} | DATE: {pdfData.date}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      if (pdfData) {
                        downloadWordDocument(pdfData);
                        confetti({ particleCount: 90, spread: 60 });
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Google Docs / Word (.doc)</span>
                  </button>

                  <a
                    href="https://docs.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Google Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Summary Box */}
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                <h4 className="font-bold text-indigo-300 uppercase tracking-wide text-[11px] mb-1">
                  Executive Summary
                </h4>
                <p className="text-slate-300 leading-relaxed text-xs">{pdfData.summary}</p>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                {pdfData.sections?.map((sec, idx) => (
                  <div key={idx} className="space-y-1.5 p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <h5 className="font-bold text-white text-sm flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-rose-400" />
                      {sec.heading}
                    </h5>
                    <p className="text-slate-300 leading-relaxed">{sec.content}</p>
                    {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                        {sec.bulletPoints.map((bp, bidx) => (
                          <li key={bidx}>{bp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Conclusion */}
              <div className="pt-2 border-t border-slate-800">
                <h5 className="font-bold text-indigo-300 mb-1">Conclusion</h5>
                <p className="text-slate-400 leading-relaxed">{pdfData.conclusion}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
              <FileText className="w-12 h-12 mx-auto text-slate-700 mb-2" />
              <p className="text-xs">Enter a topic above and click "Generate Report Content" to preview & download a PDF.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
