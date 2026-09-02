from fastapi import APIRouter
from typing import List
from app.schemas.models import AlertItem

router = APIRouter()

@router.get("/", response_model=List[AlertItem])
def get_active_alerts():
    return [
        AlertItem(
            id="ALT-101",
            title="Freight Rate Surge Warning",
            message="Capesize freight rates on Australia -> Visakhapatnam route predicted to rise +10.3% over the next 30 days.",
            severity="warning",
            category="freight",
            timestamp="2026-09-01 10:15:00"
        ),
        AlertItem(
            id="ALT-102",
            title="Visakhapatnam Berth Congestion",
            message="Visakhapatnam port congestion index reached 62.5%. Expected anchorage waiting time is 18.5 hours.",
            severity="warning",
            category="port",
            timestamp="2026-09-01 09:30:00"
        ),
        AlertItem(
            id="ALT-103",
            title="Vessel Position Matched",
            message="MV Ocean Star (180,000 DWT Capesize) is available near Port Hedland with 94% cargo & port suitability.",
            severity="success",
            category="vessel",
            timestamp="2026-09-01 08:45:00"
        ),
        AlertItem(
            id="ALT-104",
            title="Haldia Port Draft Limitation Alert",
            message="Draft restrictions at Haldia (11.2m max draft) render Capesize vessels non-compatible. Panamax/Supramax required.",
            severity="critical",
            category="port",
            timestamp="2026-08-31 16:20:00"
        )
    ]
