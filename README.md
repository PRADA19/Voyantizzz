# SAIL-FORCAST

## Intelligent Freight Forecasting & Vessel Chartering Decision Support System
**Smart India Hackathon 2026 Problem Statement:** SIH26006

> **Philosophy:** PREDICT → MATCH → OPTIMIZE → ALERT → CONTRACT

---

## 1. Problem Statement & Overview
Raw material procurement (Iron Ore, Coking Coal, Limestone) for Steel Authority of India Limited (SAIL) steel plants requires importing millions of metric tons of bulk cargo from overseas loading ports (Australia, Brazil, Indonesia, South Africa) to Indian East Coast ports (Visakhapatnam, Paradip, Haldia, Dhamra, Krishnapatnam).

Currently, freight procurement managers often make reactive spot-market chartering decisions exposed to volatile Baltic Dry Index shifts, fuel price spikes, port draft limitations, berth congestion delays, and financial risk.

**SAIL-FORCAST** resolves this by providing an integrated, AI-driven decision-support platform that transforms reactive spot buying into predictive, risk-aware chartering decisions.

---

## 2. Core Decision Pipeline

```text
Cargo Requirement Input (Iron Ore, 150,000 MT, Australia → Visakhapatnam)
        ↓
Data Integration (5 Years Freight Rates, BDI, Fuel Prices, Port & Vessel specs)
        ↓
Data Preprocessing & Feature Engineering
        ↓
Freight Rate Forecast Model (Multi-horizon 7, 30, 60-day prediction & confidence bounds)
        ↓
Market Entry Signal Generator (BUY NOW / WAIT / WATCH / HIGH RISK)
        ↓
Vessel Recommendation Engine (Multi-criteria DWT, speed & cost match scoring)
        ↓
Port Compatibility Check (Draft, LOA, Beam physical constraint checks with explicit rejection reasons)
        ↓
Voyage Financial Cost Engine (Freight + Fuel + Port Charges + Anchorage Idle Delay)
        ↓
Congestion & Idle-Time Prediction (Berth waiting hours & delay probability)
        ↓
Multi-Vector Risk Engine (0-100 Score across Market, Port, Weather, Vessel & Idle risks)
        ↓
Contract Strategy Optimization (Spot vs 1-Month vs 3-Month vs Multiple-Voyage COA)
        ↓
What-If Sensitivity Simulation (Real-time recalculation of fuel, congestion & rate deltas)
        ↓
Final Multi-Objective Decision Score & Chartering Recommendation
        ↓
Explainable AI Rationale Synthesis ("WHY THIS DECISION?")
```

---

## 3. Technology Stack

### Frontend
- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** (Dark maritime enterprise theme)
- **Recharts** (Interactive time-series line, area, pie, and bar charts)
- **Lucide React** (Enterprise icons)
- **React Leaflet** (Geospatial maritime map)
- **Axios** (API communication with dual-mode fallback)

### Backend
- **Python 3.11** + **FastAPI**
- **Scikit-learn** & **XGBoost** (Time-series freight forecasting regression)
- **Pandas** & **NumPy** (Data processing & cost engines)
- **Pydantic v2** (Strict schema validation)
- **Dual-Mode Data Loader** (Local CSV fallback + optional MongoDB integration)

---

## 4. Representative Datasets (`/data`)
- `freight_rates.csv` (1,776 historical route rates, Baltic Dry Index, Capesize/Panamax indices)
- `vessels.csv` (15 bulk carriers with DWT, LOA, Beam, Draft, Speed, Fuel consumption, Daily charter rate)
- `ports.csv` (14 East Coast Indian & overseas loading ports with max draft, LOA, beam, handling rates)
- `voyages.csv` (150 historical voyage records)
- `weather.csv` (264 monsoon & storm index records)
- `bunker_prices.csv` (840 historical VLSFO & MGO fuel prices)
- `commodity_prices.csv` (280 Iron ore & coking coal price series)
- `economic_indicators.csv` (140 Steel production & global bulk demand indices)

