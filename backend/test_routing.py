from database import SessionLocal
from seed import seed_database
import models
from routing import compute_optimal_route

def run_tests():
    print("--- 1. SEEDING DATABASE ---")
    seed_database()

    db = SessionLocal()
    legs = db.query(models.TransportLeg).all()

    print("\n--- 2. TEST SCENARIO A: Normal Cargo (450kg, Non-hazmat, Goa -> Bharati, Month=1 Jan) ---")
    res_a = compute_optimal_route(
        legs=legs,
        origin_id="LOC-GOA",
        destination_id="LOC-BHA",
        weight_kg=450.0,
        is_hazmat=False,
        target_month=1
    )
    print(f"Success: {res_a.get('success')}")
    print(f"Total Duration: {res_a.get('total_duration_days')} days")
    print(f"Path Nodes: {res_a.get('path_nodes')}")
    print("Legs Chosen:")
    for leg in res_a.get("legs", []):
        print(f"  - {leg['origin_id']} -> {leg['destination_id']} via {leg['mode']} ({leg['duration_days']} days)")

    print("\n--- 3. TEST SCENARIO B: Hazmat Cargo (12,000kg, Hazmat=True, Goa -> Maitri, Month=1 Jan) ---")
    res_b = compute_optimal_route(
        legs=legs,
        origin_id="LOC-GOA",
        destination_id="LOC-MAI",
        weight_kg=12000.0,
        is_hazmat=True,
        target_month=1
    )
    print(f"Success: {res_b.get('success')}")
    print(f"Total Duration: {res_b.get('total_duration_days')} days")
    print(f"Path Nodes: {res_b.get('path_nodes')}")
    print("Legs Chosen (Aircraft should be filtered out!):")
    for leg in res_b.get("legs", []):
        print(f"  - {leg['origin_id']} -> {leg['destination_id']} via {leg['mode']} ({leg['duration_days']} days)")
    print(f"Warnings: {res_b.get('warnings')}")

    print("\n--- 4. TEST SCENARIO C: Heavy Oversized Cargo (3,000kg, Non-hazmat, Goa -> Bharati, Month=1 Jan) ---")
    res_c = compute_optimal_route(
        legs=legs,
        origin_id="LOC-GOA",
        destination_id="LOC-BHA",
        weight_kg=3000.0,
        is_hazmat=False,
        target_month=1
    )
    print(f"Success: {res_c.get('success')}")
    print(f"Total Duration: {res_c.get('total_duration_days')} days")
    print(f"Path Nodes: {res_c.get('path_nodes')}")
    print("Legs Chosen (3000kg exceeds 1800kg air capacity & 2500kg cargo flight capacity):")
    for leg in res_c.get("legs", []):
        print(f"  - {leg['origin_id']} -> {leg['destination_id']} via {leg['mode']} ({leg['duration_days']} days)")

    print("\n--- 5. TEST SCENARIO D: Off-Season Winter Shipment (Target Month = 6 June [Polar Winter]) ---")
    res_d = compute_optimal_route(
        legs=legs,
        origin_id="LOC-GOA",
        destination_id="LOC-BHA",
        weight_kg=500.0,
        is_hazmat=False,
        target_month=6 # June is winter; available_months are [11, 12, 1, 2, 3]
    )
    print(f"Success: {res_d.get('success')}")
    print(f"Error Message: {res_d.get('error')}")
    print(f"Excluded Legs Count: {res_d.get('excluded_legs_count')}")
    print("Reason Warnings for Excluded Legs:")
    for warn in res_d.get("warnings", []):
        print(f"  - {warn}")

    db.close()

if __name__ == "__main__":
    run_tests()
