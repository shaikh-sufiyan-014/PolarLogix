import os
import json
import pytest
import tempfile
from seed import validate_and_load_locations, validate_and_load_transport_legs, seed_database
from database import SessionLocal
import models

def test_location_validation_missing_latitude_fails_loudly():
    """Confirms that if latitude is missing in locations.json, validation raises ValueError naming the bad entry."""
    bad_data = [
        {
            "id": "LOC-TEST-FAIL",
            "name": "Invalid Location",
            "type": "depot",
            "longitude": 73.8052
            # Missing latitude!
        }
    ]
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f:
        json.dump(bad_data, f)
        temp_path = f.name

    try:
        with pytest.raises(ValueError) as exc_info:
            validate_and_load_locations(temp_path)
        assert "LOC-TEST-FAIL" in str(exc_info.value)
        assert "latitude" in str(exc_info.value)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_location_validation_invalid_type_fails_loudly():
    """Confirms that invalid location type fails with clear error message."""
    bad_data = [
        {
            "id": "LOC-TEST-2",
            "name": "Invalid Type Stn",
            "type": "airport", # invalid type
            "latitude": 12.0,
            "longitude": 77.0
        }
    ]
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f:
        json.dump(bad_data, f)
        temp_path = f.name

    try:
        with pytest.raises(ValueError) as exc_info:
            validate_and_load_locations(temp_path)
        assert "invalid type" in str(exc_info.value).lower()
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_transport_leg_validation_missing_origin_id_fails_loudly():
    """Confirms transport leg validation fails loudly if foreign key or field is missing."""
    valid_loc = models.Location(
        id="LOC-GOA",
        name="Goa",
        type="depot",
        latitude=15.3991,
        longitude=73.8052,
        code="GOA"
    )
    bad_leg_data = [
        {
            "id": "LEG-BAD-01",
            # Missing origin_id
            "destination_id": "LOC-GOA",
            "mode": "ship",
            "capacity_kg": 50000.0,
            "hazmat_allowed": True,
            "available_months": [1, 2]
        }
    ]
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f:
        json.dump(bad_leg_data, f)
        temp_path = f.name

    try:
        with pytest.raises(ValueError) as exc_info:
            validate_and_load_transport_legs([valid_loc], temp_path)
        assert "LEG-BAD-01" in str(exc_info.value)
        assert "origin_id" in str(exc_info.value)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_replaceable_dataset_swap():
    """
    Demonstrates swapping in a DIFFERENT test dataset (different coordinates & custom legs)
    and proving the seed script and database reflect the new data automatically.
    """
    custom_locations = [
        {
            "id": "LOC-MUMBAI",
            "name": "Mumbai Port Depot",
            "type": "depot",
            "latitude": 18.9438,
            "longitude": 72.8354,
            "code": "MUM-PORT"
        },
        {
            "id": "LOC-DURBAN",
            "name": "Durban Staging Terminal",
            "type": "transfer",
            "latitude": -29.8587,
            "longitude": 31.0218,
            "code": "DUR-HUB"
        }
    ]

    custom_legs = [
        {
            "id": "LEG-MUM-DUR-SHIP",
            "origin_id": "LOC-MUMBAI",
            "destination_id": "LOC-DURBAN",
            "mode": "ship",
            "average_speed_knots": 16.0,
            "capacity_kg": 60000.0,
            "hazmat_allowed": True,
            "available_months": [1, 2, 3, 4]
        }
    ]

    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f_loc:
        json.dump(custom_locations, f_loc)
        loc_path = f_loc.name

    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f_leg:
        json.dump(custom_legs, f_leg)
        leg_path = f_leg.name

    try:
        # Seed custom dataset
        seed_database(locations_path=loc_path, legs_path=leg_path)

        db = SessionLocal()
        loaded_locs = db.query(models.Location).all()
        loc_ids = [l.id for l in loaded_locs]
        assert "LOC-MUMBAI" in loc_ids
        assert "LOC-DURBAN" in loc_ids
        assert "LOC-GOA" not in loc_ids # Previous Goa is gone!

        loaded_legs = db.query(models.TransportLeg).all()
        assert len(loaded_legs) == 1
        assert loaded_legs[0].id == "LEG-MUM-DUR-SHIP"
        assert loaded_legs[0].origin_id == "LOC-MUMBAI"
        assert loaded_legs[0].destination_id == "LOC-DURBAN"
        assert loaded_legs[0].distance_nm > 4000 # Marine distance calculated via searoute
        db.close()

    finally:
        if os.path.exists(loc_path):
            os.remove(loc_path)
        if os.path.exists(leg_path):
            os.remove(leg_path)
        # Restore standard seed
        seed_database()

def test_four_real_stations_loaded_with_metadata():
    """Confirms all 4 real NCPOR field stations and hubs are loaded with verified region, programme, and properties."""
    seed_database()
    db = SessionLocal()
    locs = {l.id: l for l in db.query(models.Location).all()}
    db.close()

    assert "LOC-HIM" in locs, "Himadri Arctic station must be present"
    him = locs["LOC-HIM"]
    assert him.region == "arctic"
    assert him.programme == "arctic_programme"
    assert him.is_international_research_base is True
    assert "microbiology" in him.research_areas.lower()

    assert "LOC-HMS" in locs, "Himansh Himalayan station must be present"
    hms = locs["LOC-HMS"]
    assert hms.region == "himalayan"
    assert hms.programme == "himalayan_programme"
    assert "glacier" in hms.research_areas.lower()

    assert "LOC-MAI" in locs, "Maitri Antarctic station must be present"
    mai = locs["LOC-MAI"]
    assert mai.region == "antarctic"
    assert mai.programme == "antarctic_programme"
    assert mai.distance_from_ship_access_km == 80.0
    assert mai.requires_overland_transfer is True
    assert mai.capacity_winter == 25
    assert mai.capacity_summer == 50

    assert "LOC-BHA" in locs, "Bharati Antarctic station must be present"
    bha = locs["LOC-BHA"]
    assert bha.region == "antarctic"
    assert bha.programme == "antarctic_programme"
    assert bha.distance_from_ship_access_km == 0.2
    assert bha.requires_overland_transfer is False
    assert bha.capacity_winter == 24
    assert bha.capacity_summer == 47
    assert bha.latitude == -69.4068
    assert bha.longitude == 76.1953

