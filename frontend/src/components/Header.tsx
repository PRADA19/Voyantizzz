import React from 'react';
import { Anchor, Play, AlertTriangle, Database, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRunFullDemo: () => void;
  isAnalyzing: boolean;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onRunFullDemo, isAnalyzing, activeAlertCount }) => {
  return (
    <header className="h-16 bg-[#0c2a4a] border-b border-cyan-900/30 px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
          <Anchor className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-wider text-white">SAIL-FORCAST</span>
            <span className="bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 text-xs px-2 py-0.5 rounded font-mono font-semibold">
              SIH26006
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium hidden sm:block">
            Intelligent Freight Forecasting & Vessel Chartering Decision Support
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden lg:flex items-center space-x-2 bg-cyan-950/50 px-3 py-1.5 rounded-lg border border-cyan-700/40 text-xs text-cyan-100">
          <Database className="w-3.5 h-3.5 text-cyan-300" />
          <span>Demo Mode: Representative Data</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-amber-500/20 text-amber-200 border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{activeAlertCount} Active Alerts</span>
        </div>

        <button
          onClick={onRunFullDemo}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-md shadow-cyan-600/30 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Play className="w-4 h-4 fill-current text-white" />
          )}
          <span>🚀 RUN FULL DEMO</span>
        </button>
      </div>
    </header>
  );
};
