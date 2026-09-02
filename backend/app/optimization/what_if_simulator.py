from typing import Dict, Any, Optional
from app.schemas.models import CargoRequest, WhatIfRequest, WhatIfOutput

class WhatIfSimulator:
    def simulate_scenario(self, request: WhatIfRequest, baseline_results: Dict[str, Any]) -> Dict[str, Any]:
        cargo = request.cargo
        
        base_cost_crores = float(baseline_results["voyage_cost"]["total_cost_crores"])
        base_risk = float(baseline_results["risk_analysis"]["overall_risk_score"])
        base_idle = float(baseline_results["congestion_idle"]["expected_waiting_hours"])

        # Parameter Adjustments
        bunker_mult = 1.0 + (request.bunker_price_change_pct / 100.0)
        congestion_mult = 1.0 + (request.congestion_change_pct / 100.0)
        freight_mult = 1.0 + (request.freight_rate_change_pct / 100.0)

        # Recalculate Voyage Cost Delta
        orig_bunker_inr = float(baseline_results["voyage_cost"]["bunker_cost_inr"])
        orig_freight_inr = float(baseline_results["voyage_cost"]["freight_cost_inr"])
        orig_idle_inr = float(baseline_results["voyage_cost"]["idle_delay_cost_inr"])

        new_bunker_inr = orig_bunker_inr * bunker_mult
        new_freight_inr = orig_freight_inr * freight_mult
        new_idle_inr = orig_idle_inr * congestion_mult

        new_total_cost_inr = (
            new_freight_inr +
            new_bunker_inr +
            baseline_results["voyage_cost"]["port_charges_inr"] +
            baseline_results["voyage_cost"]["handling_cost_inr"] +
            new_idle_inr +
            baseline_results["voyage_cost"]["other_expenses_inr"]
        )

        # Vessel selection adjustment
        sel_vessel_name = baseline_results["recommended_vessel"]["vessel_name"]
        if request.selected_vessel_id:
            for v in baseline_results["all_vessels"]:
                if v["vessel_id"] == request.selected_vessel_id:
                    sel_vessel_name = v["vessel_name"]
                    break

        # Scenario Total Cost & Deltas
        sim_cost_crores = round(new_total_cost_inr / 10000000.0, 2)
        cost_delta_crores = round(sim_cost_crores - base_cost_crores, 2)
        cost_delta_pct = round((cost_delta_crores / base_cost_crores) * 100.0, 1)

        sim_risk = round(min(100.0, max(0.0, base_risk + (request.congestion_change_pct * 0.25) + (request.freight_rate_change_pct * 0.15))), 1)
        risk_delta = round(sim_risk - base_risk, 1)

        sim_idle_hrs = round(base_idle * congestion_mult, 1)
        idle_delta_hrs = round(sim_idle_hrs - base_idle, 1)

        # Market Signal Adjustment
        if request.freight_rate_change_pct <= -8.0:
            sim_signal = "WAIT"
        elif request.freight_rate_change_pct >= 8.0 or request.congestion_change_pct >= 25.0:
            sim_signal = "HIGH RISK"
        else:
            sim_signal = baseline_results["market_signal"]["signal"]

        sel_contract = request.selected_contract_type or baseline_results["contract_strategy"]["contract_type"]

        return {
            "scenario_name": f"Simulated Scenario (Bunker {request.bunker_price_change_pct:+.0f}%, Congestion {request.congestion_change_pct:+.0f}%, Freight {request.freight_rate_change_pct:+.0f}%)",
            "total_cost_crores": sim_cost_crores,
            "cost_delta_crores": cost_delta_crores,
            "cost_delta_pct": cost_delta_pct,
            "risk_score": sim_risk,
            "risk_delta": risk_delta,
            "idle_hours": sim_idle_hrs,
            "idle_delta_hours": idle_delta_hrs,
            "market_signal": sim_signal,
            "recommended_vessel": sel_vessel_name,
            "recommended_contract": sel_contract
        }

what_if_simulator = WhatIfSimulator()
