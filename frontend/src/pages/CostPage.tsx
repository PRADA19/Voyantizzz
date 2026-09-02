import React from 'react';
import type { FinalRecommendationOutput } from '../types';
import { Calculator, DollarSign, PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface CostPageProps {
  data: FinalRecommendationOutput;
}

export const CostPage: React.FC<CostPageProps> = ({ data }) => {
  const cost = data.voyage_cost;

  const costBreakdownData = [
    { name: 'Freight Cost', value: cost.freight_cost_inr, color: '#0891b2' },
    { name: 'Bunker / Fuel', value: cost.bunker_cost_inr, color: '#0284c7' },
    { name: 'Port Charges', value: cost.port_charges_inr, color: '#d97706' },
    { name: 'Handling Fees', value: cost.handling_cost_inr, color: '#0d9488' },
    { name: 'Idle / Waiting', value: cost.idle_delay_cost_inr, color: '#e11d48' },
    { name: 'Other Expenses', value: cost.other_expenses_inr, color: '#7c3aed' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-cyan-700" />
            <span>Comprehensive Voyage Financial Cost Model</span>
          </h2>
          <p className="text-xs text-slate-500">
            Granular breakdown of freight base, bunker fuel consumption, port dues, handling charges, and anchorage waiting delays.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-cyan-800 font-mono">
            ₹{cost.total_cost_crores} Crores
          </div>
          <div className="text-xs text-slate-500">Total Estimated Voyage Cost</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Voyage Cost</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">₹{(cost.total_voyage_cost_inr / 10000000).toFixed(2)} Cr</div>
          <span className="text-xs text-slate-500">₹{cost.total_voyage_cost_inr.toLocaleString()} INR</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Cost Per Metric Ton</span>
          <div className="text-2xl font-bold text-cyan-800 font-mono mt-1">₹{cost.cost_per_mt_inr} / MT</div>
          <span className="text-xs text-slate-500">Quantity: {data.cargo_summary.quantity_mt.toLocaleString()} MT</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Bunker Fuel Expense</span>
          <div className="text-2xl font-bold text-sky-700 font-mono mt-1">₹{(cost.bunker_cost_inr / 100000).toFixed(1)} Lakhs</div>
          <span className="text-xs text-slate-500">~{((cost.bunker_cost_inr / cost.total_voyage_cost_inr) * 100).toFixed(1)}% of total cost</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-cyan-700" />
            <span>Line-Item Financial Cost Components</span>
          </h3>

          <div className="space-y-2 text-xs">
            {costBreakdownData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-800 font-medium">{item.name}</span>
                </div>
                <div className="font-mono text-right">
                  <div className="font-bold text-slate-900">₹{item.value.toLocaleString()}</div>
                  <div className="text-slate-500 text-[10px]">{((item.value / cost.total_voyage_cost_inr) * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <PieIcon className="w-4 h-4 text-cyan-700" />
            <span>Cost Distribution Breakdown</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Cost']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
