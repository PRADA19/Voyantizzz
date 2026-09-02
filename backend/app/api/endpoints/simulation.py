from fastapi import APIRouter
from app.schemas.models import WhatIfRequest
from app.optimization.what_if_simulator import what_if_simulator
from app.api.endpoints.analysis import run_full_analysis

router = APIRouter()

@router.post("/run")
def run_simulation(request: WhatIfRequest):
    baseline = run_full_analysis(request.cargo)
    baseline_dict = baseline.dict()
    return what_if_simulator.simulate_scenario(request, baseline_dict)
