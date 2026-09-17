from fastapi.testclient import TestClient
from main import app
from seed import seed_database
import auth

client = TestClient(app)

def test_multileg_simulation_and_persistence():
    print("--- 1. SEEDING DATABASE ---")
    seed_database()

    # Login as Super Admin
    login_res = client.post("/api/auth/login", json={"username": "admin.ncpor", "password": "Demo@Admin2026"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a Multi-Leg Hazmat shipment via POST /api/shipments
    create_payload = {
        "description": "Multi-Leg Hazmat Heavy Diesel Drum Battery Batch",
        "category": "hazmat",
        "weight_kg": 15000.0,
        "is_hazmat": True,
        "origin_id": "LOC-GOA",
        "destination_id": "LOC-MAI",
        "box_label": "Hazmat Drum 1 of 20",
        "target_month": 1
    }

    res = client.post("/api/shipments", json=create_payload, headers=headers)
    assert res.status_code == 201
    shipment = res.json()
    shp_id = shipment['id']

    print(f"\n[OK] Multi-Leg Shipment Created: ID={shp_id}")
    print(f"   Initial State: Status={shipment['status']} | Location={shipment['current_location_id']} | Category={shipment['category']}")

    def fetch_persisted_db_state(step_name):
        """Fetch directly from DB endpoint to confirm persistence"""
        get_res = client.get(f"/api/shipments/{shp_id}", headers=headers)
        assert get_res.status_code == 200
        data = get_res.json()
        print(f"   [DB PERSISTENCE CHECK] ({step_name}):")
        print(f"      - Status: {data['status']}")
        print(f"      - Current Location: {data['current_location_id']} ({data['current_location']['name']})")
        print(f"      - Current Leg ID: {data['current_leg_id']}")
        return data

    # STEP 1: Planned -> In Transit (Goa)
    print("\n--- STEP 1: Advancing Leg (Planned -> In Transit) ---")
    res1 = client.post(f"/api/shipments/{shp_id}/advance-leg", headers=headers)
    assert res1.status_code == 200
    s1 = fetch_persisted_db_state("After Step 1")
    assert s1['status'] == 'in_transit', f"Expected in_transit, got {s1['status']}"
    assert s1['current_location_id'] == 'LOC-GOA', f"Expected LOC-GOA, got {s1['current_location_id']}"

    # STEP 2: In Transit -> At Transfer Point (Cape Town)
    print("\n--- STEP 2: Advancing Leg (In Transit -> At Transfer Point [Cape Town Staging]) ---")
    res2 = client.post(f"/api/shipments/{shp_id}/advance-leg", headers=headers)
    assert res2.status_code == 200
    s2 = fetch_persisted_db_state("After Step 2")
    assert s2['status'] == 'at_transfer_point', f"Expected at_transfer_point, got {s2['status']}"
    assert s2['current_location_id'] == 'LOC-CPT', f"Expected LOC-CPT, got {s2['current_location_id']}"

    # STEP 3: At Transfer Point -> In Transit (Cape Town leg 2 departure)
    print("\n--- STEP 3: Advancing Leg (At Transfer Point -> In Transit on 2nd Leg) ---")
    res3 = client.post(f"/api/shipments/{shp_id}/advance-leg", headers=headers)
    assert res3.status_code == 200
    s3 = fetch_persisted_db_state("After Step 3")
    assert s3['status'] == 'in_transit', f"Expected in_transit, got {s3['status']}"
    assert s3['current_location_id'] == 'LOC-CPT', f"Expected LOC-CPT, got {s3['current_location_id']}"

    # STEP 4: In Transit -> Delivered (Maitri Research Station)
    print("\n--- STEP 4: Advancing Leg (In Transit -> Delivered at Destination) ---")
    res4 = client.post(f"/api/shipments/{shp_id}/advance-leg", headers=headers)
    assert res4.status_code == 200
    s4 = fetch_persisted_db_state("After Step 4")
    assert s4['status'] == 'delivered', f"Expected delivered, got {s4['status']}"
    assert s4['current_location_id'] == 'LOC-MAI', f"Expected LOC-MAI, got {s4['current_location_id']}"

    print("\n[SUCCESS] MULTI-LEG ADVANCEMENT AND SQLITE DB PERSISTENCE VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_multileg_simulation_and_persistence()
