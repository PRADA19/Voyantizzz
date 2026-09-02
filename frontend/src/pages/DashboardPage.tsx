import React, { useState } from 'react';
import type { FinalRecommendationOutput } from '../types';
import { 
  TrendingUp, 
  Ship, 
  ShieldAlert, 
  Clock, 
  FileText, 
  HelpCircle, 
  ArrowUpRight, 
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { ExplainableModal } from '../components/ExplainableModal';

interface DashboardPageProps {
  data: FinalRecommendationOutput;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ data, onNavigate }) => {
  const [showWhyModal, setShowWhyModal] = useState(false);

  const signalColorClass = 
    data.market_signal.signal === 'BUY NOW' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    data.market_signal.signal === 'WAIT' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
    'text-blue-400 bg-blue-500/10 border-blue-500/30';

  const chartData = [
    ...data.freight_forecast.historical_points.map(p => ({
      date: p.date,
      historical: p.actual_rate_inr,
      forecast: null,
      lower: null,
      upper: null
    })),
    ...data.freight_forecast.forecast_points.map(p => ({
      date: p.date,
      historical: null,
      forecast: p.predicted_rate_inr,
      lower: p.lower_bound_inr,
      upper: p.upper_bound_inr
    }))
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Current Freight Rate</span>
            <TrendingUp className="w-4 h-4 text-cyan-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            ₹{data.freight_forecast.current_rate_inr.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ MT</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            ${data.freight_forecast.current_rate_usd.toFixed(2)} USD / MT
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>30-Day Forecast</span>
            <div className="flex items-center space-x-1 text-teal-700 text-xs font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{data.market_signal.expected_change_pct}%</span>
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-cyan-800 font-mono">
            ₹{data.freight_forecast.forecast_30_day_inr.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ MT</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            Confidence: {data.freight_forecast.confidence_pct}%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Market Signal</span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider border ${signalColorClass}`}>
              🟢 {data.market_signal.signal}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 truncate">
            {data.market_signal.recommendation_summary}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Best Vessel</span>
            <Ship className="w-4 h-4 text-cyan-700" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900 truncate">
            {data.recommended_vessel.vessel_name}
          </div>
          <div className="mt-1 text-xs text-teal-700 font-semibold font-mono">
            {data.recommended_vessel.match_score}% Match • {data.recommended_vessel.vessel_type}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-500">Risk Score</span>
            <div className="text-xl font-bold text-amber-700 font-mono">
              {data.risk_analysis.overall_risk_score} / 100
            </div>
            <div className="text-xs text-slate-500">Level: {data.risk_analysis.risk_level}</div>
          </div>
          <ShieldAlert className="w-8 h-8 text-amber-500/40" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-500">Expected Idle Time</span>
            <div className="text-xl font-bold text-cyan-800 font-mono">
              {data.congestion_idle.expected_idle_days} days
            </div>
            <div className="text-xs text-slate-500">{data.congestion_idle.expected_waiting_hours} hrs waiting</div>
          </div>
          <Clock className="w-8 h-8 text-cyan-500/40" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-500">Recommended Contract</span>
            <div className="text-lg font-bold text-teal-700 truncate">
              {data.contract_strategy.contract_type}
            </div>
            <div className="text-xs text-slate-500">Est. Total Cost: ₹{data.voyage_cost.total_cost_crores} Cr</div>
          </div>
          <FileText className="w-8 h-8 text-teal-500/40" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-50 via-sky-50 to-teal-50 border border-cyan-200 rounded-xl p-5 shadow-sm relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-700" />
              <h3 className="text-sm font-bold text-cyan-900 uppercase tracking-wider font-mono">AI Market Summary</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {data.explainable_ai.overall_summary}
            </p>
          </div>
          <button
            onClick={() => setShowWhyModal(true)}
            className="px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all shrink-0 shadow-sm"
          >
            <HelpCircle className="w-4 h-4" />
            <span>WHY BUY NOW?</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Freight Rate Forecast Trajectory</span>
              <span className="text-xs font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-semibold">
                {data.cargo_summary.origin_port} → {data.cargo_summary.destination_port}
              </span>
            </h3>
            <p className="text-xs text-slate-500">Historical observations vs ML predicted rate bounds (₹/MT)</p>
          </div>
          <button
            onClick={() => onNavigate('forecast')}
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 flex items-center space-x-1"
          >
            <span>Full Forecast Analysis →</span>
          </button>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '0.5rem', fontSize: '12px' }}
                labelStyle={{ color: '#475569' }}
              />
              <Area type="monotone" dataKey="upper" stroke="#94a3b8" fillOpacity={1} fill="url(#colorUpper)" name="Upper Bound (INR)" />
              <Area type="monotone" dataKey="forecast" stroke="#0891b2" strokeWidth={2} fillOpacity={1} fill="url(#colorForecast)" name="Predicted Rate (INR)" />
              <Area type="monotone" dataKey="historical" stroke="#0284c7" strokeWidth={2.5} fill="none" name="Historical Rate (INR)" />
              <ReferenceLine y={data.freight_forecast.current_rate_inr} label="Current Rate" stroke="#059669" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ExplainableModal
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        title="Why BUY NOW Recommendation?"
        summary={data.market_signal.explanation}
        reasons={data.explainable_ai.why_signal}
      />
    </div>
  );
};
