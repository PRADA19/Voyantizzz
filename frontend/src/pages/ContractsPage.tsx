import React, { useState } from 'react';
import type { FinalRecommendationOutput } from '../types';
import { FileText, Award, HelpCircle } from 'lucide-react';
import { ExplainableModal } from '../components/ExplainableModal';

interface ContractsPageProps {
  data: FinalRecommendationOutput;
}

export const ContractsPage: React.FC<ContractsPageProps> = ({ data }) => {
  const [showWhyModal, setShowWhyModal] = useState(false);

  const contracts = data.all_contracts || [data.contract_strategy];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-700" />
            <span>Contract Strategy Optimization</span>
          </h2>
          <p className="text-xs text-slate-500">
            Risk-adjusted financial comparison across Spot Market, 1-Month, 3-Month, and Contract of Affreightment (COA) options.
          </p>
        </div>

        <button
          onClick={() => setShowWhyModal(true)}
          className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all shadow-xs"
        >
          <HelpCircle className="w-4 h-4" />
          <span>WHY THIS CONTRACT?</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contracts.map((c, idx) => {
          const isRec = c.is_recommended;
          const borderClass = isRec
            ? 'border-teal-400 bg-gradient-to-b from-teal-50/60 via-white to-cyan-50/60 shadow-md'
            : 'border-slate-200 bg-white shadow-sm';

          return (
            <div key={idx} className={`border rounded-xl p-5 space-y-4 flex flex-col justify-between relative ${borderClass}`}>
              {isRec && (
                <div className="absolute -top-3 left-4 bg-teal-700 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                  <Award className="w-3 h-3" />
                  <span>RECOMMENDED STRATEGY</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">{c.contract_type}</h3>
                  <p className="text-xs text-slate-500">{c.rationale}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Effective Rate:</span>
                    <span className="font-bold text-slate-900">₹{c.rate_per_mt_inr} / MT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Expected Cost:</span>
                    <span className="font-bold text-cyan-800">₹{c.total_cost_crores} Cr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Est. Savings vs Spot:</span>
                    <span className="font-bold text-teal-700">₹{(c.estimated_savings_inr / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Flexibility:</span>
                    <span className="text-slate-800">{c.flexibility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Risk Exposure:</span>
                    <span className="text-amber-700 font-bold">{c.risk_score} / 100</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ExplainableModal
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        title="Why 3-Month Contract Strategy Was Selected?"
        reasons={data.explainable_ai.why_contract}
      />
    </div>
  );
};
