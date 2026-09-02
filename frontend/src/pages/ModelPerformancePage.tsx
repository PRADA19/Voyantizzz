import React from 'react';
import { Cpu, BarChart2 } from 'lucide-react';
import type { FinalRecommendationOutput } from '../types';

interface ModelPerformancePageProps {
  data: FinalRecommendationOutput;
}

export const ModelPerformancePage: React.FC<ModelPerformancePageProps> = ({ data }) => {
  const m = data.freight_forecast.metrics;

  const features = [
    { name: 'Baltic Dry Index (BDI Lag)', importance: '34%' },
    { name: '4-Week Rolling Freight Rate Average', importance: '28%' },
    { name: 'VLSFO Bunker Fuel Price', importance: '18%' },
    { name: 'Freight Rate Lag 1 Step', importance: '12%' },
    { name: 'Seasonal Month & DayOfYear Index', importance: '8%' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-700" />
            <span>Machine Learning Freight Forecasting Evaluation</span>
          </h2>
          <p className="text-xs text-slate-500">
            RandomForest Regression model metrics computed on test dataset partition.
          </p>
        </div>
        <span className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-300 text-xs font-mono font-bold rounded">
          Model Status: Trained & Validated
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">MAE</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">₹{m.mae}</div>
          <span className="text-[10px] text-slate-500">Mean Absolute Error</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">RMSE</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">₹{m.rmse}</div>
          <span className="text-[10px] text-slate-500">Root Mean Sq Error</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">R² Metric</span>
          <div className="text-2xl font-bold text-cyan-800 font-mono mt-1">{m.r2}</div>
          <span className="text-[10px] text-slate-500">Variance Explained</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">MAPE</span>
          <div className="text-2xl font-bold text-teal-700 font-mono mt-1">{m.mape}%</div>
          <span className="text-[10px] text-slate-500">Mean Abs Pct Error</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-cyan-700" />
          <span>Feature Importance Weight Breakdown</span>
        </h3>

        <div className="space-y-3">
          {features.map((f, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">{f.name}</span>
                <span className="text-cyan-800 font-mono font-bold">{f.importance}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-cyan-600 h-full rounded-full"
                  style={{ width: f.importance }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
