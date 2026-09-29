import React, { useState, useEffect, useRef } from 'react';
import type { FinalRecommendationOutput, VesselRecommendationOutput, VesselVoyageTrackingState, VoyageStatus } from '../types';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import { 
  MapPin, Anchor, Search, Radio, Navigation, Square, Crosshair, ChevronRight 
} from 'lucide-react';
import L from 'leaflet';

interface PortsMapPageProps {
  data: FinalRecommendationOutput;
}

// Haversine distance in Nautical Miles
function calculateDistanceNM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth radius in NM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Bearing / Heading angle calculation (0-360 deg)
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = lat1 * (Math.PI / 180);
  const phi2 = lat2 * (Math.PI / 180);
  const lam1 = lon1 * (Math.PI / 180);
  const lam2 = lon2 * (Math.PI / 180);
  const y = Math.sin(lam2 - lam1) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(lam2 - lam1);
  const theta = Math.atan2(y, x);
  return (theta * (180 / Math.PI) + 360) % 360;
}

// Leaflet Map Controller for Centering and Auto-Follow
const MapController: React.FC<{ center?: [number, number]; zoom?: number; autoFollow?: boolean }> = ({ center, zoom, autoFollow }) => {
  const map = useMap();
  const prevCenterRef = useRef<[number, number] | undefined>(undefined);

  useEffect(() => {
    if (center) {
      if (autoFollow) {
        map.panTo(center, { animate: true, duration: 1 });
      } else if (!prevCenterRef.current) {
        map.setView(center, zoom || 5, { animate: true });
      }
      prevCenterRef.current = center;
    }
  }, [center, autoFollow, map, zoom]);

  return null;
};

