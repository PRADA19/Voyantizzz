from fastapi import APIRouter
from app.optimization.contract_optimizer import contract_optimizer

router = APIRouter()

@router.post("/optimize")
def optimize_contracts(current_rate_inr: float = 1830.0, forecast_30_day_inr: float = 2018.0, quantity_mt: float = 150000.0, expected_voyages: int = 3):
    return contract_optimizer.optimize_contracts(current_rate_inr, forecast_30_day_inr, quantity_mt, expected_voyages)
