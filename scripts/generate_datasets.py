import os
import csv
import random
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Set random seed for consistent realistic prototype generation
random.seed(42)

def generate_freight_rates():
    filepath = os.path.join(DATA_DIR, "freight_rates.csv")
    headers = [
        "date", "route", "origin", "destination", "cargo_type", "vessel_type",
        "freight_rate_usd_mt", "freight_rate_inr_mt", "baltic_dry_index",
        "capesize_index", "panamax_index", "bunker_price_usd_ton"
    ]
    
    routes = [
        ("Australia -> Visakhapatnam", "Port Hedland", "Visakhapatnam", "Iron Ore", "Capesize", 22.0, 1830.0),
        ("Australia -> Paradip", "Hay Point", "Paradip", "Coking Coal", "Panamax", 19.5, 1620.0),
        ("Brazil -> Haldia", "Tubarao", "Haldia", "Iron Ore", "Capesize", 28.0, 2325.0),
        ("Indonesia -> Dhamra", "Samarinda", "Dhamra", "Thermal Coal", "Supramax", 14.0, 1160.0),
        ("South Africa -> Krishnapatnam", "Richards Bay", "Krishnapatnam", "Coal", "Panamax", 17.5, 1450.0),
        ("Australia -> Visakhapatnam", "Newcastle", "Visakhapatnam", "Coking Coal", "Panamax", 20.0, 1660.0),
    ]

    start_date = datetime(2021, 1, 1)
    end_date = datetime(2026, 9, 1)
    current_date = start_date

    bdi_base = 2100
    cape_base = 2800
    pana_base = 1900
    bunker_base = 620.0
    usd_to_inr = 83.0

    rows = []
    
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        days_from_start = (current_date - start_date).days
        market_cycle = 300 * ((days_from_start / 365.0) % 2.5 - 1.25)
        random_walk = random.uniform(-40, 42)
        
        bdi_base = max(800, bdi_base + random_walk + (market_cycle / 100))
        cape_base = bdi_base * 1.35 + random.uniform(-50, 50)
        pana_base = bdi_base * 0.95 + random.uniform(-30, 30)
        bunker_base = max(450.0, min(950.0, bunker_base + random.uniform(-4.0, 4.2)))

        for route_name, origin, dest, cargo, vtype, base_usd, base_inr in routes:
            type_factor = 1.25 if vtype == "Capesize" else (1.0 if vtype == "Panamax" else 0.85)
            rate_usd = base_usd * (bdi_base / 2000.0) * type_factor + random.uniform(-0.8, 0.8)
            rate_usd = round(max(8.0, rate_usd), 2)
            rate_inr = round(rate_usd * usd_to_inr, 1)

            rows.append([
                date_str, route_name, origin, dest, cargo, vtype,
                rate_usd, rate_inr, int(bdi_base), int(cape_base), int(pana_base), round(bunker_base, 1)
            ])
            
        current_date += timedelta(days=7)

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    print(f"Generated {len(rows)} freight rate records.")

