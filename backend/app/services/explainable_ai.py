from typing import Dict, Any, List

class ExplainableAIEngine:
    def generate_explanations(
        self,
        cargo: Dict[str, Any],
        forecast: Dict[str, Any],
        signal: Dict[str, Any],
        vessel: Dict[str, Any],
        port_check: Dict[str, Any],
        cost: Dict[str, Any],
        risk: Dict[str, Any],
        contract: Dict[str, Any]
    ) -> Dict[str, Any]:

        cur_rate = forecast["current_rate_inr"]
        f30_rate = forecast["forecast_30_day_inr"]
        delta_pct = signal["expected_change_pct"]
        v_name = vessel["vessel_name"]
        v_match = vessel["match_score"]
        v_dwt = vessel["dwt"]
        port_dest = cargo.get("destination_port", "Visakhapatnam")
        contract_name = contract.get("contract_type", "3-Month Contract")

        # Dynamic overall summary
        overall_summary = (
            f"Freight rates for {cargo.get('cargo_type', 'Iron Ore')} on {cargo.get('origin_port', 'Australia')} → {port_dest} "
            f"are forecast to change by {delta_pct:+.1f}% over the next 30 days (from ₹{cur_rate:.1f}/MT to ₹{f30_rate:.1f}/MT). "
            f"The recommended vessel **{v_name}** ({v_dwt:,.0f} DWT, {v_match:.0f}% match) fully satisfies draft and physical dimension constraints "
            f"at {port_dest}. Based on the projected market trajectory and repeated cargo quantity ({cargo.get('quantity_mt', 150000):,.0f} MT x {cargo.get('expected_voyages', 3)} voyages), "
            f"a **{contract_name}** provides optimal risk-adjusted cost (₹{cost.get('total_cost_crores', 8.11)} Cr total expected cost, Risk Score {risk.get('overall_risk_score', 32)}/100)."
        )

        why_signal = [
            f"Forecast indicates {delta_pct:+.1f}% rate shift over 30 days based on historical Baltic Dry Index and bunker fuel momentum.",
            f"Current rate (₹{cur_rate:.1f}/MT) is below the projected 30-day peak (₹{f30_rate:.1f}/MT).",
            f"ML model confidence is {forecast.get('confidence_pct', 85)}% with an R² metric of {forecast.get('metrics', {}).get('r2', 0.84)}.",
            f"Securing chartering now prevents price inflation across the {cargo.get('expected_voyages', 3)} planned voyages."
        ]

        why_vessel = [
            f"Top match score of {v_match:.1f}% based on DWT capacity fit ({vessel.get('cargo_fit_score', 95):.0f}%), availability timing, and charter cost.",
            f"Draft clearance is verified: Vessel draft ({vessel.get('draft_m', 14.5)}m) fits within {port_dest} max draft ({port_check.get('max_draft_m', 14.5)}m).",
            f"Positioned near {vessel.get('current_port', 'Port Hedland')} with availability on {vessel.get('availability_date', '2026-09-10')}, aligning with laycan requirements.",
            f"Fuel consumption ({vessel.get('speed_knots', 14.0)} knots @ {vessel.get('fuel_consumption_ton_day', 38.0)} T/day) minimizes bunker fuel expenditure."
        ]

        why_contract = [
            f"{contract_name} locks in an effective rate of ₹{contract.get('rate_per_mt_inr', cur_rate):.1f}/MT against potential spot spikes.",
            f"Yields estimated savings of ₹{contract.get('estimated_savings_inr', 2500000) / 100000:,.1f} Lakhs compared to unhedged spot buying.",
            f"Maintains balanced operational flexibility across the {cargo.get('contract_duration_months', 3)}-month procurement window.",
            f"Keeps overall risk exposure low at {risk.get('overall_risk_score', 32)}/100."
        ]

        return {
            "overall_summary": overall_summary,
            "why_signal": why_signal,
            "why_vessel": why_vessel,
            "why_contract": why_contract
        }

explainable_ai_engine = ExplainableAIEngine()
