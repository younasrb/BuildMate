import React, { useState } from 'react';
import { PresentationData, Slide } from '../../types';
import { X, Presentation, ChevronLeft, ChevronRight, Sparkles, RefreshCw, Monitor, Download, Plus, Trash2, Edit3, Palette, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadNativePPTX } from '../../utils/exporter';
import { AIGeneratorLoader } from '../AIGeneratorLoader';
import logoIcon from '../../assets/logo-icon.png';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PresentationData | null;
  initialTopic?: string;
  onGeneratePresentation: (topic: string, slideCount: number) => Promise<PresentationData | void>;
}

type PPTTheme = 'dark' | 'light' | 'navy' | 'emerald' | 'sunset';

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
  initialData,
  initialTopic,
  onGeneratePresentation,
}) => {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [presentation, setPresentation] = useState<PresentationData | null>(initialData || null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [pptTheme, setPptTheme] = useState<PPTTheme>('dark');
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && initialTopic && initialTopic.trim()) {
      setTopic(initialTopic.trim());
    }
  }, [isOpen, initialTopic]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const result = await onGeneratePresentation(topic, slideCount);
      if (result) {
        setPresentation(result);
        setActiveSlideIndex(0);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message || 'Presentation generate nahi ho saki. Dobara koshish karein.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSlide = () => {
    if (!presentation) return;
    const newSlideNum = presentation.slides.length + 1;
    const newSlide: Slide = {
      slideNumber: newSlideNum,
      title: `New Slide ${newSlideNum}`,
      layout: 'bullet_list',
      bulletPoints: ['First key point', 'Second key point'],
      speakerNotes: 'Notes for presentation speech...'
    };
    const updatedSlides = [...presentation.slides, newSlide];
    setPresentation({ ...presentation, slides: updatedSlides });
    setActiveSlideIndex(updatedSlides.length - 1);
  };

  const handleDeleteSlide = (indexToDelete: number) => {
    if (!presentation || presentation.slides.length <= 1) return;
    const updatedSlides = presentation.slides
      .filter((_, idx) => idx !== indexToDelete)
      .map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    setPresentation({ ...presentation, slides: updatedSlides });
    setActiveSlideIndex((prev) => Math.min(prev, updatedSlides.length - 1));
  };

  const handleUpdateSlideLayout = (newLayout: string) => {
    if (!presentation) return;
    const updated = [...presentation.slides];
    updated[activeSlideIndex].layout = newLayout;
    setPresentation({ ...presentation, slides: updated });
  };

  const handleUpdateSlideTitle = (newTitle: string) => {
    if (!presentation) return;
    const updated = [...presentation.slides];
    updated[activeSlideIndex].title = newTitle;
    setPresentation({ ...presentation, slides: updated });
  };

  const handleUpdateBulletPoint = (bulletIndex: number, text: string) => {
    if (!presentation) return;
    const updated = [...presentation.slides];
    updated[activeSlideIndex].bulletPoints[bulletIndex] = text;
    setPresentation({ ...presentation, slides: updated });
  };

  const handleAddBulletPoint = () => {
    if (!presentation) return;
    const updated = [...presentation.slides];
    updated[activeSlideIndex].bulletPoints.push('New point');
    setPresentation({ ...presentation, slides: updated });
  };

  const handleRemoveBulletPoint = (bulletIndex: number) => {
    if (!presentation) return;
    const updated = [...presentation.slides];
    updated[activeSlideIndex].bulletPoints = updated[activeSlideIndex].bulletPoints.filter((_, idx) => idx !== bulletIndex);
    setPresentation({ ...presentation, slides: updated });
  };

  const handleUpdateSpeakerNotes = (notes: string) => {
    if (!presentation) return;
    const updated = [...presentation.slides];
    updated[activeSlideIndex].speakerNotes = notes;
    setPresentation({ ...presentation, slides: updated });
  };

  const currentSlide = presentation?.slides?.[activeSlideIndex];

  const LAYOUT_OPTIONS: { id: string; name: string }[] = [
    { id: 'bullet_list', name: 'Bullet List' },
    { id: 'section_header', name: 'Section Header' },
    { id: 'two_column', name: 'Two Column' },
    { id: 'quote', name: 'Quote / Statement' },
    { id: 'stat_highlight', name: 'Stat Highlight' },
  ];

  const THEME_OPTIONS: { id: PPTTheme; name: string; bg: string; accent: string }[] = [
    { id: 'dark', name: 'Slate Dark', bg: 'bg-slate-900', accent: 'bg-indigo-500' },
    { id: 'navy', name: 'BUET Navy', bg: 'bg-blue-950', accent: 'bg-amber-500' },
    { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-950', accent: 'bg-emerald-400' },
    { id: 'sunset', name: 'Sunset', bg: 'bg-amber-950', accent: 'bg-orange-500' },
    { id: 'light', name: 'Clean Light', bg: 'bg-slate-100 text-slate-900', accent: 'bg-blue-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-indigo-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-indigo-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-orange-500/30 flex items-center justify-center overflow-hidden p-1">
              <img src={logoIcon} alt="BuildMate AI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                PowerPoint Studio
              </h3>
              <p className="text-xs text-slate-400">
                Generate, edit & download real .pptx presentations directly
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
          {/* Top Generator Input Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950/60 p-4 rounded-xl border border-indigo-900/30">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter presentation topic e.g. Hasse Diagrams & Order Theory"
              className="flex-1 bg-slate-900 border border-indigo-900/60 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
            <select
              value={slideCount}
              onChange={(e) => setSlideCount(Number(e.target.value))}
              className="bg-slate-900 border border-indigo-900/60 rounded-lg p-2.5 text-slate-200 focus:outline-none"
            >
              <option value={3}>3 Slides</option>
              <option value={5}>5 Slides</option>
              <option value={7}>7 Slides</option>
              <option value={10}>10 Slides</option>
            </select>
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-indigo-600 hover:from-orange-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold transition-all flex items-center gap-2 shadow-lg whitespace-nowrap cursor-pointer"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGenerating ? 'Building Slides...' : 'Build Slide Deck'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Interactive Slide Canvas Viewer or Engaging Loader */}
          {isGenerating ? (
            <AIGeneratorLoader
              type="presentation"
              title="Designing Presentation Slide Deck..."
              subtitle="Generating rich slides with bullet points, speaker notes & PowerPoint (.pptx) download."
            />
          ) : presentation && currentSlide ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Slide List Sidebar */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Slides ({presentation.slides.length})
                  </span>
                  <button
                    onClick={handleAddSlide}
                    className="p-1 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 text-[10px] flex items-center gap-1 font-bold cursor-pointer"
                    title="Add new slide"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                {presentation.slides.map((s, idx) => (
                  <div
                    key={idx}
                    className={`group relative flex items-center justify-between rounded-xl border transition-all ${
                      activeSlideIndex === idx
                        ? 'bg-orange-950/60 border-orange-500/80 text-white shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => setActiveSlideIndex(idx)}
                      className="flex-1 text-left p-2.5 flex items-center gap-1.5 truncate cursor-pointer"
                    >
                      <span className="w-4 h-4 rounded bg-orange-500/20 text-orange-400 text-[10px] flex items-center justify-center font-mono shrink-0">
                        {s.slideNumber}
                      </span>
                      <span className="truncate text-[11px] font-bold">{s.title}</span>
                    </button>
                    {presentation.slides.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(idx);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 rounded text-red-400 hover:bg-red-500/20 transition-opacity cursor-pointer"
                        title="Delete slide"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Main Active Slide Display Stage */}
              <div className="md:col-span-3 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 border border-orange-500/30 rounded-2xl p-6 shadow-2xl flex flex-col justify-between min-h-[360px] relative overflow-hidden">
                {/* Header Controls: Theme Selector & Edit Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                      <Palette className="w-3 h-3 text-amber-400" />
                      <span>Theme:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {THEME_OPTIONS.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setPptTheme(t.id)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            pptTheme === t.id
                              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${t.accent}`}></span>
                          <span>{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      isEditing ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    <span>{isEditing ? 'Done Editing' : 'Edit Slide Content'}</span>
                  </button>
                </div>

                {/* Slide Body */}
                <div className="space-y-4">
                  {/* Slide Title + Layout Picker */}
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-amber-400 uppercase block mb-1">Slide Title</label>
                        <input
                          type="text"
                          value={currentSlide.title}
                          onChange={(e) => handleUpdateSlideTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-amber-500/50 rounded-lg p-2 text-white font-bold text-base focus:outline-none"
                        />
                      </div>
                      <div className="sm:w-44">
                        <label className="text-[10px] font-bold text-amber-400 uppercase block mb-1">Layout</label>
                        <select
                          value={currentSlide.layout || 'bullet_list'}
                          onChange={(e) => handleUpdateSlideLayout(e.target.value)}
                          className="w-full bg-slate-950 border border-amber-500/50 rounded-lg p-2 text-white text-xs focus:outline-none"
                        >
                          {LAYOUT_OPTIONS.map((l) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-orange-400" />
                        {currentSlide.title}
                      </h2>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono uppercase tracking-wide">
                        {LAYOUT_OPTIONS.find((l) => l.id === (currentSlide.layout || 'bullet_list'))?.name || currentSlide.layout}
                      </span>
                    </div>
                  )}

                  {/* Bullet Points / Layout-aware Content */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-amber-400 uppercase">
                          {currentSlide.layout === 'quote' ? 'Quote Text' : currentSlide.layout === 'stat_highlight' ? 'Stat + Caption' : 'Bullet Points'}
                        </label>
                        <button
                          onClick={handleAddBulletPoint}
                          className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Point
                        </button>
                      </div>
                      {currentSlide.bulletPoints.map((bp, bidx) => (
                        <div key={bidx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={bp}
                            onChange={(e) => handleUpdateBulletPoint(bidx, e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                          />
                          <button
                            onClick={() => handleRemoveBulletPoint(bidx)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : currentSlide.layout === 'quote' ? (
                    <blockquote className="border-l-4 border-orange-400 pl-4 py-2 text-lg md:text-xl font-bold italic text-slate-100 leading-snug">
                      {currentSlide.bulletPoints?.[0]}
                    </blockquote>
                  ) : currentSlide.layout === 'stat_highlight' ? (
                    <div className="text-center py-2">
                      <div className="text-4xl md:text-5xl font-black text-orange-400">{currentSlide.bulletPoints?.[0]}</div>
                      {currentSlide.bulletPoints?.[1] && (
                        <p className="text-sm text-slate-300 mt-2">{currentSlide.bulletPoints[1]}</p>
                      )}
                    </div>
                  ) : currentSlide.layout === 'section_header' ? (
                    <div
                      className="relative text-center py-10 rounded-xl overflow-hidden bg-cover bg-center"
                      style={currentSlide.imageUrl ? { backgroundImage: `url(${currentSlide.imageUrl})` } : undefined}
                    >
                      {currentSlide.imageUrl && <div className="absolute inset-0 bg-black/50" />}
                      <div className="relative">
                        <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-1">Section</p>
                        {currentSlide.bulletPoints?.[0] && (
                          <p className={`text-sm italic ${currentSlide.imageUrl ? 'text-slate-200' : 'text-slate-400'}`}>{currentSlide.bulletPoints[0]}</p>
                        )}
                      </div>
                    </div>
                  ) : currentSlide.layout === 'two_column' && (currentSlide.bulletPoints?.length || 0) > 1 ? (
                    <div className="grid grid-cols-2 gap-6">
                      {[0, 1].map((col) => {
                        const bp = currentSlide.bulletPoints || [];
                        const mid = Math.ceil(bp.length / 2);
                        const items = col === 0 ? bp.slice(0, mid) : bp.slice(mid);
                        return (
                          <ul key={col} className="space-y-3 font-sans text-slate-200">
                            {items.map((bp, bidx) => (
                              <li key={bidx} className="flex items-start gap-2.5 text-xs md:text-sm">
                                <span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></span>
                                <span className="leading-relaxed">{bp}</span>
                              </li>
                            ))}
                          </ul>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={currentSlide.imageUrl ? 'grid grid-cols-3 gap-4' : ''}>
                      <ul className={`space-y-3 font-sans text-slate-200 ${currentSlide.imageUrl ? 'col-span-2' : ''}`}>
                        {currentSlide.bulletPoints?.map((bp, bidx) => (
                          <li key={bidx} className="flex items-start gap-2.5 text-xs md:text-sm">
                            <span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></span>
                            <span className="leading-relaxed">{bp}</span>
                          </li>
                        ))}
                      </ul>
                      {currentSlide.imageUrl && (
                        <img
                          src={currentSlide.imageUrl}
                          alt=""
                          className="col-span-1 w-full h-32 md:h-full object-cover rounded-lg border border-slate-700"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Speaker Notes */}
                <div className="mt-6 pt-3 border-t border-slate-800 bg-slate-950/80 p-3 rounded-xl border border-indigo-900/30">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block mb-1">
                    🎤 Speaker Notes
                  </span>
                  {isEditing ? (
                    <textarea
                      value={currentSlide.speakerNotes}
                      onChange={(e) => handleUpdateSpeakerNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-slate-400 italic text-xs leading-relaxed">
                      {currentSlide.speakerNotes}
                    </p>
                  )}
                </div>

                {/* Export Options Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        if (presentation) {
                          await downloadNativePPTX(presentation, pptTheme);
                          confetti({ particleCount: 100, spread: 70 });
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer transition-all border border-amber-300/40"
                      title="Download native Microsoft PowerPoint Presentation (.pptx)"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PowerPoint (.pptx)</span>
                    </button>
                  </div>

                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    Theme: <strong className="text-amber-400 capitalize">{pptTheme}</strong>
                  </span>
                </div>

                {/* Slide Nav Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                    disabled={activeSlideIndex === 0}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={() => setActiveSlideIndex((prev) => Math.min(presentation.slides.length - 1, prev + 1))}
                    disabled={activeSlideIndex === presentation.slides.length - 1}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold flex items-center gap-1 shadow cursor-pointer"
                  >
                    <span>Next Slide</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
              <Presentation className="w-12 h-12 mx-auto text-slate-700 mb-2" />
              <p className="text-xs">Enter a presentation topic above to build an interactive slide deck.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

