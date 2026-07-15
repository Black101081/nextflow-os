"""
Logistics & Delivery – Route Optimization AI Agent
==================================================
TSP Nearest Neighbor solver using geocoding and Haversine distance matrix.
"""

import math
from typing import List, Dict, Any, Tuple

# Pre-defined coordinates for common delivery hubs/districts in Ho Chi Minh City
HCMC_GEO_DB = {
    "kho": (10.7769, 106.7009),      # Quận 1 (Depot/Warehouse)
    "quận 1": (10.7769, 106.7009),
    "quận 3": (10.7798, 106.6853),
    "quận 5": (10.7570, 106.6631),
    "quận 10": (10.7749, 106.6669),
    "tân bình": (10.8015, 106.6525),
    "phú nhuận": (10.7992, 106.6803),
    "bình thạnh": (10.8038, 106.6974),
    "quận 2": (10.7875, 106.7485),
    "quận 7": (10.7323, 106.7265),
    "quận 9": (10.8428, 106.8286),
    "thủ đức": (10.8494, 106.7537),
    "gò vấp": (10.8388, 106.6662)
}

def haversine_distance(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """Tính khoảng cách đường chim bay giữa 2 điểm Lat/Lon (km)."""
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    R = 6371.0 # Earth radius in km
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def geocode_address(address: str) -> Tuple[float, float]:
    """Tìm tọa độ gần đúng cho địa chỉ (fallback mặc định về trung tâm nếu không khớp)."""
    addr_lower = address.lower()
    for key, coords in HCMC_GEO_DB.items():
        if key in addr_lower:
            return coords
    # Default to Depot Quận 1 + slight random noise to differentiate duplicate addresses
    import random
    base_lat, base_lon = HCMC_GEO_DB["kho"]
    return base_lat + random.uniform(-0.02, 0.02), base_lon + random.uniform(-0.02, 0.02)

class LogisticsRouteOptimizerAgent:
    def __init__(self, gemini_client = None):
        self.client = gemini_client

    def optimize(self, stops: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Giải bài toán TSP sử dụng thuật toán Nearest Neighbor xuất phát từ kho (Depot).
        Input: list of stops: [{"id": "1", "address": "Quận 3"}, {"id": "2", "address": "Gò Vấp"}]
        Output: danh sách đã sắp xếp, tổng quãng đường (km), thời gian di chuyển dự kiến.
        """
        if not stops:
            return {"optimized_stops": [], "total_distance_km": 0.0, "estimated_duration_mins": 0}

        # 1. Geocode all stops
        geocoded_stops = []
        for stop in stops:
            addr = stop.get("address", "")
            lat, lon = geocode_address(addr)
            geocoded_stops.append({
                "id": stop.get("id"),
                "address": addr,
                "lat": lat,
                "lon": lon,
                "original_data": stop
            })

        # Depot is starting point
        depot_coords = HCMC_GEO_DB["kho"]
        
        current_coords = depot_coords
        unvisited = list(geocoded_stops)
        optimized_route = []
        total_distance = 0.0

        # 2. Nearest Neighbor TSP
        while unvisited:
            nearest_idx = 0
            min_dist = float('inf')
            
            for idx, stop in enumerate(unvisited):
                dist = haversine_distance(current_coords, (stop["lat"], stop["lon"]))
                if dist < min_dist:
                    min_dist = dist
                    nearest_idx = idx
            
            nearest_stop = unvisited.pop(nearest_idx)
            total_distance += min_dist
            current_coords = (nearest_stop["lat"], nearest_stop["lon"])
            optimized_route.append(nearest_stop)

        # Return to depot distance
        return_dist = haversine_distance(current_coords, depot_coords)
        total_distance += return_dist

        # 3. Calculate estimated duration (assuming average speed 30km/h in HCMC + 10 mins processing time per stop)
        avg_speed_kmh = 25.0
        travel_time_hours = total_distance / avg_speed_kmh
        processing_time_mins = len(stops) * 10
        total_time_mins = int(travel_time_hours * 60 + processing_time_mins)

        # Build clean output stops
        output_stops = []
        for rank, stop in enumerate(optimized_route, 1):
            s = dict(stop["original_data"])
            s["route_sequence"] = rank
            s["coords"] = {"lat": stop["lat"], "lon": stop["lon"]}
            output_stops.append(s)

        return {
            "optimized_stops": output_stops,
            "total_distance_km": round(total_distance, 2),
            "estimated_duration_mins": total_time_mins,
            "depot_coords": {"lat": depot_coords[0], "lon": depot_coords[1]}
        }
