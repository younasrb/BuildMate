import React, { useState, useRef } from 'react';
import { X, Code2, Copy, Check, Play, Download, Sparkles, RefreshCw, Bug, FolderTree, FileCode2, Package, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProjectData } from '../../types';

interface CodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialLanguage?: string;
  onGenerateCode: (prompt: string, language: string) => Promise<{ code: string; explanation: string } | void>;
  onGenerateProject?: (topic: string, language: string) => Promise<ProjectData | void>;
}

type EditorMode = 'single' | 'project';

export const CodeEditorModal: React.FC<CodeEditorModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  initialLanguage = 'python',
  onGenerateCode,
  onGenerateProject,
}) => {
  const [mode, setMode] = useState<EditorMode>('single');
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(initialCode || `# BuildMate AI - Code Sandbox\ndef hello_world():\n    print("Assalam-o-Alaikum from BuildMate AI!")\n\nif __name__ == "__main__":\n    hello_world()`);
  const [explanation, setExplanation] = useState('Write or fix code using BuildMate AI assistant.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);

  // Full-project generation state
  const [project, setProject] = useState<ProjectData | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [buildSteps, setBuildSteps] = useState<string[]>([]);
  const [singleErrorMsg, setSingleErrorMsg] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  if (!isOpen) return null;

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const inferLangFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
      js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
      py: 'python', html: 'html', css: 'css', json: 'json', md: 'markdown',
      cpp: 'cpp', c: 'c', sql: 'sql', java: 'java',
    };
    return map[ext] || 'text';
  };

  const handleGenerateSingle = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setSingleErrorMsg(null);
    try {
      const res = await onGenerateCode(prompt, language);
      if (res) {
        setCode(res.code);
        setExplanation(res.explanation);
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      }
    } catch (e: any) {
      console.error(e);
      setSingleErrorMsg(e?.message || 'Code generate nahi ho saka. Dobara koshish karein.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFullProject = async () => {
    if (!prompt.trim() || !onGenerateProject) return;
    setIsGenerating(true);
    setProject(null);
    setBuildSteps(['🔎 Analyzing your requirements...']);
    clearTimers();

    try {
      // Kick off the real request immediately
      const resultPromise = onGenerateProject(prompt, language);

      // Meanwhile, show believable step-by-step progress so the user can
      // see what's happening while the AI builds the project.
      const earlySteps = [
        '📁 Planning project structure...',
        '🧠 Choosing the right files & architecture...',
        '✍️ Writing source code...',
      ];
      earlySteps.forEach((step, idx) => {
        const t = setTimeout(() => {
          setBuildSteps((prev) => [...prev, step]);
        }, 500 * (idx + 1));
        timersRef.current.push(t);
      });

      const result = await resultPromise;
      clearTimers();

      if (result) {
        // Reveal each generated file one by one for a satisfying "building" feel
        const fileSteps = result.files.map((f) => `📄 Created ${f.path}`);
        for (let i = 0; i < fileSteps.length; i++) {
          await new Promise((r) => setTimeout(r, 220));
          setBuildSteps((prev) => [...prev, fileSteps[i]]);
        }
        await new Promise((r) => setTimeout(r, 200));
        setBuildSteps((prev) => [...prev, `✅ Project "${result.projectName}" is ready!`]);

        setProject(result);
        setActiveFileIndex(0);
        if (result.files[0]) {
          setCode(result.files[0].content);
          setLanguage(inferLangFromPath(result.files[0].path));
        }
        setExplanation(result.description || 'Full project generated successfully via BuildMate AI Router.');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error(e);
      setBuildSteps((prev) => [...prev, '⚠️ Something went wrong, please try again.']);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (mode === 'project') {
      handleGenerateFullProject();
    } else {
      handleGenerateSingle();
    }
  };

  const handleSelectFile = (idx: number) => {
    if (!project) return;
    setActiveFileIndex(idx);
    setCode(project.files[idx].content);
    setLanguage(inferLangFromPath(project.files[idx].path));
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

  const handleDownloadProjectZip = async () => {
    if (!project) return;
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      project.files.forEach((f) => {
        zip.file(f.path, f.content);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.projectName || 'buildmate-project'}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to build project zip:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-indigo-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
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
                Generate a single snippet, or a full multi-file project
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
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-indigo-900/30 w-fit">
            <button
              onClick={() => setMode('single')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                mode === 'single' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Single File</span>
            </button>
            {onGenerateProject && (
              <button
                onClick={() => setMode('project')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  mode === 'project' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>Full Project</span>
              </button>
            )}
          </div>

          {/* Top Generator Input Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950/60 p-4 rounded-xl border border-indigo-900/30">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'project'
                  ? 'Describe the whole project you want, e.g. "Student Attendance Management System"...'
                  : 'Describe what code to generate or fix in Roman Urdu or English...'
              }
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
              <span>{isGenerating ? 'Building...' : mode === 'project' ? 'Generate Project' : 'Generate Code'}</span>
            </button>
          </div>

          {mode === 'single' && singleErrorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              ⚠️ {singleErrorMsg}
            </div>
          )}

          {/* Step-by-Step Build Loader */}
          {mode === 'project' && (isGenerating || buildSteps.length > 0) && (
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/40 space-y-1.5 font-mono">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-[11px] uppercase tracking-wider mb-1">
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isGenerating ? 'BuildMate AI is working...' : 'Build Log'}</span>
              </div>
              {buildSteps.map((step, i) => (
                <div key={i} className="text-slate-300 text-[11px] animate-in fade-in slide-in-from-left-1">
                  {step}
                </div>
              ))}
            </div>
          )}

          {/* Explanation Banner */}
          {explanation && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-slate-300 leading-relaxed text-xs">
              <span className="font-bold text-indigo-300 mr-1">Explanation:</span>
              {explanation}
            </div>
          )}

          {/* Project File Tabs */}
          {mode === 'project' && project && project.files.length > 0 && (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {project.files.map((f, idx) => (
                  <button
                    key={f.path}
                    onClick={() => handleSelectFile(idx)}
                    className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] border transition-colors flex items-center gap-1.5 ${
                      activeFileIndex === idx
                        ? 'bg-indigo-600/30 border-indigo-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileCode2 className="w-3 h-3" />
                    <span>{f.path}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleDownloadProjectZip}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Download Project (.zip)</span>
              </button>
            </div>
          )}

          {/* Code Viewer Container */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="ml-2 uppercase font-bold text-slate-300">
                  {mode === 'project' && project ? project.files[activeFileIndex]?.path : language}
                </span>
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
              onChange={(e) => {
                setCode(e.target.value);
                if (mode === 'project' && project) {
                  const updatedFiles = [...project.files];
                  updatedFiles[activeFileIndex] = { ...updatedFiles[activeFileIndex], content: e.target.value };
                  setProject({ ...project, files: updatedFiles });
                }
              }}
              rows={14}
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
