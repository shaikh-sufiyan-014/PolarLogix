import pytest
from routing import compute_leg_geometry_and_duration, compute_optimal_route
from database import SessionLocal
import models

def test_searoute_curved_path_and_duration():
    """
    Verifies that for ship legs (e.g. Goa to Cape Town), searoute generates a realistic
    multi-waypoint sea path avoiding landmass, calculating realistic nautical distance and duration.
    """
    # Goa (15.3991, 73.8052) to Cape Town (-33.9249, 18.4241)
    res = compute_leg_geometry_and_duration(
        mode="ship",
        origin_lat=15.3991,
        origin_lng=73.8052,
        dest_lat=-33.9249,
        dest_lng=18.4241,
        average_speed_knots=15.0
    )

    assert not res["is_fallback"]
    assert len(res["waypoints"]) >= 15 # Real curved route has many marine waypoints
    assert res["distance_nm"] > 5500 # True nautical distance across Indian Ocean
    # At 15 knots, ~6400 nm / (15*24) = ~17.8 -> 18 days
    assert 16 <= res["duration_days"] <= 20
    # First waypoint near Goa, last waypoint near Cape Town
    assert abs(res["waypoints"][0][0] - 15.3991) < 1.0
    assert abs(res["waypoints"][-1][0] - (-33.9249)) < 1.0

def test_flight_modes_use_direct_straight_vector():
    """Confirms non-ship modes (aircraft, cargo_flight, helicopter) do NOT use searoute and remain direct."""
    res_air = compute_leg_geometry_and_duration(
        mode="aircraft",
        origin_lat=-33.9249,
        origin_lng=18.4241,
        dest_lat=-69.4068,
        dest_lng=76.1953,
        base_duration_days=3
    )

    assert len(res_air["waypoints"]) == 2 # Direct start & end points
    assert res_air["duration_days"] == 3
    assert not res_air["is_fallback"]

def test_searoute_failure_fallback_graceful():
    """
    Verifies that if searoute encounters an unroutable topology or exception,
    it catches the exception gracefully, returns a 2-point direct estimate, and sets a clear warning flag.
    """
    from unittest.mock import patch
    with patch("searoute.searoute", side_effect=Exception("Maritime graph routing topology failure")):
        res_fallback = compute_leg_geometry_and_duration(
            mode="ship",
            origin_lat=15.3991,
            origin_lng=73.8052,
            dest_lat=-33.9249,
            dest_lng=18.4241,
            average_speed_knots=15.0
        )

        # Must not crash!
        assert res_fallback["is_fallback"] is True
        assert len(res_fallback["waypoints"]) == 2
        assert any("Unable to compute detailed marine route — showing direct path estimate" in w for w in res_fallback["warnings"])
        assert res_fallback["duration_days"] >= 1

def test_dijkstra_uses_dynamic_duration_in_network():
    """Verifies that the NetworkX Dijkstra routing engine uses dynamic durations computed from searoute."""
    db = SessionLocal()
    legs = db.query(models.TransportLeg).all()
    locations = {l.id: l for l in db.query(models.Location).all()}

    # Compute route Goa -> Bharati (hazmat cargo must take Ship -> Ship)
    route = compute_optimal_route(
        legs=legs,
        origin_id="LOC-GOA",
        destination_id="LOC-BHA",
        weight_kg=5000.0,
        is_hazmat=True,
        target_month=1,
        locations_dict=locations
    )
    db.close()

    assert route["success"] is True
    assert len(route["legs"]) == 2 # GOA->CPT (Ship) + CPT->BHA (Ship)
    assert route["legs"][0]["mode"] == "ship"
    assert route["legs"][1]["mode"] == "ship"
    # Verify waypoints are returned in route result
    assert len(route["waypoints"]) > 20
    assert route["total_duration_days"] > 25

def test_cape_town_to_bharati_exact_endpoint_connection():
    """
    CRITICAL POLAR ENDPOINT CONNECTION TEST:
    Searoute's raw shipping-lane graph ends near Lat -50°S, Long 80°E.
    This test confirms that for Cape Town -> Bharati Station:
    1. The rendered polyline's first coordinate exactly matches Cape Town's coordinates: [-33.9249, 18.4241].
    2. The rendered polyline's LAST coordinate exactly matches Bharati Station's coordinates: [-69.4068, 76.1953].
    3. The total distance_nm correctly incorporates the last-mile Southern Ocean segment (~5,223 nm total vs ~4,049 nm raw).
    4. Duration is accurately computed from the complete connected distance (~16 days at 14 knots).
    """
    cpt_lat, cpt_lng = -33.9249, 18.4241
    bha_lat, bha_lng = -69.4068, 76.1953

    res = compute_leg_geometry_and_duration(
        mode="ship",
        origin_lat=cpt_lat,
        origin_lng=cpt_lng,
        dest_lat=bha_lat,
        dest_lng=bha_lng,
        average_speed_knots=14.0
    )

    waypoints = res["waypoints"]
    assert len(waypoints) >= 12

    # 1. First coordinate MUST exactly match Cape Town's coordinates
    first_pt = waypoints[0]
    assert first_pt == [cpt_lat, cpt_lng], f"Expected first waypoint to be {cpt_lat, cpt_lng}, got {first_pt}"

    # 2. Last coordinate MUST exactly match Bharati Station's coordinates (from locations.json)
    last_pt = waypoints[-1]
    assert last_pt == [bha_lat, bha_lng], f"Expected last waypoint to be {bha_lat, bha_lng}, got {last_pt}"

    # 3. Total distance must include the full path to Bharati Station (~5,223.4 nm)
    assert res["distance_nm"] > 5000.0, f"Expected distance > 5000 nm, got {res['distance_nm']}"

    # 4. Duration at 14 knots: 5223.4 / (14 * 24) = 15.55 -> 16 days
    assert res["duration_days"] == 16, f"Expected duration_days == 16, got {res['duration_days']}"

