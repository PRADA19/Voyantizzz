from fastapi import APIRouter, HTTPException
from app.schemas.models import CargoRequest, FinalRecommendationOutput, AlertItem
from app.ml.freight_forecast import freight_forecast_engine
from app.services.market_signal import market_signal_engine
from app.services.vessel_recommendation import vessel_recommendation_engine
from app.services.port_compatibility import port_compatibility_engine
from app.services.congestion_predictor import congestion_predictor
from app.services.voyage_cost import voyage_cost_engine
from app.services.risk_engine import risk_engine
from app.optimization.contract_optimizer import contract_optimizer
from app.optimization.optimization_engine import optimization_engine
from app.services.explainable_ai import explainable_ai_engine
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/run", response_model=FinalRecommendationOutput)
def run_full_analysis(request: CargoRequest):
    try:
        analysis_id = f"ANL-{uuid.uuid4().hex[:8].upper()}"

        # Step 1: Freight Forecast
        forecast_res = freight_forecast_engine.train_and_predict(
            origin=request.origin_port,
            destination=request.destination_port,
            cargo_type=request.cargo_type
        )

        # Step 2: Market Entry Signal
        signal_res = market_signal_engine.generate_signal(
            current_rate=forecast_res["current_rate_inr"],
            forecast_30_day=forecast_res["forecast_30_day_inr"],
            confidence_pct=forecast_res["confidence_pct"]
        )

        # Step 3: Vessel Recommendation & Shortlisting
        all_vessels = vessel_recommendation_engine.recommend_vessels(
            cargo_type=request.cargo_type,
            quantity_mt=request.quantity_mt,
            origin=request.origin_port,
            destination=request.destination_port,
            delivery_start=request.delivery_start,
            delivery_end=request.delivery_end
        )
        rec_vessel = all_vessels[0] if len(all_vessels) > 0 else {}

        # Step 4: Port Compatibility Check
        port_check = rec_vessel.get("port_compatibility", {
            "is_compatible": True, "status": "COMPATIBLE", "max_draft_m": 14.5,
            "vessel_draft_m": 14.5, "draft_exceeded_m": 0.0, "max_loa_m": 290.0,
            "vessel_loa_m": 290.0, "max_beam_m": 45.0, "vessel_beam_m": 45.0, "rejection_reasons": []
        })

        # Step 5: Congestion & Idle-Time Prediction
        congestion_res = congestion_predictor.predict_congestion(
            destination_port_name=request.destination_port,
            delivery_start=request.delivery_start
        )

        # Step 6: Voyage Cost Engine
        cost_res = voyage_cost_engine.calculate_cost(
            quantity_mt=request.quantity_mt,
            freight_rate_inr_mt=forecast_res["current_rate_inr"],
            origin=request.origin_port,
            destination=request.destination_port,
            vessel=rec_vessel,
            expected_waiting_hrs=congestion_res["expected_waiting_hours"]
        )

        # Step 7: Risk Engine
        risk_res = risk_engine.analyze_risk(
            freight_confidence=forecast_res["confidence_pct"],
            price_delta_pct=signal_res["expected_change_pct"],
            port_congestion=congestion_res["congestion_index_pct"],
            expected_waiting_hrs=congestion_res["expected_waiting_hours"],
            vessel_match_score=rec_vessel.get("match_score", 90.0),
            port_compatible=port_check.get("is_compatible", True),
            origin=request.origin_port,
            destination=request.destination_port
        )

        # Step 8: Contract Optimization
        all_contracts = contract_optimizer.optimize_contracts(
            current_rate_inr=forecast_res["current_rate_inr"],
            forecast_30_day_inr=forecast_res["forecast_30_day_inr"],
            quantity_mt=request.quantity_mt,
            expected_voyages=request.expected_voyages,
            base_voyage_cost_inr=cost_res["total_voyage_cost_inr"],
            risk_score_base=risk_res["overall_risk_score"]
        )

        rec_contract = next((c for c in all_contracts if c["is_recommended"]), all_contracts[2])

        # Step 9: Final Multi-Objective Decision Score
        opt_res = optimization_engine.calculate_decision_score(
            voyage_cost_crores=cost_res["total_cost_crores"],
            vessel_match_score=rec_vessel.get("match_score", 90.0),
            port_compatible=port_check.get("is_compatible", True),
            risk_score=risk_res["overall_risk_score"],
            idle_hours=congestion_res["expected_waiting_hours"],
            contract_recommended=rec_contract.get("is_recommended", True)
        )

        # Step 10: Explainable AI Rationale Synthesis
        explain_res = explainable_ai_engine.generate_explanations(
            cargo=request.dict(),
            forecast=forecast_res,
            signal=signal_res,
            vessel=rec_vessel,
            port_check=port_check,
            cost=cost_res,
            risk=risk_res,
            contract=rec_contract
        )

        return FinalRecommendationOutput(
            analysis_id=analysis_id,
            cargo_summary=request,
            market_signal=signal_res,
            recommended_vessel=rec_vessel,
            port_compatibility=port_check,
            freight_forecast=forecast_res,
            voyage_cost=cost_res,
            congestion_idle=congestion_res,
            risk_analysis=risk_res,
            contract_strategy=rec_contract,
            all_vessels=all_vessels,
            all_contracts=all_contracts,
            decision_score=opt_res["decision_score"],
            confidence_pct=opt_res["confidence_pct"],
            explainable_ai=explain_res
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")
