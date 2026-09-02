import React from 'react';
import { HelpCircle, X, CheckCircle2 } from 'lucide-react';

interface ExplainableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  reasons: string[];
  summary?: string;
}

export const ExplainableModal: React.FC<ExplainableModalProps> = ({
  isOpen,
  onClose,
  title,
  reasons,
  summary
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-cyan-200 rounded-xl p-6 max-w-xl w-full shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center border border-cyan-300">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Explainable AI Reasoning</h3>
            <p className="text-xs text-cyan-700 font-medium">{title}</p>
          </div>
        </div>

        {summary && (
          <div className="p-3.5 rounded-lg bg-sky-50/80 border border-sky-200 text-xs text-slate-800 leading-relaxed">
            {summary}
          </div>
        )}

        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono">
            Key Decision Factors:
          </div>
          <div className="space-y-2.5">
            {reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span className="text-slate-800 leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Close Rationale
          </button>
        </div>
      </div>
    </div>
  );
};
