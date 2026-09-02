from fastapi import APIRouter
from app.services.voyage_cost import voyage_cost_engine

router = APIRouter()

@router.post("/calculate")
def calculate_voyage_cost(quantity_mt: float = 150000.0, freight_rate_inr_mt: float = 1830.0, origin: str = "Port Hedland", destination: str = "Visakhapatnam"):
    sample_vessel = {"speed_knots": 14.5, "fuel_consumption_ton_day": 38.0, "daily_charter_rate_usd": 28500.0}
    return voyage_cost_engine.calculate_cost(quantity_mt, freight_rate_inr_mt, origin, destination, sample_vessel)
