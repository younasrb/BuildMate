import { AIModelOption, CommandShortcut, QuickAction, RecentFile, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  name: 'Younas Mengal',
  email: 'studentsattendancedemo@gmail.com',
  badge: 'Pro Member',
  avatarText: 'YM',
  isPro: true,
};

export const AI_MODELS: AIModelOption[] = [
  {
    id: 'gemini-3.6-flash',
    name: 'Gemma 3 12B',
    contextWindow: '128K',
    temperature: 0.7,
    description: 'Fast, intelligent model optimized for code, PDFs, and Roman Urdu conversations.',
    badge: 'Recommended',
    isOnline: true,
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    contextWindow: '1M',
    temperature: 0.7,
    description: 'Advanced reasoning model for complex STEM, deep research, and heavy code refactoring.',
    badge: 'Pro',
    isOnline: true,
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemma 2 27B',
    contextWindow: '32K',
    temperature: 0.6,
    description: 'Ultra low latency model for fast translations and quick summaries.',
    badge: 'Fast',
    isOnline: true,
  },
];

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'pdf',
    title: 'Create PDF Report',
    iconName: 'FileText',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    badgeTextColor: 'text-rose-400',
    badgeText: 'PDF',
    description: 'Generate formatted PDF reports with summary & sections',
    accentColor: '#f43f5e',
  },
  {
    id: 'presentation',
    title: 'Create Presentation',
    iconName: 'Presentation',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    badgeTextColor: 'text-orange-400',
    badgeText: 'PPTX',
    description: 'Build slide decks with speaker notes & slide layout',
    accentColor: '#f97316',
  },
  {
    id: 'code',
    title: 'Generate Code',
    iconName: 'Code2',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    badgeTextColor: 'text-emerald-400',
    badgeText: '</>',
    description: 'Write Python, React, JS, C++, HTML/CSS with live preview',
    accentColor: '#10b981',
  },
  {
    id: 'summarize',
    title: 'Summarize Document',
    iconName: 'FileSearch',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    badgeTextColor: 'text-sky-400',
    badgeText: 'DOC',
    description: 'Extract key takeaways & executive summaries',
    accentColor: '#0ea5e9',
  },
  {
    id: 'fix',
    title: 'Fix Code',
    iconName: 'Bug',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    badgeTextColor: 'text-purple-400',
    badgeText: 'FIX',
    description: 'Debug syntax errors, optimize speed & clean code',
    accentColor: '#a855f7',
  },
  {
    id: 'translate',
    title: 'Translate Text',
    iconName: 'Globe',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    badgeTextColor: 'text-indigo-400',
    badgeText: 'TRANS',
    description: 'Seamless Roman Urdu <-> English translation',
    accentColor: '#6366f1',
  },
];

export const INITIAL_RECENT_FILES: RecentFile[] = [
  {
    id: 'rf-1',
    name: 'Discrete Structures Report.pdf',
    type: 'pdf',
    date: 'Today, 10:25 AM',
    size: '1.2 MB',
    pdfData: {
      title: 'Discrete Structures & Graph Theory',
      subtitle: 'Comprehensive Academic Study Report',
      author: 'Younas Mengal',
      date: 'July 2026',
      summary: 'An in-depth analysis of graph connectivity, Euler paths, graph coloring, and propositional logic applications.',
      sections: [
        {
          heading: '1. Graph Connectivity & Hasse Diagrams',
          content: 'A Hasse diagram is a graphical representation of a finite partially ordered set (poset). Transitive edges are omitted for simplicity.',
          bulletPoints: ['Posets & Lattice Structures', 'Upper and Lower Bounds', 'Minimal and Maximal Elements']
        },
        {
          heading: '2. Recurrence Relations',
          content: 'Solving linear homogeneous recurrence relations with constant coefficients using characteristic roots.',
          bulletPoints: ['Fibonacci Sequences', 'Divide and Conquer Algorithms', 'Generating Functions']
        }
      ],
      conclusion: 'Discrete mathematical structures form the fundamental backbone of modern computer science and algorithm analysis.'
    }
  },
  {
    id: 'rf-2',
    name: 'Hasse Diagram Presentation.pptx',
    type: 'pptx',
    date: 'Today, 09:40 AM',
    size: '3.4 MB',
    presentationData: {
      presentationTitle: 'Hasse Diagrams & Posets',
      presentationSubtitle: 'Order Theory in Discrete Mathematics',
      slides: [
        {
          slideNumber: 1,
          title: 'Introduction to Partially Ordered Sets (Posets)',
          layout: 'Title',
          bulletPoints: [
            'Definition: A set R with a reflexive, antisymmetric, and transitive relation',
            'Examples: Divisibility on integers, Subset inclusion',
            'Goal: Simplify visual representation using Hasse Diagrams'
          ],
          speakerNotes: 'Welcome everyone. Today we examine how posets eliminate redundant arrows to build crisp Hasse diagrams.'
        },
        {
          slideNumber: 2,
          title: 'How to Construct a Hasse Diagram',
          layout: 'BulletList',
          bulletPoints: [
            'Step 1: Draw nodes for each set element',
            'Step 2: Place larger elements above smaller elements',
            'Step 3: Connect with lines only covering relations (no transitive loops)'
          ],
          speakerNotes: 'Highlight that direction is implicitly upwards so arrows are replaced with simple line segments.'
        }
      ]
    }
  },
  {
    id: 'rf-3',
    name: 'AI Project Proposal.docx',
    type: 'docx',
    date: 'Yesterday, 08:15 PM',
    size: '850 KB',
  },
  {
    id: 'rf-4',
    name: 'main.py',
    type: 'code',
    date: 'Yesterday, 07:50 PM',
    size: '14 KB',
    content: `# BuildMate AI - Python Execution Script
def analyze_data(items):
    """
    Roman Urdu: Ye function items list ko process karke summary statistics calculate karta hai.
    """
    total = sum(items)
    avg = total / len(items) if items else 0
    return {
        "count": len(items),
        "total": total,
        "average": avg
    }

if __name__ == "__main__":
    sample_data = [12, 45, 67, 89, 23, 90]
    result = analyze_data(sample_data)
    print("Analysis Result:", result)
`
  },
];

export const COMMAND_SHORTCUTS: CommandShortcut[] = [
  { command: '/pdf', description: 'Create PDF report from topic' },
  { command: '/ppt', description: 'Create Presentation outline & slides' },
  { command: '/code', description: 'Generate Code in Python/JS/C++' },
  { command: '/summarize', description: 'Summarize Document or Text' },
  { command: '/help', description: 'Show all commands & shortcuts' },
];
