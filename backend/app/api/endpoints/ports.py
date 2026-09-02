from fastapi import APIRouter
from app.data.data_service import data_service
from app.services.port_compatibility import port_compatibility_engine

router = APIRouter()

@router.get("/")
def get_ports():
    return data_service.get_ports().to_dict(orient="records")

@router.post("/compatibility")
def check_port_compatibility(vessel_draft_m: float = 18.2, vessel_loa_m: float = 292.0, vessel_beam_m: float = 45.0, destination_port: str = "Visakhapatnam"):
    vdict = {"draft_m": vessel_draft_m, "loa_m": vessel_loa_m, "beam_m": vessel_beam_m}
    return port_compatibility_engine.check_compatibility(vdict, "Port Hedland", destination_port)
