from typing import Dict, Any, List
from app.data.data_service import data_service

class PortCompatibilityEngine:
    def check_compatibility(self, vessel: Dict[str, Any], origin_port_name: str, dest_port_name: str) -> Dict[str, Any]:
        dest_port = data_service.get_port_by_name(dest_port_name)
        orig_port = data_service.get_port_by_name(origin_port_name)

        v_draft = float(vessel.get("draft_m", 14.5))
        v_loa = float(vessel.get("loa_m", 290.0))
        v_beam = float(vessel.get("beam_m", 45.0))

        p_max_draft = float(dest_port.get("max_draft_m", 14.5))
        p_max_loa = float(dest_port.get("max_loa_m", 290.0))
        p_max_beam = float(dest_port.get("max_beam_m", 45.0))

        draft_diff = round(v_draft - p_max_draft, 2)
        loa_diff = round(v_loa - p_max_loa, 2)
        beam_diff = round(v_beam - p_max_beam, 2)

        rejection_reasons = []
        
        if draft_diff > 0:
            rejection_reasons.append(f"Vessel Draft ({v_draft}m) exceeds destination port {dest_port_name} Maximum Draft ({p_max_draft}m) by {draft_diff}m.")
        
        if loa_diff > 0:
            rejection_reasons.append(f"Vessel LOA ({v_loa}m) exceeds port {dest_port_name} Maximum LOA ({p_max_loa}m) by {loa_diff}m.")
        
        if beam_diff > 0:
            rejection_reasons.append(f"Vessel Beam ({v_beam}m) exceeds port {dest_port_name} Maximum Beam ({p_max_beam}m) by {beam_diff}m.")

        if len(rejection_reasons) == 0:
            # Check tight margins for conditional status
            if (p_max_draft - v_draft) <= 0.3 or (p_max_loa - v_loa) <= 5.0:
                status = "CONDITIONALLY COMPATIBLE"
                is_compatible = True
                rejection_reasons.append("Tight clearance window. Tides and ballast management required during discharge.")
            else:
                status = "COMPATIBLE"
                is_compatible = True
        else:
            status = "NOT COMPATIBLE"
            is_compatible = False

        return {
            "is_compatible": is_compatible,
            "status": status,
            "max_draft_m": p_max_draft,
            "vessel_draft_m": v_draft,
            "draft_exceeded_m": max(0.0, draft_diff),
            "max_loa_m": p_max_loa,
            "vessel_loa_m": v_loa,
            "max_beam_m": p_max_beam,
            "vessel_beam_m": v_beam,
            "rejection_reasons": rejection_reasons
        }

port_compatibility_engine = PortCompatibilityEngine()
