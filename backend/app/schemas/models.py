from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class CargoRequest(BaseModel):
    cargo_type: str = Field(default="Iron Ore", description="Type of raw material cargo")
    quantity_mt: float = Field(default=150000.0, description="Quantity in metric tons")
    origin_port: str = Field(default="Port Hedland", description="Origin overseas loading port")
    destination_port: str = Field(default="Visakhapatnam", description="Destination East Coast India unloading port")
    delivery_start: str = Field(default="2026-10-15", description="Delivery window start date")
    delivery_end: str = Field(default="2026-10-25", description="Delivery window end date")
    contract_duration_months: int = Field(default=3, description="Contract duration in months")
    expected_voyages: int = Field(default=3, description="Number of voyages required")
    target_freight_rate: Optional[float] = Field(default=45.0, description="Target rate in $/MT or ₹/MT")
    priority: str = Field(default="Medium Risk / Cost Optimized", description="Procurement priority")

class FreightForecastOutput(BaseModel):
    current_rate_usd: float
    current_rate_inr: float
    forecast_7_day_inr: float
    forecast_30_day_inr: float
    forecast_60_day_inr: float
    lower_bound_inr: float
    upper_bound_inr: float
    confidence_pct: float
    trend: str
    historical_points: List[Dict[str, Any]]
    forecast_points: List[Dict[str, Any]]
    metrics: Dict[str, float]

class MarketSignalOutput(BaseModel):
    signal: str  # BUY NOW, WAIT, WATCH, HIGH RISK
    color: str
    current_rate_inr: float
    forecast_30_day_inr: float
    expected_change_pct: float
    confidence_pct: float
    explanation: str
    recommendation_summary: str

class PortCompatibilityCheck(BaseModel):
    is_compatible: bool
    status: str # COMPATIBLE, CONDITIONALLY COMPATIBLE, NOT COMPATIBLE
    max_draft_m: float
    vessel_draft_m: float
    draft_exceeded_m: float
    max_loa_m: float
    vessel_loa_m: float
    max_beam_m: float
    vessel_beam_m: float
    rejection_reasons: List[str]

class VesselRecommendationOutput(BaseModel):
    vessel_id: str
    vessel_name: str
    vessel_type: str
    dwt: float
    loa_m: float
    beam_m: float
    draft_m: float
    speed_knots: float
    daily_charter_rate_usd: float
    availability_date: str
    current_port: str
    lat: float
    lon: float
    owner: str
    status: str
    match_score: float
    cargo_fit_score: float
    port_fit_score: float
    availability_score: float
    cost_score: float
    idle_risk_score: float
    port_compatibility: PortCompatibilityCheck

class VoyageCostOutput(BaseModel):
    freight_cost_inr: float
    bunker_cost_inr: float
    port_charges_inr: float
    handling_cost_inr: float
    idle_delay_cost_inr: float
    other_expenses_inr: float
    total_voyage_cost_inr: float
    total_cost_crores: float
    cost_per_mt_inr: float

class CongestionIdleOutput(BaseModel):
    congestion_index_pct: float
    delay_probability_pct: float
    expected_waiting_hours: float
    expected_idle_days: float
    idle_risk_score: float

class RiskOutput(BaseModel):
    overall_risk_score: float
    risk_level: str  # LOW, MEDIUM, HIGH
    market_risk: float
    port_risk: float
    weather_risk: float
    vessel_risk: float
    idle_risk: float
    external_risk: float
    top_risk_factors: List[str]

class ContractOption(BaseModel):
    contract_type: str  # Spot, 1-Month, 3-Month, Multiple-Voyage
    rate_per_mt_inr: float
    total_cost_inr: float
    total_cost_crores: float
    risk_score: float
    flexibility: str
    number_of_voyages: int
    estimated_savings_inr: float
    is_recommended: bool
    rationale: str

class WhatIfRequest(BaseModel):
    cargo: CargoRequest
    bunker_price_change_pct: float = 0.0
    congestion_change_pct: float = 0.0
    freight_rate_change_pct: float = 0.0
    selected_vessel_id: Optional[str] = None
    selected_contract_type: Optional[str] = None

class WhatIfOutput(BaseModel):
    scenario_name: str
    total_cost_crores: float
    cost_delta_crores: float
    cost_delta_pct: float
    risk_score: float
    risk_delta: float
    idle_hours: float
    idle_delta_hours: float
    market_signal: str
    recommended_vessel: str
    recommended_contract: str

class FinalRecommendationOutput(BaseModel):
    analysis_id: str
    cargo_summary: CargoRequest
    market_signal: MarketSignalOutput
    recommended_vessel: VesselRecommendationOutput
    port_compatibility: PortCompatibilityCheck
    freight_forecast: FreightForecastOutput
    voyage_cost: VoyageCostOutput
    congestion_idle: CongestionIdleOutput
    risk_analysis: RiskOutput
    contract_strategy: ContractOption
    all_vessels: List[VesselRecommendationOutput]
    all_contracts: List[ContractOption]
    decision_score: float
    confidence_pct: float
    explainable_ai: Dict[str, Any]

class AlertItem(BaseModel):
    id: str
    title: str
    message: str
    severity: str # critical, warning, info, success
    category: str # freight, port, weather, vessel, risk
    timestamp: str
    read: bool = False
