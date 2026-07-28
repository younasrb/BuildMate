import React from 'react';
import { QuickAction } from '../types';
import { FileText, Presentation, Code2, FileSearch, Bug, Globe, Sparkles } from 'lucide-react';

interface QuickActionsGridProps {
  actions: QuickAction[];
  onSelectAction: (actionId: QuickAction['id']) => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  actions,
  onSelectAction,
}) => {
  const getIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-5 h-5" style={{ color }} />;
      case 'Presentation':
        return <Presentation className="w-5 h-5" style={{ color }} />;
      case 'Code2':
        return <Code2 className="w-5 h-5" style={{ color }} />;
      case 'FileSearch':
        return <FileSearch className="w-5 h-5" style={{ color }} />;
      case 'Bug':
        return <Bug className="w-5 h-5" style={{ color }} />;
      case 'Globe':
        return <Globe className="w-5 h-5" style={{ color }} />;
      default:
        return <Sparkles className="w-5 h-5" style={{ color }} />;
    }
  };

  return (
    <div className="my-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Quick Actions
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onSelectAction(action.id)}
            className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/80 border border-indigo-900/40 hover:border-indigo-500/60 hover:bg-slate-850/90 text-center transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/10 cursor-pointer"
          >
            {/* Badge Icon Container */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 border ${action.badgeBg} group-hover:scale-110 transition-transform shadow-inner`}>
              {getIcon(action.iconName, action.accentColor)}
            </div>

            <span className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-1">
              {action.title}
            </span>

            <span className="text-[10px] text-slate-400 mt-1 line-clamp-1 leading-tight group-hover:text-slate-300">
              {action.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
