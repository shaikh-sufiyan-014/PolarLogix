import json
import uuid
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload

from database import engine, get_db, Base
import models
import schemas
from routing import compute_optimal_route

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PolarLogix API",
    description="India's Antarctic Expedition Logistics Platform (NCPOR)",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 14. HEALTH CHECK
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "PolarLogix NCPOR Logistics Platform",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# LOCATIONS & LEGS HELPERS
@app.get("/api/locations", response_model=List[schemas.LocationBase])
def get_locations(db: Session = Depends(get_db)):
    return db.query(models.Location).all()

@app.get("/api/transport-legs", response_model=List[schemas.TransportLegBase])
def get_transport_legs(db: Session = Depends(get_db)):
    return db.query(models.TransportLeg).all()

# 13. DASHBOARD SUMMARY
@app.get("/api/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_shipments = db.query(models.CargoShipment).count()
    active_shipments = db.query(models.CargoShipment).filter(
        models.CargoShipment.status.in_(["planned", "in_transit", "at_transfer_point"])
    ).count()
    
    personnel_deployed = db.query(models.Personnel).filter(
        models.Personnel.current_status.in_(["deployed", "in_transit"])
    ).count()

    inventory_items = db.query(models.InventoryItem).all()
    low_stock_count = sum(1 for item in inventory_items if item.quantity <= item.minimum_threshold)

    open_emergencies = db.query(models.EmergencyEvent).filter(
        models.EmergencyEvent.status == "open"
    ).count()

    locations = db.query(models.Location).all()
    location_summary = {}
    for loc in locations:
        shipment_count = db.query(models.CargoShipment).filter(models.CargoShipment.current_location_id == loc.id).count()
        inventory_low = sum(1 for i in inventory_items if i.location_id == loc.id and i.quantity <= i.minimum_threshold)
        location_summary[loc.id] = {
            "name": loc.name,
            "shipments_count": shipment_count,
            "low_stock_count": inventory_low
        }

    return {
        "total_shipments": total_shipments,
        "active_shipments": active_shipments,
        "personnel_deployed": personnel_deployed,
        "low_stock_alerts": low_stock_count,
        "open_emergencies": open_emergencies,
        "location_summary": location_summary
    }

# 1. CREATE SHIPMENT (AUTO-COMPUTE ROUTE)
@app.post("/api/shipments", response_model=schemas.ShipmentResponse, status_code=status.HTTP_201_CREATED)
def create_shipment(payload: schemas.ShipmentCreate, db: Session = Depends(get_db)):
    legs = db.query(models.TransportLeg).all()
    
    # Compute route via NetworkX graph Dijkstra engine
    route_result = compute_optimal_route(
        legs=legs,
        origin_id=payload.origin_id,
        destination_id=payload.destination_id,
        weight_kg=payload.weight_kg,
        is_hazmat=payload.is_hazmat,
        target_month=payload.target_month or 1
    )

    if not route_result.get("success"):
        raise HTTPException(
            status_code=400,
            detail=route_result.get("error", "No viable transport route found satisfying cargo constraints.")
        )

    computed_legs = route_result.get("legs", [])
    total_days = route_result.get("total_duration_days", 0)
    created_now = datetime.datetime.utcnow()
    eta_date = created_now + datetime.timedelta(days=total_days)

    shipment_id = f"SHP-{created_now.strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"

    first_leg_id = computed_legs[0]["leg_id"] if computed_legs else None

    shipment = models.CargoShipment(
        id=shipment_id,
        description=payload.description,
        category=payload.category,
        weight_kg=payload.weight_kg,
        is_hazmat=payload.is_hazmat,
        origin_id=payload.origin_id,
        destination_id=payload.destination_id,
        current_location_id=payload.origin_id,
        current_leg_id=first_leg_id,
        status="planned",
        box_label=payload.box_label or "1 of 1",
        created_at=created_now.isoformat(),
        eta=eta_date.strftime("%Y-%m-%d"),
        computed_route_json=json.dumps(computed_legs)
    )

    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    return shipment

# 2. LIST SHIPMENTS WITH FILTERS
@app.get("/api/shipments", response_model=List[schemas.ShipmentResponse])
def get_shipments(
    status: Optional[str] = Query(None),
    mode: Optional[str] = Query(None),
    destination: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.CargoShipment).options(
        joinedload(models.CargoShipment.origin),
        joinedload(models.CargoShipment.destination),
        joinedload(models.CargoShipment.current_location)
    )

    if status:
        query = query.filter(models.CargoShipment.status == status)
    if destination:
        query = query.filter(models.CargoShipment.destination_id == destination)
    
    shipments = query.all()

    if mode:
        filtered = []
        for s in shipments:
            if s.computed_route_json:
                try:
                    route = json.loads(s.computed_route_json)
                    if any(leg.get("mode") == mode for leg in route):
                        filtered.append(s)
                except Exception:
                    pass
        return filtered

    return shipments

# 3. GET SHIPMENT DETAIL
@app.get("/api/shipments/{shipment_id}", response_model=schemas.ShipmentResponse)
def get_shipment_detail(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(models.CargoShipment).options(
        joinedload(models.CargoShipment.origin),
        joinedload(models.CargoShipment.destination),
        joinedload(models.CargoShipment.current_location)
    ).filter(models.CargoShipment.id == shipment_id).first()

    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

# 4. PATCH SHIPMENT STATUS / LOCATION
@app.patch("/api/shipments/{shipment_id}/status", response_model=schemas.ShipmentResponse)
def update_shipment_status(
    shipment_id: str,
    payload: schemas.ShipmentStatusUpdate,
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    shipment.status = payload.status
    if payload.current_location_id:
        shipment.current_location_id = payload.current_location_id
    if payload.current_leg_id:
        shipment.current_leg_id = payload.current_leg_id

    db.commit()
    db.refresh(shipment)
    return shipment

# ADVANCE SHIPMENT TO NEXT ROUTE LEG (DEMO SIMULATION)
@app.post("/api/shipments/{shipment_id}/advance-leg", response_model=schemas.ShipmentResponse)
def advance_shipment_leg(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    route_legs = []
    if shipment.computed_route_json:
        try:
            route_legs = json.loads(shipment.computed_route_json)
        except Exception:
            pass

    if shipment.status == "planned":
        shipment.status = "in_transit"
        if route_legs:
            shipment.current_location_id = route_legs[0].get("origin_id", shipment.origin_id)
            shipment.current_leg_id = route_legs[0].get("leg_id")
    elif shipment.status == "in_transit":
        # Check if first leg ends at Cape Town (LOC-CPT)
        if route_legs and len(route_legs) > 1 and route_legs[0].get("destination_id") == "LOC-CPT" and shipment.current_location_id != "LOC-CPT":
            shipment.status = "at_transfer_point"
            shipment.current_location_id = "LOC-CPT"
            shipment.current_leg_id = route_legs[1].get("leg_id")
        else:
            shipment.status = "delivered"
            shipment.current_location_id = shipment.destination_id
            shipment.current_leg_id = None
    elif shipment.status == "at_transfer_point":
        shipment.status = "in_transit"
        if route_legs and len(route_legs) > 1:
            shipment.current_location_id = "LOC-CPT"
            shipment.current_leg_id = route_legs[1].get("leg_id")
    else:
        shipment.status = "delivered"
        shipment.current_location_id = shipment.destination_id
        shipment.current_leg_id = None

    db.commit()
    db.refresh(shipment)
    return shipment

# 5. GET SHIPMENT ROUTE MAP DATA
@app.get("/api/shipments/{shipment_id}/route-map")
def get_shipment_route_map(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    locations = {loc.id: loc for loc in db.query(models.Location).all()}
    
    route_legs = []
    if shipment.computed_route_json:
        try:
            route_legs = json.loads(shipment.computed_route_json)
        except Exception:
            pass

    path_coordinates = []
    current_loc = locations.get(shipment.current_location_id)

    # Origin coordinate
    orig = locations.get(shipment.origin_id)
    if orig:
        path_coordinates.append({"id": orig.id, "name": orig.name, "lat": orig.latitude, "lng": orig.longitude})

    for leg in route_legs:
        dest = locations.get(leg.get("destination_id"))
        if dest and {"id": dest.id, "name": dest.name, "lat": dest.latitude, "lng": dest.longitude} not in path_coordinates:
            path_coordinates.append({"id": dest.id, "name": dest.name, "lat": dest.latitude, "lng": dest.longitude})

    return {
        "shipment_id": shipment.id,
        "description": shipment.description,
        "status": shipment.status,
        "current_position": {
            "id": current_loc.id if current_loc else None,
            "name": current_loc.name if current_loc else None,
            "lat": current_loc.latitude if current_loc else None,
            "lng": current_loc.longitude if current_loc else None
        },
        "path_coordinates": path_coordinates,
        "legs": route_legs
    }

# 6. GET INVENTORY WITH LOW-STOCK FLAGS
@app.get("/api/inventory", response_model=List[schemas.InventoryResponse])
def get_inventory(location_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.InventoryItem).options(joinedload(models.InventoryItem.location))
    if location_id:
        query = query.filter(models.InventoryItem.location_id == location_id)
    return query.all()

# 7. ADD/UPDATE INVENTORY ITEM
@app.post("/api/inventory/{location_id}", response_model=schemas.InventoryResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_inventory(location_id: str, payload: schemas.InventoryCreate, db: Session = Depends(get_db)):
    existing = db.query(models.InventoryItem).filter(
        models.InventoryItem.location_id == location_id,
        models.InventoryItem.item_name == payload.item_name
    ).first()

    if existing:
        existing.quantity = payload.quantity
        existing.unit = payload.unit
        existing.minimum_threshold = payload.minimum_threshold
        existing.category = payload.category
        db.commit()
        db.refresh(existing)
        return existing
    else:
        inv_id = f"INV-{location_id.replace('LOC-', '')}-{uuid.uuid4().hex[:4].upper()}"
        new_item = models.InventoryItem(
            id=inv_id,
            location_id=location_id,
            item_name=payload.item_name,
            category=payload.category,
            quantity=payload.quantity,
            unit=payload.unit,
            minimum_threshold=payload.minimum_threshold
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item

# 8. GET PERSONNEL ROSTER
@app.get("/api/personnel", response_model=List[schemas.PersonnelResponse])
def get_personnel(station: Optional[str] = Query(None), season: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Personnel)
    if station:
        query = query.filter(models.Personnel.assigned_station == station)
    if season:
        query = query.filter(models.Personnel.season_type == season)
    return query.all()

# 9. ADD/UPDATE PERSONNEL
@app.post("/api/personnel", response_model=schemas.PersonnelResponse, status_code=status.HTTP_201_CREATED)
def create_personnel(payload: schemas.PersonnelCreate, db: Session = Depends(get_db)):
    per_id = f"PER-{uuid.uuid4().hex[:5].upper()}"
    new_per = models.Personnel(
        id=per_id,
        name=payload.name,
        role=payload.role,
        assigned_station=payload.assigned_station,
        season_type=payload.season_type,
        deployment_start=payload.deployment_start,
        deployment_end=payload.deployment_end,
        current_status=payload.current_status
    )
    db.add(new_per)
    db.commit()
    db.refresh(new_per)
    return new_per

# 10. GET EMERGENCY EVENTS
@app.get("/api/emergencies", response_model=List[schemas.EmergencyResponse])
def get_emergencies(status: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.EmergencyEvent).options(joinedload(models.EmergencyEvent.station))
    if status:
        query = query.filter(models.EmergencyEvent.status == status)
    return query.order_by(models.EmergencyEvent.reported_at.desc()).all()

# 11. POST NEW EMERGENCY EVENT
@app.post("/api/emergencies", response_model=schemas.EmergencyResponse, status_code=status.HTTP_201_CREATED)
def create_emergency(payload: schemas.EmergencyCreate, db: Session = Depends(get_db)):
    emg_id = f"EMG-{datetime.datetime.utcnow().strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"
    now_str = datetime.datetime.utcnow().isoformat()
    new_emg = models.EmergencyEvent(
        id=emg_id,
        station_id=payload.station_id,
        event_type=payload.event_type,
        severity=payload.severity,
        description=payload.description,
        reported_at=now_str,
        status="open",
        response_log=f"{now_str[:16].replace('T', ' ')}: Emergency incident reported."
    )
    db.add(new_emg)
    db.commit()
    db.refresh(new_emg)
    return new_emg

# 12. PATCH EMERGENCY EVENT STATUS / LOG
@app.patch("/api/emergencies/{emergency_id}", response_model=schemas.EmergencyResponse)
def update_emergency(emergency_id: str, payload: schemas.EmergencyUpdate, db: Session = Depends(get_db)):
    emg = db.query(models.EmergencyEvent).filter(models.EmergencyEvent.id == emergency_id).first()
    if not emg:
        raise HTTPException(status_code=404, detail="Emergency event not found")

    if payload.status:
        emg.status = payload.status
    if payload.response_log:
        now_stamp = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M')
        emg.response_log = f"{emg.response_log}\n{now_stamp}: {payload.response_log}"

    db.commit()
    db.refresh(emg)
    return emg
