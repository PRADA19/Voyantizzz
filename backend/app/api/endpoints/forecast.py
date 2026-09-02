from fastapi import APIRouter
from app.ml.freight_forecast import freight_forecast_engine
from app.schemas.models import FreightForecastOutput

router = APIRouter()

@router.get("/{route}", response_model=FreightForecastOutput)
def get_freight_forecast(route: str = "Australia -> Visakhapatnam"):
    return freight_forecast_engine.train_and_predict(origin="Port Hedland", destination="Visakhapatnam")

@router.post("/freight", response_model=FreightForecastOutput)
def post_freight_forecast(origin: str = "Port Hedland", destination: str = "Visakhapatnam", cargo_type: str = "Iron Ore"):
    return freight_forecast_engine.train_and_predict(origin=origin, destination=destination, cargo_type=cargo_type)
