import React from 'react';
import { CheckCircle2, Loader2, Anchor } from 'lucide-react';

interface StepProgressModalProps {
  isOpen: boolean;
  currentStep: number;
}

export const PIPELINE_STEPS = [
  'Loading historical freight & market data',
  'Forecasting freight rates with ML engine',
  'Filtering candidate bulk vessels',
  'Checking physical port draft & dimension compatibility',
  'Predicting port congestion & waiting time',
  'Calculating detailed voyage cost model',
  'Assessing operational & financial risk score',
  'Optimizing contract strategy options',
  'Generating explainable AI charter recommendation'
];

export const StepProgressModal: React.FC<StepProgressModalProps> = ({ isOpen, currentStep }) => {
  if (!isOpen) return null;

  const progressPct = Math.round(((currentStep + 1) / PIPELINE_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center border border-cyan-300">
            <Anchor className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Analyzing Cargo Requirement</h3>
            <p className="text-xs text-slate-500">Executing SAIL-FORCAST Decision Support Pipeline</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-cyan-700">Analysis Progress</span>
            <span className="text-slate-700 font-mono">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-r from-cyan-600 to-teal-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {PIPELINE_STEPS.map((stepText, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center space-x-3 text-xs p-2 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-cyan-50 text-cyan-900 border border-cyan-300 font-semibold'
                    : isDone
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-cyan-700 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span>{stepText}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
