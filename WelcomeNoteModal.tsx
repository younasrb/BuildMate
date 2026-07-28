import React, { useState, useEffect, useRef } from 'react';
import { Message, UserProfile, ModelCategory } from '../../types';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Globe, Sparkles, Bot, User, Send, RefreshCw, X, Radio } from 'lucide-react';

interface LiveVoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSendMessage: (text: string, file?: any, category?: ModelCategory) => void;
  isLoading: boolean;
  user: UserProfile;
  selectedCategory: ModelCategory;
}

export const LiveVoiceCallModal: React.FC<LiveVoiceCallModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
  user,
  selectedCategory,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [language, setLanguage] = useState<'ur-PK' | 'en-US'>('ur-PK');
  const [transcript, setTranscript] = useState('');
  const [callState, setCallState] = useState<'connecting' | 'listening' | 'processing' | 'speaking' | 'idle'>('connecting');
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize SpeechSynthesis reference
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Handle call open/close and continuous speech recognition
  useEffect(() => {
    if (!isOpen) {
      stopAllVoiceServices();
      return;
    }

    setCallState('listening');
    startListening();

    return () => {
      stopAllVoiceServices();
    };
  }, [isOpen, language]);

  // Track new assistant messages to automatically read them aloud (Gemini Live Mode)
  useEffect(() => {
    if (!isOpen) return;

    if (isLoading) {
      setCallState('processing');
    } else {
      const latestMessage = messages[messages.length - 1];
      if (
        latestMessage &&
        latestMessage.role === 'assistant' &&
        latestMessage.id !== lastMessageIdRef.current
      ) {
        lastMessageIdRef.current = latestMessage.id;

        if (autoSpeak) {
          speakText(latestMessage.content);
        } else {
          setCallState('listening');
          startListening();
        }
      }
    }
  }, [messages, isLoading, isOpen]);

  // Scroll transcript to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript]);

  const stopAllVoiceServices = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore error
      }
      recognitionRef.current = null;
    }

    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch (e) {
        // ignore error
      }
    }

    setIsListening(false);
    setCallState('idle');
  };

  const startListening = () => {
    if (isMuted) return;

    setSpeechError(null);

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }

    // Stop current synthesis if speaking
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      let currentFinal = '';

      recognition.onstart = () => {
        setIsListening(true);
        setCallState('listening');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const fullTranscript = (currentFinal + interimTranscript).trim();
        setTranscript(fullTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        if (event.error !== 'no-speech') {
          setSpeechError(`Voice Error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error(err);
      setSpeechError('Microphone permission required for Live Voice Call.');
      setIsListening(false);
    }
  };

  const handleSendSpokenQuery = () => {
    if (!transcript.trim()) return;

    const queryToSend = transcript.trim();
    setTranscript('');
    setCallState('processing');

    // Stop listening while AI processes response
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    onSendMessage(queryToSend, undefined, selectedCategory);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setCallState('listening');
      startListening();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean text from markdown code blocks or symbols for speech
      const cleanText = text
        .replace(/```[\s\S]*?```/g, ' Code snippet provided on screen. ')
        .replace(/[*#_`]/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select Urdu or English voice
      const voices = window.speechSynthesis.getVoices();
      if (language === 'ur-PK') {
        const urVoice = voices.find(v => v.lang.startsWith('ur') || v.name.toLowerCase().includes('urdu') || v.lang.startsWith('hi'));
        if (urVoice) utterance.voice = urVoice;
        utterance.lang = 'ur-PK';
      } else {
        const enVoice = voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
        utterance.lang = 'en-US';
      }

      utterance.onstart = () => {
        setCallState('speaking');
      };

      utterance.onend = () => {
        setCallState('listening');
        // Auto resume listening after AI finishes speaking (Gemini Live loop)
        if (!isMuted) {
          startListening();
        }
      };

      utterance.onerror = () => {
        setCallState('listening');
        if (!isMuted) startListening();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      setCallState('listening');
      if (!isMuted) startListening();
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);

    if (nextMute) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      setCallState('idle');
    } else {
      startListening();
    }
  };

  const handleStopSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    setCallState('listening');
    if (!isMuted) startListening();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[750px]">
        
        {/* Top Call Header */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-indigo-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 relative"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Gemini & ChatGPT Style Live Voice Call
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  Real-time Voice
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Speaks & Listens in {language === 'ur-PK' ? 'Urdu / Roman Urdu 🇵🇰' : 'English 🇺🇸'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'ur-PK' ? 'en-US' : 'ur-PK')}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Switch Voice Recognition Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'ur-PK' ? 'Urdu 🇵🇰' : 'English 🇺🇸'}</span>
            </button>

            <button
              onClick={() => {
                stopAllVoiceServices();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Animated Orb & Voice Visualizer */}
        <div className="py-6 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center relative border-b border-indigo-900/30">
          {/* Animated Glowing Orb Rings */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center my-2">
            {callState === 'listening' && (
              <>
                <div className="absolute inset-0 rounded-full bg-indigo-600/20 animate-ping opacity-75"></div>
                <div className="absolute -inset-4 rounded-full bg-purple-600/15 animate-pulse blur-xl"></div>
              </>
            )}

            {callState === 'speaking' && (
              <>
                <div className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-spin blur-md"></div>
                <div className="absolute -inset-6 rounded-full bg-teal-500/20 animate-pulse blur-2xl"></div>
              </>
            )}

            {callState === 'processing' && (
              <div className="absolute inset-0 rounded-full bg-amber-500/30 animate-spin blur-md"></div>
            )}

            <div className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 border ${
              callState === 'listening'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 scale-105 shadow-indigo-500/50'
                : callState === 'speaking'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-600 border-emerald-400 scale-110 shadow-emerald-500/50'
                : callState === 'processing'
                ? 'bg-gradient-to-br from-amber-600 to-orange-600 border-amber-400 animate-pulse shadow-amber-500/50'
                : 'bg-slate-800 border-slate-700'
            }`}>
              <Radio className={`w-8 h-8 sm:w-10 sm:h-10 text-white ${callState === 'listening' ? 'animate-bounce' : ''}`} />
              <span className="text-[10px] uppercase font-extrabold text-white mt-1 tracking-wider">
                {callState === 'listening' ? 'Listening...' : callState === 'speaking' ? 'Speaking...' : callState === 'processing' ? 'Thinking...' : 'Muted'}
              </span>
            </div>
          </div>

          {/* Equalizer Frequency Bar Animation */}
          <div className="flex items-center gap-1.5 h-6 my-2">
            {[12, 24, 18, 30, 16, 28, 14, 22, 10].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-200 ${
                  callState === 'listening'
                    ? 'bg-indigo-400 animate-pulse'
                    : callState === 'speaking'
                    ? 'bg-emerald-400 animate-bounce'
                    : 'bg-slate-700 h-2'
                }`}
                style={{
                  height: callState === 'idle' ? '6px' : `${h}px`,
                  animationDelay: `${i * 80}ms`,
                }}
              />
            ))}
          </div>

          {/* Live Speech Recognition Transcript Box */}
          <div className="w-full max-w-lg mt-2 px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-indigo-900/50 text-center">
            {transcript ? (
              <p className="text-xs sm:text-sm text-indigo-200 font-medium italic animate-in fade-in">
                "{transcript}"
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-normal">
                {callState === 'listening'
                  ? `Voice input active... speak now in ${language === 'ur-PK' ? 'Urdu or Roman Urdu' : 'English'}`
                  : callState === 'speaking'
                  ? 'AI Assistant is speaking response aloud...'
                  : callState === 'processing'
                  ? 'AI is thinking & generating response...'
                  : 'Microphone is muted. Click mic to unmute.'}
              </p>
            )}

            {speechError && (
              <p className="text-xs text-rose-400 mt-1 font-semibold">{speechError}</p>
            )}
          </div>
        </div>

        {/* Live Conversation Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
          <div className="text-center my-1">
            <span className="text-[10px] px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Voice Transcript History
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 text-xs ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed text-xs">{msg.content}</p>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow">
                  {user.avatarText}
                </div>
              )}
            </div>
          ))}

          <div ref={chatBottomRef} />
        </div>

        {/* Bottom Call Action Control Toolbar */}
        <div className="p-4 bg-slate-950 border-t border-indigo-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Mute Mic Button */}
            <button
              onClick={toggleMute}
              className={`p-3 rounded-2xl font-bold transition-all flex items-center justify-center ${
                isMuted
                  ? 'bg-rose-950 border border-rose-500/50 text-rose-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5 text-indigo-400" />}
            </button>

            {/* Auto Speak Toggle */}
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                autoSpeak
                  ? 'bg-indigo-950 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle AI Voice Response Read Aloud"
            >
              {autoSpeak ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span className="hidden sm:inline">{autoSpeak ? 'Auto Voice On' : 'Voice Off'}</span>
            </button>

            {/* Stop AI Speaking button if active */}
            {callState === 'speaking' && (
              <button
                onClick={handleStopSpeaking}
                className="px-3 py-2.5 rounded-2xl bg-amber-950 border border-amber-500/50 text-amber-200 text-xs font-bold flex items-center gap-1"
              >
                <VolumeX className="w-4 h-4 text-amber-400" />
                <span>Stop Voice</span>
              </button>
            )}
          </div>

          {/* Send Spoken Transcript Button */}
          {transcript.trim() && (
            <button
              onClick={handleSendSpokenQuery}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-indigo-600/30 animate-pulse"
            >
              <span>Speak Query Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={() => {
              stopAllVoiceServices();
              onClose();
            }}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all border border-rose-400/40"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>

      </div>
    </div>
  );
};
