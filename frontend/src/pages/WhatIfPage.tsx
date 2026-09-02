import React, { useState } from 'react';
import type { FinalRecommendationOutput, WhatIfOutput } from '../types';
import { Sliders, RotateCcw, Play, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface WhatIfPageProps {
  data: FinalRecommendationOutput;
}

export const WhatIfPage: React.FC<WhatIfPageProps> = ({ data }) => {
  const [bunkerPct, setBunkerPct] = useState<number>(0);
  const [congestionPct, setCongestionPct] = useState<number>(0);
  const [freightPct, setFreightPct] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<WhatIfOutput | null>(null);

  const baseCost = data.voyage_cost.total_cost_crores;
  const baseRisk = data.risk_analysis.overall_risk_score;
  const baseIdle = data.congestion_idle.expected_waiting_hours;

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const response = await api.post<WhatIfOutput>('/simulation/run', {
        cargo: data.cargo_summary,
        bunker_price_change_pct: bunkerPct,
        congestion_change_pct: congestionPct,
        freight_rate_change_pct: freightPct,
      });
      setSimulationResult(response.data);
    } catch (e) {
      const costMult = 1.0 + (freightPct * 0.5 + bunkerPct * 0.3 + congestionPct * 0.1) / 100.0;
      const simCost = Number((baseCost * costMult).toFixed(2));
      const simRisk = Math.min(100, Math.max(0, Number((baseRisk + congestionPct * 0.2 + freightPct * 0.1).toFixed(1))));
      const simIdle = Number((baseIdle * (1.0 + congestionPct / 100.0)).toFixed(1));

      const bStr = bunkerPct > 0 ? `+${bunkerPct}%` : `${bunkerPct}%`;
      const cStr = congestionPct > 0 ? `+${congestionPct}%` : `${congestionPct}%`;
      const fStr = freightPct > 0 ? `+${freightPct}%` : `${freightPct}%`;

      setSimulationResult({
        scenario_name: `Modified Scenario (Bunker ${bStr}, Congestion ${cStr}, Freight ${fStr})`,
        total_cost_crores: simCost,
        cost_delta_crores: Number((simCost - baseCost).toFixed(2)),
        cost_delta_pct: Number((((simCost - baseCost) / baseCost) * 100).toFixed(1)),
        risk_score: simRisk,
        risk_delta: Number((simRisk - baseRisk).toFixed(1)),
        idle_hours: simIdle,
        idle_delta_hours: Number((simIdle - baseIdle).toFixed(1)),
        market_signal: freightPct >= 10 ? 'BUY NOW' : freightPct <= -10 ? 'WAIT' : 'WATCH',
        recommended_vessel: data.recommended_vessel.vessel_name,
        recommended_contract: data.contract_strategy.contract_type
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setBunkerPct(0);
    setCongestionPct(0);
    setFreightPct(0);
    setSimulationResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-700" />
            <span>Interactive What-If Sensitivity Simulator</span>
          </h2>
          <p className="text-xs text-slate-500">
            Simulate market disruptions (fuel spikes, port congestion surges, rate shifts) and evaluate side-by-side financial and operational impact.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET</span>
          </button>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg flex items-center space-x-2 shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>APPLY SCENARIO</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-700">Fuel / Bunker Price Shift</span>
            <span className={`font-mono font-bold ${bunkerPct > 0 ? 'text-rose-600' : bunkerPct < 0 ? 'text-teal-700' : 'text-slate-500'}`}>
              {bunkerPct > 0 ? `+${bunkerPct}%` : `${bunkerPct}%`}
            </span>
          </div>
          <input
            type="range"
            min={-30}
            max={50}
            step={5}
            value={bunkerPct}
            onChange={(e) => setBunkerPct(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-30%</span>
            <span>0% (Baseline)</span>
            <span>+50%</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-700">Port Congestion Surge</span>
            <span className={`font-mono font-bold ${congestionPct > 0 ? 'text-rose-600' : congestionPct < 0 ? 'text-teal-700' : 'text-slate-500'}`}>
              {congestionPct > 0 ? `+${congestionPct}%` : `${congestionPct}%`}
            </span>
          </div>
          <input
            type="range"
            min={-50}
            max={100}
            step={10}
            value={congestionPct}
            onChange={(e) => setCongestionPct(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-50%</span>
            <span>0% (Baseline)</span>
            <span>+100%</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-700">Freight Rate Market Delta</span>
            <span className={`font-mono font-bold ${freightPct > 0 ? 'text-rose-600' : freightPct < 0 ? 'text-teal-700' : 'text-slate-500'}`}>
              {freightPct > 0 ? `+${freightPct}%` : `${freightPct}%`}
            </span>
          </div>
          <input
            type="range"
            min={-30}
            max={50}
            step={5}
            value={freightPct}
            onChange={(e) => setFreightPct(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-30%</span>
            <span>0% (Baseline)</span>
            <span>+50%</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
          Baseline vs Modified Scenario Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-mono border-b border-slate-200">
              <tr>
                <th className="p-3.5">Metric / Parameter</th>
                <th className="p-3.5">Current Baseline</th>
                <th className="p-3.5">Modified Scenario</th>
                <th className="p-3.5 text-right">Delta Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              <tr>
                <td className="p-3.5 font-semibold text-slate-900">Total Expected Cost</td>
                <td className="p-3.5 font-mono text-cyan-800 font-bold">₹{baseCost} Cr</td>
                <td className="p-3.5 font-mono font-bold text-slate-900">
                  ₹{simulationResult ? simulationResult.total_cost_crores : baseCost} Cr
                </td>
                <td className="p-3.5 text-right font-mono font-bold">
                  {simulationResult ? (
                    <span className={simulationResult.cost_delta_crores > 0 ? 'text-rose-600' : simulationResult.cost_delta_crores < 0 ? 'text-teal-700' : 'text-slate-500'}>
                      {simulationResult.cost_delta_crores > 0 ? `+₹${simulationResult.cost_delta_crores} Cr` : `₹${simulationResult.cost_delta_crores} Cr`} ({simulationResult.cost_delta_pct}%)
                    </span>
                  ) : (
                    <span className="text-slate-400">0.0 Cr</span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-slate-900">Overall Risk Score</td>
                <td className="p-3.5 font-mono text-amber-700 font-bold">{baseRisk} / 100</td>
                <td className="p-3.5 font-mono font-bold text-slate-900">
                  {simulationResult ? `${simulationResult.risk_score} / 100` : `${baseRisk} / 100`}
                </td>
                <td className="p-3.5 text-right font-mono font-bold">
                  {simulationResult ? (
                    <span className={simulationResult.risk_delta > 0 ? 'text-rose-600' : simulationResult.risk_delta < 0 ? 'text-teal-700' : 'text-slate-500'}>
                      {simulationResult.risk_delta > 0 ? `+${simulationResult.risk_delta}` : simulationResult.risk_delta} pts
                    </span>
                  ) : (
                    <span className="text-slate-400">0.0 pts</span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-slate-900">Expected Idle Waiting Time</td>
                <td className="p-3.5 font-mono text-cyan-800 font-bold">{baseIdle} hrs</td>
                <td className="p-3.5 font-mono font-bold text-slate-900">
                  {simulationResult ? `${simulationResult.idle_hours} hrs` : `${baseIdle} hrs`}
                </td>
                <td className="p-3.5 text-right font-mono font-bold">
                  {simulationResult ? (
                    <span className={simulationResult.idle_delta_hours > 0 ? 'text-rose-600' : simulationResult.idle_delta_hours < 0 ? 'text-teal-700' : 'text-slate-500'}>
                      {simulationResult.idle_delta_hours > 0 ? `+${simulationResult.idle_delta_hours} hrs` : `${simulationResult.idle_delta_hours} hrs`}
                    </span>
                  ) : (
                    <span className="text-slate-400">0.0 hrs</span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-slate-900">Market Entry Signal</td>
                <td className="p-3.5 font-bold text-teal-700">🟢 {data.market_signal.signal}</td>
                <td className="p-3.5 font-bold text-cyan-800">
                  {simulationResult ? simulationResult.market_signal : data.market_signal.signal}
                </td>
                <td className="p-3.5 text-right font-mono text-slate-400">—</td>
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-slate-900">Recommended Vessel</td>
                <td className="p-3.5 text-slate-700">{data.recommended_vessel.vessel_name}</td>
                <td className="p-3.5 font-bold text-slate-900">
                  {simulationResult ? simulationResult.recommended_vessel : data.recommended_vessel.vessel_name}
                </td>
                <td className="p-3.5 text-right font-mono text-slate-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
