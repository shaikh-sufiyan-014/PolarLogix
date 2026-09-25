import io
import pytest
from fastapi.testclient import TestClient
from main import app, UPLOAD_DIR
from seed import seed_database
import auth

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    auth._failed_attempts.clear()
    seed_database()

def get_token(username: str, password: str):
    response = client.post("/api/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200, f"Login failed for {username}: {response.text}"
    return response.json()["access_token"]

# ================= 1. SHIPMENT DOCUMENT UPLOAD & DOWNLOAD TESTS =================

def test_document_upload_and_download_flow():
    """Verify real multipart file upload and subsequent authenticated download."""
    officer_token = get_token("officer.shipping1", "Demo@Officer2026")
    headers = {"Authorization": f"Bearer {officer_token}"}

    # Retrieve assigned shipment
    shipments_res = client.get("/api/shipments", headers=headers)
    assert shipments_res.status_code == 200
    shipments = shipments_res.json()
    assert len(shipments) > 0
    shipment_id = shipments[0]["id"]

    # 1. Upload valid PDF file
    file_content = b"%PDF-1.4 sample polar logistics manifest test content"
    files = {"file": ("Hazmat_MSDS_Certificate.pdf", io.BytesIO(file_content), "application/pdf")}
    data = {"file_type": "hazmat_cert"}

    upload_res = client.post(
        f"/api/shipments/{shipment_id}/documents",
        headers=headers,
        files=files,
        data=data
    )
    assert upload_res.status_code == 201, upload_res.text
    uploaded_doc = upload_res.json()
    assert uploaded_doc["file_name"] == "Hazmat_MSDS_Certificate.pdf"
    assert uploaded_doc["file_type"] == "hazmat_cert"
    assert uploaded_doc["file_size_kb"] > 0
    doc_id = uploaded_doc["id"]

    # 2. Download the uploaded document
    download_res = client.get(
        f"/api/shipments/{shipment_id}/documents/{doc_id}/download",
        headers=headers
    )
    assert download_res.status_code == 200
    assert download_res.content == file_content
    assert "Hazmat_MSDS_Certificate.pdf" in download_res.headers.get("content-disposition", "")

def test_document_upload_validation_unsupported_format():
    """Verify unsupported file formats (e.g. .exe) are rejected with 400."""
    officer_token = get_token("officer.shipping1", "Demo@Officer2026")
    headers = {"Authorization": f"Bearer {officer_token}"}

    shipments = client.get("/api/shipments", headers=headers).json()
    shipment_id = shipments[0]["id"]

    files = {"file": ("malicious_script.exe", io.BytesIO(b"executable payload"), "application/octet-stream")}
    data = {"file_type": "inspection_report"}

    upload_res = client.post(
        f"/api/shipments/{shipment_id}/documents",
        headers=headers,
        files=files,
        data=data
    )
    assert upload_res.status_code == 400
    assert "Unsupported file format" in upload_res.json()["detail"]

def test_document_upload_validation_empty_file():
    """Verify empty file upload is rejected with 400."""
    officer_token = get_token("officer.shipping1", "Demo@Officer2026")
    headers = {"Authorization": f"Bearer {officer_token}"}

    shipments = client.get("/api/shipments", headers=headers).json()
    shipment_id = shipments[0]["id"]

    files = {"file": ("empty_report.pdf", io.BytesIO(b""), "application/pdf")}
    data = {"file_type": "inspection_report"}

    upload_res = client.post(
        f"/api/shipments/{shipment_id}/documents",
        headers=headers,
        files=files,
        data=data
    )
    assert upload_res.status_code == 400
    assert "Cannot upload empty file" in upload_res.json()["detail"]

def test_document_upload_rbac_unauthorized():
    """Verify unauthorized user cannot attach documents to another officer's shipment."""
    personnel_token = get_token("PER-001", "Demo@Personnel2026")
    headers = {"Authorization": f"Bearer {personnel_token}"}

    # Get a shipment
    admin_token = get_token("admin.ncpor", "Demo@Admin2026")
    shipments = client.get("/api/shipments", headers={"Authorization": f"Bearer {admin_token}"}).json()
    shipment_id = shipments[0]["id"]

    files = {"file": ("test_paperwork.pdf", io.BytesIO(b"content"), "application/pdf")}
    data = {"file_type": "customs_paperwork"}

    upload_res = client.post(
        f"/api/shipments/{shipment_id}/documents",
        headers=headers,
        files=files,
        data=data
    )
    assert upload_res.status_code == 403

# ================= 2. WEATHER LOG CREATE, EDIT & DELETE TESTS =================

def test_weather_log_crud_flow():
    """Verify full CRUD lifecycle for weather observations."""
    officer_token = get_token("officer.shipping1", "Demo@Officer2026")
    headers = {"Authorization": f"Bearer {officer_token}"}

    shipments = client.get("/api/shipments", headers=headers).json()
    shipment_id = shipments[0]["id"]

    # 1. CREATE Weather Log
    create_res = client.post(
        f"/api/shipments/{shipment_id}/weather-logs",
        headers=headers,
        json={
            "condition": "Severe Gale / 50kt Winds",
            "note": "Ice swell 6m encountered near Southern Ocean convergence zone",
            "temperature_c": -18.5,
            "wind_speed_knots": 50.0
        }
    )
    assert create_res.status_code == 201
    created_log = create_res.json()
    log_id = created_log["id"]
    assert created_log["condition"] == "Severe Gale / 50kt Winds"
    assert created_log["temperature_c"] == -18.5

    # 2. UPDATE / EDIT Weather Log
    update_res = client.put(
        f"/api/shipments/{shipment_id}/weather-logs/{log_id}",
        headers=headers,
        json={
            "condition": "Moderating Seas / 25kt Winds",
            "note": "Wind subsided, ship resuming standard 14 knot cruising speed",
            "temperature_c": -12.0,
            "wind_speed_knots": 25.0
        }
    )
    assert update_res.status_code == 200
    updated_log = update_res.json()
    assert updated_log["id"] == log_id
    assert updated_log["condition"] == "Moderating Seas / 25kt Winds"
    assert updated_log["temperature_c"] == -12.0
    assert updated_log["wind_speed_knots"] == 25.0

    # Verify no duplicate was created
    detail_res = client.get(f"/api/shipments/{shipment_id}", headers=headers)
    assert detail_res.status_code == 200
    matching_logs = [l for l in detail_res.json()["weather_logs"] if l["id"] == log_id]
    assert len(matching_logs) == 1
    assert matching_logs[0]["condition"] == "Moderating Seas / 25kt Winds"

    # 3. DELETE Weather Log
    delete_res = client.delete(
        f"/api/shipments/{shipment_id}/weather-logs/{log_id}",
        headers=headers
    )
    assert delete_res.status_code == 200
    assert delete_res.json()["message"] == "Weather observation deleted successfully"

    # Verify deletion in shipment details
    detail_res_after = client.get(f"/api/shipments/{shipment_id}", headers=headers)
    remaining_logs = [l for l in detail_res_after.json()["weather_logs"] if l["id"] == log_id]
    assert len(remaining_logs) == 0

def test_system_weather_log_protection():
    """Verify automatically generated operational hazard logs cannot be edited or deleted."""
    officer_token = get_token("officer.shipping1", "Demo@Officer2026")
    headers = {"Authorization": f"Bearer {officer_token}"}

    shipments = client.get("/api/shipments", headers=headers).json()
    shipment_id = shipments[0]["id"]

    # Insert a system-generated hazard log directly to ensure pristine test isolation
    from database import get_db
    import models, uuid, datetime
    db = next(get_db())
    sys_log_id = f"WTH-SYS-{uuid.uuid4().hex[:4].upper()}"
    sys_log = models.WeatherLog(
        id=sys_log_id,
        shipment_id=shipment_id,
        logged_by="USER-ADMIN-01",
        condition="Route Diverted / Weather Hazard",
        note="Automated Dijkstra re-routing: Heavy sea ice pack formation detected.",
        logged_at=datetime.datetime.utcnow().isoformat()
    )
    db.add(sys_log)
    db.commit()

    # Attempt to EDIT protected system record -> Should fail with 400
    edit_res = client.put(
        f"/api/shipments/{shipment_id}/weather-logs/{sys_log_id}",
        headers=headers,
        json={"condition": "Tampered Condition", "note": "Hacking log"}
    )
    assert edit_res.status_code == 400
    assert "protected" in edit_res.json()["detail"].lower()

    # Attempt to DELETE protected system record -> Should fail with 400
    del_res = client.delete(
        f"/api/shipments/{shipment_id}/weather-logs/{sys_log_id}",
        headers=headers
    )
    assert del_res.status_code == 400
    assert "protected" in del_res.json()["detail"].lower()
