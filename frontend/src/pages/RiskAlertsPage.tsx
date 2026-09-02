import React, { useState } from 'react';
import type { FinalRecommendationOutput, AlertItem } from '../types';
import { ShieldAlert, AlertTriangle, Bell } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface RiskAlertsPageProps {
  data: FinalRecommendationOutput;
  alerts: AlertItem[];
  onDismissAlert: (id: string) => void;
}

export const RiskAlertsPage: React.FC<RiskAlertsPageProps> = ({ data, alerts, onDismissAlert }) => {
  const [activeTab, setActiveTab] = useState<'risk' | 'alerts'>('risk');

  const risk = data.risk_analysis;

  const riskCategoriesData = [
    { name: 'Market Risk', score: risk.market_risk, color: '#06b6d4' },
    { name: 'Port Risk', score: risk.port_risk, color: '#f59e0b' },
    { name: 'Weather Risk', score: risk.weather_risk, color: '#3b82f6' },
    { name: 'Vessel Risk', score: risk.vessel_risk, color: '#10b981' },
    { name: 'Idle Risk', score: risk.idle_risk, color: '#ef4444' },
    { name: 'External Risk', score: risk.external_risk, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>Risk Matrix & Early Warning Alert Engine</span>
          </h2>
          <p className="text-xs text-slate-500">
            Multi-factor weighted risk model evaluating spot price volatility, port congestion, weather patterns, and vessel readiness.
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-300 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'risk' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Risk Analysis
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'alerts' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Alerts ({alerts.length})
          </button>
        </div>
      </div>

      {activeTab === 'risk' ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 uppercase font-mono">Composite Operational Risk Index</span>
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-extrabold text-amber-700 font-mono">
                  {risk.overall_risk_score} / 100
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                  {risk.risk_level} RISK
                </span>
              </div>
              <p className="text-xs text-slate-500">Weighted score across 6 operational and financial vulnerability vectors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 font-mono">Risk Vectors Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskCategoriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '0.5rem', fontSize: '12px' }}
                      formatter={(val: any) => [`${val} / 100`, 'Risk Score']}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {riskCategoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 font-mono">Top Risk Driver Explanations</h3>
              <div className="space-y-3 text-xs">
                {risk.top_risk_factors.map((factor, idx) => (
                  <div key={idx} className="flex items-start space-x-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-slate-800 leading-relaxed">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center space-x-2">
            <Bell className="w-4 h-4 text-amber-600" />
            <span>Active Operational Alerts Feed</span>
          </h3>

          <div className="space-y-3">
            {alerts.map((alert) => {
              const borderClass = 
                alert.severity === 'critical' ? 'border-rose-300 bg-rose-50 text-rose-900' :
                alert.severity === 'warning' ? 'border-amber-300 bg-amber-50 text-amber-900' :
                alert.severity === 'success' ? 'border-teal-300 bg-teal-50 text-teal-900' :
                'border-sky-300 bg-sky-50 text-sky-900';

              return (
                <div key={alert.id} className={`p-4 rounded-xl border ${borderClass} flex justify-between items-start gap-4`}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{alert.title}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                        {alert.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800">{alert.message}</p>
                    <div className="text-[10px] text-slate-500 font-mono pt-1">{alert.timestamp}</div>
                  </div>

                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="text-xs text-slate-700 hover:text-slate-900 px-2.5 py-1 bg-white hover:bg-slate-100 rounded border border-slate-300 shadow-xs"
                  >
                    Dismiss
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