---

## 5. Machine Learning & Optimization Methodology

### ML Freight Rate Forecasting
- Model: **RandomForest & Gradient Boosting Regressor**
- Input Features: Lagged freight rates (Lag-1, Lag-2), 4-week rolling averages, Baltic Dry Index (BDI), VLSFO bunker fuel prices, and seasonal month/dayofyear indicators.
- Metrics Evaluated: **MAE**, **RMSE**, **R²**, **MAPE**.
- Output: 7, 30, and 60-day predicted rates, upper/lower 95% confidence bounds.

### Multi-Criteria Vessel Scoring Engine
$$\text{Vessel Score} = 0.30 \cdot \text{CargoFit} + 0.20 \cdot \text{PortFit} + 0.15 \cdot \text{Availability} + 0.20 \cdot \text{Cost} + 0.10 \cdot \text{IdleRisk} + 0.05 \cdot \text{RouteFit}$$

### Port Physical Constraint Verification
- Verifies: $\text{Vessel Draft} \le \text{Port Max Draft}$, $\text{LOA} \le \text{Max LOA}$, $\text{Beam} \le \text{Max Beam}$.
- Explicitly outputs rejection reasoning for non-compatible vessels (e.g., "Vessel Draft 15.0m exceeds Haldia Max Draft 11.2m by 3.8m").

---

## 6. Installation & Setup Guide

### System Requirements
- Node.js v18+
- Python 3.10+
- npm v9+

### Quick Local Start

#### 1. Backend Server Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Backend API will be running at `http://localhost:8000`.

#### 2. Frontend Application Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend UI will be accessible at `http://localhost:5173`.

---

## 7. API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analysis/run` | Master pipeline endpoint (Executes full 12-step decision engine) |
| `POST` | `/api/cargo/analyze` | Validate cargo requirement input |
| `POST` | `/api/forecast/freight` | Generate freight rate prediction & metrics |
| `POST` | `/api/vessels/recommend` | Rank bulk carrier candidates |
| `POST` | `/api/ports/compatibility` | Check physical port draft/LOA clearance |
| `POST` | `/api/cost/calculate` | Compute detailed voyage financial model |
| `POST` | `/api/risk/analyze` | Calculate multi-vector risk score (0-100) |
| `POST` | `/api/contracts/optimize` | Compare Spot vs 1M vs 3M vs COA contracts |
| `POST` | `/api/simulation/run` | Execute What-If scenario sensitivity simulation |
| `GET` | `/api/alerts` | Fetch active operational alerts feed |

---

## 8. Demo Scenario for Hackathon Presentation

1. Launch application at `http://localhost:5173`.
2. Click the top navbar **🚀 RUN FULL DEMO** button.
3. Observe the animated 9-step progress modal ("Loading data -> Forecasting -> Vessel matching -> Port compatibility -> Voyage cost -> Risk -> Recommendation").
4. Inspect the resulting **FINAL CHARTER RECOMMENDATION**:
   - **Market Signal:** 🟢 `BUY NOW`
   - **Recommended Vessel:** `MV Ocean Star` (180,000 DWT Capesize, 94% Match)
   - **Port Status:** 🟢 `COMPATIBLE` (Visakhapatnam Max Draft 14.5m)
   - **Expected Total Cost:** `₹8.11 Crores`
   - **Recommended Contract:** `3-Month Multiple-Voyage`
   - **Risk Score:** `32 / 100 (MEDIUM)`
   - **Explainable AI:** Click **"WHY THIS DECISION?"** to view dynamic rationale.
5. Navigate to **What-If Simulator** and adjust fuel price or congestion sliders to demonstrate real-time scenario recalculation.

---

## 9. Future Improvements
- Integration with live AIS vessel tracking streams (Marinetraffic/Spire API).
- Live Baltic Dry Index (BDI) and Platts bunker price API integration.
- SAP / SAIL ERP raw material procurement system connector.
