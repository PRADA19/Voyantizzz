from typing import Dict, Any, List

class RiskEngine:
    def analyze_risk(
        self,
        freight_confidence: float,
        price_delta_pct: float,
        port_congestion: float,
        expected_waiting_hrs: float,
        vessel_match_score: float,
        port_compatible: bool,
        origin: str,
        destination: str
    ) -> Dict[str, Any]:

        # 1. Market Risk (0-100)
        market_risk = round(max(10.0, (100.0 - freight_confidence) * 1.2 + abs(price_delta_pct) * 1.5), 1)

        # 2. Port Risk (0-100)
        port_risk = round(max(15.0, port_congestion * 0.7 + (0.0 if port_compatible else 45.0)), 1)

        # 3. Weather Risk (0-100)
        # Seasonal weather factor (East Coast Indian monsoons or Bay of Bengal storms)
        weather_risk = 38.0 if destination in ["Visakhapatnam", "Paradip", "Haldia", "Dhamra"] else 22.0

        # 4. Vessel Availability & Condition Risk (0-100)
        vessel_risk = round(max(10.0, 100.0 - vessel_match_score), 1)

        # 5. Idle-Time Risk (0-100)
        idle_risk = round(min(100.0, (expected_waiting_hrs / 36.0) * 100.0), 1)

        # 6. External Disruption Risk (0-100)
        external_risk = 28.0

        # Overall Weighted Composite Risk (0-100)
        overall_risk = round(
            0.25 * market_risk +
            0.20 * port_risk +
            0.15 * weather_risk +
            0.15 * vessel_risk +
            0.15 * idle_risk +
            0.10 * external_risk,
            1
        )

        overall_risk = max(0.0, min(100.0, overall_risk))

        if overall_risk <= 30.0:
            risk_level = "LOW"
        elif overall_risk <= 60.0:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        top_factors = []
        if market_risk >= 35.0:
            top_factors.append(f"Market Freight Volatility: High rate trend shift ({price_delta_pct:+.1f}%) projected over 30-day window.")
        if port_risk >= 40.0:
            top_factors.append(f"Port Congestion Exposure: Destination port {destination} operating at {port_congestion:.1f}% capacity.")
        if idle_risk >= 35.0:
            top_factors.append(f"Berth Waiting Delay: Projected {expected_waiting_hrs:.1f} hours waiting at anchorage.")
        if not port_compatible:
            top_factors.append("Port Physical Restriction: Candidate vessel exceeds max draft / LOA limits.")
        if len(top_factors) == 0:
            top_factors.append("Favorable operational conditions with low market volatility.")

        return {
            "overall_risk_score": overall_risk,
            "risk_level": risk_level,
            "market_risk": min(100.0, market_risk),
            "port_risk": min(100.0, port_risk),
            "weather_risk": min(100.0, weather_risk),
            "vessel_risk": min(100.0, vessel_risk),
            "idle_risk": min(100.0, idle_risk),
            "external_risk": min(100.0, external_risk),
            "top_risk_factors": top_factors
        }

risk_engine = RiskEngine()
