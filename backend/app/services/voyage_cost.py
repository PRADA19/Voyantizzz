from typing import Dict, Any
from app.data.data_service import data_service

class VoyageCostEngine:
    def calculate_cost(
        self,
        quantity_mt: float,
        freight_rate_inr_mt: float,
        origin: str,
        destination: str,
        vessel: Dict[str, Any],
        expected_waiting_hrs: float = 18.5,
        bunker_price_usd_ton: float = 620.0,
        usd_to_inr: float = 83.0
    ) -> Dict[str, Any]:
        
        # Approximate distance in nautical miles
        if "Australia" in origin or origin in ["Port Hedland", "Hay Point", "Newcastle", "Gladstone"]:
            distance_nm = 4500.0
        elif origin == "Tubarao":
            distance_nm = 11500.0
        elif origin == "Samarinda":
            distance_nm = 2200.0
        else:
            distance_nm = 4800.0

        speed = float(vessel.get("speed_knots", 14.0))
        fuel_per_day = float(vessel.get("fuel_consumption_ton_day", 38.0))
        daily_charter_usd = float(vessel.get("daily_charter_rate_usd", 28500.0))

        sailing_days = distance_nm / (speed * 24.0)
        total_voyage_days = sailing_days + (expected_waiting_hrs / 24.0) + 3.0 # +3 days loading/unloading

        # Financial Breakdown
        freight_cost_inr = quantity_mt * freight_rate_inr_mt

        fuel_tons = total_voyage_days * fuel_per_day
        bunker_cost_usd = fuel_tons * bunker_price_usd_ton
        bunker_cost_inr = bunker_cost_usd * usd_to_inr

        dest_port = data_service.get_port_by_name(destination)
        orig_port = data_service.get_port_by_name(origin)
        
        port_charges_usd = float(dest_port.get("port_charges_usd", 18500)) + float(orig_port.get("port_charges_usd", 28000))
        port_charges_inr = port_charges_usd * usd_to_inr

        handling_cost_inr = quantity_mt * 45.0 # ₹45/MT handling fee

        idle_delay_cost_usd = (expected_waiting_hrs / 24.0) * daily_charter_usd
        idle_delay_cost_inr = idle_delay_cost_usd * usd_to_inr

        other_expenses_inr = 3500000.0 # pilotage, agency, insurance

        total_voyage_cost_inr = (
            freight_cost_inr +
            bunker_cost_inr +
            port_charges_inr +
            handling_cost_inr +
            idle_delay_cost_inr +
            other_expenses_inr
        )

        total_cost_crores = round(total_voyage_cost_inr / 10000000.0, 2)
        cost_per_mt_inr = round(total_voyage_cost_inr / quantity_mt, 1)

        return {
            "freight_cost_inr": round(freight_cost_inr, 0),
            "bunker_cost_inr": round(bunker_cost_inr, 0),
            "port_charges_inr": round(port_charges_inr, 0),
            "handling_cost_inr": round(handling_cost_inr, 0),
            "idle_delay_cost_inr": round(idle_delay_cost_inr, 0),
            "other_expenses_inr": round(other_expenses_inr, 0),
            "total_voyage_cost_inr": round(total_voyage_cost_inr, 0),
            "total_cost_crores": total_cost_crores,
            "cost_per_mt_inr": cost_per_mt_inr
        }

voyage_cost_engine = VoyageCostEngine()
