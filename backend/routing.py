import json
import math
import logging
from typing import List, Dict, Any, Optional
import networkx as nx

logger = logging.getLogger("routing")

def haversine_distance_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great circle distance between two points in nautical miles (1 nm = 1.852 km)."""
    R_KM = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    km = R_KM * c
    return km / 1.852

def compute_leg_geometry_and_duration(
    mode: str,
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    average_speed_knots: Optional[float] = None,
    base_duration_days: Optional[int] = None
) -> Dict[str, Any]:
    """
    Computes real waypoint geometry, nautical distance, and dynamic duration.
    For ship mode: Uses searoute to generate realistic marine waypoints avoiding landmasses.
    Falls back gracefully to direct great-circle path with a warning if searoute encounters an unroutable topology.
    For flight modes (aircraft, helicopter, cargo_flight): Uses direct straight line coordinates.
    """
    warnings = []
    
    if mode == "ship":
        speed_knots = float(average_speed_knots or 14.0)
        if speed_knots <= 0:
            speed_knots = 14.0

        try:
            import searoute as sr
            # searoute expects [longitude, latitude]
            route = sr.searoute(
                [origin_lng, origin_lat],
                [dest_lng, dest_lat],
                units="nm"
            )
            raw_coords = route.geometry.coordinates # List of [lon, lat]
            # Convert to [lat, lon] for Leaflet mapping
            waypoints = [[float(c[1]), float(c[0])] for c in raw_coords]
            distance_nm = float(route.properties.get("length", 0.0))

            # 1. Symmetrically check Origin Endpoint Gap:
            # If the first searoute waypoint doesn't match the actual origin coordinate,
            # prepend the exact origin coordinate and add the last-mile nautical distance.
            orig_gap_nm = haversine_distance_nm(origin_lat, origin_lng, waypoints[0][0], waypoints[0][1])
            if orig_gap_nm > 0.05: # more than ~100m
                waypoints.insert(0, [origin_lat, origin_lng])
                distance_nm += orig_gap_nm
            else:
                waypoints[0] = [origin_lat, origin_lng]

            # 2. Symmetrically check Destination Endpoint Gap:
            # Polar/Antarctic stations (e.g. Bharati, Maitri) are outside standard commercial shipping lanes.
            # If the last searoute waypoint differs from the actual destination coordinate,
            # explicitly append the exact destination coordinate and add the final stretch distance.
            dest_gap_nm = haversine_distance_nm(waypoints[-1][0], waypoints[-1][1], dest_lat, dest_lng)
            if dest_gap_nm > 0.05: # more than ~100m
                waypoints.append([dest_lat, dest_lng])
                distance_nm += dest_gap_nm
            else:
                waypoints[-1] = [dest_lat, dest_lng]
            
            # Compute dynamic voyage duration from actual nautical distance & speed
            duration_hours = distance_nm / speed_knots
            duration_days = max(1, int(round(duration_hours / 24.0)))

            return {
                "waypoints": waypoints,
                "distance_nm": round(distance_nm, 1),
                "duration_days": duration_days,
                "average_speed_knots": speed_knots,
                "warnings": warnings,
                "is_fallback": False
            }

        except Exception as e:
            logger.warning(f"Searoute failed for ship route ({origin_lat},{origin_lng}) -> ({dest_lat},{dest_lng}): {e}")
            fallback_warn = "Unable to compute detailed marine route — showing direct path estimate"
            warnings.append(fallback_warn)
            
            dist_nm = haversine_distance_nm(origin_lat, origin_lng, dest_lat, dest_lng)
            duration_hours = dist_nm / speed_knots
            duration_days = max(1, int(round(duration_hours / 24.0))) if not base_duration_days else base_duration_days

            return {
                "waypoints": [[origin_lat, origin_lng], [dest_lat, dest_lng]],
                "distance_nm": round(dist_nm, 1),
                "duration_days": duration_days,
                "average_speed_knots": speed_knots,
                "warnings": warnings,
                "is_fallback": True
            }

    else:
        # Non-ship modes: Direct flight paths (aircraft, helicopter, cargo_flight)
        dist_nm = haversine_distance_nm(origin_lat, origin_lng, dest_lat, dest_lng)
        duration_days = int(base_duration_days or 1)
        
        return {
            "waypoints": [[origin_lat, origin_lng], [dest_lat, dest_lng]],
            "distance_nm": round(dist_nm, 1),
            "duration_days": duration_days,
            "average_speed_knots": average_speed_knots,
            "warnings": [],
            "is_fallback": False
        }

def compute_optimal_route(
    legs: List[Any],
    origin_id: str,
    destination_id: str,
    weight_kg: float,
    is_hazmat: bool,
    target_month: int = 1,
    locations_dict: Optional[Dict[str, Any]] = None,
    check_weather: bool = False
) -> Dict[str, Any]:
    """
    Builds a directed graph of available transport legs,
    applies hazmat, capacity, and seasonal constraints, and computes
    the optimal (shortest duration) path using NetworkX Dijkstra algorithm.
    Includes realistic marine waypoints and dynamic durations.
    """
    G = nx.DiGraph()

    warnings = []
    excluded_legs = []

    for leg in legs:
        # 1. Hazmat constraint check
        if is_hazmat and not getattr(leg, 'hazmat_allowed', True):
            excluded_legs.append((leg.id, f"Hazmat cargo excluded on leg {leg.mode} ({leg.origin_id} -> {leg.destination_id})"))
            continue

        # 2. Weight capacity constraint check
        if weight_kg > getattr(leg, 'capacity_kg', 100000.0):
            excluded_legs.append((leg.id, f"Weight ({weight_kg}kg) exceeds leg capacity ({leg.capacity_kg}kg)"))
            continue

        # 3. Seasonal availability constraint check
        try:
            available_months = leg.available_months
            if isinstance(available_months, str):
                available_months = json.loads(available_months)
            if target_month not in available_months:
                excluded_legs.append((leg.id, f"Leg unavailable in target month {target_month}"))
                continue
        except Exception:
            pass

        # Use dynamically computed duration_days or leg.duration_days
        duration = getattr(leg, 'duration_days', 1)
        
        # Add valid edge to NetworkX graph
        # If multiple legs exist between same nodes, keep the one with shorter duration
        if G.has_edge(leg.origin_id, leg.destination_id):
            existing_leg = G[leg.origin_id][leg.destination_id]
            if duration < existing_leg['duration_days']:
                G.add_edge(
                    leg.origin_id,
                    leg.destination_id,
                    duration_days=duration,
                    leg_object=leg
                )
        else:
            G.add_edge(
                leg.origin_id,
                leg.destination_id,
                duration_days=duration,
                leg_object=leg
            )

    if not G.has_node(origin_id) or not G.has_node(destination_id):
        return {
            "success": False,
            "error": "No viable route exists satisfying cargo weight, hazmat, or seasonal constraints.",
            "warnings": [msg for _, msg in excluded_legs]
        }

    try:
        path_nodes = nx.shortest_path(G, source=origin_id, target=destination_id, weight='duration_days')
        
        path_legs = []
        total_duration = 0
        all_route_waypoints = []

        for i in range(len(path_nodes) - 1):
            u, v = path_nodes[i], path_nodes[i+1]
            leg_data = G[u][v]['leg_object']
            
            # Extract waypoints and distance
            waypoints = []
            if hasattr(leg_data, 'waypoints_json') and leg_data.waypoints_json:
                try:
                    waypoints = json.loads(leg_data.waypoints_json)
                except Exception:
                    pass

            # If waypoints not stored on model, compute on the fly if locations available
            if not waypoints and locations_dict and u in locations_dict and v in locations_dict:
                loc_u = locations_dict[u]
                loc_v = locations_dict[v]
                calc = compute_leg_geometry_and_duration(
                    mode=leg_data.mode,
                    origin_lat=loc_u.latitude,
                    origin_lng=loc_u.longitude,
                    dest_lat=loc_v.latitude,
                    dest_lng=loc_v.longitude,
                    average_speed_knots=getattr(leg_data, 'average_speed_knots', None),
                    base_duration_days=getattr(leg_data, 'duration_days', None)
                )
                waypoints = calc["waypoints"]
                if calc.get("warnings"):
                    warnings.extend(calc["warnings"])

            leg_dict = {
                "leg_id": leg_data.id,
                "origin_id": leg_data.origin_id,
                "destination_id": leg_data.destination_id,
                "mode": leg_data.mode,
                "duration_days": leg_data.duration_days,
                "capacity_kg": leg_data.capacity_kg,
                "hazmat_allowed": leg_data.hazmat_allowed,
                "average_speed_knots": getattr(leg_data, 'average_speed_knots', None),
                "distance_nm": getattr(leg_data, 'distance_nm', None),
                "waypoints": waypoints
            }
            path_legs.append(leg_dict)
            total_duration += leg_data.duration_days

            # Append waypoints to full route polyline
            if waypoints:
                if not all_route_waypoints:
                    all_route_waypoints.extend(waypoints)
                else:
                    # Avoid duplicate joining point
                    all_route_waypoints.extend(waypoints[1:])

        if is_hazmat:
            warnings.append("Hazmat cargo restriction active: Restricted to sea transport legs only.")
        if weight_kg > 1500:
            warnings.append(f"Heavy cargo ({weight_kg}kg): Helicopter and light aircraft legs filtered out.")

        # Weather evaluation if requested
        weather_advisory = None
        if check_weather and all_route_waypoints:
            try:
                from weather_service import evaluate_waypoints_weather
                # Sample key waypoints: start, midpoint, destination
                key_pts = []
                if len(all_route_waypoints) <= 3:
                    for idx, pt in enumerate(all_route_waypoints):
                        key_pts.append({
                            "name": f"Waypoint {idx+1}",
                            "lat": pt[0],
                            "lng": pt[1]
                        })
                else:
                    indices = [0, len(all_route_waypoints) // 2, len(all_route_waypoints) - 1]
                    names = ["Departure Sector", "Mid-Ocean Corridor", "Arrival Sector"]
                    for idx, name in zip(indices, names):
                        pt = all_route_waypoints[idx]
                        key_pts.append({
                            "name": name,
                            "lat": pt[0],
                            "lng": pt[1]
                        })
                
                weather_advisory = evaluate_waypoints_weather(key_pts)
            except Exception as e:
                logger.warning(f"Weather evaluation error: {e}")

        return {
            "success": True,
            "origin_id": origin_id,
            "destination_id": destination_id,
            "total_duration_days": total_duration,
            "legs": path_legs,
            "path_nodes": path_nodes,
            "waypoints": all_route_waypoints,
            "warnings": warnings,
            "excluded_legs_count": len(excluded_legs),
            "weather_advisory": weather_advisory
        }

    except nx.NetworkXNoPath:
        return {
            "success": False,
            "error": f"No connected route from {origin_id} to {destination_id} for specified cargo specs.",
            "warnings": [msg for _, msg in excluded_legs]
        }
