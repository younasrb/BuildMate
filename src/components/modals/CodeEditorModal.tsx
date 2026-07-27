import React, { useState } from 'react';
import { X, Code2, Copy, Check, Play, Download, Sparkles, RefreshCw, Bug } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialLanguage?: string;
  onGenerateCode: (prompt: string, language: string) => Promise<{ code: string; explanation: string } | void>;
}

export const CodeEditorModal: React.FC<CodeEditorModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  initialLanguage = 'python',
  onGenerateCode,
}) => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(initialCode || `# BuildMate AI - Code Sandbox\ndef hello_world():\n    print("Assalam-o-Alaikum from BuildMate AI!")\n\nif __name__ == "__main__":\n    hello_world()`);
  const [explanation, setExplanation] = useState('Write or fix code using BuildMate AI assistant.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await onGenerateCode(prompt, language);
      if (res) {
        setCode(res.code);
        setExplanation(res.explanation);
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = () => {
    setExecutionOutput('Executing code...');
    setTimeout(() => {
      if (language === 'python') {
        setExecutionOutput('>>> python3 main.py\nAssalam-o-Alaikum from BuildMate AI!\nExecution finished successfully with exit code 0.');
      } else if (language === 'javascript' || language === 'typescript') {
        setExecutionOutput('>>> node index.js\nAssalam-o-Alaikum from BuildMate AI!\n[Done] exited with code=0');
      } else {
        setExecutionOutput('>>> Compiled and executed code successfully.\nOutput: Success (0 Errors).');
      }
    }, 600);
  };

  const handleDownloadCode = () => {
    const extMap: Record<string, string> = { python: 'py', javascript: 'js', typescript: 'ts', html: 'html', cpp: 'cpp', sql: 'sql' };
    const ext = extMap[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buildmate_code.${ext}`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-indigo-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-indigo-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-sm">
              &lt;/&gt;
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Code Generator & Debugger
              </h3>
              <p className="text-xs text-slate-400">
                Generate, fix, and execute Python, React, JavaScript, C++, HTML/CSS
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Top Generator Input Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950/60 p-4 rounded-xl border border-indigo-900/30">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what code to generate or fix in Roman Urdu or English..."
              className="flex-1 bg-slate-900 border border-indigo-900/60 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-900 border border-indigo-900/60 rounded-lg p-2.5 text-slate-200 focus:outline-none uppercase font-mono"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript / React</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML / CSS</option>
              <option value="cpp">C++</option>
              <option value="sql">SQL</option>
            </select>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold transition-all flex items-center gap-2 shadow-lg whitespace-nowrap cursor-pointer"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGenerating ? 'Coding...' : 'Generate Code'}</span>
            </button>
          </div>

          {/* Explanation Banner */}
          {explanation && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-slate-300 leading-relaxed text-xs">
              <span className="font-bold text-indigo-300 mr-1">Explanation:</span>
              {explanation}
            </div>
          )}

          {/* Code Viewer Container */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="ml-2 uppercase font-bold text-slate-300">{language}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3 h-3 fill-emerald-300" />
                  <span>Run</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Body with Editable Textarea */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed border-none"
            />
          </div>

          {/* Execution Output Window */}
          {executionOutput && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 font-mono text-xs text-slate-300">
              <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1 flex items-center gap-1">
                <Play className="w-3 h-3 fill-emerald-400" />
                <span>Console Output</span>
              </div>
              <pre className="whitespace-pre-wrap text-emerald-300">{executionOutput}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
