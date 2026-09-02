from typing import Dict, Any

class MarketSignalEngine:
    def generate_signal(self, current_rate: float, forecast_30_day: float, confidence_pct: float, urgency_days: int = 30) -> Dict[str, Any]:
        price_delta_pct = ((forecast_30_day - current_rate) / current_rate) * 100.0

        if confidence_pct < 65.0:
            signal = "HIGH RISK"
            color = "rose"
            explanation = f"Model forecast confidence is relatively low ({confidence_pct}%). Market volatility is elevated. Exercise caution before locking long-term contracts."
            summary = "High market uncertainty. Monitor spot rate trajectory before long-term commitment."
        elif price_delta_pct >= 5.0:
            signal = "BUY NOW"
            color = "emerald"
            explanation = (
                f"Freight rates are forecast to INCREASE by +{price_delta_pct:.1f}% over the next 30 days "
                f"(from ₹{current_rate:.1f}/MT to ₹{forecast_30_day:.1f}/MT). Current market conditions indicate "
                f"that chartering vessels now under a medium-term contract will mitigate future rate increase exposure."
            )
            summary = "Proactive chartering recommended. Lock contract before expected freight rate escalation."
        elif price_delta_pct <= -5.0:
            signal = "WAIT"
            color = "amber"
            explanation = (
                f"Freight rates are forecast to DECREASE by {price_delta_pct:.1f}% over the next 30 days. "
                f"Holding off on immediate multi-month chartering and relying on spot allocation or short commitments will capture lower future rates."
            )
            summary = "Freight softness expected. Defer contract entry to leverage lower spot rates."
        else:
            signal = "WATCH"
            color = "blue"
            explanation = (
                f"Freight rates are projected to remain relatively flat (delta: {price_delta_pct:+.1f}%). "
                f"No immediate spike detected. Secure routine vessel requirements without paying high urgency premiums."
            )
            summary = "Stable rate environment. Maintain standard procurement schedule."

        return {
            "signal": signal,
            "color": color,
            "current_rate_inr": round(current_rate, 1),
            "forecast_30_day_inr": round(forecast_30_day, 1),
            "expected_change_pct": round(price_delta_pct, 1),
            "confidence_pct": round(confidence_pct, 1),
            "explanation": explanation,
            "recommendation_summary": summary
        }

market_signal_engine = MarketSignalEngine()
