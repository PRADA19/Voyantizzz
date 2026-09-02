import React from 'react';
import { Database } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-sky-100/70 via-cyan-50/70 to-teal-50/70 border border-sky-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-700 shadow-sm">
      <div className="flex items-center space-x-2.5">
        <Database className="w-4 h-4 text-cyan-700 shrink-0" />
        <div>
          <span className="font-bold text-slate-900 uppercase tracking-wider font-mono mr-2">Prototype Demo</span>
          <span>Using representative bulk maritime dataset covering 5 years of historical rates, vessels & ports.</span>
        </div>
      </div>
      <span className="hidden sm:inline font-mono text-[10px] text-cyan-800 bg-cyan-100 border border-cyan-300 px-2 py-0.5 rounded font-semibold">
        Offline Ready
      </span>
    </div>
  );
};
