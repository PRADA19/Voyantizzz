from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="SAIL-FORCAST API Engine",
    description="Intelligent Freight Forecasting & Vessel Chartering Decision Support System for SAIL",
    version="1.0.0"
)

# CORS configuration
origins = os.getenv("ALLOW_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import endpoints
from app.api.endpoints import (
    cargo, forecast, vessels, ports, cost, risk, contracts, simulation, analysis, alerts
)

app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis Pipeline"])
app.include_router(cargo.router, prefix="/api/cargo", tags=["Cargo Requirements"])
app.include_router(forecast.router, prefix="/api/forecast", tags=["Freight Forecast"])
app.include_router(vessels.router, prefix="/api/vessels", tags=["Vessel Recommendation"])
app.include_router(ports.router, prefix="/api/ports", tags=["Ports & Compatibility"])
app.include_router(cost.router, prefix="/api/cost", tags=["Voyage Cost"])
app.include_router(risk.router, prefix="/api/risk", tags=["Risk Engine"])
app.include_router(contracts.router, prefix="/api/contracts", tags=["Contract Strategy"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["What-If Simulator"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])

@app.get("/")
def read_root():
    return {
        "system": "SAIL-FORCAST",
        "status": "online",
        "version": "1.0.0",
        "mode": "Prototype Demo (Representative Dataset)",
        "message": "Intelligent Freight Forecasting & Vessel Chartering Decision Support API Server"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "demo_mode": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
