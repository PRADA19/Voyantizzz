import React, { useState } from 'react';
import type { FinalRecommendationOutput } from '../types';
import { Award, HelpCircle, Ship, Calculator, Sparkles, Printer } from 'lucide-react';
import { ExplainableModal } from '../components/ExplainableModal';

interface RecommendationPageProps {
  data: FinalRecommendationOutput;
}

export const RecommendationPage: React.FC<RecommendationPageProps> = ({ data }) => {
  const [showWhyModal, setShowWhyModal] = useState(false);

  const cargo = data.cargo_summary;
  const vessel = data.recommended_vessel;
  const signal = data.market_signal;
  const cost = data.voyage_cost;
  const risk = data.risk_analysis;
  const contract = data.contract_strategy;
  const explain = data.explainable_ai;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-800 uppercase tracking-wider">
            Analysis Reference ID: {data.analysis_id}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2 mt-1">
            <Award className="w-6 h-6 text-teal-600" />
            <span>SAIL-FORCAST FINAL CHARTERING RECOMMENDATION</span>
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => setShowWhyModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-extrabold text-xs rounded-lg flex items-center space-x-1.5 shadow-md shadow-teal-600/20 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-white" />
            <span>WHY THIS DECISION?</span>
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-teal-400 rounded-2xl p-6 shadow-md space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-100/40 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-200 relative z-10">
          <div>
            <div className="text-xs text-slate-500 font-semibold">MARKET SIGNAL</div>
            <div className="text-lg font-extrabold text-teal-700 mt-0.5">🟢 {signal.signal}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">VESSEL MATCH</div>
            <div className="text-lg font-extrabold text-cyan-800 mt-0.5 font-mono">{vessel.match_score}% Match</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">PORT STATUS</div>
            <div className="text-lg font-extrabold text-teal-700 mt-0.5">🟢 {data.port_compatibility.status}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">MODEL CONFIDENCE</div>
            <div className="text-lg font-extrabold text-cyan-800 mt-0.5 font-mono">{data.confidence_pct}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 text-xs">
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="font-bold text-sm text-cyan-900 border-b border-slate-200 pb-2 flex items-center space-x-2">
              <Ship className="w-4 h-4 text-cyan-700" />
              <span>Cargo & Vessel Specification</span>
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Cargo Type:</span>
                <span className="text-slate-900 font-bold">{cargo.cargo_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity Required:</span>
                <span className="text-slate-900 font-bold">{cargo.quantity_mt.toLocaleString()} MT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping Route:</span>
                <span className="text-cyan-800 font-bold">{cargo.origin_port} → {cargo.destination_port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Vessel:</span>
                <span className="text-teal-700 font-bold">{vessel.vessel_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vessel DWT / Type:</span>
                <span className="text-slate-800">{vessel.dwt.toLocaleString()} MT ({vessel.vessel_type})</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="font-bold text-sm text-cyan-900 border-b border-slate-200 pb-2 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-cyan-700" />
              <span>Financial & Operational Parameters</span>
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Freight Rate:</span>
                <span className="text-slate-900 font-bold">₹{data.freight_forecast.current_rate_inr} / MT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Voyage Cost:</span>
                <span className="text-cyan-800 font-bold">₹{cost.total_cost_crores} Crores</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Idle Time:</span>
                <span className="text-amber-700 font-bold">{data.congestion_idle.expected_idle_days} Days ({data.congestion_idle.expected_waiting_hours} hrs)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Overall Risk Score:</span>
                <span className="text-amber-700 font-bold">{risk.overall_risk_score} / 100 ({risk.risk_level})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recommended Contract:</span>
                <span className="text-teal-700 font-bold">{contract.contract_type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 relative z-10">
          <div className="flex items-center space-x-2 text-cyan-800">
            <Sparkles className="w-4 h-4 text-cyan-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono">WHY THIS DECISION? (DYNAMIC RATIONALE)</h3>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed">
            {explain.overall_summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-[11px] space-y-1 shadow-xs">
              <div className="font-bold text-teal-700">1. Market Entry Rationale</div>
              <p className="text-slate-700">{explain.why_signal[0]}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-[11px] space-y-1 shadow-xs">
              <div className="font-bold text-cyan-800">2. Vessel Selection Rationale</div>
              <p className="text-slate-700">{explain.why_vessel[0]}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-[11px] space-y-1 shadow-xs">
              <div className="font-bold text-amber-700">3. Contract Strategy Rationale</div>
              <p className="text-slate-700">{explain.why_contract[0]}</p>
            </div>
          </div>
        </div>
      </div>

      <ExplainableModal
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        title="Complete Explainable AI Decision Rationale"
        summary={explain.overall_summary}
        reasons={[...explain.why_signal, ...explain.why_vessel, ...explain.why_contract]}
      />
    </div>
  );
};
