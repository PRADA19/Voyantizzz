import React, { useState } from 'react';
import type { FinalRecommendationOutput, VesselRecommendationOutput } from '../types';
import { Ship, Filter, XCircle, HelpCircle, ChevronRight } from 'lucide-react';
import { ExplainableModal } from '../components/ExplainableModal';

interface VesselsPageProps {
  data: FinalRecommendationOutput;
}

export const VesselsPage: React.FC<VesselsPageProps> = ({ data }) => {
  const [selectedVessel, setSelectedVessel] = useState<VesselRecommendationOutput | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showWhyModal, setShowWhyModal] = useState(false);

  const vessels = data.all_vessels || [data.recommended_vessel];

  const filteredVessels = vessels.filter(v => {
    if (filterType !== 'ALL' && v.vessel_type.toLowerCase() !== filterType.toLowerCase()) return false;
    if (filterStatus === 'COMPATIBLE' && !v.port_compatibility.is_compatible) return false;
    if (filterStatus === 'INCOMPATIBLE' && v.port_compatibility.is_compatible) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Ship className="w-5 h-5 text-cyan-700" />
            <span>Vessel Recommendation & Port Suitability Engine</span>
          </h2>
          <p className="text-xs text-slate-500">
            Multi-criteria scoring model evaluating DWT capacity fit, physical port clearance, availability, daily charter rate, and idle risk.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Vessel Types</option>
              <option value="Capesize">Capesize (&gt;120k DWT)</option>
              <option value="Panamax">Panamax (65k-120k DWT)</option>
              <option value="Supramax">Supramax (50k-65k DWT)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 text-xs">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Port Statuses</option>
              <option value="COMPATIBLE">Compatible Only</option>
              <option value="INCOMPATIBLE">Show Rejected Vessels</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-sky-50 border border-teal-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-teal-100 text-teal-900 text-xs font-bold px-2.5 py-0.5 rounded border border-teal-300 uppercase tracking-wider font-mono">
              ★ TOP RECOMMENDATION
            </span>
            <span className="text-xs text-slate-600 font-medium">Ranked #1 Candidate</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-3">
            <span>{data.recommended_vessel.vessel_name}</span>
            <span className="text-sm font-mono text-cyan-800">({data.recommended_vessel.dwt.toLocaleString()} DWT {data.recommended_vessel.vessel_type})</span>
          </h3>
          <p className="text-xs text-slate-700">
            Current Location: <span className="text-cyan-800 font-semibold">{data.recommended_vessel.current_port}</span> • Avail: <span className="font-mono text-slate-900">{data.recommended_vessel.availability_date}</span> • Daily Rate: <span className="font-mono text-teal-700 font-bold">${data.recommended_vessel.daily_charter_rate_usd.toLocaleString()}/day</span>
          </p>
        </div>

        <div className="flex items-center space-x-4 shrink-0">
          <div className="text-right">
            <div className="text-2xl font-extrabold text-teal-700 font-mono">
              {data.recommended_vessel.match_score}%
            </div>
            <div className="text-xs text-slate-500">Overall Match Score</div>
          </div>
          <button
            onClick={() => setShowWhyModal(true)}
            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all shadow-xs"
          >
            <HelpCircle className="w-4 h-4" />
            <span>WHY THIS VESSEL?</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-mono tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Vessel Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">DWT (MT)</th>
                <th className="p-3.5">Draft / LOA / Beam</th>
                <th className="p-3.5">Availability</th>
                <th className="p-3.5">Daily Charter Rate</th>
                <th className="p-3.5">Port Status</th>
                <th className="p-3.5 text-right">Match Score</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredVessels.map((v) => {
                const isCompat = v.port_compatibility.is_compatible;
                const statusColor = 
                  v.port_compatibility.status === 'COMPATIBLE' ? 'text-teal-800 bg-teal-50 border-teal-300' :
                  v.port_compatibility.status === 'CONDITIONALLY COMPATIBLE' ? 'text-amber-800 bg-amber-50 border-amber-300' :
                  'text-rose-800 bg-rose-50 border-rose-300';

                return (
                  <tr key={v.vessel_id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center space-x-2">
                      <Ship className="w-4 h-4 text-cyan-700" />
                      <span>{v.vessel_name}</span>
                    </td>
                    <td className="p-3.5">{v.vessel_type}</td>
                    <td className="p-3.5 font-mono">{v.dwt.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {v.draft_m}m / {v.loa_m}m / {v.beam_m}m
                    </td>
                    <td className="p-3.5 font-mono">{v.availability_date}</td>
                    <td className="p-3.5 font-mono text-teal-700 font-bold">${v.daily_charter_rate_usd.toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${statusColor}`}>
                        {isCompat ? '🟢' : '❌'} {v.port_compatibility.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-cyan-800 text-sm">
                      {v.match_score}%
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setSelectedVessel(v)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded text-xs font-semibold flex items-center space-x-1 mx-auto"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedVessel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedVessel.vessel_name}</h3>
                <p className="text-xs text-cyan-800 font-mono">{selectedVessel.vessel_type} • {selectedVessel.dwt.toLocaleString()} DWT</p>
              </div>
              <button onClick={() => setSelectedVessel(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
                <div>Speed: <span className="text-slate-900 font-bold">{selectedVessel.speed_knots} knots</span></div>
                <div>Daily Charter: <span className="text-teal-700 font-bold">${selectedVessel.daily_charter_rate_usd.toLocaleString()}</span></div>
                <div>Owner: <span className="text-slate-700">{selectedVessel.owner}</span></div>
                <div>Status: <span className="text-cyan-800">{selectedVessel.status}</span></div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-700 uppercase font-mono">Port Physical Constraint Verification</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between bg-slate-50 p-2 rounded border border-slate-200">
                    <span>Draft vs Max Draft:</span>
                    <span className="font-mono text-slate-900 font-bold">{selectedVessel.draft_m}m vs {selectedVessel.port_compatibility.max_draft_m}m</span>
                  </div>
                  <div className="flex justify-between bg-slate-50 p-2 rounded border border-slate-200">
                    <span>LOA vs Max LOA:</span>
                    <span className="font-mono text-slate-900 font-bold">{selectedVessel.loa_m}m vs {selectedVessel.port_compatibility.max_loa_m}m</span>
                  </div>
                  <div className="flex justify-between bg-slate-50 p-2 rounded border border-slate-200">
                    <span>Beam vs Max Beam:</span>
                    <span className="font-mono text-slate-900 font-bold">{selectedVessel.beam_m}m vs {selectedVessel.port_compatibility.max_beam_m}m</span>
                  </div>
                </div>
              </div>

              {selectedVessel.port_compatibility.rejection_reasons.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg space-y-1">
                  <div className="font-semibold text-rose-800 flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>Incompatibility Reasons:</span>
                  </div>
                  {selectedVessel.port_compatibility.rejection_reasons.map((r, idx) => (
                    <p key={idx} className="text-slate-800 pl-5 leading-relaxed">• {r}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedVessel(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-semibold">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <ExplainableModal
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        title="Why MV Ocean Star Was Selected?"
        reasons={data.explainable_ai.why_vessel}
      />
    </div>
  );
};