def generate_vessels():
    filepath = os.path.join(DATA_DIR, "vessels.csv")
    headers = [
        "vessel_id", "vessel_name", "vessel_type", "dwt", "loa_m", "beam_m",
        "draft_m", "speed_knots", "fuel_consumption_ton_day", "daily_charter_rate_usd",
        "availability_date", "current_port", "lat", "lon", "owner", "status", "year_built", "flag"
    ]

    vessel_names = [
        ("MV Ocean Star", "Capesize", 180000, 292.0, 45.0, 18.2, 14.5, 38.0, 28500, "Port Hedland", -20.31, 118.57, "SAIL Maritime Chartering", "Available", 2019, "India"),
        ("MV Eastern Pearl", "Capesize", 175000, 289.0, 45.0, 17.8, 14.2, 36.5, 27200, "Singapore Hub", 1.29, 103.85, "Oceania Shipping Corp", "Available", 2021, "Panama"),
        ("MV Pacific Trader", "Panamax", 82000, 229.0, 32.2, 14.4, 13.8, 26.0, 19500, "Hay Point", -21.28, 149.30, "Global Bulk Lines", "Available", 2018, "Singapore"),
        ("MV Visakha Pride", "Capesize", 182000, 295.0, 46.0, 18.5, 14.8, 39.5, 29000, "Visakhapatnam Outer", 17.68, 83.21, "Indian Maritime Enterprise", "In Voyage", 2022, "India"),
        ("MV Paradip Pioneer", "Panamax", 76000, 225.0, 32.2, 13.9, 13.5, 24.5, 18200, "Gladstone", -23.84, 151.25, "Kalinga Shipping Co", "Available", 2020, "India"),
        ("MV Iron Express", "Capesize", 178000, 290.0, 45.0, 18.0, 14.3, 37.0, 27800, "Port Hedland", -20.31, 118.57, "Iron Range Shipping", "Available", 2017, "Liberia"),
        ("MV Bengal Glory", "Supramax", 58000, 190.0, 32.2, 12.8, 13.0, 21.0, 14500, "Samarinda", -0.50, 117.15, "Eastern Coastal Transport", "Available", 2016, "India"),
        ("MV Coal Champion", "Panamax", 81000, 229.0, 32.2, 14.2, 13.6, 25.5, 19100, "Newcastle", -32.92, 151.78, "Southern Cross Logistics", "Available", 2021, "Marshall Islands"),
        ("MV Atlantic Titan", "Capesize", 205000, 300.0, 50.0, 18.8, 15.0, 42.0, 32000, "Tubarao", -20.28, -40.28, "Transatlantic Bulk Ltd", "Maintenance", 2015, "Liberia"),
        ("MV Dhamra Express", "Supramax", 63000, 199.0, 32.2, 13.1, 13.2, 22.0, 15200, "Dhamra Port", 20.80, 86.96, "Dhamra Coastal Maritime", "Available", 2023, "India"),
        ("MV Southern Fortune", "Panamax", 78000, 227.0, 32.2, 14.0, 13.5, 24.8, 18600, "Richards Bay", -28.80, 32.03, "Indian Ocean Lines", "In Voyage", 2019, "Singapore"),
        ("MV Kalinga Enterprise", "Capesize", 176000, 290.0, 45.0, 17.9, 14.4, 37.5, 28000, "Port Hedland", -20.31, 118.57, "SAIL Dedicated Fleet", "Available", 2024, "India"),
        ("MV Coromandel Voyager", "Handymax", 45000, 180.0, 28.0, 11.5, 12.5, 18.0, 12000, "Krishnapatnam", 14.25, 80.13, "Coromandel Bulk Shippers", "Available", 2018, "India"),
        ("MV Steel Mariner", "Capesize", 185000, 294.0, 46.0, 18.4, 14.6, 38.5, 29500, "Singapore Anchorage", 1.25, 103.80, "Global Steel Chartering", "Available", 2020, "Panama"),
        ("MV Ore Challenger", "Capesize", 172000, 288.0, 45.0, 17.6, 14.1, 36.0, 26800, "Port Hedland", -20.31, 118.57, "Pacific Ore Transport", "Available", 2017, "Bahamas")
    ]

    rows = []
    base_date = datetime(2026, 9, 10)
    for i, item in enumerate(vessel_names, 1):
        v_id = f"VES-{i:03d}"
        name, vtype, dwt, loa, beam, draft, speed, fuel, charter_rate, port, lat, lon, owner, status, year, flag = item
        avail_days = random.randint(0, 15) if status == "Available" else random.randint(12, 35)
        avail_date = (base_date + timedelta(days=avail_days)).strftime("%Y-%m-%d")

        rows.append([
            v_id, name, vtype, dwt, loa, beam, draft, speed, fuel, charter_rate,
            avail_date, port, lat, lon, owner, status, year, flag
        ])

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    print(f"Generated {len(rows)} vessel records.")

