from fastapi import APIRouter
from app.services.risk_engine import risk_engine

router = APIRouter()

@router.post("/analyze")
def analyze_risk(confidence_pct: float = 85.0, price_delta_pct: float = 10.3, port_congestion: float = 62.5, destination: str = "Visakhapatnam"):
    return risk_engine.analyze_risk(
        freight_confidence=confidence_pct,
        price_delta_pct=price_delta_pct,
        port_congestion=port_congestion,
        expected_waiting_hrs=18.5,
        vessel_match_score=94.0,
        port_compatible=True,
        origin="Port Hedland",
        destination=destination
    )
