import React, { useState, useRef, useEffect } from 'react';
import { Message, UserProfile, ModelCategory } from '../types';
import { Send, Paperclip, Mic, MicOff, Bot, User, Copy, Check, Sparkles, X, Cpu, Zap, Activity, Volume2, VolumeX, PhoneCall, MessageSquare, Edit2 } from 'lucide-react';
import { LiveVoiceCallModal } from './modals/LiveVoiceCallModal';

interface TypewriterTextProps {
  content: string;
  isLatest: boolean;
  onTextUpdate?: () => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ content, isLatest, onTextUpdate }) => {
  const [displayedText, setDisplayedText] = useState(() => (isLatest ? '' : content));
  const [isTyping, setIsTyping] = useState(() => isLatest);

  useEffect(() => {
    if (!isLatest) {
      setDisplayedText(content);
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;
    const length = content.length;

    // Adjust speed & chunk size so responses reveal smoothly like LLM stream tokens (~1-2.5s total)
    const chunkSize = Math.max(2, Math.floor(length / 80));
    const intervalTime = 20; // 20ms tick

    const timer = setInterval(() => {
      currentIndex += chunkSize;
      if (currentIndex >= length) {
        setDisplayedText(content);
        setIsTyping(false);
        clearInterval(timer);
      } else {
        setDisplayedText(content.slice(0, currentIndex));
      }
      onTextUpdate?.();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [content, isLatest]);

  const handleSkip = () => {
    if (isTyping) {
      setDisplayedText(content);
      setIsTyping(false);
    }
  };

  return (
    <div onClick={handleSkip} title={isTyping ? "Click to reveal full text" : undefined} className={isTyping ? "cursor-pointer" : ""}>
      <span className="whitespace-pre-wrap leading-relaxed font-sans text-xs">
        {displayedText}
      </span>
      {isTyping && (
        <span className="inline-block w-1.5 h-3.5 ml-1 bg-indigo-400 animate-pulse align-middle rounded-sm" />
      )}
    </div>
  );
};

interface ChatSectionProps {
  messages: Message[];
  onSendMessage: (
    text: string,
    file?: { name: string; size: string; type: string; content?: string },
    category?: ModelCategory
  ) => void;
  isLoading: boolean;
  user: UserProfile;
  onTriggerAction: (actionType: 'pdf' | 'presentation' | 'code' | 'summarize') => void;
  onViewStructuredData: (msg: Message) => void;
  selectedCategory: ModelCategory;
  onSelectCategory: (cat: ModelCategory) => void;
  sessionTitle?: string;
  onRenameSessionTitle?: (newTitle: string) => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  onSendMessage,
  isLoading,
  user,
  onTriggerAction,
  onViewStructuredData,
  selectedCategory,
  onSelectCategory,
  sessionTitle,
  onRenameSessionTitle,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string; content?: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLanguage, setRecordingLanguage] = useState<'ur-PK' | 'en-US'>('ur-PK');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const clean = text.replace(/```[\s\S]*?```/g, ' Code snippet omitted on voice speech. ').replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = recordingLanguage;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore cleanup error
        }
      }
    };
  }, []);

  const handleSend = () => {
    if ((!inputPrompt.trim() && !attachedFile) || isLoading) return;

    // Check for slash commands
    const trimmed = inputPrompt.trim();
    if (trimmed.startsWith('/pdf')) {
      const topic = trimmed.replace('/pdf', '').trim() || 'Software Architecture Overview';
      onSendMessage(`Create a PDF report on topic: ${topic}`, attachedFile || undefined, selectedCategory);
    } else if (trimmed.startsWith('/ppt')) {
      const topic = trimmed.replace('/ppt', '').trim() || 'Artificial Intelligence Trends';
      onSendMessage(`Create a presentation slide deck on: ${topic}`, attachedFile || undefined, selectedCategory);
    } else if (trimmed.startsWith('/code')) {
      const codeReq = trimmed.replace('/code', '').trim() || 'Write a Python script for data processing';
      onSendMessage(`Generate code for: ${codeReq}`, attachedFile || undefined, 'Coding');
    } else if (trimmed.startsWith('/summarize')) {
      onSendMessage(`Summarize the attached document or following topic: ${trimmed.replace('/summarize', '').trim()}`, attachedFile || undefined, selectedCategory);
    } else if (trimmed.startsWith('/help')) {
      onSendMessage('Show all available slash commands and shortcuts in Roman Urdu & English.', undefined, selectedCategory);
    } else {
      onSendMessage(inputPrompt, attachedFile || undefined, selectedCategory);
    }

    setInputPrompt('');
    setAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const textContent = evt.target?.result as string;
        setAttachedFile({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type || 'document',
          content: textContent || '',
        });
      };
      reader.readAsText(file);
    }
  };

  const toggleRecording = () => {
    setSpeechError(null);

    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
      setIsRecording(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechError('Speech recognition is not supported in this browser window.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = recordingLanguage;

      let finalTranscript = '';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const combined = (finalTranscript + interimTranscript).trim();
        if (combined) {
          setInputPrompt(() => combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setSpeechError(`Voice input error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error(err);
      setSpeechError('Could not access microphone for voice input.');
      setIsRecording(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories: { id: ModelCategory; label: string; icon: string }[] = [
    { id: 'Fast', label: '⚡ Fast', icon: 'zap' },
    { id: 'Balanced', label: '⚖️ Balanced', icon: 'scale' },
    { id: 'Premium', label: '🌟 Premium', icon: 'star' },
    { id: 'Reasoning', label: '🧠 Reasoning', icon: 'brain' },
    { id: 'Coding', label: '💻 Coding', icon: 'code' },
    { id: 'Vision', label: '👁️ Vision', icon: 'eye' },
  ];

  return (
    <div id="chat-section" className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-indigo-900/40 overflow-hidden shadow-2xl my-2 scroll-mt-6">
      {/* Header Bar for Chat */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-indigo-900/30 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 max-w-full overflow-hidden">
          <MessageSquare className="w-4 h-4 text-purple-400 shrink-0" />
          
          {sessionTitle && (
            <div className="flex items-center gap-1.5 truncate">
              {isEditingTitle ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && titleInput.trim()) {
                        onRenameSessionTitle?.(titleInput.trim());
                        setIsEditingTitle(false);
                      } else if (e.key === 'Escape') {
                        setIsEditingTitle(false);
                      }
                    }}
                    autoFocus
                    className="bg-slate-950 text-white text-xs px-2 py-0.5 rounded border border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (titleInput.trim()) {
                        onRenameSessionTitle?.(titleInput.trim());
                      }
                      setIsEditingTitle(false);
                    }}
                    className="p-1 hover:text-emerald-400 text-slate-300"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => { setTitleInput(sessionTitle); setIsEditingTitle(true); }}>
                  <span className="text-xs font-bold text-white truncate max-w-[220px] sm:max-w-[320px]" title={sessionTitle}>
                    {sessionTitle}
                  </span>
                  <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-indigo-300 transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
                </div>
              )}
            </div>
          )}

          {!sessionTitle && (
            <span className="text-xs font-bold text-slate-200">Chat Session</span>
          )}

          <button
            onClick={() => setIsLiveCallOpen(true)}
            className="ml-2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 border border-emerald-400/40 animate-pulse cursor-pointer shrink-0"
            title="Launch Gemini & ChatGPT Style Live Voice Call"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
            <span>Live Voice Call</span>
          </button>
        </div>

        {/* Category Dock */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Category:</span>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                selectedCategory === c.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[380px] h-[calc(100vh-230px)] scrollbar-thin scrollbar-thumb-indigo-900 scrollbar-track-slate-950">
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-indigo-600/30">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-3.5 shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                  : 'bg-slate-900/90 border border-indigo-900/50 text-slate-200 rounded-bl-none'
              }`}
            >
              {/* Provider & Router Metadata Badge for assistant messages */}
              {msg.role === 'assistant' && (msg.providerUsed || msg.modelUsed) && (
                <div className="mb-2 pb-1.5 border-b border-indigo-900/40 flex items-center justify-between text-[10px] text-indigo-300 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-indigo-400" />
                    <span className="uppercase font-bold">{msg.providerUsed || 'Gemini'}</span>
                    <span className="text-slate-400">({msg.modelUsed || '3.6 Flash'})</span>
                  </div>
                  {msg.latencyMs && (
                    <span className="text-amber-400 font-medium">{msg.latencyMs}ms</span>
                  )}
                </div>
              )}

              {/* Attachment tag if user attached file */}
              {msg.fileAttachment && (
                <div className="mb-2 p-2 rounded-lg bg-slate-950/60 border border-indigo-500/30 flex items-center gap-2 text-[11px] text-indigo-300">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="font-medium">{msg.fileAttachment.name}</span>
                  <span className="text-[9px] text-slate-400">({msg.fileAttachment.size})</span>
                </div>
              )}

              {/* Text Body with Streaming Typing Effect */}
              {msg.role === 'assistant' ? (
                <TypewriterText
                  content={msg.content}
                  isLatest={idx === messages.length - 1}
                  onTextUpdate={() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
                />
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs">
                  {msg.content}
                </div>
              )}

              {/* View Generated Artifact Trigger if available */}
              {msg.structuredData && (
                <div className="mt-3 pt-2 border-t border-indigo-800/40 flex items-center justify-between">
                  <span className="text-[10px] text-indigo-300 font-semibold">
                    {msg.actionType === 'pdf' ? '📄 PDF Report Generated' : msg.actionType === 'presentation' ? '📊 Presentation Slides Generated' : '📄 Document Processed'}
                  </span>
                  <button
                    onClick={() => onViewStructuredData(msg)}
                    className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition-all flex items-center gap-1 shadow"
                  >
                    <span>View Interactive Artifact</span>
                  </button>
                </div>
              )}

              {/* Timestamp, Speech Playback & Copy */}
              <div className="mt-2 flex items-center justify-between text-[10px] opacity-75 pt-1">
                <span>{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSpeakMessage(msg.id, msg.content)}
                      className="hover:text-indigo-300 transition-colors p-0.5 flex items-center gap-1"
                      title={speakingMsgId === msg.id ? "Stop voice audio" : "Listen response aloud (Urdu/English)"}
                    >
                      {speakingMsgId === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 hover:text-indigo-300" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopyCode(msg.content, msg.id)}
                      className="hover:text-indigo-300 transition-colors p-0.5"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-700 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-md">
                {user.avatarText}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-indigo-300 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-indigo-900/50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              <span>Intelligent Router routing to best available AI Provider for category '{selectedCategory}'...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Dock */}
      <div className="p-3 bg-slate-900/90 border-t border-indigo-900/40">
        {/* Active Speech Recording Banner */}
        {isRecording && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/50 flex items-center justify-between text-xs text-rose-200 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span className="font-semibold">Listening... speak in {recordingLanguage === 'ur-PK' ? 'Roman Urdu / Urdu' : 'English'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRecordingLanguage(recordingLanguage === 'ur-PK' ? 'en-US' : 'ur-PK')}
                className="text-[10px] px-2 py-0.5 rounded bg-rose-900/60 border border-rose-500/40 hover:bg-rose-800 text-white font-mono"
              >
                Lang: {recordingLanguage === 'ur-PK' ? 'Urdu' : 'English'}
              </button>
              <button onClick={toggleRecording} className="p-0.5 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-between text-xs text-amber-200">
            <span>{speechError}</span>
            <button onClick={() => setSpeechError(null)} className="p-0.5 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Attached file chip */}
        {attachedFile && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-600/40 flex items-center justify-between text-xs text-indigo-200">
            <div className="flex items-center gap-2">
              <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium">{attachedFile.name}</span>
              <span className="text-[10px] text-slate-400">({attachedFile.size})</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="p-1 hover:text-rose-400 text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Box */}
        <div className="relative rounded-xl bg-slate-950 border border-indigo-900/60 focus-within:border-indigo-500/80 transition-all p-2">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... (Speak using mic or type in Roman Urdu / English)"
            rows={2}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none px-2 py-1 font-sans"
          />

              {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-900/80">
            {/* Slash Command Helper Quick Chips - Touch-friendly scroll row */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[10px]">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.pdf,.docx,.py,.js,.ts,.json,.md,.cpp"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-800 transition-colors flex-shrink-0 min-h-[36px]"
                title="Upload file or document"
              >
                <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden min-[400px]:inline">Upload</span>
              </button>

              <button
                onClick={() => onTriggerAction('pdf')}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 font-mono font-bold flex-shrink-0 min-h-[36px] flex items-center"
              >
                /pdf
              </button>
              <button
                onClick={() => onTriggerAction('presentation')}
                className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 border border-orange-500/30 font-mono font-bold flex-shrink-0 min-h-[36px] flex items-center"
              >
                /ppt
              </button>
              <button
                onClick={() => onTriggerAction('code')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 font-mono font-bold flex-shrink-0 min-h-[36px] flex items-center"
              >
                /code
              </button>
              <button
                onClick={() => onTriggerAction('summarize')}
                className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 border border-sky-500/30 font-mono font-bold flex-shrink-0 min-h-[36px] flex items-center"
              >
                /summarize
              </button>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRecordingLanguage(recordingLanguage === 'ur-PK' ? 'en-US' : 'ur-PK')}
                className="px-2 py-1 text-[10px] font-mono rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-white min-h-[36px] flex items-center"
                title="Toggle Voice Recognition Language"
              >
                {recordingLanguage === 'ur-PK' ? '🎤 Urdu' : '🎤 EN'}
              </button>

              <button
                onClick={() => setIsLiveCallOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30 transition-all cursor-pointer min-h-[36px]"
                title="Start Live Voice Call (Gemini / ChatGPT style)"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Live Call</span>
              </button>

              <button
                onClick={toggleRecording}
                className={`p-2 rounded-lg text-xs transition-all flex items-center justify-center min-w-[40px] min-h-[36px] ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-bounce ring-2 ring-rose-400/50'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
                title="Voice input (Web Speech API)"
              >
                {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={handleSend}
                disabled={(!inputPrompt.trim() && !attachedFile) || isLoading}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer min-h-[36px]"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-500 mt-2">
          BuildMate Custom API Proxy & Smart Router • Roman Urdu & English Supported
        </p>
      </div>

      {/* Gemini & ChatGPT Style Live Voice Call Modal */}
      <LiveVoiceCallModal
        isOpen={isLiveCallOpen}
        onClose={() => setIsLiveCallOpen(false)}
        messages={messages}
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        user={user}
        selectedCategory={selectedCategory}
      />
    </div>
  );
};