def generate_ports():
    filepath = os.path.join(DATA_DIR, "ports.csv")
    headers = [
        "port_id", "port_name", "country", "is_sail_destination", "lat", "lon",
        "max_draft_m", "max_loa_m", "max_beam_m", "handling_rate_mt_day",
        "congestion_index", "berth_capacity", "avg_waiting_hours", "port_charges_usd"
    ]

    ports = [
        ("PORT-IN-01", "Visakhapatnam", "India", True, 17.68, 83.21, 14.5, 290.0, 45.0, 35000, 62.5, 12, 18.5, 18500),
        ("PORT-IN-02", "Paradip", "India", True, 20.26, 86.67, 14.5, 290.0, 45.0, 32000, 71.0, 10, 24.0, 21000),
        ("PORT-IN-03", "Haldia", "India", True, 22.02, 88.06, 11.2, 230.0, 32.2, 18000, 84.0, 6, 42.0, 24500),
        ("PORT-IN-04", "Dhamra", "India", True, 20.80, 86.96, 18.0, 310.0, 48.0, 45000, 38.0, 8, 8.5, 16000),
        ("PORT-IN-05", "Krishnapatnam", "India", True, 14.25, 80.13, 16.5, 295.0, 46.0, 38000, 45.0, 8, 12.0, 17500),
        ("PORT-IN-06", "Chennai", "India", False, 13.08, 80.27, 13.5, 240.0, 35.0, 22000, 58.0, 14, 20.0, 19000),
        ("PORT-IN-07", "Tuticorin", "India", False, 8.76, 78.13, 12.8, 230.0, 32.2, 20000, 41.0, 7, 11.0, 15500),
        ("PORT-OS-01", "Port Hedland", "Australia", False, -20.31, 118.57, 19.5, 330.0, 55.0, 85000, 52.0, 24, 14.0, 32000),
        ("PORT-OS-02", "Hay Point", "Australia", False, -21.28, 149.30, 17.5, 300.0, 50.0, 65000, 48.0, 16, 12.5, 28000),
        ("PORT-OS-03", "Newcastle", "Australia", False, -32.92, 151.78, 15.2, 275.0, 47.0, 55000, 66.0, 18, 22.0, 26000),
        ("PORT-OS-04", "Gladstone", "Australia", False, -23.84, 151.25, 16.0, 285.0, 48.0, 58000, 44.0, 14, 10.0, 25000),
        ("PORT-OS-05", "Richards Bay", "South Africa", False, -28.80, 32.03, 17.5, 300.0, 48.0, 52000, 59.0, 15, 19.0, 24000),
        ("PORT-OS-06", "Samarinda", "Indonesia", False, -0.50, 117.15, 13.0, 210.0, 33.0, 25000, 63.0, 10, 21.0, 14000),
        ("PORT-OS-07", "Tubarao", "Brazil", False, -20.28, -40.28, 20.0, 340.0, 56.0, 90000, 40.0, 20, 9.0, 35000)
    ]

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(ports)
    print(f"Generated {len(ports)} port records.")

def generate_voyages():
    filepath = os.path.join(DATA_DIR, "voyages.csv")
    headers = [
        "voyage_id", "vessel_id", "vessel_name", "cargo_type", "quantity_mt",
        "origin", "destination", "distance_nm", "duration_days", "waiting_time_hours",
        "freight_rate_usd_mt", "total_cost_inr", "status", "completion_date"
    ]

    rows = []
    base_date = datetime(2026, 8, 25)
    for i in range(1, 151):
        v_id = f"VES-{(i % 15) + 1:03d}"
        voy_id = f"VOY-2026-{(1000 + i)}"
        cargo = random.choice(["Iron Ore", "Coking Coal", "Thermal Coal", "Limestone"])
        origin = random.choice(["Port Hedland", "Hay Point", "Newcastle", "Samarinda", "Richards Bay", "Tubarao"])
        dest = random.choice(["Visakhapatnam", "Paradip", "Dhamra", "Haldia", "Krishnapatnam"])
        
        dist = 4500 if "Australia" in origin or origin in ["Port Hedland", "Hay Point", "Newcastle"] else (
            11500 if origin == "Tubarao" else (
                2200 if origin == "Samarinda" else 4800
            )
        )
        
        speed = random.uniform(13.0, 14.5)
        duration_days = round(dist / (speed * 24) + random.uniform(0.5, 2.0), 1)
        waiting_hrs = round(random.uniform(6.0, 36.0), 1)
        qty = random.choice([150000, 180000, 75000, 82000, 58000])
        rate_usd = round(random.uniform(15.0, 32.0), 2)
        total_cost_inr = round(qty * rate_usd * 83.0 + random.uniform(2000000, 5000000), 0)
        comp_date = (base_date - timedelta(days=i * 4)).strftime("%Y-%m-%d")

        rows.append([
            voy_id, v_id, f"MV Bulk Carrier {i}", cargo, qty, origin, dest,
            dist, duration_days, waiting_hrs, rate_usd, total_cost_inr, "Completed", comp_date
        ])

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    print(f"Generated {len(rows)} voyage records.")

