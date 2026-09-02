from typing import Dict, Any, List
import pandas as pd
from datetime import datetime
from app.data.data_service import data_service
from app.services.port_compatibility import port_compatibility_engine

class VesselRecommendationEngine:
    def recommend_vessels(self, cargo_type: str, quantity_mt: float, origin: str, destination: str, delivery_start: str, delivery_end: str) -> List[Dict[str, Any]]:
        vessels_df = data_service.get_vessels()
        
        try:
            start_date = datetime.strptime(delivery_start, "%Y-%m-%d")
        except:
            start_date = datetime(2026, 10, 15)

        ranked_vessels = []

        for _, row in vessels_df.iterrows():
            vdict = row.to_dict()
            v_id = vdict["vessel_id"]
            dwt = float(vdict.get("dwt", 80000))
            vtype = vdict.get("vessel_type", "Panamax")
            charter_rate = float(vdict.get("daily_charter_rate_usd", 25000))
            avail_str = str(vdict.get("availability_date", "2026-09-10"))

            # Port compatibility check
            port_check = port_compatibility_engine.check_compatibility(vdict, origin, destination)

            # 1. Cargo Fit (30%)
            # Ideal DWT is equal to or slightly above cargo_quantity (up to 1.2x)
            dwt_ratio = dwt / quantity_mt
            if 0.95 <= dwt_ratio <= 1.35:
                cargo_fit = 100.0
            elif 0.80 <= dwt_ratio < 0.95:
                cargo_fit = 75.0
            elif 1.35 < dwt_ratio <= 1.6:
                cargo_fit = 65.0
            else:
                cargo_fit = 40.0

            # 2. Port Fit (20%)
            if port_check["status"] == "COMPATIBLE":
                port_fit = 100.0
            elif port_check["status"] == "CONDITIONALLY COMPATIBLE":
                port_fit = 75.0
            else:
                port_fit = 15.0  # Penalize incompatible vessels heavily

            # 3. Availability Fit (15%)
            try:
                avail_date = datetime.strptime(avail_str, "%Y-%m-%d")
                days_diff = (start_date - avail_date).days
                if 0 <= days_diff <= 20:
                    avail_score = 100.0
                elif -5 <= days_diff < 0:
                    avail_score = 80.0
                elif 20 < days_diff <= 35:
                    avail_score = 60.0
                else:
                    avail_score = 30.0
            except:
                avail_score = 70.0

            # 4. Cost Fit (20%)
            # Benchmark rate ~$28,000 for Capesize, $20,000 for Panamax
            if charter_rate <= 22000:
                cost_score = 100.0
            elif charter_rate <= 28500:
                cost_score = 85.0
            elif charter_rate <= 33000:
                cost_score = 65.0
            else:
                cost_score = 45.0

            # 5. Idle-Time Risk Score (10%)
            status = vdict.get("status", "Available")
            if status == "Available":
                idle_risk_score = 90.0
            elif status == "In Voyage":
                idle_risk_score = 65.0
            else:
                idle_risk_score = 30.0

            # Combined weighted score
            match_score = round(
                0.30 * cargo_fit +
                0.20 * port_fit +
                0.15 * avail_score +
                0.20 * cost_score +
                0.10 * idle_risk_score +
                0.05 * (90.0 if (cargo_type.lower() == "iron ore" and vtype == "Capesize") else 70.0),
                1
            )

            # Ensure incompatible vessels receive capped overall match score
            if not port_check["is_compatible"]:
                match_score = min(match_score, 45.0)

            ranked_vessels.append({
                "vessel_id": v_id,
                "vessel_name": vdict["vessel_name"],
                "vessel_type": vtype,
                "dwt": dwt,
                "loa_m": float(vdict.get("loa_m", 290.0)),
                "beam_m": float(vdict.get("beam_m", 45.0)),
                "draft_m": float(vdict.get("draft_m", 14.5)),
                "speed_knots": float(vdict.get("speed_knots", 14.0)),
                "daily_charter_rate_usd": charter_rate,
                "availability_date": avail_str,
                "current_port": vdict.get("current_port", origin),
                "lat": float(vdict.get("lat", -20.31)),
                "lon": float(vdict.get("lon", 118.57)),
                "owner": vdict.get("owner", "SAIL Maritime"),
                "status": vdict.get("status", "Available"),
                "match_score": match_score,
                "cargo_fit_score": cargo_fit,
                "port_fit_score": port_fit,
                "availability_score": avail_score,
                "cost_score": cost_score,
                "idle_risk_score": idle_risk_score,
                "port_compatibility": port_check
            })

        # Sort descending by match score
        ranked_vessels = sorted(ranked_vessels, key=lambda x: x["match_score"], reverse=True)
        return ranked_vessels

vessel_recommendation_engine = VesselRecommendationEngine()
