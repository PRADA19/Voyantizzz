import os
import pandas as pd
from typing import Dict, Any, List
import logging

logger = logging.getLogger("sail_forcast.data_service")

class DataService:
    def __init__(self, data_dir: str = None):
        if data_dir is None:
            # Look for environment variable or calculate root data directory
            env_dir = os.getenv("DATA_DIR")
            if env_dir and os.path.exists(env_dir):
                self.data_dir = env_dir
            else:
                # D:/voyantiz/backend/app/data/data_service.py -> D:/voyantiz/data
                app_dir = os.path.dirname(os.path.abspath(__file__)) # .../app/data
                backend_dir = os.path.dirname(os.path.dirname(app_dir)) # .../backend
                root_dir = os.path.dirname(backend_dir) # .../voyantiz
                self.data_dir = os.path.join(root_dir, "data")
                if not os.path.exists(self.data_dir):
                    # Fallback if executed directly from backend
                    self.data_dir = os.path.join(backend_dir, "data")
        else:
            self.data_dir = data_dir
        
        self.freight_df = None
        self.vessels_df = None
        self.ports_df = None
        self.voyages_df = None
        self.weather_df = None
        self.bunker_df = None
        self.commodity_df = None
        self.economic_df = None
        
        self.load_all_data()

    def load_all_data(self):
        try:
            self.freight_df = pd.read_csv(os.path.join(self.data_dir, "freight_rates.csv"))
            self.vessels_df = pd.read_csv(os.path.join(self.data_dir, "vessels.csv"))
            self.ports_df = pd.read_csv(os.path.join(self.data_dir, "ports.csv"))
            self.voyages_df = pd.read_csv(os.path.join(self.data_dir, "voyages.csv"))
            self.weather_df = pd.read_csv(os.path.join(self.data_dir, "weather.csv"))
            self.bunker_df = pd.read_csv(os.path.join(self.data_dir, "bunker_prices.csv"))
            self.commodity_df = pd.read_csv(os.path.join(self.data_dir, "commodity_prices.csv"))
            self.economic_df = pd.read_csv(os.path.join(self.data_dir, "economic_indicators.csv"))
            logger.info("Loaded all representative datasets into memory successfully.")
        except Exception as e:
            logger.error(f"Failed loading CSV datasets from {self.data_dir}: {str(e)}")

    def get_freight_history(self, route: str = None) -> pd.DataFrame:
        if self.freight_df is None:
            self.load_all_data()
        df = self.freight_df.copy()
        if route and "route" in df.columns:
            matched = df[df["route"].str.lower() == route.lower()]
            if not matched.empty:
                return matched
        return df

    def get_vessels(self) -> pd.DataFrame:
        if self.vessels_df is None:
            self.load_all_data()
        return self.vessels_df.copy()

    def get_ports(self) -> pd.DataFrame:
        if self.ports_df is None:
            self.load_all_data()
        return self.ports_df.copy()

    def get_port_by_name(self, port_name: str) -> Dict[str, Any]:
        df = self.get_ports()
        matched = df[df["port_name"].str.lower() == port_name.lower()]
        if not matched.empty:
            return matched.iloc[0].to_dict()
        return {
            "port_name": port_name,
            "country": "India",
            "max_draft_m": 14.5,
            "max_loa_m": 290.0,
            "max_beam_m": 45.0,
            "handling_rate_mt_day": 35000,
            "congestion_index": 55.0,
            "berth_capacity": 10,
            "avg_waiting_hours": 18.0,
            "port_charges_usd": 18500
        }

    def get_vessel_by_id(self, vessel_id: str) -> Dict[str, Any]:
        df = self.get_vessels()
        matched = df[df["vessel_id"].str.lower() == vessel_id.lower()]
        if not matched.empty:
            return matched.iloc[0].to_dict()
        return None

# Global singleton instance
data_service = DataService()
