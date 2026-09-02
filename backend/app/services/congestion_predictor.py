from typing import Dict, Any
from app.data.data_service import data_service

class CongestionPredictor:
    def predict_congestion(self, destination_port_name: str, delivery_start: str = "2026-10-15") -> Dict[str, Any]:
        port = data_service.get_port_by_name(destination_port_name)
        base_congestion = float(port.get("congestion_index", 62.5))
        base_waiting = float(port.get("avg_waiting_hours", 18.5))

        # Seasonal monsoon check (October is post-monsoon on East Coast, moderate activity)
        month = 10
        if "2026-" in delivery_start:
            try:
                month = int(delivery_start.split("-")[1])
            except:
                pass
        
        seasonal_factor = 1.15 if month in [6, 7, 8, 9] else 0.95
        
        congestion_index = round(min(98.0, max(10.0, base_congestion * seasonal_factor)), 1)
        expected_waiting_hrs = round(base_waiting * (congestion_index / 50.0), 1)
        delay_prob = round(min(95.0, max(5.0, (congestion_index / 100.0) * 40.0 + 5.0)), 1)
        expected_idle_days = round(expected_waiting_hrs / 24.0, 1)

        idle_risk_score = round(min(100.0, (expected_waiting_hrs / 48.0) * 100.0), 1)

        return {
            "congestion_index_pct": congestion_index,
            "delay_probability_pct": delay_prob,
            "expected_waiting_hours": expected_waiting_hrs,
            "expected_idle_days": expected_idle_days,
            "idle_risk_score": idle_risk_score
        }

congestion_predictor = CongestionPredictor()