def generate_weather():
    filepath = os.path.join(DATA_DIR, "weather.csv")
    headers = [
        "date", "port", "wind_speed_knots", "wave_height_m", "storm_probability_pct",
        "monsoon_severity_index", "weather_risk_score"
    ]

    ports = ["Visakhapatnam", "Paradip", "Haldia", "Dhamra", "Port Hedland", "Newcastle"]
    start_date = datetime(2025, 1, 1)
    end_date = datetime(2026, 9, 1)
    current_date = start_date

    rows = []
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        month = current_date.month
        is_monsoon = month in [6, 7, 8, 9]

        for p in ports:
            if p in ["Visakhapatnam", "Paradip", "Haldia", "Dhamra"] and is_monsoon:
                wind = round(random.uniform(18.0, 38.0), 1)
                wave = round(random.uniform(2.5, 4.8), 2)
                storm_prob = round(random.uniform(25.0, 65.0), 1)
                monsoon_idx = round(random.uniform(60.0, 95.0), 1)
            else:
                wind = round(random.uniform(8.0, 18.0), 1)
                wave = round(random.uniform(1.0, 2.2), 2)
                storm_prob = round(random.uniform(5.0, 20.0), 1)
                monsoon_idx = round(random.uniform(10.0, 30.0), 1)

            risk_score = round(wind * 0.3 + wave * 10.0 + storm_prob * 0.4, 1)
            risk_score = min(100.0, max(0.0, risk_score))

            rows.append([date_str, p, wind, wave, storm_prob, monsoon_idx, risk_score])

        current_date += timedelta(days=14)

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    print(f"Generated {len(rows)} weather records.")

def generate_bunker_prices():
    filepath = os.path.join(DATA_DIR, "bunker_prices.csv")
    headers = ["date", "port", "fuel_type", "bunker_price_usd_ton"]

    ports = ["Singapore", "Fujairah", "Visakhapatnam"]
    start_date = datetime(2024, 1, 1)
    end_date = datetime(2026, 9, 1)
    current_date = start_date

    vlsfo_base = 610.0
    mgo_base = 820.0

    rows = []
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        vlsfo_base = max(480.0, min(880.0, vlsfo_base + random.uniform(-6.0, 6.5)))
        mgo_base = max(650.0, min(1100.0, mgo_base + random.uniform(-8.0, 8.5)))

        for p in ports:
            port_diff = 15.0 if p == "Visakhapatnam" else (5.0 if p == "Fujairah" else 0.0)
            rows.append([date_str, p, "VLSFO (0.5% S)", round(vlsfo_base + port_diff, 1)])
            rows.append([date_str, p, "MGO (Low Sulphur)", round(mgo_base + port_diff * 1.2, 1)])

        current_date += timedelta(days=7)

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    print(f"Generated {len(rows)} bunker price records.")

def generate_commodity_and_economic():
    filepath_c = os.path.join(DATA_DIR, "commodity_prices.csv")
    filepath_e = os.path.join(DATA_DIR, "economic_indicators.csv")

    headers_c = ["date", "commodity", "price_usd_mt"]
    headers_e = ["date", "steel_production_index", "global_bulk_demand_index", "crude_oil_brent_usd"]

    start_date = datetime(2024, 1, 1)
    end_date = datetime(2026, 9, 1)
    current_date = start_date

    iron_price = 112.0
    coal_price = 195.0
    steel_idx = 105.0
    bulk_idx = 110.0
    brent_price = 78.0

    rows_c = []
    rows_e = []

    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        iron_price = max(80.0, min(160.0, iron_price + random.uniform(-1.5, 1.6)))
        coal_price = max(130.0, min(310.0, coal_price + random.uniform(-2.5, 2.7)))

        rows_c.append([date_str, "Iron Ore 62% Fe CFR China", round(iron_price, 2)])
        rows_c.append([date_str, "Coking Coal FOB Australia", round(coal_price, 2)])

        steel_idx = max(85.0, min(140.0, steel_idx + random.uniform(-0.8, 0.9)))
        bulk_idx = max(90.0, min(145.0, bulk_idx + random.uniform(-0.7, 0.8)))
        brent_price = max(60.0, min(110.0, brent_price + random.uniform(-1.2, 1.3)))

        rows_e.append([date_str, round(steel_idx, 1), round(bulk_idx, 1), round(brent_price, 2)])

        current_date += timedelta(days=7)

    with open(filepath_c, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers_c)
        writer.writerows(rows_c)
    print(f"Generated {len(rows_c)} commodity price records.")

    with open(filepath_e, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers_e)
        writer.writerows(rows_e)
    print(f"Generated {len(rows_e)} economic indicator records.")

if __name__ == "__main__":
    print("Generating SAIL-FORCAST Representative Prototype Datasets...")
    generate_freight_rates()
    generate_vessels()
    generate_ports()
    generate_voyages()
    generate_weather()
    generate_bunker_prices()
    generate_commodity_and_economic()
    print("All datasets successfully generated in /data!")
