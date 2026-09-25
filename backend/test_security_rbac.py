# pyrefly: ignore [missing-import]
import pytest
from fastapi.testclient import TestClient
from main import app
from seed import seed_database
import auth

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    # Reset failed attempts dictionary
    auth._failed_attempts.clear()
    seed_database()

def get_token(username: str, password: str):
    response = client.post("/api/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200, f"Login failed for {username}: {response.text}"
    return response.json()["access_token"]

# ================= 1. AUTHENTICATION & LOGIN TESTS =================
def test_all_four_demo_logins():
    """Verify all 4 demo role accounts can login successfully."""
    # 1. Super Admin
    admin_token = get_token("admin.ncpor", "Demo@Admin2026")
    assert admin_token is not None

    # 2. Station Commander Bharati
    commander_token = get_token("commander.bharati", "Demo@Bharati2026")
    assert commander_token is not None

    # 3. Shipment Officer
    officer_token = get_token("officer.shipping1", "Demo@Officer2026")
    assert officer_token is not None

    # 4. Personnel
    personnel_token = get_token("PER-001", "Demo@Personnel2026")
    assert personnel_token is not None

def test_invalid_login_generic_message():
    """Verify failed login returns a generic 401 message without leaking existence."""
    response = client.post("/api/auth/login", json={"username": "admin.ncpor", "password": "WrongPassword!"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"

    response2 = client.post("/api/auth/login", json={"username": "non_existent_user", "password": "WrongPassword!"})
    assert response2.status_code == 401
    assert response2.json()["detail"] == "Invalid username or password"

def test_rate_limiting_after_5_failed_attempts():
    """Verify rate limiter blocks login on 5 consecutive failed attempts with 429."""
    test_user = "rate_limit_test_user"
    for _ in range(5):
        client.post("/api/auth/login", json={"username": test_user, "password": "BadPassword"})
    
    # 6th attempt should trigger 429 Too Many Requests
    res = client.post("/api/auth/login", json={"username": test_user, "password": "BadPassword"})
    assert res.status_code == 429
    assert "temporarily locked" in res.json()["detail"]

# ================= 2. AUTHORIZATION & 403 OWNERSHIP TESTS =================
def test_shipment_officer_cannot_access_unassigned_shipment():
    """Verify Shipment Officer 1 CANNOT access a shipment assigned to Officer 2 (expect 403)."""
    officer1_token = get_token("officer.shipping1", "Demo@Officer2026")
    headers = {"Authorization": f"Bearer {officer1_token}"}

    # SHP-2026-003 is assigned to USR-OFF-02
    response = client.get("/api/shipments/SHP-2026-003", headers=headers)
    assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}: {response.text}"
    assert "not assigned" in response.json()["detail"].lower() or "forbidden" in response.json()["detail"].lower()

def test_shipment_officer_can_access_assigned_shipment():
    """Verify Shipment Officer 1 CAN access their own assigned shipment (expect 200)."""
    officer1_token = get_token("officer.shipping1", "Demo@Officer2026")
    headers = {"Authorization": f"Bearer {officer1_token}"}

    # SHP-2026-001 is assigned to officer.shipping1
    response = client.get("/api/shipments/SHP-2026-001", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == "SHP-2026-001"

def test_personnel_cannot_access_other_personnel_record():
    """Verify Personnel PER-001 CANNOT access PER-002's record (expect 403)."""
    personnel_token = get_token("PER-001", "Demo@Personnel2026")
    headers = {"Authorization": f"Bearer {personnel_token}"}

    response = client.get("/api/personnel/PER-002", headers=headers)
    assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}: {response.text}"
    assert "cannot access" in response.json()["detail"].lower() or "forbidden" in response.json()["detail"].lower()

def test_personnel_can_access_own_record():
    """Verify Personnel PER-001 CAN access their own record (expect 200)."""
    personnel_token = get_token("PER-001", "Demo@Personnel2026")
    headers = {"Authorization": f"Bearer {personnel_token}"}

    response = client.get("/api/personnel/PER-001", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == "PER-001"

def test_station_commander_cannot_access_other_station_inventory():
    """Verify Station Commander Bharati CANNOT query Maitri inventory (expect 403)."""
    commander_token = get_token("commander.bharati", "Demo@Bharati2026")
    headers = {"Authorization": f"Bearer {commander_token}"}

    # Attempting to fetch Maitri (LOC-MAI) inventory
    response = client.get("/api/inventory?location_id=LOC-MAI", headers=headers)
    assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}: {response.text}"

def test_station_commander_cannot_access_other_station_personnel():
    """Verify Station Commander Bharati CANNOT query Maitri station personnel roster (expect 403)."""
    commander_token = get_token("commander.bharati", "Demo@Bharati2026")
    headers = {"Authorization": f"Bearer {commander_token}"}

    response = client.get("/api/personnel?station=Maitri", headers=headers)
    assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}: {response.text}"

def test_super_admin_bypasses_all_restrictions():
    """Verify Super Admin has full unrestricted access across all shipments, personnel, and inventory."""
    admin_token = get_token("admin.ncpor", "Demo@Admin2026")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Can access any shipment
    res_shp = client.get("/api/shipments/SHP-2026-003", headers=headers)
    assert res_shp.status_code == 200

    # Can access any personnel
    res_per = client.get("/api/personnel/PER-002", headers=headers)
    assert res_per.status_code == 200

    # Can access any station inventory
    res_inv = client.get("/api/inventory?location_id=LOC-MAI", headers=headers)
    assert res_inv.status_code == 200

# ================= 3. CONNECTED EMERGENCY SYSTEM TESTS =================
def test_connected_emergency_flow():
    """Verify an emergency reported by Personnel at Bharati appears in Admin and Bharati Commander views, but not Officer."""
    personnel_token = get_token("PER-001", "Demo@Personnel2026")
    p_headers = {"Authorization": f"Bearer {personnel_token}"}

    # Personnel reports emergency
    report_res = client.post(
        "/api/emergencies",
        json={
            "station_id": "LOC-BHA",
            "event_type": "Generator Radiator Leak",
            "severity": "high",
            "description": "Minor coolant leak observed in backup genset room at Bharati."
        },
        headers=p_headers
    )
    assert report_res.status_code == 201
    new_emg_id = report_res.json()["id"]

    # Super Admin sees it
    admin_token = get_token("admin.ncpor", "Demo@Admin2026")
    admin_res = client.get("/api/emergencies", headers={"Authorization": f"Bearer {admin_token}"})
    assert any(e["id"] == new_emg_id for e in admin_res.json())

    # Station Commander Bharati sees it
    cmd_bha_token = get_token("commander.bharati", "Demo@Bharati2026")
    cmd_res = client.get("/api/emergencies", headers={"Authorization": f"Bearer {cmd_bha_token}"})
    assert any(e["id"] == new_emg_id for e in cmd_res.json())

    # Shipment Officer does NOT see it (it's unrelated to any of their shipments)
    officer_token = get_token("officer.shipping1", "Demo@Officer2026")
    off_res = client.get("/api/emergencies", headers={"Authorization": f"Bearer {officer_token}"})
    assert not any(e["id"] == new_emg_id for e in off_res.json())

# ================= 4. SHIPMENT OFFICER OPERATIONS TESTS =================
def test_shipment_officer_operations():
    """Verify handover confirmation, consumable updates, and weather logging for Shipment Officer."""
    officer_token = get_token("officer.shipping1", "Demo@Officer2026")
    headers = {"Authorization": f"Bearer {officer_token}"}

    # 1. Handover confirmation
    hnd_res = client.post(
        "/api/shipments/SHP-2026-001/handover",
        json={
            "location_id": "LOC-CPT",
            "confirmation_type": "handed_off",
            "notes": "Passed cargo custody to BAS polar transport aircraft."
        },
        headers=headers
    )
    assert hnd_res.status_code == 201

    # 2. Consumables fetch
    con_res = client.get("/api/shipments/SHP-2026-001/consumables", headers=headers)
    assert con_res.status_code == 200
    assert len(con_res.json()) > 0

    # 3. Weather log
    wth_res = client.post(
        "/api/shipments/SHP-2026-001/weather-logs",
        json={
            "condition": "Sub-zero Sea Fog",
            "note": "Visibility reduced to 200m near Antarctic Convergence.",
            "temperature_c": -6.0,
            "wind_speed_knots": 22.0
        },
        headers=headers
    )
    assert wth_res.status_code == 201

    # 4. Recalculate alternate route
    alt_res = client.post(
        "/api/shipments/SHP-2026-001/recalculate-alternate-route",
        json={
            "issue_description": "Airbridge runway icing at destination",
            "avoid_mode": "aircraft"
        },
        headers=headers
    )
    assert alt_res.status_code == 200

def test_inventory_rbac_edit_and_delete():
    """Verify inventory item edit and delete RBAC and IDOR restrictions."""
    admin_token = get_token("admin.ncpor", "Demo@Admin2026")
    bha_commander_token = get_token("commander.bharati", "Demo@Bharati2026")
    personnel_token = get_token("PER-001", "Demo@Personnel2026")

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    bha_headers = {"Authorization": f"Bearer {bha_commander_token}"}
    per_headers = {"Authorization": f"Bearer {personnel_token}"}

    # 1. Super admin creates an item at Maitri (LOC-MAI)
    create_res = client.post(
        "/api/inventory/LOC-MAI",
        json={
            "location_id": "LOC-MAI",
            "item_name": "Test RBAC Generator Part",
            "category": "spare_parts",
            "quantity": 100.0,
            "unit": "units",
            "minimum_threshold": 20.0
        },
        headers=admin_headers
    )
    assert create_res.status_code == 201
    item_id = create_res.json()["id"]

    # 2. Bharati Station Commander attempts to PATCH Maitri item -> 403 Forbidden
    patch_fail = client.patch(
        f"/api/inventory/{item_id}",
        json={"quantity": 15.0},
        headers=bha_headers
    )
    assert patch_fail.status_code == 403

    # 3. Personnel attempts to PATCH inventory -> 403 Forbidden
    patch_per_fail = client.patch(
        f"/api/inventory/{item_id}",
        json={"quantity": 15.0},
        headers=per_headers
    )
    assert patch_per_fail.status_code == 403

    # 4. Super Admin PATCHes Maitri item to below threshold -> 200 OK & quantity updated
    patch_success = client.patch(
        f"/api/inventory/{item_id}",
        json={"quantity": 10.0, "minimum_threshold": 25.0},
        headers=admin_headers
    )
    assert patch_success.status_code == 200
    assert patch_success.json()["quantity"] == 10.0
    assert patch_success.json()["minimum_threshold"] == 25.0

    # 5. Bharati Commander creates item at Bharati (LOC-BHA)
    bha_create = client.post(
        "/api/inventory/LOC-BHA",
        json={
            "location_id": "LOC-BHA",
            "item_name": "Bharati Filter Core",
            "category": "spare_parts",
            "quantity": 50.0,
            "unit": "units",
            "minimum_threshold": 10.0
        },
        headers=bha_headers
    )
    assert bha_create.status_code == 201
    bha_item_id = bha_create.json()["id"]

    # 6. Bharati Commander PATCHes their own Bharati item -> 200 OK
    bha_patch = client.patch(
        f"/api/inventory/{bha_item_id}",
        json={"quantity": 8.0},
        headers=bha_headers
    )
    assert bha_patch.status_code == 200
    assert bha_patch.json()["quantity"] == 8.0

    # 7. Bharati Commander attempts to DELETE Maitri item -> 403 Forbidden
    del_fail = client.delete(
        f"/api/inventory/{item_id}",
        headers=bha_headers
    )
    assert del_fail.status_code == 403

    # 8. Bharati Commander DELETES their own Bharati item -> 200 OK
    del_bha_success = client.delete(
        f"/api/inventory/{bha_item_id}",
        headers=bha_headers
    )
    assert del_bha_success.status_code == 200

    # 9. Super Admin DELETES Maitri item -> 200 OK
    del_admin_success = client.delete(
        f"/api/inventory/{item_id}",
        headers=admin_headers
    )
    assert del_admin_success.status_code == 200
