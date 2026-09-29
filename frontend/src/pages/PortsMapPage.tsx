import React from 'react';
import type { FinalRecommendationOutput } from '../types';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { MapPin, Anchor } from 'lucide-react';
import L from 'leaflet';

interface PortsMapPageProps {
  data: FinalRecommendationOutput;
}

const createPortIcon = (type: 'DEST' | 'ORIGIN') => {
  const isDest = type === 'DEST';
  const bgColor = isDest ? '#0d9488' : '#0284c7';
  return L.divIcon({
    className: 'custom-port-marker',
    html: `
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        background-color: ${bgColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(45deg); color: #ffffff; font-weight: bold; font-size: 11px; font-family: sans-serif;">
          ${isDest ? 'D' : 'L'}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -26]
  });
};

const portIcon = createPortIcon('ORIGIN');
const destIcon = createPortIcon('DEST');

const vesselIcon = L.divIcon({
  className: 'custom-vessel-marker',
  html: `
    <div style="
      width: 26px;
      height: 26px;
      background-color: #f59e0b;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="5" r="3"/>
        <line x1="12" y1="22" x2="12" y2="8"/>
        <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
      </svg>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13]
});

export const PortsMapPage: React.FC<PortsMapPageProps> = ({ data }) => {
  const ports = [
    { name: 'Visakhapatnam', lat: 17.68, lon: 83.21, type: 'DEST', draft: 14.5, loa: 290, beam: 45, rate: 35000, congestion: 62.5, wait: 18.5 },
    { name: 'Paradip', lat: 20.26, lon: 86.67, type: 'DEST', draft: 14.5, loa: 290, beam: 45, rate: 32000, congestion: 71.0, wait: 24.0 },
    { name: 'Haldia', lat: 22.02, lon: 88.06, type: 'DEST', draft: 11.2, loa: 230, beam: 32.2, rate: 18000, congestion: 84.0, wait: 42.0 },
    { name: 'Dhamra', lat: 20.80, lon: 86.96, type: 'DEST', draft: 18.0, loa: 310, beam: 48, rate: 45000, congestion: 38.0, wait: 8.5 },
    { name: 'Krishnapatnam', lat: 14.25, lon: 80.13, type: 'DEST', draft: 16.5, loa: 295, beam: 46, rate: 38000, congestion: 45.0, wait: 12.0 },

    { name: 'Port Hedland', lat: -20.31, lon: 118.57, type: 'ORIGIN', draft: 19.5, loa: 330, beam: 55, rate: 85000, congestion: 52.0, wait: 14.0 },
    { name: 'Hay Point', lat: -21.28, lon: 149.30, type: 'ORIGIN', draft: 17.5, loa: 300, beam: 50, rate: 65000, congestion: 48.0, wait: 12.5 },
    { name: 'Newcastle', lat: -32.92, lon: 151.78, type: 'ORIGIN', draft: 15.2, loa: 275, beam: 47, rate: 55000, congestion: 66.0, wait: 22.0 },
    { name: 'Samarinda', lat: -0.50, lon: 117.15, type: 'ORIGIN', draft: 13.0, loa: 210, beam: 33, rate: 25000, congestion: 63.0, wait: 21.0 },
    { name: 'Richards Bay', lat: -28.80, lon: 32.03, type: 'ORIGIN', draft: 17.5, loa: 300, beam: 48, rate: 52000, congestion: 59.0, wait: 19.0 },
  ];

  const originPort = ports.find(p => p.name === data.cargo_summary.origin_port) || ports[5];
  const destPort = ports.find(p => p.name === data.cargo_summary.destination_port) || ports[0];

  const routePolyline: [number, number][] = [
    [originPort.lat, originPort.lon],
    [destPort.lat, destPort.lon]
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-cyan-700" />
            <span>Interactive Maritime Shipping & Port Map</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time geospatial tracking of overseas origin loading hubs, East Coast Indian discharge ports, shipping corridors, and berth congestion.
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5 text-teal-700 font-semibold">
            <div className="w-3 h-3 rounded-full bg-teal-600" />
            <span>Discharge Port</span>
          </div>
          <div className="flex items-center space-x-1.5 text-sky-700 font-semibold">
            <div className="w-3 h-3 rounded-full bg-sky-600" />
            <span>Loading Origin</span>
          </div>
          <div className="flex items-center space-x-1.5 text-amber-700 font-semibold">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Candidate Vessel</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="h-[480px] w-full rounded-lg overflow-hidden relative">
          <MapContainer
            center={[0, 100]}
            zoom={3}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            <Polyline
              positions={routePolyline}
              pathOptions={{ color: '#0891b2', weight: 3, dashArray: '6, 8', opacity: 0.9 }}
            />

            {ports.map((p, idx) => (
              <Marker
                key={idx}
                position={[p.lat, p.lon]}
                icon={p.type === 'DEST' ? destIcon : portIcon}
              >
                <Popup>
                  <div className="p-1 space-y-2 text-xs">
                    <div className="font-bold text-sm text-cyan-900 border-b border-slate-200 pb-1">
                      {p.name} ({p.type})
                    </div>
                    <div className="space-y-1 font-mono text-slate-700">
                      <div>Max Draft: <span className="text-slate-900 font-bold">{p.draft}m</span></div>
                      <div>Max LOA: <span className="text-slate-900 font-bold">{p.loa}m</span></div>
                      <div>Max Beam: <span className="text-slate-900 font-bold">{p.beam}m</span></div>
                      <div>Handling Rate: <span className="text-teal-700 font-bold">{p.rate.toLocaleString()} MT/day</span></div>
                      <div>Congestion Index: <span className="text-amber-700 font-bold">{p.congestion}%</span></div>
                      <div>Avg Waiting: <span className="text-cyan-700 font-bold">{p.wait} hours</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {data.all_vessels?.map((v) => (
              <Marker
                key={v.vessel_id}
                position={[v.lat, v.lon]}
                icon={vesselIcon}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-900 flex items-center space-x-1">
                      <Anchor className="w-3.5 h-3.5 text-amber-600" />
                      <span>{v.vessel_name}</span>
                    </div>
                    <div className="text-cyan-800 font-mono font-semibold">{v.vessel_type} • {v.dwt.toLocaleString()} DWT</div>
                    <div className="text-slate-700">Match Score: <span className="text-teal-700 font-bold">{v.match_score}%</span></div>
                    <div className="text-slate-700">Charter Rate: <span className="text-teal-700 font-bold">${v.daily_charter_rate_usd.toLocaleString()}/day</span></div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
