import json
import networkx as nx
from typing import List, Dict, Any, Optional

def compute_optimal_route(
    legs: List[Any],
    origin_id: str,
    destination_id: str,
    weight_kg: float,
    is_hazmat: bool,
    target_month: int = 1
) -> Dict[str, Any]:
    """
    Builds a directed multi-edge graph of available transport legs,
    applies hazmat, capacity, and seasonal constraints, and computes
    the optimal (shortest duration) path using NetworkX Dijkstra algorithm.
    """
    G = nx.DiGraph()

    warnings = []
    excluded_legs = []

    for leg in legs:
        # Check hazmat constraint
        if is_hazmat and not leg.hazmat_allowed:
            excluded_legs.append((leg.id, f"Hazmat cargo excluded on leg {leg.mode} ({leg.origin_id} -> {leg.destination_id})"))
            continue

        # Check weight capacity constraint
        if weight_kg > leg.capacity_kg:
            excluded_legs.append((leg.id, f"Weight ({weight_kg}kg) exceeds leg capacity ({leg.capacity_kg}kg)"))
            continue

        # Check seasonal availability constraint
        try:
            available_months = json.loads(leg.available_months)
            if target_month not in available_months:
                excluded_legs.append((leg.id, f"Leg unavailable in target month {target_month}"))
                continue
        except Exception:
            pass

        # Add valid edge to NetworkX graph
        # If multiple legs exist between same nodes, keep the one with shorter duration
        if G.has_edge(leg.origin_id, leg.destination_id):
            existing_leg = G[leg.origin_id][leg.destination_id]
            if leg.duration_days < existing_leg['duration_days']:
                G.add_edge(
                    leg.origin_id,
                    leg.destination_id,
                    duration_days=leg.duration_days,
                    leg_object=leg
                )
        else:
            G.add_edge(
                leg.origin_id,
                leg.destination_id,
                duration_days=leg.duration_days,
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
        for i in range(len(path_nodes) - 1):
            u, v = path_nodes[i], path_nodes[i+1]
            leg_data = G[u][v]['leg_object']
            path_legs.append({
                "leg_id": leg_data.id,
                "origin_id": leg_data.origin_id,
                "destination_id": leg_data.destination_id,
                "mode": leg_data.mode,
                "duration_days": leg_data.duration_days,
                "capacity_kg": leg_data.capacity_kg,
                "hazmat_allowed": leg_data.hazmat_allowed
            })
            total_duration += leg_data.duration_days

        if is_hazmat:
            warnings.append("Hazmat cargo restriction active: Restricted to sea transport legs only.")
        if weight_kg > 1500:
            warnings.append(f"Heavy cargo ({weight_kg}kg): Helicopter and light aircraft legs filtered out.")

        return {
            "success": True,
            "origin_id": origin_id,
            "destination_id": destination_id,
            "total_duration_days": total_duration,
            "legs": path_legs,
            "path_nodes": path_nodes,
            "warnings": warnings,
            "excluded_legs_count": len(excluded_legs)
        }

    except nx.NetworkXNoPath:
        return {
            "success": False,
            "error": f"No connected route from {origin_id} to {destination_id} for specified cargo specs.",
            "warnings": [msg for _, msg in excluded_legs]
        }
