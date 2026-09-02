from typing import Dict, Any, List

class ContractOptimizer:
    def optimize_contracts(
        self,
        current_rate_inr: float,
        forecast_30_day_inr: float,
        quantity_mt: float,
        expected_voyages: int = 3,
        base_voyage_cost_inr: float = 81100000.0,
        risk_score_base: float = 32.0
    ) -> List[Dict[str, Any]]:

        # Spot rate: current market price or projected spot upon laycan
        spot_rate = max(current_rate_inr, forecast_30_day_inr * 1.05)
        spot_cost = spot_rate * quantity_mt * expected_voyages + (base_voyage_cost_inr - current_rate_inr * quantity_mt) * expected_voyages

        # 1-Month Contract: modest discount/lock
        r_1m = current_rate_inr * 0.98 + (forecast_30_day_inr - current_rate_inr) * 0.4
        c_1m_cost = r_1m * quantity_mt * expected_voyages + (base_voyage_cost_inr - current_rate_inr * quantity_mt) * expected_voyages

        # 3-Month Contract: medium term volume discount
        r_3m = current_rate_inr * 0.96 + (forecast_30_day_inr - current_rate_inr) * 0.15
        c_3m_cost = r_3m * quantity_mt * expected_voyages + (base_voyage_cost_inr - current_rate_inr * quantity_mt) * expected_voyages

        # Multiple-Voyage Contract (COA): guaranteed long-term fixed rate
        r_multi = current_rate_inr * 0.95
        c_multi_cost = r_multi * quantity_mt * expected_voyages + (base_voyage_cost_inr - current_rate_inr * quantity_mt) * expected_voyages

        # Determine recommendation based on expected market trend
        # If rates rising over 3M, 3-Month or Multi-Voyage contract yields maximum savings
        is_rising = forecast_30_day_inr > current_rate_inr

        contracts = [
            {
                "contract_type": "Spot Contract",
                "rate_per_mt_inr": round(spot_rate, 1),
                "total_cost_inr": round(spot_cost, 0),
                "total_cost_crores": round(spot_cost / 10000000.0, 2),
                "risk_score": round(min(100.0, risk_score_base + 18.0), 1),
                "flexibility": "High (Single Voyage)",
                "number_of_voyages": 1,
                "estimated_savings_inr": 0.0,
                "is_recommended": False,
                "rationale": "High market exposure to spot price spikes during delivery period."
            },
            {
                "contract_type": "1-Month Contract",
                "rate_per_mt_inr": round(r_1m, 1),
                "total_cost_inr": round(c_1m_cost, 0),
                "total_cost_crores": round(c_1m_cost / 10000000.0, 2),
                "risk_score": round(min(100.0, risk_score_base + 8.0), 1),
                "flexibility": "Moderate",
                "number_of_voyages": expected_voyages,
                "estimated_savings_inr": round(max(0.0, spot_cost - c_1m_cost), 0),
                "is_recommended": False,
                "rationale": "Short-term protection but requires renegotiation before subsequent voyages."
            },
            {
                "contract_type": "3-Month Contract",
                "rate_per_mt_inr": round(r_3m, 1),
                "total_cost_inr": round(c_3m_cost, 0),
                "total_cost_crores": round(c_3m_cost / 10000000.0, 2),
                "risk_score": round(risk_score_base, 1),
                "flexibility": "Balanced",
                "number_of_voyages": expected_voyages,
                "estimated_savings_inr": round(max(0.0, spot_cost - c_3m_cost), 0),
                "is_recommended": is_rising,
                "rationale": "Optimal balance of rate hedging, volume discount, and operational flexibility over the 3-month window."
            },
            {
                "contract_type": "Multiple-Voyage (COA)",
                "rate_per_mt_inr": round(r_multi, 1),
                "total_cost_inr": round(c_multi_cost, 0),
                "total_cost_crores": round(c_multi_cost / 10000000.0, 2),
                "risk_score": round(max(10.0, risk_score_base - 4.0), 1),
                "flexibility": "Fixed Allocation",
                "number_of_voyages": expected_voyages,
                "estimated_savings_inr": round(max(0.0, spot_cost - c_multi_cost), 0),
                "is_recommended": not is_rising,
                "rationale": "Guaranteed tonnage allocation with long-term fixed pricing; ideal for steady raw material procurement."
            }
        ]

        return contracts

contract_optimizer = ContractOptimizer()
