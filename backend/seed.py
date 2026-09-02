import json
import datetime
from database import engine, SessionLocal, Base
import models

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. LOCATIONS
        locations = [
            models.Location(
                id="LOC-GOA",
                name="India Depot (Goa)",
                type="depot",
                current_season="summer",
                latitude=15.3991,
                longitude=73.8052,
                code="GOA-DEPOT"
            ),
            models.Location(
                id="LOC-CPT",
                name="Cape Town Transfer Point",
                type="transfer",
                current_season="summer",
                latitude=-33.9249,
                longitude=18.4241,
                code="CPT-STAGING"
            ),
            models.Location(
                id="LOC-MAI",
                name="Maitri Research Station",
                type="station",
                current_season="summer",
                latitude=-70.7667,
                longitude=11.7333,
                code="MAITRI-STN"
            ),
            models.Location(
                id="LOC-BHA",
                name="Bharati Research Station",
                type="station",
                current_season="summer",
                latitude=-69.4072,
                longitude=76.1896,
                code="BHARATI-STN"
            )
        ]
        db.add_all(locations)
        db.commit()

        # 2. TRANSPORT LEGS
        legs = [
            models.TransportLeg(
                id="LEG-GOA-CPT-SHIP",
                origin_id="LOC-GOA",
                destination_id="LOC-CPT",
                mode="ship",
                duration_days=14,
                capacity_kg=50000.0,
                hazmat_allowed=True,
                available_months=json.dumps([11, 12, 1, 2, 3])
            ),
            models.TransportLeg(
                id="LEG-CPT-BHA-SHIP",
                origin_id="LOC-CPT",
                destination_id="LOC-BHA",
                mode="ship",
                duration_days=20,
                capacity_kg=45000.0,
                hazmat_allowed=True,
                available_months=json.dumps([11, 12, 1, 2, 3])
            ),
            models.TransportLeg(
                id="LEG-CPT-BHA-AIR",
                origin_id="LOC-CPT",
                destination_id="LOC-BHA",
                mode="aircraft",
                duration_days=3,
                capacity_kg=1800.0,
                hazmat_allowed=False,
                available_months=json.dumps([11, 12, 1, 2])
            ),
            models.TransportLeg(
                id="LEG-CPT-MAI-SHIP",
                origin_id="LOC-CPT",
                destination_id="LOC-MAI",
                mode="ship",
                duration_days=22,
                capacity_kg=40000.0,
                hazmat_allowed=True,
                available_months=json.dumps([11, 12, 1, 2, 3])
            ),
            models.TransportLeg(
                id="LEG-CPT-MAI-AIR",
                origin_id="LOC-CPT",
                destination_id="LOC-MAI",
                mode="aircraft",
                duration_days=3,
                capacity_kg=1500.0,
                hazmat_allowed=False,
                available_months=json.dumps([11, 12, 1, 2])
            ),
            models.TransportLeg(
                id="LEG-GOA-BHA-CARGO",
                origin_id="LOC-GOA",
                destination_id="LOC-BHA",
                mode="cargo_flight",
                duration_days=2,
                capacity_kg=2500.0,
                hazmat_allowed=False,
                available_months=json.dumps([12, 1])
            ),
            models.TransportLeg(
                id="LEG-MAI-BHA-HELI",
                origin_id="LOC-MAI",
                destination_id="LOC-BHA",
                mode="helicopter",
                duration_days=1,
                capacity_kg=800.0,
                hazmat_allowed=False,
                available_months=json.dumps([11, 12, 1, 2, 3])
            )
        ]
        db.add_all(legs)
        db.commit()

        # 3. SAMPLE SHIPMENTS
        shipments = [
            models.CargoShipment(
                id="SHP-2026-001",
                description="Seismometer replacement sensor & spectral logger",
                category="scientific_equipment",
                weight_kg=450.0,
                is_hazmat=False,
                origin_id="LOC-GOA",
                destination_id="LOC-BHA",
                current_location_id="LOC-CPT",
                current_leg_id="LEG-CPT-BHA-AIR",
                status="in_transit",
                box_label="1 of 3",
                eta="2026-09-08",
                computed_route_json=json.dumps([
                    {"leg_id": "LEG-GOA-CPT-SHIP", "mode": "ship", "duration_days": 14},
                    {"leg_id": "LEG-CPT-BHA-AIR", "mode": "aircraft", "duration_days": 3}
                ])
            ),
            models.CargoShipment(
                id="SHP-2026-002",
                description="Arctic-grade Aviation Turbine Fuel (Jet A-1 Drums)",
                category="hazmat",
                weight_kg=12000.0,
                is_hazmat=True,
                origin_id="LOC-GOA",
                destination_id="LOC-MAI",
                current_location_id="LOC-CPT",
                current_leg_id="LEG-CPT-MAI-SHIP",
                status="at_transfer_point",
                box_label="Pallet 12 of 40",
                eta="2026-09-25",
                computed_route_json=json.dumps([
                    {"leg_id": "LEG-GOA-CPT-SHIP", "mode": "ship", "duration_days": 14},
                    {"leg_id": "LEG-CPT-MAI-SHIP", "mode": "ship", "duration_days": 22}
                ])
            ),
            models.CargoShipment(
                id="SHP-2026-003",
                description="High-altitude freeze-dried rations & grains batch #4",
                category="food",
                weight_kg=2200.0,
                is_hazmat=False,
                origin_id="LOC-GOA",
                destination_id="LOC-BHA",
                current_location_id="LOC-BHA",
                current_leg_id=None,
                status="delivered",
                box_label="4 of 10",
                eta="2026-08-30",
                computed_route_json=json.dumps([
                    {"leg_id": "LEG-GOA-BHA-CARGO", "mode": "cargo_flight", "duration_days": 2}
                ])
            ),
            models.CargoShipment(
                id="SHP-2026-004",
                description="Caterpillar Genset Spare Fuel Injection Pumps",
                category="spare_parts",
                weight_kg=350.0,
                is_hazmat=False,
                origin_id="LOC-GOA",
                destination_id="LOC-MAI",
                current_location_id="LOC-GOA",
                current_leg_id="LEG-GOA-CPT-SHIP",
                status="planned",
                box_label="2 of 2",
                eta="2026-09-28",
                computed_route_json=json.dumps([
                    {"leg_id": "LEG-GOA-CPT-SHIP", "mode": "ship", "duration_days": 14},
                    {"leg_id": "LEG-CPT-MAI-AIR", "mode": "aircraft", "duration_days": 3}
                ])
            ),
            models.CargoShipment(
                id="SHP-2026-005",
                description="Lithium-ion Battery Banks for Solar Microgrid",
                category="hazmat",
                weight_kg=4800.0,
                is_hazmat=True,
                origin_id="LOC-GOA",
                destination_id="LOC-BHA",
                current_location_id="LOC-GOA",
                current_leg_id=None,
                status="on_hold",
                box_label="Hazmat Pack 1 of 6",
                eta="2026-10-15",
                computed_route_json=json.dumps([
                    {"leg_id": "LEG-GOA-CPT-SHIP", "mode": "ship", "duration_days": 14},
                    {"leg_id": "LEG-CPT-BHA-SHIP", "mode": "ship", "duration_days": 20}
                ])
            )
        ]
        db.add_all(shipments)
        db.commit()

        # 4. PERSONNEL
        personnel = [
            models.Personnel(
                id="PER-001",
                name="Dr. Rajesh V. Sharma",
                role="Station Commander",
                assigned_station="Bharati Station",
                season_type="winter",
                deployment_start="2025-11-01",
                deployment_end="2026-11-15",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-002",
                name="Sunita Narayanan",
                role="Senior Glaciologist",
                assigned_station="Bharati Station",
                season_type="summer",
                deployment_start="2025-12-01",
                deployment_end="2026-03-31",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-003",
                name="Major Amit Deshmukh",
                role="Logistics Officer",
                assigned_station="Maitri Station",
                season_type="winter",
                deployment_start="2025-10-15",
                deployment_end="2026-10-30",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-004",
                name="Vikramjit Singh",
                role="Chief Diesel Engineer",
                assigned_station="Maitri Station",
                season_type="winter",
                deployment_start="2025-11-10",
                deployment_end="2026-11-20",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-005",
                name="Dr. Ananya Roy",
                role="Medical Officer",
                assigned_station="Bharati Station",
                season_type="winter",
                deployment_start="2025-11-01",
                deployment_end="2026-11-15",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-006",
                name="Karan Malhotra",
                role="RF Communications Engineer",
                assigned_station="Cape Town Staging",
                season_type="summer",
                deployment_start="2026-01-10",
                deployment_end="2026-04-15",
                current_status="in_transit"
            ),
            models.Personnel(
                id="PER-007",
                name="Priya Sengupta",
                role="Atmospheric Scientist",
                assigned_station="Maitri Station",
                season_type="summer",
                deployment_start="2025-12-15",
                deployment_end="2026-03-15",
                current_status="returned"
            )
        ]
        db.add_all(personnel)
        db.commit()

        # 5. INVENTORY
        inventory_items = [
            # Bharati Station Inventory
            models.InventoryItem(
                id="INV-BHA-01",
                location_id="LOC-BHA",
                item_name="Polar Diesel Fuel (Grade Arctic-A)",
                category="fuel",
                quantity=18500.0,
                unit="liters",
                minimum_threshold=25000.0 # Low stock trigger!
            ),
            models.InventoryItem(
                id="INV-BHA-02",
                location_id="LOC-BHA",
                item_name="Freeze-Dried High Calorie Rations",
                category="food",
                quantity=4200.0,
                unit="kg",
                minimum_threshold=1500.0
            ),
            models.InventoryItem(
                id="INV-BHA-03",
                location_id="LOC-BHA",
                item_name="Emergency Oxygen Cylinders",
                category="medical",
                quantity=14.0,
                unit="units",
                minimum_threshold=20.0 # Low stock trigger!
            ),
            models.InventoryItem(
                id="INV-BHA-04",
                location_id="LOC-BHA",
                item_name="Ozone Sonde Balloons & Payloads",
                category="scientific_equipment",
                quantity=65.0,
                unit="units",
                minimum_threshold=20.0
            ),

            # Maitri Station Inventory
            models.InventoryItem(
                id="INV-MAI-01",
                location_id="LOC-MAI",
                item_name="Aviation Turbine Fuel (Jet A-1)",
                category="fuel",
                quantity=9800.0,
                unit="liters",
                minimum_threshold=12000.0 # Low stock trigger!
            ),
            models.InventoryItem(
                id="INV-MAI-02",
                location_id="LOC-MAI",
                item_name="Main Generator Spare Filters & Belts",
                category="spare_parts",
                quantity=32.0,
                unit="units",
                minimum_threshold=15.0
            ),
            models.InventoryItem(
                id="INV-MAI-03",
                location_id="LOC-MAI",
                item_name="Polar Expedition Parkas & Boots",
                category="clothing",
                quantity=45.0,
                unit="sets",
                minimum_threshold=30.0
            ),

            # Cape Town Transfer Inventory
            models.InventoryItem(
                id="INV-CPT-01",
                location_id="LOC-CPT",
                item_name="Containerized Cold-Chain Storage Racks",
                category="spare_parts",
                quantity=18.0,
                unit="units",
                minimum_threshold=5.0
            ),
            models.InventoryItem(
                id="INV-CPT-02",
                location_id="LOC-CPT",
                item_name="Aircraft Cargo Pallets & Nets",
                category="spare_parts",
                quantity=80.0,
                unit="units",
                minimum_threshold=25.0
            ),

            # Goa Depot Inventory
            models.InventoryItem(
                id="INV-GOA-01",
                location_id="LOC-GOA",
                item_name="Ice Core Drill Bits (Titanium Tip)",
                category="scientific_equipment",
                quantity=12.0,
                unit="units",
                minimum_threshold=5.0
            ),
            models.InventoryItem(
                id="INV-GOA-02",
                location_id="LOC-GOA",
                item_name="Hazardous Waste Neutralization Kits",
                category="hazmat",
                quantity=40.0,
                unit="boxes",
                minimum_threshold=10.0
            )
        ]
        db.add_all(inventory_items)
        db.commit()

        # 6. EMERGENCY EVENTS
        emergencies = [
            models.EmergencyEvent(
                id="EMG-2026-01",
                station_id="LOC-BHA",
                event_type="Blizzard Damage",
                severity="high",
                description="Category 4 Blizzard damaged radome antenna housing on outer perimeter. Backup satellite link active.",
                reported_at="2026-08-28T14:30:00",
                status="open",
                response_log="2026-08-28 15:00: Emergency maintenance team dispatched. 2026-08-28 17:30: Temporary structural harness attached."
            ),
            models.EmergencyEvent(
                id="EMG-2026-02",
                station_id="LOC-MAI",
                event_type="Generator Failure",
                severity="critical",
                description="Genset #2 unexpected automatic shutdown due to oil pressure regulator fault. Genset #1 carrying primary load.",
                reported_at="2026-08-25T09:15:00",
                status="resolved",
                response_log="2026-08-25 09:30: Switched load to secondary backup. 2026-08-26 11:00: Replaced regulator valve from station spare inventory. Genset #2 tested and operational."
            )
        ]
        db.add_all(emergencies)
        db.commit()

        print("Database successfully seeded with realistic NCPOR Antarctica operational data!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
