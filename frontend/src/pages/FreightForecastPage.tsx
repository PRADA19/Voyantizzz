import React, { useState } from 'react';
import type { FinalRecommendationOutput } from '../types';
import { TrendingUp, Cpu, Calendar, Filter } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

interface FreightForecastPageProps {
  data: FinalRecommendationOutput;
}

export const FreightForecastPage: React.FC<FreightForecastPageProps> = ({ data }) => {
  const [horizon, setHorizon] = useState<'7' | '30' | '60'>('30');
  const [route, setRoute] = useState('Australia -> Visakhapatnam');

  const fc = data.freight_forecast;

  const chartData = [
    ...fc.historical_points.map(p => ({
      date: p.date,
      historical: p.actual_rate_inr,
      forecast: null,
      lower: null,
      upper: null
    })),
    ...fc.forecast_points.map(p => ({
      date: p.date,
      historical: null,
      forecast: p.predicted_rate_inr,
      lower: p.lower_bound_inr,
      upper: p.upper_bound_inr
    }))
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-cyan-700" />
            <span>Freight Rate Forecasting Model</span>
          </h2>
          <p className="text-xs text-slate-500">
            Time-series machine learning model trained on 5 years of historical Baltic Dry Index, bunker fuel prices, and route rates.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none"
            >
              <option value="Australia -> Visakhapatnam">Australia → Visakhapatnam (Capesize)</option>
              <option value="Australia -> Paradip">Australia → Paradip (Panamax)</option>
              <option value="Brazil -> Haldia">Brazil → Haldia (Iron Ore)</option>
              <option value="Indonesia -> Dhamra">Indonesia → Dhamra (Thermal Coal)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-300 text-xs font-semibold">
            {(['7', '30', '60'] as const).map(h => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1 rounded transition-colors ${
                  horizon === h ? 'bg-cyan-700 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {h}D
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500">Current Freight Rate</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">₹{fc.current_rate_inr}</div>
          <span className="text-xs text-slate-500">${fc.current_rate_usd} USD/MT</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500">7-Day Forecast</span>
          <div className="text-2xl font-bold text-cyan-800 font-mono mt-1">₹{fc.forecast_7_day_inr}</div>
          <span className="text-xs text-teal-700 font-semibold">+2.7% expected shift</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500">30-Day Forecast Peak</span>
          <div className="text-2xl font-bold text-cyan-700 font-mono mt-1">₹{fc.forecast_30_day_inr}</div>
          <span className="text-xs text-slate-500">Range: ₹{fc.lower_bound_inr} - ₹{fc.upper_bound_inr}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500">Model Confidence</span>
          <div className="text-2xl font-bold text-teal-700 font-mono mt-1">{fc.confidence_pct}%</div>
          <span className="text-xs text-slate-500">Trend: {fc.trend}</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-cyan-700" />
            <span>Multi-horizon Freight Trajectory & Confidence Interval</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Weekly Step Resolution</span>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorCi" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="upper" stroke="#94a3b8" fillOpacity={1} fill="url(#colorCi)" name="Upper Confidence Bound (INR)" />
              <Area type="monotone" dataKey="forecast" stroke="#0891b2" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFc)" name="ML Forecasted Rate (INR)" />
              <Area type="monotone" dataKey="historical" stroke="#0284c7" strokeWidth={2.5} fill="none" name="Historical Rate (INR)" />
              <ReferenceLine y={fc.current_rate_inr} label="Current Spot Rate" stroke="#059669" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center space-x-2 text-cyan-800">
          <Cpu className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Model Validation Metrics (Evaluated on Test Partition)</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
            <div className="text-xs text-slate-500 font-semibold">Mean Absolute Error (MAE)</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-1">₹{fc.metrics.mae}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
            <div className="text-xs text-slate-500 font-semibold">Root Mean Sq Error (RMSE)</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-1">₹{fc.metrics.rmse}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
            <div className="text-xs text-slate-500 font-semibold">R-Squared (R²)</div>
            <div className="text-lg font-bold text-cyan-800 font-mono mt-1">{fc.metrics.r2}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
            <div className="text-xs text-slate-500 font-semibold">Mean Abs Pct Error (MAPE)</div>
            <div className="text-lg font-bold text-teal-700 font-mono mt-1">{fc.metrics.mape}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
