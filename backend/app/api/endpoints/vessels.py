from fastapi import APIRouter
from app.services.vessel_recommendation import vessel_recommendation_engine
from app.data.data_service import data_service

router = APIRouter()

@router.get("/")
def get_vessels():
    return data_service.get_vessels().to_dict(orient="records")

@router.post("/recommend")
def recommend_vessels(cargo_type: str = "Iron Ore", quantity_mt: float = 150000, origin: str = "Port Hedland", destination: str = "Visakhapatnam"):
    return vessel_recommendation_engine.recommend_vessels(
        cargo_type=cargo_type, quantity_mt=quantity_mt, origin=origin, destination=destination,
        delivery_start="2026-10-15", delivery_end="2026-10-25"
    )
