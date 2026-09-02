from fastapi import APIRouter
from app.schemas.models import CargoRequest
import uuid

router = APIRouter()

@router.post("/analyze")
def analyze_cargo_request(request: CargoRequest):
    req_id = f"CRG-{uuid.uuid4().hex[:6].upper()}"
    return {
        "status": "success",
        "request_id": req_id,
        "message": "Cargo procurement request received and validated.",
        "cargo": request
    }
