import React, { useState } from 'react';
import type { CargoRequest } from '../types';
import { DEFAULT_DEMO_CARGO } from '../services/api';
import { Anchor, Sparkles, Send, RotateCcw } from 'lucide-react';

interface CargoRequestPageProps {
  onAnalyze: (request: CargoRequest) => void;
  isAnalyzing: boolean;
}

export const CargoRequestPage: React.FC<CargoRequestPageProps> = ({ onAnalyze, isAnalyzing }) => {
  const [form, setForm] = useState<CargoRequest>(DEFAULT_DEMO_CARGO);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'quantity_mt' || name === 'contract_duration_months' || name === 'expected_voyages' || name === 'target_freight_rate'
        ? Number(value)
        : value
    }));
  };

  const handleLoadDemo = () => {
    setForm(DEFAULT_DEMO_CARGO);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(form);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Anchor className="w-5 h-5 text-cyan-700" />
            <span>Cargo Procurement Requirement</span>
          </h2>
          <p className="text-xs text-slate-500">
            Submit overseas raw material cargo details to trigger end-to-end freight prediction and charter optimization.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadDemo}
          className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-cyan-700" />
          <span>LOAD DEMO SCENARIO</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Cargo Type</label>
            <select
              name="cargo_type"
              value={form.cargo_type}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
            >
              <option value="Iron Ore">Iron Ore</option>
              <option value="Coking Coal">Coking Coal</option>
              <option value="Thermal Coal">Thermal Coal</option>
              <option value="Limestone">Limestone</option>
              <option value="Other Bulk Cargo">Other Bulk Cargo</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Quantity (Metric Tons - MT)</label>
            <input
              type="number"
              name="quantity_mt"
              value={form.quantity_mt}
              onChange={handleInputChange}
              min={10000}
              max={300000}
              step={5000}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-cyan-600 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Origin Port (Overseas Loading)</label>
            <select
              name="origin_port"
              value={form.origin_port}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
            >
              <option value="Port Hedland">Port Hedland (Australia)</option>
              <option value="Hay Point">Hay Point (Australia)</option>
              <option value="Newcastle">Newcastle (Australia)</option>
              <option value="Gladstone">Gladstone (Australia)</option>
              <option value="Tubarao">Tubarao (Brazil)</option>
              <option value="Samarinda">Samarinda (Indonesia)</option>
              <option value="Richards Bay">Richards Bay (South Africa)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Destination Port (East Coast India)</label>
            <select
              name="destination_port"
              value={form.destination_port}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
            >
              <option value="Visakhapatnam">Visakhapatnam (SAIL Strategic Port)</option>
              <option value="Paradip">Paradip</option>
              <option value="Haldia">Haldia (Draft Restricted)</option>
              <option value="Dhamra">Dhamra (Deep Draft)</option>
              <option value="Krishnapatnam">Krishnapatnam</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Required Delivery Start</label>
            <input
              type="date"
              name="delivery_start"
              value={form.delivery_start}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-cyan-600 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Required Delivery End</label>
            <input
              type="date"
              name="delivery_end"
              value={form.delivery_end}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-cyan-600 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Contract Duration (Months)</label>
            <select
              name="contract_duration_months"
              value={form.contract_duration_months}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
            >
              <option value={1}>1 Month (Short Term)</option>
              <option value={3}>3 Months (Medium Term)</option>
              <option value={6}>6 Months (Long Term COA)</option>
              <option value={12}>12 Months (Annual Contract)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Expected Number of Voyages</label>
            <input
              type="number"
              name="expected_voyages"
              value={form.expected_voyages}
              onChange={handleInputChange}
              min={1}
              max={12}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-cyan-600 focus:bg-white focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleLoadDemo}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Form</span>
          </button>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg flex items-center space-x-2 shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>ANALYZE REQUIREMENT</span>
          </button>
        </div>
      </form>
    </div>
  );
};
