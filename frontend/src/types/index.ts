export interface CargoRequest {
  cargo_type: string;
  quantity_mt: number;
  origin_port: string;
  destination_port: string;
  delivery_start: string;
  delivery_end: string;
  contract_duration_months: number;
  expected_voyages: number;
  target_freight_rate?: number;
  priority: string;
}

export interface FreightForecastOutput {
  current_rate_usd: number;
  current_rate_inr: number;
  forecast_7_day_inr: number;
  forecast_30_day_inr: number;
  forecast_60_day_inr: number;
  lower_bound_inr: number;
  upper_bound_inr: number;
  confidence_pct: number;
  trend: string;
  historical_points: any[];
  forecast_points: any[];
  metrics: {
    mae: number;
    rmse: number;
    r2: number;
    mape: number;
  };
}

export interface MarketSignalOutput {
  signal: 'BUY NOW' | 'WAIT' | 'WATCH' | 'HIGH RISK';
  color: 'emerald' | 'amber' | 'blue' | 'rose';
  current_rate_inr: number;
  forecast_30_day_inr: number;
  expected_change_pct: number;
  confidence_pct: number;
  explanation: string;
  recommendation_summary: string;
}

export interface PortCompatibilityCheck {
  is_compatible: boolean;
  status: 'COMPATIBLE' | 'CONDITIONALLY COMPATIBLE' | 'NOT COMPATIBLE';
  max_draft_m: number;
  vessel_draft_m: number;
  draft_exceeded_m: number;
  max_loa_m: number;
  vessel_loa_m: number;
  max_beam_m: number;
  vessel_beam_m: number;
  rejection_reasons: string[];
}

export interface VesselRecommendationOutput {
  vessel_id: string;
  vessel_name: string;
  vessel_type: string;
  dwt: number;
  loa_m: number;
  beam_m: number;
  draft_m: number;
  speed_knots: number;
  daily_charter_rate_usd: number;
  availability_date: string;
  current_port: string;
  lat: number;
  lon: number;
  owner: string;
  status: string;
  match_score: number;
  cargo_fit_score: number;
  port_fit_score: number;
  availability_score: number;
  cost_score: number;
  idle_risk_score: number;
  port_compatibility: PortCompatibilityCheck;
}

export interface VoyageCostOutput {
  freight_cost_inr: number;
  bunker_cost_inr: number;
  port_charges_inr: number;
  handling_cost_inr: number;
  idle_delay_cost_inr: number;
  other_expenses_inr: number;
  total_voyage_cost_inr: number;
  total_cost_crores: number;
  cost_per_mt_inr: number;
}

export interface CongestionIdleOutput {
  congestion_index_pct: number;
  delay_probability_pct: number;
  expected_waiting_hours: number;
  expected_idle_days: number;
  idle_risk_score: number;
}

export interface RiskOutput {
  overall_risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'MEDIUM-HIGH' | 'HIGH';
  market_risk: number;
  port_risk: number;
  weather_risk: number;
  vessel_risk: number;
  idle_risk: number;
  external_risk: number;
  top_risk_factors: string[];
}

export interface ContractOption {
  contract_type: string;
  rate_per_mt_inr: number;
  total_cost_inr: number;
  total_cost_crores: number;
  risk_score: number;
  flexibility: string;
  number_of_voyages: number;
  estimated_savings_inr: number;
  is_recommended: boolean;
  rationale: string;
}

export interface WhatIfOutput {
  scenario_name: string;
  total_cost_crores: number;
  cost_delta_crores: number;
  cost_delta_pct: number;
  risk_score: number;
  risk_delta: number;
  idle_hours: number;
  idle_delta_hours: number;
  market_signal: string;
  recommended_vessel: string;
  recommended_contract: string;
}

export interface FinalRecommendationOutput {
  analysis_id: string;
  cargo_summary: CargoRequest;
  market_signal: MarketSignalOutput;
  recommended_vessel: VesselRecommendationOutput;
  port_compatibility: PortCompatibilityCheck;
  freight_forecast: FreightForecastOutput;
  voyage_cost: VoyageCostOutput;
  congestion_idle: CongestionIdleOutput;
  risk_analysis: RiskOutput;
  contract_strategy: ContractOption;
  all_vessels: VesselRecommendationOutput[];
  all_contracts: ContractOption[];
  decision_score: number;
  confidence_pct: number;
  explainable_ai: {
    overall_summary: string;
    why_signal: string[];
    why_vessel: string[];
    why_contract: string[];
  };
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  category: 'freight' | 'port' | 'weather' | 'vessel' | 'risk';
  timestamp: string;
  read?: boolean;
}

export type VoyageStatus = 
  | 'PLANNED' 
  | 'TRACKING' 
  | 'UNDERWAY' 
  | 'DELAYED' 
  | 'NEAR DESTINATION' 
  | 'ARRIVED' 
  | 'DATA DELAYED' 
  | 'COMPLETED';

export interface TrackingPositionPoint {
  lat: number;
  lon: number;
  timestamp: string;
  speed_knots: number;
}

export interface VesselVoyageTrackingState {
  is_tracking: boolean;
  is_live: boolean; // true = Live AIS, false = Simulated Demo Tracking
  vessel_id: string;
  vessel_name: string;
  vessel_type: string;
  imo_number: number;
  mmsi_number: number;
  origin_port: string;
  destination_port: string;
  origin_coords: [number, number];
  destination_coords: [number, number];
  current_lat: number;
  current_lon: number;
  current_speed_knots: number;
  heading_degrees: number;
  status: VoyageStatus;
  progress_pct: number;
  distance_travelled_nm: number;
  distance_remaining_nm: number;
  total_distance_nm: number;
  eta_formatted: string;
  last_updated_seconds_ago: number;
  last_update_timestamp: string;
  history: [number, number][];
  auto_follow: boolean;
  geofence_radius_nm: number;
}
