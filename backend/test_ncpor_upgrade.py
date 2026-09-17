import pytest
from fastapi.testclient import TestClient
from main import app
from seed import seed_database
import models
from database import SessionLocal

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    seed_database()

def get_admin_token():
    res = client.post("/api/auth/login", json={"username": "admin.ncpor", "password": "Demo@Admin2026"})
    assert res.status_code == 200
    return res.json()["access_token"]

# ================= 1. FOUR REAL STATIONS & LOCATIONS API =================
def test_all_four_real_stations_returned():
    """Verify locations API returns all 4 real stations and staging points with full metadata."""
    token = get_admin_token()
    res = client.get("/api/locations", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    locs = {l["id"]: l for l in res.json()}

    # Check that 4 stations + 2 depots/hubs exist
    assert len(locs) == 6
    assert "LOC-HIM" in locs
    assert "LOC-HMS" in locs
    assert "LOC-MAI" in locs
    assert "LOC-BHA" in locs
    assert "LOC-GOA" in locs
    assert "LOC-CPT" in locs

    # Verify Himadri (Arctic)
    him = locs["LOC-HIM"]
    assert him["name"] == "Himadri Arctic Station"
    assert him["region"] == "arctic"
    assert him["programme"] == "arctic_programme"
    assert him["is_international_research_base"] is True
    assert "microbiology" in him["research_areas"].lower()
    assert him["established_year"] == 2008

    # Verify Himansh (Himalayas)
    hms = locs["LOC-HMS"]
    assert hms["name"] == "Himansh Himalayan Station"
    assert hms["region"] == "himalayan"
    assert hms["programme"] == "himalayan_programme"
    assert hms["is_international_research_base"] is False
    assert "glacier" in hms["research_areas"].lower()

    # Verify Maitri (Antarctic Inland)
    mai = locs["LOC-MAI"]
    assert mai["region"] == "antarctic"
    assert mai["programme"] == "antarctic_programme"
    assert mai["distance_from_ship_access_km"] == 80.0
    assert mai["requires_overland_transfer"] is True
    assert mai["capacity_winter"] == 25
    assert mai["capacity_summer"] == 50
    assert "configuration" in mai["capacity_note"].lower()

    # Verify Bharati (Antarctic Coastal)
    bha = locs["LOC-BHA"]
    assert bha["region"] == "antarctic"
    assert bha["programme"] == "antarctic_programme"
    assert bha["distance_from_ship_access_km"] == 0.2
    assert bha["requires_overland_transfer"] is False
    assert bha["capacity_winter"] == 24
    assert bha["capacity_summer"] == 47
    assert bha["latitude"] == -69.4068
    assert bha["longitude"] == 76.1953

def test_locations_api_programme_filter():
    """Verify locations endpoint filters by programme correctly."""
    token = get_admin_token()
    
    # Arctic Programme only
    res_arc = client.get("/api/locations?programme=arctic_programme", headers={"Authorization": f"Bearer {token}"})
    assert res_arc.status_code == 200
    arc_ids = [l["id"] for l in res_arc.json()]
    assert arc_ids == ["LOC-HIM"]

    # Himalayan Programme only
    res_hms = client.get("/api/locations?programme=himalayan_programme", headers={"Authorization": f"Bearer {token}"})
    assert res_hms.status_code == 200
    hms_ids = [l["id"] for l in res_hms.json()]
    assert hms_ids == ["LOC-HMS"]

    # Antarctic Programme
    res_ant = client.get("/api/locations?programme=antarctic_programme", headers={"Authorization": f"Bearer {token}"})
    assert res_ant.status_code == 200
    ant_ids = [l["id"] for l in res_ant.json()]
    assert "LOC-MAI" in ant_ids
    assert "LOC-BHA" in ant_ids
    assert "LOC-HIM" not in ant_ids

# ================= 2. MULTI-INSTITUTION PERSONNEL MODEL =================
def test_multi_institution_personnel_model():
    """Verify personnel records contain affiliated_institution and personnel_category."""
    token = get_admin_token()
    res = client.get("/api/personnel", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    roster = res.json()
    assert len(roster) >= 7

    institutions = {p["affiliated_institution"] for p in roster}
    categories = {p["personnel_category"] for p in roster}

    # Verify diversity across partner institutes
    assert "NCPOR" in institutions
    assert "CSIR-NIO" in institutions
    assert "IIT Bombay" in institutions
    assert "AIIMS New Delhi" in institutions
    assert "GSI" in institutions

    # Verify diversity across employment categories
    assert "permanent_staff" in categories
    assert "visiting_researcher" in categories
    assert "contract_specialist" in categories
    assert "project_scientist" in categories

def test_personnel_creation_with_institution_and_category():
    """Verify creating a new personnel record saves institution and category."""
    token = get_admin_token()
    new_per = {
        "name": "Dr. Devendra Sahu",
        "role": "Permafrost Specialist",
        "affiliated_institution": "Wadia Institute of Himalayan Geology",
        "personnel_category": "visiting_researcher",
        "assigned_station": "Himansh Himalayan Station",
        "season_type": "summer",
        "deployment_start": "2026-06-01",
        "deployment_end": "2026-09-30",
        "current_status": "deployed"
    }
    res = client.post("/api/personnel", json=new_per, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Dr. Devendra Sahu"
    assert data["affiliated_institution"] == "Wadia Institute of Himalayan Geology"
    assert data["personnel_category"] == "visiting_researcher"

# ================= 3. PROGRAMME-LEVEL DASHBOARD SUMMARY =================
def test_dashboard_summary_programme_filtering():
    """Verify dashboard summary provides accurate stats per programme."""
    token = get_admin_token()

    # All programmes
    res_all = client.get("/api/dashboard/summary?programme=all", headers={"Authorization": f"Bearer {token}"})
    assert res_all.status_code == 200
    data_all = res_all.json()
    assert data_all["programme"] == "all"
    assert len(data_all["location_summary"]) == 6

    # Arctic programme
    res_arc = client.get("/api/dashboard/summary?programme=arctic_programme", headers={"Authorization": f"Bearer {token}"})
    assert res_arc.status_code == 200
    data_arc = res_arc.json()
    assert data_arc["programme"] == "arctic_programme"
    assert len(data_arc["location_summary"]) == 1
    assert "LOC-HIM" in data_arc["location_summary"]

    # Antarctic programme
    res_ant = client.get("/api/dashboard/summary?programme=antarctic_programme", headers={"Authorization": f"Bearer {token}"})
    assert res_ant.status_code == 200
    data_ant = res_ant.json()
    assert data_ant["programme"] == "antarctic_programme"
    assert "LOC-BHA" in data_ant["location_summary"]
    assert "LOC-MAI" in data_ant["location_summary"]
    assert "LOC-HIM" not in data_ant["location_summary"]

# ================= 4. ROUTE PLANNING INTEGRITY FOR MAITRI & BHARATI =================
def test_antarctic_route_planning_integrity():
    """Verify Antarctic route preview continues to compute optimal multi-modal routes for Maitri/Bharati."""
    token = get_admin_token()

    # Plan route from Goa to Bharati
    payload_bha = {
        "description": "CTD Oceanographic Sensor Rig",
        "category": "scientific_equipment",
        "weight_kg": 600.0,
        "is_hazmat": False,
        "origin_id": "LOC-GOA",
        "destination_id": "LOC-BHA",
        "box_label": "1 of 1",
        "target_month": 1
    }
    res_bha = client.post("/api/routing/preview", json=payload_bha, headers={"Authorization": f"Bearer {token}"})
    assert res_bha.status_code == 200
    bha_route = res_bha.json()
    assert bha_route["success"] is True
    assert bha_route["total_duration_days"] > 0
    assert len(bha_route["legs"]) >= 1

    # Plan route from Goa to Maitri with hazmat
    payload_mai = {
        "description": "Arctic Fuel Drums",
        "category": "hazmat",
        "weight_kg": 10000.0,
        "is_hazmat": True,
        "origin_id": "LOC-GOA",
        "destination_id": "LOC-MAI",
        "box_label": "Pallet 1 of 5",
        "target_month": 1
    }
    res_mai = client.post("/api/routing/preview", json=payload_mai, headers={"Authorization": f"Bearer {token}"})
    assert res_mai.status_code == 200
    mai_route = res_mai.json()
    assert mai_route["success"] is True
    assert all(leg["mode"] == "ship" for leg in mai_route["legs"])
