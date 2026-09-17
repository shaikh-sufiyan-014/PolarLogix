import os
import json
import datetime
from typing import Dict, Any, List
from database import engine, SessionLocal, Base
import models
from auth import hash_password
from routing import compute_leg_geometry_and_duration

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
LOCATIONS_FILE = os.path.join(DATA_DIR, "locations.json")
TRANSPORT_LEGS_FILE = os.path.join(DATA_DIR, "transport_legs.json")
WEATHER_THRESHOLDS_FILE = os.path.join(DATA_DIR, "weather_thresholds.json")

def validate_and_load_locations(filepath: str = LOCATIONS_FILE) -> List[models.Location]:
    """
    Reads locations from JSON file and strictly validates every entry.
    Fails loudly with explicit ValueError naming the bad entry if any required field is missing or invalid.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Required locations file not found: {filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except Exception as e:
            raise ValueError(f"Invalid JSON syntax in locations file {filepath}: {e}")

    if not isinstance(data, list):
        raise ValueError(f"Locations JSON root must be an array of location objects, got {type(data).__name__}")

    if len(data) == 0:
        raise ValueError("Locations dataset cannot be empty.")

    valid_types = {"depot", "transfer", "station"}
    valid_regions = {"antarctic", "arctic", "himalayan", "transit_hub", "depot"}
    valid_programmes = {"antarctic_programme", "arctic_programme", "himalayan_programme"}
    location_models = []
    seen_ids = set()

    for idx, entry in enumerate(data):
        entry_id = entry.get("id")
        entry_label = f"Entry #{idx} (id='{entry_id}')" if entry_id else f"Entry #{idx}"

        if not isinstance(entry, dict):
            raise ValueError(f"Location {entry_label} must be a JSON object, got {type(entry).__name__}")

        # Check required fields
        required_fields = ["id", "name", "type", "latitude", "longitude"]
        for field in required_fields:
            if field not in entry or entry[field] is None:
                raise ValueError(f"Location validation failed: {entry_label} is missing required field '{field}'.")

        # Validate ID
        loc_id = str(entry["id"]).strip()
        if not loc_id:
            raise ValueError(f"Location validation failed: {entry_label} has an empty 'id'.")
        if loc_id in seen_ids:
            raise ValueError(f"Location validation failed: Duplicate location id '{loc_id}' found at {entry_label}.")
        seen_ids.add(loc_id)

        # Validate Name
        name = str(entry["name"]).strip()
        if not name:
            raise ValueError(f"Location validation failed: {entry_label} has an empty 'name'.")

        # Validate Type
        loc_type = str(entry["type"]).strip().lower()
        if loc_type not in valid_types:
            raise ValueError(
                f"Location validation failed: {entry_label} has invalid type '{entry['type']}'. "
                f"Must be one of: {sorted(list(valid_types))}."
            )

        # Validate Region if present
        region = str(entry.get("region", "antarctic" if loc_type == "station" else "transit_hub" if loc_type == "transfer" else "depot")).strip().lower()
        if region not in valid_regions:
            raise ValueError(
                f"Location validation failed: {entry_label} has invalid region '{entry.get('region')}'. "
                f"Must be one of: {sorted(list(valid_regions))}."
            )

        # Validate Programme if present
        programme = str(entry.get("programme", "antarctic_programme" if region in {"antarctic", "transit_hub", "depot"} else f"{region}_programme")).strip().lower()
        if programme not in valid_programmes:
            raise ValueError(
                f"Location validation failed: {entry_label} has invalid programme '{entry.get('programme')}'. "
                f"Must be one of: {sorted(list(valid_programmes))}."
            )

        # Validate Latitude
        try:
            lat = float(entry["latitude"])
            if not (-90.0 <= lat <= 90.0):
                raise ValueError()
        except (TypeError, ValueError):
            raise ValueError(
                f"Location validation failed: {entry_label} has invalid latitude '{entry.get('latitude')}'. "
                "Must be a float between -90.0 and 90.0."
            )

        # Validate Longitude
        try:
            lng = float(entry["longitude"])
            if not (-180.0 <= lng <= 180.0):
                raise ValueError()
        except (TypeError, ValueError):
            raise ValueError(
                f"Location validation failed: {entry_label} has invalid longitude '{entry.get('longitude')}'. "
                "Must be a float between -180.0 and 180.0."
            )

        code = entry.get("code") or loc_id.replace("LOC-", "") + "-STN"
        current_season = entry.get("current_season", "summer")

        location_models.append(
            models.Location(
                id=loc_id,
                name=name,
                type=loc_type,
                region=region,
                programme=programme,
                current_season=current_season,
                latitude=lat,
                longitude=lng,
                code=code,
                established_year=entry.get("established_year"),
                is_international_research_base=entry.get("is_international_research_base", False),
                capacity_summer=entry.get("capacity_summer"),
                capacity_winter=entry.get("capacity_winter"),
                capacity_note=entry.get("capacity_note"),
                distance_from_ship_access_km=entry.get("distance_from_ship_access_km"),
                requires_overland_transfer=entry.get("requires_overland_transfer", False),
                research_areas=entry.get("research_areas")
            )
        )

    return location_models

def validate_and_load_transport_legs(
    locations: List[models.Location],
    filepath: str = TRANSPORT_LEGS_FILE
) -> List[models.TransportLeg]:
    """
    Reads transport legs from JSON file, validates constraints, and computes realistic marine waypoint geometry.
    Fails loudly with explicit ValueError naming the bad entry if any required field is missing or invalid.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Required transport legs file not found: {filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except Exception as e:
            raise ValueError(f"Invalid JSON syntax in transport legs file {filepath}: {e}")

    if not isinstance(data, list):
        raise ValueError(f"Transport legs JSON root must be an array of leg objects, got {type(data).__name__}")

    if len(data) == 0:
        raise ValueError("Transport legs dataset cannot be empty.")

    loc_map = {loc.id: loc for loc in locations}
    valid_modes = {"ship", "aircraft", "helicopter", "cargo_flight"}
    leg_models = []
    seen_ids = set()

    for idx, entry in enumerate(data):
        entry_id = entry.get("id")
        entry_label = f"Leg entry #{idx} (id='{entry_id}')" if entry_id else f"Leg entry #{idx}"

        if not isinstance(entry, dict):
            raise ValueError(f"Transport leg {entry_label} must be a JSON object, got {type(entry).__name__}")

        # Check required fields
        required_fields = ["id", "origin_id", "destination_id", "mode", "capacity_kg", "hazmat_allowed", "available_months"]
        for field in required_fields:
            if field not in entry or entry[field] is None:
                raise ValueError(f"Transport leg validation failed: {entry_label} is missing required field '{field}'.")

        # Validate ID
        leg_id = str(entry["id"]).strip()
        if not leg_id:
            raise ValueError(f"Transport leg validation failed: {entry_label} has an empty 'id'.")
        if leg_id in seen_ids:
            raise ValueError(f"Transport leg validation failed: Duplicate leg id '{leg_id}' found at {entry_label}.")
        seen_ids.add(leg_id)

        # Validate Origin & Destination Foreign Keys
        orig_id = str(entry["origin_id"]).strip()
        if orig_id not in loc_map:
            raise ValueError(
                f"Transport leg validation failed: {entry_label} references unknown origin_id '{orig_id}'. "
                f"Valid location IDs are: {sorted(list(loc_map.keys()))}."
            )

        dest_id = str(entry["destination_id"]).strip()
        if dest_id not in loc_map:
            raise ValueError(
                f"Transport leg validation failed: {entry_label} references unknown destination_id '{dest_id}'. "
                f"Valid location IDs are: {sorted(list(loc_map.keys()))}."
            )

        if orig_id == dest_id:
            raise ValueError(f"Transport leg validation failed: {entry_label} has identical origin and destination '{orig_id}'.")

        # Validate Mode
        mode = str(entry["mode"]).strip().lower()
        if mode not in valid_modes:
            raise ValueError(
                f"Transport leg validation failed: {entry_label} has invalid mode '{entry['mode']}'. "
                f"Must be one of: {sorted(list(valid_modes))}."
            )

        # Validate Capacity
        try:
            capacity = float(entry["capacity_kg"])
            if capacity <= 0:
                raise ValueError()
        except (TypeError, ValueError):
            raise ValueError(
                f"Transport leg validation failed: {entry_label} has invalid capacity_kg '{entry.get('capacity_kg')}'. "
                "Must be a positive number."
            )

        # Validate Hazmat
        hazmat = entry["hazmat_allowed"]
        if not isinstance(hazmat, bool):
            raise ValueError(
                f"Transport leg validation failed: {entry_label} has non-boolean hazmat_allowed '{hazmat}'. "
                "Must be true or false."
            )

        # Validate Available Months
        months = entry["available_months"]
        if not isinstance(months, list) or len(months) == 0:
            raise ValueError(
                f"Transport leg validation failed: {entry_label} available_months must be a non-empty array of month integers (1-12)."
            )
        for m in months:
            if not isinstance(m, int) or not (1 <= m <= 12):
                raise ValueError(
                    f"Transport leg validation failed: {entry_label} contains invalid month '{m}' in available_months. "
                    "Must be integers between 1 and 12."
                )

        # Validate speed for ship legs
        avg_speed = None
        if mode == "ship":
            if "average_speed_knots" in entry and entry["average_speed_knots"] is not None:
                try:
                    avg_speed = float(entry["average_speed_knots"])
                    if avg_speed <= 0:
                        raise ValueError()
                except (TypeError, ValueError):
                    raise ValueError(
                        f"Transport leg validation failed: {entry_label} has invalid average_speed_knots '{entry.get('average_speed_knots')}'. "
                        "Must be a positive float."
                    )
            else:
                avg_speed = 14.0 # default nautical cruising speed

        # Compute dynamic waypoints and duration using routing geometry
        orig_loc = loc_map[orig_id]
        dest_loc = loc_map[dest_id]
        calc = compute_leg_geometry_and_duration(
            mode=mode,
            origin_lat=orig_loc.latitude,
            origin_lng=orig_loc.longitude,
            dest_lat=dest_loc.latitude,
            dest_lng=dest_loc.longitude,
            average_speed_knots=avg_speed,
            base_duration_days=entry.get("duration_days", 1)
        )

        duration_days = calc["duration_days"]
        distance_nm = calc["distance_nm"]
        waypoints_json = json.dumps(calc["waypoints"])

        leg_models.append(
            models.TransportLeg(
                id=leg_id,
                origin_id=orig_id,
                destination_id=dest_id,
                mode=mode,
                duration_days=duration_days,
                capacity_kg=capacity,
                hazmat_allowed=hazmat,
                available_months=json.dumps(months),
                average_speed_knots=avg_speed,
                distance_nm=distance_nm,
                waypoints_json=waypoints_json
            )
        )

    return leg_models

def seed_database(
    locations_path: str = LOCATIONS_FILE,
    legs_path: str = TRANSPORT_LEGS_FILE
):
    """
    Populates database from external JSON reference data with strict validation.
    """
    print(f"Loading locations from: {locations_path}")
    locations = validate_and_load_locations(locations_path)

    print(f"Loading transport legs from: {legs_path}")
    legs = validate_and_load_transport_legs(locations, legs_path)

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. Insert Locations & Legs from JSON
        db.add_all(locations)
        db.add_all(legs)
        db.commit()
        print(f"Successfully seeded {len(locations)} locations and {len(legs)} transport legs with marine waypoints.")

        # 2. PERSONNEL (Diverse Multi-Institution Roster)
        personnel = [
            models.Personnel(
                id="PER-001",
                name="Dr. Rajesh V. Sharma",
                role="Station Commander / Chief Scientist",
                affiliated_institution="NCPOR",
                personnel_category="permanent_staff",
                assigned_station="Bharati Research Station",
                season_type="winter",
                deployment_start="2025-11-01",
                deployment_end="2026-11-15",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-002",
                name="Sunita Narayanan",
                role="Senior Glaciologist",
                affiliated_institution="CSIR-NIO",
                personnel_category="visiting_researcher",
                assigned_station="Bharati Research Station",
                season_type="summer",
                deployment_start="2025-12-01",
                deployment_end="2026-03-31",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-003",
                name="Major Amit Deshmukh",
                role="Station Commander / Logistics Officer",
                affiliated_institution="NCPOR",
                personnel_category="permanent_staff",
                assigned_station="Maitri Research Station",
                season_type="winter",
                deployment_start="2025-10-15",
                deployment_end="2026-10-30",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-004",
                name="Vikramjit Singh",
                role="Chief Diesel Engineer",
                affiliated_institution="NCPOR",
                personnel_category="contract_specialist",
                assigned_station="Maitri Research Station",
                season_type="winter",
                deployment_start="2025-11-10",
                deployment_end="2026-11-20",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-005",
                name="Dr. Ananya Roy",
                role="Medical Officer",
                affiliated_institution="AIIMS New Delhi",
                personnel_category="contract_specialist",
                assigned_station="Bharati Research Station",
                season_type="winter",
                deployment_start="2025-11-01",
                deployment_end="2026-11-15",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-006",
                name="Karan Malhotra",
                role="RF Communications Engineer",
                affiliated_institution="ISRO-SAC",
                personnel_category="visiting_researcher",
                assigned_station="Cape Town Transfer Point",
                season_type="summer",
                deployment_start="2026-01-10",
                deployment_end="2026-04-15",
                current_status="in_transit"
            ),
            models.Personnel(
                id="PER-007",
                name="Priya Sengupta",
                role="Atmospheric Scientist",
                affiliated_institution="IIT Bombay",
                personnel_category="visiting_researcher",
                assigned_station="Maitri Research Station",
                season_type="summer",
                deployment_start="2025-12-15",
                deployment_end="2026-03-15",
                current_status="returned"
            ),
            models.Personnel(
                id="PER-008",
                name="Dr. Aarav Mehta",
                role="Arctic Microbiologist & Field PI",
                affiliated_institution="NCPOR",
                personnel_category="project_scientist",
                assigned_station="Himadri Arctic Station",
                season_type="summer",
                deployment_start="2026-05-01",
                deployment_end="2026-09-30",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-009",
                name="Dr. Tenzing Norbu",
                role="Glacial Hydrologist",
                affiliated_institution="GSI",
                personnel_category="visiting_researcher",
                assigned_station="Himansh Himalayan Station",
                season_type="summer",
                deployment_start="2026-06-01",
                deployment_end="2026-10-15",
                current_status="deployed"
            )
        ]
        db.add_all(personnel)
        db.commit()

        # 3. USERS
        users = [
            models.User(
                id="USR-ADMIN-01",
                username="admin.ncpor",
                password_hash=hash_password("Demo@Admin2026"),
                role="admin",
                linked_station_id=None,
                linked_personnel_id=None,
                created_at=datetime.datetime.utcnow().isoformat()
            ),
            models.User(
                id="USR-CMD-BHA",
                username="commander.bharati",
                password_hash=hash_password("Demo@Bharati2026"),
                role="station_commander",
                linked_station_id="LOC-BHA" if "LOC-BHA" in [l.id for l in locations] else locations[0].id,
                linked_personnel_id="PER-001",
                created_at=datetime.datetime.utcnow().isoformat()
            ),
            models.User(
                id="USR-CMD-MAI",
                username="commander.maitri",
                password_hash=hash_password("Demo@Maitri2026"),
                role="station_commander",
                linked_station_id="LOC-MAI" if "LOC-MAI" in [l.id for l in locations] else locations[0].id,
                linked_personnel_id="PER-003",
                created_at=datetime.datetime.utcnow().isoformat()
            ),
            models.User(
                id="USR-OFF-01",
                username="officer.shipping1",
                password_hash=hash_password("Demo@Officer2026"),
                role="shipment_officer",
                linked_station_id=None,
                linked_personnel_id=None,
                created_at=datetime.datetime.utcnow().isoformat()
            ),
            models.User(
                id="USR-OFF-02",
                username="officer.shipping2",
                password_hash=hash_password("Demo@Officer2026"),
                role="shipment_officer",
                linked_station_id=None,
                linked_personnel_id=None,
                created_at=datetime.datetime.utcnow().isoformat()
            ),
            models.User(
                id="USR-PER-001",
                username="PER-001",
                password_hash=hash_password("Demo@Personnel2026"),
                role="personnel",
                linked_station_id="LOC-BHA" if "LOC-BHA" in [l.id for l in locations] else locations[0].id,
                linked_personnel_id="PER-001",
                created_at=datetime.datetime.utcnow().isoformat()
            ),
            models.User(
                id="USR-PER-002",
                username="PER-002",
                password_hash=hash_password("Demo@Personnel2026"),
                role="personnel",
                linked_station_id="LOC-BHA" if "LOC-BHA" in [l.id for l in locations] else locations[0].id,
                linked_personnel_id="PER-002",
                created_at=datetime.datetime.utcnow().isoformat()
            )
        ]
        db.add_all(users)
        db.commit()

        # 4. SHIPMENTS (Pre-linked to valid seeded legs & locations)
        first_loc = locations[0].id
        second_loc = locations[1].id if len(locations) > 1 else first_loc
        third_loc = locations[2].id if len(locations) > 2 else second_loc
        ship_legs = [l for l in legs if l.mode == "ship"]
        first_ship_leg = ship_legs[0] if ship_legs else legs[0]

        shipments = [
            models.CargoShipment(
                id="SHP-2026-001",
                description="Seismometer replacement sensor & spectral logger",
                category="scientific_equipment",
                weight_kg=450.0,
                is_hazmat=False,
                origin_id=first_loc,
                destination_id=second_loc,
                current_location_id=first_loc,
                current_leg_id=first_ship_leg.id,
                assigned_officer_id="USR-OFF-01",
                status="in_transit",
                box_label="1 of 3",
                eta="2026-09-25",
                computed_route_json=json.dumps([
                    {
                        "leg_id": first_ship_leg.id,
                        "mode": first_ship_leg.mode,
                        "duration_days": first_ship_leg.duration_days,
                        "origin_id": first_ship_leg.origin_id,
                        "destination_id": first_ship_leg.destination_id,
                        "average_speed_knots": first_ship_leg.average_speed_knots,
                        "distance_nm": first_ship_leg.distance_nm
                    }
                ])
            ),
            models.CargoShipment(
                id="SHP-2026-002",
                description="Arctic-grade Aviation Turbine Fuel (Jet A-1 Drums)",
                category="hazmat",
                weight_kg=12000.0,
                is_hazmat=True,
                origin_id=first_loc,
                destination_id=second_loc,
                current_location_id=first_loc,
                current_leg_id=first_ship_leg.id,
                assigned_officer_id="USR-OFF-01",
                status="planned",
                box_label="Pallet 12 of 40",
                eta="2026-10-02",
                computed_route_json=json.dumps([
                    {
                        "leg_id": first_ship_leg.id,
                        "mode": first_ship_leg.mode,
                        "duration_days": first_ship_leg.duration_days,
                        "origin_id": first_ship_leg.origin_id,
                        "destination_id": first_ship_leg.destination_id
                    }
                ])
            ),
            models.CargoShipment(
                id="SHP-2026-003",
                description="High-altitude freeze-dried rations & grains batch #4",
                category="food",
                weight_kg=2200.0,
                is_hazmat=False,
                origin_id=first_loc,
                destination_id=second_loc,
                current_location_id=second_loc,
                current_leg_id=None,
                assigned_officer_id="USR-OFF-02", # Assigned to Officer 2!
                status="delivered",
                box_label="4 of 10",
                eta="2026-08-30",
                computed_route_json=json.dumps([
                    {"leg_id": first_ship_leg.id, "mode": "ship", "duration_days": 14, "origin_id": first_loc, "destination_id": second_loc}
                ])
            ),
            models.CargoShipment(
                id="SHP-2026-004",
                description="Caterpillar Genset Spare Fuel Injection Pumps",
                category="spare_parts",
                weight_kg=350.0,
                is_hazmat=False,
                origin_id=first_loc,
                destination_id=third_loc,
                current_location_id=first_loc,
                current_leg_id=first_ship_leg.id,
                assigned_officer_id="USR-OFF-02", # Assigned to Officer 2!
                status="planned",
                box_label="2 of 2",
                eta="2026-10-05",
                computed_route_json=json.dumps([
                    {"leg_id": first_ship_leg.id, "mode": "ship", "duration_days": 14, "origin_id": first_loc, "destination_id": second_loc}
                ])
            ),
            models.CargoShipment(
                id="SHP-2026-005",
                description="Lithium-ion Battery Banks for Solar Microgrid",
                category="hazmat",
                weight_kg=4800.0,
                is_hazmat=True,
                origin_id=first_loc,
                destination_id=second_loc,
                current_location_id=first_loc,
                current_leg_id=first_ship_leg.id,
                assigned_officer_id="USR-OFF-01",
                status="in_transit",
                box_label="Hazmat Pack 1 of 6",
                eta="2026-10-15",
                computed_route_json=json.dumps([
                    {"leg_id": first_ship_leg.id, "mode": "ship", "duration_days": 14, "origin_id": first_loc, "destination_id": second_loc}
                ])
            )
        ]
        db.add_all(shipments)
        db.commit()

        # 5. VOYAGE CONSUMABLES
        consumables = [
            models.VoyageConsumable(
                id="CON-001-FUEL",
                shipment_id="SHP-2026-001",
                item_name="Marine Diesel Oil",
                unit="liters",
                starting_quantity=15000.0,
                current_quantity=11500.0,
                daily_consumption_rate=350.0
            ),
            models.VoyageConsumable(
                id="CON-001-WATER",
                shipment_id="SHP-2026-001",
                item_name="Potable Fresh Water",
                unit="liters",
                starting_quantity=3000.0,
                current_quantity=2200.0,
                daily_consumption_rate=50.0
            )
        ]
        db.add_all(consumables)
        db.commit()

        # 6. INVENTORY
        inventory = [
            models.InventoryItem(
                id="INV-GOA-01",
                location_id="LOC-GOA",
                item_name="Polar Expedition Rations",
                category="food",
                quantity=3500.0,
                unit="kg",
                minimum_threshold=1000.0
            ),
            models.InventoryItem(
                id="INV-GOA-02",
                location_id="LOC-GOA",
                item_name="Arctic Grade Diesel (A-1)",
                category="fuel",
                quantity=18000.0,
                unit="liters",
                minimum_threshold=20000.0 # Low stock alert
            ),
            models.InventoryItem(
                id="INV-BHA-01",
                location_id="LOC-BHA",
                item_name="Marine Gas Oil (MGO DMA)",
                category="fuel",
                quantity=25000.0,
                unit="liters",
                minimum_threshold=15000.0
            ),
            models.InventoryItem(
                id="INV-BHA-02",
                location_id="LOC-BHA",
                item_name="Cryogenic Biological Sample Vials",
                category="scientific_equipment",
                quantity=450.0,
                unit="units",
                minimum_threshold=100.0
            ),
            models.InventoryItem(
                id="INV-MAI-01",
                location_id="LOC-MAI",
                item_name="Low-Temperature Aviation Kerosene",
                category="fuel",
                quantity=12000.0,
                unit="liters",
                minimum_threshold=10000.0
            ),
            models.InventoryItem(
                id="INV-MAI-02",
                location_id="LOC-MAI",
                item_name="PistenBully Overland Snow Track Spares",
                category="spare_parts",
                quantity=8.0,
                unit="units",
                minimum_threshold=10.0 # Low stock alert
            ),
            models.InventoryItem(
                id="INV-HIM-01",
                location_id="LOC-HIM",
                item_name="Aerosol Optical Spectrometer Sensors",
                category="scientific_equipment",
                quantity=12.0,
                unit="units",
                minimum_threshold=5.0
            ),
            models.InventoryItem(
                id="INV-HMS-01",
                location_id="LOC-HMS",
                item_name="High-Altitude Glacier Depth Sonic Probes",
                category="scientific_equipment",
                quantity=14.0,
                unit="units",
                minimum_threshold=6.0
            )
        ]
        db.add_all(inventory)
        db.commit()

        # 7. EMERGENCIES
        emergencies = [
            models.EmergencyEvent(
                id="EMG-2026-01",
                station_id=locations[0].id,
                shipment_id="SHP-2026-001",
                reported_by_user_id="USR-OFF-01",
                reported_by_role="shipment_officer",
                event_type="Marine Swell Alert",
                severity="medium",
                description="Southern Ocean swell height reaching 4.5m along shipping corridor. Speed adjusted.",
                reported_at="2026-09-12T10:00:00",
                status="open",
                response_log="2026-09-12 10:15: Vessel course trimmed to ease heavy rolling."
            )
        ]
        db.add_all(emergencies)
        db.commit()

        print("Database successfully seeded from data files!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
