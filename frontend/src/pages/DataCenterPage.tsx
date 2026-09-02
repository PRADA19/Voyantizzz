import React from 'react';
import { Database, FileText } from 'lucide-react';

export const DataCenterPage: React.FC = () => {
  const datasets = [
    { name: 'freight_rates.csv', records: 1776, size: '245 KB', updated: '2026-09-01', missing: '0%' },
    { name: 'vessels.csv', records: 15, size: '4.2 KB', updated: '2026-09-01', missing: '0%' },
    { name: 'ports.csv', records: 14, size: '3.8 KB', updated: '2026-09-01', missing: '0%' },
    { name: 'voyages.csv', records: 150, size: '28 KB', updated: '2026-09-01', missing: '0%' },
    { name: 'weather.csv', records: 264, size: '18 KB', updated: '2026-09-01', missing: '0%' },
    { name: 'bunker_prices.csv', records: 840, size: '42 KB', updated: '2026-09-01', missing: '0%' },
    { name: 'commodity_prices.csv', records: 280, size: '14 KB', updated: '2026-09-01', missing: '0%' },
    { name: 'economic_indicators.csv', records: 140, size: '8 KB', updated: '2026-09-01', missing: '0%' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-700" />
            <span>SAIL-FORCAST Data Integration Center</span>
          </h2>
          <p className="text-xs text-slate-500">
            Unified data service managing historical maritime, port, vessel fleet, weather, and commodity price series.
          </p>
        </div>
        <span className="px-3 py-1 bg-cyan-50 text-cyan-800 border border-cyan-300 text-xs font-mono font-bold rounded">
          Representative Dataset Active
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 uppercase font-mono border-b border-slate-200">
            <tr>
              <th className="p-3.5">Dataset Filename</th>
              <th className="p-3.5">Record Count</th>
              <th className="p-3.5">File Size</th>
              <th className="p-3.5">Last Refreshed</th>
              <th className="p-3.5">Data Quality</th>
              <th className="p-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {datasets.map((d, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3.5 font-bold font-mono text-cyan-800 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>{d.name}</span>
                </td>
                <td className="p-3.5 font-mono">{d.records.toLocaleString()}</td>
                <td className="p-3.5 font-mono text-slate-500">{d.size}</td>
                <td className="p-3.5 font-mono">{d.updated}</td>
                <td className="p-3.5 text-teal-700 font-semibold">{d.missing} missing</td>
                <td className="p-3.5 text-right">
                  <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-300 rounded text-[10px] font-bold">
                    VALIDATED
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