// Custom Leaflet Icons
const createPortIcon = (type: 'DEST' | 'ORIGIN') => {
  const isDest = type === 'DEST';
  const bgColor = isDest ? '#0d9488' : '#0284c7';
  return L.divIcon({
    className: 'custom-port-marker',
    html: `
      <div style="
        position: relative;
        width: 30px;
        height: 30px;
        background-color: ${bgColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #ffffff;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(45deg); color: #ffffff; font-weight: bold; font-size: 11px; font-family: sans-serif;">
          ${isDest ? 'D' : 'L'}
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28]
  });
};

const portIcon = createPortIcon('ORIGIN');
const destIcon = createPortIcon('DEST');

const defaultVesselIcon = L.divIcon({
  className: 'custom-vessel-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background-color: #f59e0b;
      border-radius: 50%;
      border: 2.5px solid #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    ">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="5" r="3"/>
        <line x1="12" y1="22" x2="12" y2="8"/>
        <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
      </svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

const createTrackedVesselIcon = (headingDegrees: number, status: VoyageStatus) => {
  const isArrived = status === 'ARRIVED' || status === 'COMPLETED';
  const color = isArrived ? '#0d9488' : '#0284c7';
  return L.divIcon({
    className: 'custom-tracked-vessel-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, ${color}, #0369a1);
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 0 18px rgba(2, 132, 199, 0.8), 0 4px 10px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(${headingDegrees}deg);
        transition: transform 0.4s ease-out;
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 19 21 12 17 5 21 12 2"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

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

  // Search & Selection state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVessel, setSelectedVessel] = useState<VesselRecommendationOutput | null>(null);
  const [isLiveAIS, setIsLiveAIS] = useState(false); // Toggle LIVE vs DEMO TRACKING

  // Active Tracking State
  const [trackingState, setTrackingState] = useState<VesselVoyageTrackingState | null>(null);
  const [mapTargetCenter, setMapTargetCenter] = useState<[number, number] | undefined>(undefined);
  const [mapTargetZoom, setMapTargetZoom] = useState<number | undefined>(undefined);

  // Filter vessels based on search query
  const filteredVessels = data.all_vessels?.filter(v => 
    v.vessel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vessel_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vessel_type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Start tracking a vessel
  const handleStartTracking = (vessel: VesselRecommendationOutput) => {
    const origCoords: [number, number] = [originPort.lat, originPort.lon];
    const destCoords: [number, number] = [destPort.lat, destPort.lon];
    
    // Check initial position vs origin & destination
    const totalDist = calculateDistanceNM(origCoords[0], origCoords[1], destCoords[0], destCoords[1]);
    const initDistRemaining = calculateDistanceNM(vessel.lat, vessel.lon, destCoords[0], destCoords[1]);
    const initDistTravelled = Math.max(0, totalDist - initDistRemaining);
    const initProgress = Math.min(99, Math.round((initDistTravelled / totalDist) * 100));

    const bearing = calculateBearing(vessel.lat, vessel.lon, destCoords[0], destCoords[1]);

    const initialTracking: VesselVoyageTrackingState = {
      is_tracking: true,
      is_live: isLiveAIS,
      vessel_id: vessel.vessel_id,
      vessel_name: vessel.vessel_name,
      vessel_type: vessel.vessel_type,
      imo_number: 9482010 + Math.floor(Math.random() * 900),
      mmsi_number: 538007000 + Math.floor(Math.random() * 9000),
      origin_port: originPort.name,
      destination_port: destPort.name,
      origin_coords: origCoords,
      destination_coords: destCoords,
      current_lat: vessel.lat,
      current_lon: vessel.lon,
      current_speed_knots: vessel.speed_knots || 13.2,
      heading_degrees: Math.round(bearing),
      status: 'UNDERWAY',
      progress_pct: initProgress,
      distance_travelled_nm: initDistTravelled,
      distance_remaining_nm: initDistRemaining,
      total_distance_nm: totalDist,
      eta_formatted: '02 Oct 2026',
      last_updated_seconds_ago: 0,
      last_update_timestamp: new Date().toLocaleTimeString(),
      history: [origCoords, [vessel.lat, vessel.lon]],
      auto_follow: true,
      geofence_radius_nm: 15
    };

    setTrackingState(initialTracking);
    setSelectedVessel(vessel);
    setMapTargetCenter([vessel.lat, vessel.lon]);
    setMapTargetZoom(5);
  };

  // Stop tracking
  const handleStopTracking = () => {
    setTrackingState(null);
  };

  // Toggle Auto-Follow
  const handleToggleAutoFollow = () => {
    if (trackingState) {
      setTrackingState(prev => prev ? { ...prev, auto_follow: !prev.auto_follow } : null);
    }
  };

  // Center on vessel manually
  const handleCenterOnVessel = () => {
    if (trackingState) {
      setMapTargetCenter([trackingState.current_lat, trackingState.current_lon]);
    }
  };

  // Real-time automatic position update simulation interval
  useEffect(() => {
    if (!trackingState || !trackingState.is_tracking || trackingState.status === 'ARRIVED' || trackingState.status === 'COMPLETED') {
      return;
    }

    const interval = setInterval(() => {
      setTrackingState(prev => {
        if (!prev) return null;

        // Destination coordinates
        const [destLat, destLon] = prev.destination_coords;
        const currentDistRem = calculateDistanceNM(prev.current_lat, prev.current_lon, destLat, destLon);

        // Geofence check: within 15 NM of destination
        if (currentDistRem <= prev.geofence_radius_nm) {
          return {
            ...prev,
            current_lat: destLat,
            current_lon: destLon,
            distance_remaining_nm: 0,
            distance_travelled_nm: prev.total_distance_nm,
            progress_pct: 100,
            status: 'ARRIVED',
            last_updated_seconds_ago: 0,
            last_update_timestamp: new Date().toLocaleTimeString(),
            history: [...prev.history, [destLat, destLon]]
          };
        }

        // Increment position step towards destination port
        const latStep = (destLat - prev.current_lat) * 0.025;
        const lonStep = (destLon - prev.current_lon) * 0.025;

        const newLat = prev.current_lat + latStep;
        const newLon = prev.current_lon + lonStep;

        const newDistRemaining = calculateDistanceNM(newLat, newLon, destLat, destLon);
        const newDistTravelled = Math.max(0, prev.total_distance_nm - newDistRemaining);
        const newProgress = Math.min(99, Math.round((newDistTravelled / prev.total_distance_nm) * 100));

        const newBearing = calculateBearing(newLat, newLon, destLat, destLon);
        const newStatus: VoyageStatus = newProgress >= 90 ? 'NEAR DESTINATION' : 'UNDERWAY';

        const updatedHistory = [...prev.history, [newLat, newLon] as [number, number]];

        return {
          ...prev,
          current_lat: newLat,
          current_lon: newLon,
          heading_degrees: Math.round(newBearing),
          distance_remaining_nm: newDistRemaining,
          distance_travelled_nm: newDistTravelled,
          progress_pct: newProgress,
          status: newStatus,
          last_updated_seconds_ago: (prev.last_updated_seconds_ago + 3) % 60,
          last_update_timestamp: new Date().toLocaleTimeString(),
          history: updatedHistory
        };
      });
    }, 3000); // Step every 3 seconds

    return () => clearInterval(interval);
  }, [trackingState?.is_tracking, trackingState?.status]);

  // Compute route polylines for active tracking
  const completedPath: [number, number][] = trackingState ? [...trackingState.history, [trackingState.current_lat, trackingState.current_lon]] : [];
  const remainingPath: [number, number][] = trackingState ? [[trackingState.current_lat, trackingState.current_lon], trackingState.destination_coords] : [];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-cyan-700" />
              <span>Interactive Maritime Shipping & Port Voyage Tracker</span>
            </h2>
            {/* Live vs Demo Tracking Mode Badge */}
            <button
              onClick={() => setIsLiveAIS(!isLiveAIS)}
              className={`px-3 py-1 text-xs font-bold rounded-full border transition-all flex items-center space-x-1.5 ${
                isLiveAIS 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm' 
                  : 'bg-amber-50 border-amber-300 text-amber-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLiveAIS ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isLiveAIS ? '🟢 LIVE AIS TRACKING' : '🟠 DEMO TRACKING (SIMULATED POSITION)'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time AIS geospatial tracking of overseas bulk loading hubs, East Coast Indian discharge ports, shipping corridors, and active vessel progress.
          </p>
        </div>

        {/* Legend */}
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

      {/* Active Tracking Top Notification Banner */}
      {trackingState && (
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm ${
          trackingState.status === 'ARRIVED' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-cyan-50 border-cyan-200 text-cyan-950'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${trackingState.status === 'ARRIVED' ? 'bg-emerald-600 text-white' : 'bg-cyan-700 text-white'} animate-pulse`}>
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm">
                  {trackingState.status === 'ARRIVED' ? '🎉 VOYAGE COMPLETED — ARRIVED AT DESTINATION' : '🟢 TRACKING ACTIVE'}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/80 border border-cyan-200 text-cyan-900 font-semibold">
                  {trackingState.vessel_name}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Route: <span className="font-semibold text-slate-900">{trackingState.origin_port}</span> ➔ <span className="font-semibold text-slate-900">{trackingState.destination_port}</span> • Progress: <span className="font-bold text-cyan-800">{trackingState.progress_pct}%</span> • ETA: <span className="font-bold">{trackingState.eta_formatted}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button
              onClick={handleCenterOnVessel}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center space-x-1"
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-700" />
              <span>Center on Vessel</span>
            </button>
            <button
              onClick={handleStopTracking}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
            >
              Stop Tracking
            </button>
          </div>
        </div>
      )}

      {/* Main Map & Search Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Vessel Search & List */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 flex flex-col h-[520px]">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2 mb-2">
              <Search className="w-4 h-4 text-cyan-700" />
              <span>Search & Select Vessel</span>
            </h3>
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Vessel, IMO or Class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Vessel Fleet List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredVessels.map((v) => {
              const isSelected = selectedVessel?.vessel_id === v.vessel_id;
              const isTracked = trackingState?.vessel_id === v.vessel_id;

              return (
                <div
                  key={v.vessel_id}
                  onClick={() => {
                    setSelectedVessel(v);
                    setMapTargetCenter([v.lat, v.lon]);
                    setMapTargetZoom(5);
                  }}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isTracked
                      ? 'bg-cyan-50 border-cyan-400 ring-2 ring-cyan-500/20'
                      : isSelected
                      ? 'bg-slate-50 border-cyan-600'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 flex items-center space-x-1">
                      <Anchor className="w-3.5 h-3.5 text-amber-600" />
                      <span>{v.vessel_name}</span>
                    </span>
                    {isTracked && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-cyan-600 text-white rounded">
                        TRACKING
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {v.vessel_type} • {v.dwt.toLocaleString()} DWT
                  </div>

                  <div className="flex justify-between items-center mt-2 text-[11px]">
                    <span className="text-teal-700 font-semibold">Match: {v.match_score}%</span>
                    <span className="text-slate-600 font-mono">${v.daily_charter_rate_usd.toLocaleString()}/day</span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTracking(v);
                      }}
                      className="w-full py-1 text-[11px] font-bold bg-cyan-700 hover:bg-cyan-800 text-white rounded transition-colors flex items-center justify-center space-x-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>TRACK THIS VESSEL</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Map Canvas & Live Telemetry Panel */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-4 relative h-[520px] overflow-hidden">
          
          <MapContainer
            center={[0, 100]}
            zoom={3}
            scrollWheelZoom={true}
            className="w-full h-full rounded-lg"
          >
            <MapController 
              center={mapTargetCenter} 
              zoom={mapTargetZoom} 
              autoFollow={trackingState?.auto_follow} 
            />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            {/* Static Cargo Route Polyline */}
            {!trackingState && (
              <Polyline
                positions={[[originPort.lat, originPort.lon], [destPort.lat, destPort.lon]]}
                pathOptions={{ color: '#0891b2', weight: 3, dashArray: '6, 8', opacity: 0.9 }}
              />
            )}

            {/* Active Tracked Vessel Completed Route (Solid Line) */}
            {trackingState && completedPath.length > 1 && (
              <Polyline
                positions={completedPath}
                pathOptions={{ color: '#0d9488', weight: 4, opacity: 0.95 }}
              />
            )}

            {/* Active Tracked Vessel Remaining Route (Dashed Line) */}
            {trackingState && remainingPath.length > 1 && (
              <Polyline
                positions={remainingPath}
                pathOptions={{ color: '#f59e0b', weight: 3, dashArray: '6, 8', opacity: 0.9 }}
              />
            )}

            {/* Destination Port Arrival Geofence Circle (15 NM) */}
            <Circle
              center={[destPort.lat, destPort.lon]}
              radius={27780} // 15 Nautical Miles in meters
              pathOptions={{ color: '#0d9488', fillColor: '#0d9488', fillOpacity: 0.1, weight: 1.5, dashArray: '4, 4' }}
            />

            {/* Port Markers */}
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

            {/* All Un-tracked Vessels Markers */}
            {data.all_vessels?.map((v) => {
              if (trackingState?.vessel_id === v.vessel_id) return null; // Rendered separately as active tracked vessel

              return (
                <Marker
                  key={v.vessel_id}
                  position={[v.lat, v.lon]}
                  icon={defaultVesselIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedVessel(v);
                    }
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-2 text-xs">
                      <div className="font-bold text-slate-900 flex items-center justify-between border-b pb-1">
                        <span className="flex items-center space-x-1">
                          <Anchor className="w-3.5 h-3.5 text-amber-600" />
                          <span>{v.vessel_name}</span>
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          IMO: 9482012
                        </span>
                      </div>
                      <div className="text-cyan-800 font-mono font-semibold">{v.vessel_type} • {v.dwt.toLocaleString()} DWT</div>
                      <div className="text-slate-700">Status: <span className="text-slate-900 font-semibold">{v.status}</span></div>
                      <div className="text-slate-700">Match Score: <span className="text-teal-700 font-bold">{v.match_score}%</span></div>
                      <div className="text-slate-700">Charter Rate: <span className="text-teal-700 font-bold">${v.daily_charter_rate_usd.toLocaleString()}/day</span></div>

                      <button
                        onClick={() => handleStartTracking(v)}
                        className="w-full mt-2 py-1.5 text-xs font-bold bg-cyan-700 hover:bg-cyan-800 text-white rounded transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>TRACK THIS VESSEL</span>
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Active Tracked Vessel Marker (Heading-Rotated Icon) */}
            {trackingState && (
              <Marker
                position={[trackingState.current_lat, trackingState.current_lon]}
                icon={createTrackedVesselIcon(trackingState.heading_degrees, trackingState.status)}
              >
                <Popup>
                  <div className="p-2 space-y-2 text-xs">
                    <div className="font-bold text-sm text-cyan-900 border-b pb-1 flex justify-between items-center">
                      <span>{trackingState.vessel_name}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                        {trackingState.status}
                      </span>
                    </div>
                    <div className="font-mono text-slate-700 space-y-1">
                      <div>Speed: <span className="font-bold text-slate-900">{trackingState.current_speed_knots} kn</span></div>
                      <div>Heading: <span className="font-bold text-slate-900">{trackingState.heading_degrees}°</span></div>
                      <div>Completed: <span className="font-bold text-teal-700">{trackingState.progress_pct}%</span></div>
                      <div>Remaining: <span className="font-bold text-cyan-700">{trackingState.distance_remaining_nm} NM</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Persistent Floating Telemetry & Control Panel (Bottom Right) */}
          {trackingState && (
            <div className="absolute bottom-6 right-6 z-[1000] w-80 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-4 shadow-2xl space-y-3 font-sans text-xs">
              
              <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                    <Anchor className="w-4 h-4 text-cyan-700" />
                    <span>{trackingState.vessel_name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    IMO: {trackingState.imo_number} • MMSI: {trackingState.mmsi_number}
                  </div>
                </div>

                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  trackingState.status === 'ARRIVED' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : trackingState.status === 'NEAR DESTINATION'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                }`}>
                  {trackingState.status}
                </span>
              </div>

              {/* Voyage Route */}
              <div className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded border border-slate-200 font-semibold text-slate-800">
                <span>{trackingState.origin_port}</span>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-700" />
                <span>{trackingState.destination_port}</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-slate-700">VOYAGE PROGRESS</span>
                  <span className="font-mono font-bold text-teal-700">{trackingState.progress_pct}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-cyan-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${trackingState.progress_pct}%` }}
                  />
                </div>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-slate-500">Speed</div>
                  <div className="font-bold font-mono text-slate-900 mt-0.5">{trackingState.current_speed_knots} kn</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-slate-500">Distance Travelled</div>
                  <div className="font-bold font-mono text-slate-900 mt-0.5">{trackingState.distance_travelled_nm.toLocaleString()} NM</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-slate-500">Remaining</div>
                  <div className="font-bold font-mono text-cyan-800 mt-0.5">{trackingState.distance_remaining_nm.toLocaleString()} NM</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-slate-500">ETA</div>
                  <div className="font-bold font-mono text-slate-900 mt-0.5">{trackingState.eta_formatted}</div>
                </div>
              </div>

              {/* Live Status Refresh Info */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Updated {trackingState.last_updated_seconds_ago} sec ago</span>
                </span>
                <span className="font-mono">{trackingState.last_update_timestamp}</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleToggleAutoFollow}
                  className={`py-1.5 px-2 text-[11px] font-bold rounded border transition-colors flex items-center justify-center space-x-1 ${
                    trackingState.auto_follow
                      ? 'bg-cyan-700 text-white border-cyan-800'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Navigation className="w-3 h-3" />
                  <span>{trackingState.auto_follow ? 'FOLLOWING' : 'FOLLOW VESSEL'}</span>
                </button>

                <button
                  onClick={handleStopTracking}
                  className="py-1.5 px-2 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded transition-colors flex items-center justify-center space-x-1"
                >
                  <Square className="w-3 h-3" />
                  <span>STOP TRACKING</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
