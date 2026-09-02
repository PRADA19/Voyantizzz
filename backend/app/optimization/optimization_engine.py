from typing import Dict, Any

class OptimizationEngine:
    def calculate_decision_score(
        self,
        voyage_cost_crores: float,
        vessel_match_score: float,
        port_compatible: bool,
        risk_score: float,
        idle_hours: float,
        contract_recommended: bool,
        weights: Dict[str, float] = None
    ) -> Dict[str, float]:

        if weights is None:
            weights = {
                "total_cost": 0.35,
                "vessel_suitability": 0.20,
                "port_compatibility": 0.15,
                "risk": 0.15,
                "idle_time": 0.10,
                "contract_fit": 0.05
            }

        # Normalize metrics to 0-100 scale (higher is better)
        # Cost score: 100 for <= 7 Cr, scaled down
        cost_score = max(10.0, min(100.0, 100.0 - (voyage_cost_crores - 7.0) * 15.0))
        vessel_score = vessel_match_score
        port_score = 100.0 if port_compatible else 20.0
        risk_inverted = max(0.0, 100.0 - risk_score)
        idle_inverted = max(0.0, 100.0 - (idle_hours / 36.0) * 100.0)
        contract_score = 95.0 if contract_recommended else 60.0

        decision_score = round(
            weights["total_cost"] * cost_score +
            weights["vessel_suitability"] * vessel_score +
            weights["port_compatibility"] * port_score +
            weights["risk"] * risk_inverted +
            weights["idle_time"] * idle_inverted +
            weights["contract_fit"] * contract_score,
            1
        )

        confidence_pct = round(max(75.0, min(96.0, decision_score * 0.9 + 10.0)), 1)

        return {
            "decision_score": min(100.0, decision_score),
            "confidence_pct": confidence_pct
        }

optimization_engine = OptimizationEngine()
