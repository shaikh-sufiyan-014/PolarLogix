import pytest
from fastapi.testclient import TestClient
from main import app
from seed import seed_database
import models
from database import SessionLocal

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    seed_database()

def get_admin_token():
    res = client.post("/api/auth/login", json={"username": "admin.ncpor", "password": "Demo@Admin2026"})
    assert res.status_code == 200
    return res.json()["access_token"]

def test_health_check_endpoint():
    """Validates GET /api/health for active connectivity heartbeat."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "system" in data
    assert "timestamp" in data

def test_critical_emergency_sync_endpoint():
    """Validates that offline critical emergency payload can be synced cleanly to server."""
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "event_type": "Severe Blizzard Roof Breach",
        "description": "Secondary habitat dome integrity alarm triggered during 70kt gale.",
        "severity": "critical",
        "station_id": "LOC-BHA"
    }
    response = client.post("/api/emergencies", json=payload, headers=headers)
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["event_type"] == payload["event_type"]
    assert data["severity"] == "critical"
    assert data["status"] in ["open", "active"]
    assert "id" in data

def test_inventory_and_telemetry_sync():
    """Validates normal priority status updates and inventory syncing."""
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    # 1. Inventory Sync
    inv_payload = {
        "location_id": "LOC-BHA",
        "item_name": "Polar Winter Parkas (Heavy Duty)",
        "category": "protective_gear",
        "quantity": 50.0,
        "unit": "suits",
        "minimum_threshold": 15.0
    }
    inv_res = client.post("/api/inventory/LOC-BHA", json=inv_payload, headers=headers)
    assert inv_res.status_code in [200, 201]
    assert inv_res.json()["item_name"] == inv_payload["item_name"]
