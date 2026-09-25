import os
import re
import json
import uuid
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status, Header, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload

from database import engine, get_db, Base
import models
import schemas
import auth
from routing import compute_optimal_route
from weather_service import evaluate_waypoints_weather, get_marine_conditions, load_weather_thresholds

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads", "shipment_documents")
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".jpg", ".jpeg", ".png"}
MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PolarLogix API",
    description="India's Antarctic Expedition Logistics Platform (NCPOR) - Multi-Role Operations",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",    "https://polarlogix-sih.vercel.app",
    "https://polarlogix.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# HEALTH CHECK (Public)
# -------------------------------------------------------------
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "PolarLogix NCPOR Logistics Platform",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# -------------------------------------------------------------
# AUTHENTICATION & USER MANAGEMENT
# -------------------------------------------------------------
@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    username = credentials.username.strip()
    # Check rate limiting: 5 failed attempts locks user out
    auth.check_rate_limit(username)

    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not auth.verify_password(credentials.password, user.password_hash):
        auth.record_failed_attempt(username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Reset failed attempts on successful login
    auth.reset_failed_attempts(username)

    token_data = {
        "sub": user.id,
        "username": user.username,
        "role": user.role,
        "linked_station_id": user.linked_station_id,
        "linked_personnel_id": user.linked_personnel_id
    }
    token = auth.create_access_token(token_data)
    return schemas.TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user
    )

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_current_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/api/auth/users", response_model=List[schemas.UserResponse])
def get_all_users(
    current_user: models.User = Depends(auth.require_roles("admin")),
    db: Session = Depends(get_db)
):
    return db.query(models.User).all()

@app.post("/api/auth/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: schemas.UserCreate,
    current_user: models.User = Depends(auth.require_roles("admin")),
    db: Session = Depends(get_db)
):
    existing = db.query(models.User).filter(models.User.username == payload.username.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_id = f"USR-{uuid.uuid4().hex[:6].upper()}"
    new_user = models.User(
        id=new_id,
        username=payload.username.strip(),
        password_hash=auth.hash_password(payload.password),
        role=payload.role,
        linked_station_id=payload.linked_station_id,
        linked_personnel_id=payload.linked_personnel_id,
        created_at=datetime.datetime.utcnow().isoformat()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# -------------------------------------------------------------
# LOCATIONS & TRANSPORT LEGS (Authenticated)
# -------------------------------------------------------------
@app.get("/api/locations", response_model=List[schemas.LocationBase])
def get_locations(
    programme: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Location)
    if programme and programme != "all":
        query = query.filter(models.Location.programme == programme)
    if region and region != "all":
        query = query.filter(models.Location.region == region)
    return query.all()

@app.get("/api/transport-legs", response_model=List[schemas.TransportLegBase])
def get_transport_legs(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.TransportLeg).all()

# -------------------------------------------------------------
# ROLE-SCOPED DASHBOARD SUMMARY
# -------------------------------------------------------------
@app.get("/api/dashboard/summary")
def get_dashboard_summary(
    programme: Optional[str] = Query(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # 1. SUPER ADMIN: Full Network / Programme-Scoped View
    if current_user.role == "admin":
        loc_query = db.query(models.Location)
        if programme and programme != "all":
            loc_query = loc_query.filter(models.Location.programme == programme)
        locations = loc_query.all()
        target_loc_ids = {l.id for l in locations}
        target_loc_names = {l.name for l in locations}

        if programme and programme != "all":
            shipments_q = db.query(models.CargoShipment).filter(
                (models.CargoShipment.origin_id.in_(target_loc_ids)) |
                (models.CargoShipment.destination_id.in_(target_loc_ids)) |
                (models.CargoShipment.current_location_id.in_(target_loc_ids))
            )
            total_shipments = shipments_q.count()
            active_shipments = shipments_q.filter(
                models.CargoShipment.status.in_(["planned", "in_transit", "at_transfer_point"])
            ).count()

            all_personnel = db.query(models.Personnel).all()
            personnel_deployed = sum(
                1 for p in all_personnel
                if p.current_status in ["deployed", "in_transit"] and any(loc_name in p.assigned_station for loc_name in target_loc_names)
            )

            inventory_items = db.query(models.InventoryItem).filter(
                models.InventoryItem.location_id.in_(target_loc_ids)
            ).all()
            low_stock_count = sum(1 for item in inventory_items if item.quantity <= item.minimum_threshold)

            open_emergencies = db.query(models.EmergencyEvent).filter(
                models.EmergencyEvent.status == "open",
                models.EmergencyEvent.station_id.in_(target_loc_ids)
            ).count()
        else:
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

        location_summary = {}
        for loc in locations:
            shipment_count = db.query(models.CargoShipment).filter(models.CargoShipment.current_location_id == loc.id).count()
            inventory_low = sum(1 for i in inventory_items if i.location_id == loc.id and i.quantity <= i.minimum_threshold)
            location_summary[loc.id] = {
                "name": loc.name,
                "region": loc.region,
                "programme": loc.programme,
                "shipments_count": shipment_count,
                "low_stock_count": inventory_low
            }

        return {
            "role": "admin",
            "programme": programme or "all",
            "total_shipments": total_shipments,
            "active_shipments": active_shipments,
            "personnel_deployed": personnel_deployed,
            "low_stock_alerts": low_stock_count,
            "open_emergencies": open_emergencies,
            "location_summary": location_summary
        }

    # 2. STATION COMMANDER: Scoped to their Station
    elif current_user.role == "station_commander":
        stn_id = current_user.linked_station_id
        station = db.query(models.Location).filter(models.Location.id == stn_id).first()
        station_name = station.name if station else "Assigned Station"

        # Shipments inbound to, outbound from, or at this station
        station_shipments = db.query(models.CargoShipment).filter(
            (models.CargoShipment.destination_id == stn_id) |
            (models.CargoShipment.origin_id == stn_id) |
            (models.CargoShipment.current_location_id == stn_id)
        ).all()

        # Station personnel
        station_personnel = db.query(models.Personnel).all()
        filtered_personnel = [p for p in station_personnel if ("Bharati" in p.assigned_station if stn_id == "LOC-BHA" else "Maitri" in p.assigned_station)]

        # Station inventory
        station_inventory = db.query(models.InventoryItem).filter(models.InventoryItem.location_id == stn_id).all()
        low_stock_count = sum(1 for item in station_inventory if item.quantity <= item.minimum_threshold)

        # Station emergencies (including shipments headed to this station)
        inbound_shp_ids = [s.id for s in station_shipments]
        open_emergencies = db.query(models.EmergencyEvent).filter(
            models.EmergencyEvent.status == "open",
            (models.EmergencyEvent.station_id == stn_id) | (models.EmergencyEvent.shipment_id.in_(inbound_shp_ids))
        ).count()

        return {
            "role": "station_commander",
            "station_id": stn_id,
            "station_name": station_name,
            "total_shipments": len(station_shipments),
            "active_shipments": sum(1 for s in station_shipments if s.status in ["planned", "in_transit", "at_transfer_point"]),
            "personnel_deployed": sum(1 for p in filtered_personnel if p.current_status == "deployed"),
            "low_stock_alerts": low_stock_count,
            "open_emergencies": open_emergencies
        }

    # 3. SHIPMENT OFFICER: Scoped to Assigned Shipments
    elif current_user.role == "shipment_officer":
        assigned_shipments = db.query(models.CargoShipment).filter(
            models.CargoShipment.assigned_officer_id == current_user.id
        ).all()
        shp_ids = [s.id for s in assigned_shipments]

        active_count = sum(1 for s in assigned_shipments if s.status in ["in_transit", "at_transfer_point", "planned"])
        open_emergencies = db.query(models.EmergencyEvent).filter(
            models.EmergencyEvent.status == "open",
            models.EmergencyEvent.shipment_id.in_(shp_ids)
        ).count() if shp_ids else 0

        # Consumable warnings
        consumables = db.query(models.VoyageConsumable).filter(
            models.VoyageConsumable.shipment_id.in_(shp_ids)
        ).all() if shp_ids else []
        low_consumables = sum(1 for c in consumables if c.current_quantity <= (c.starting_quantity * 0.25))

        return {
            "role": "shipment_officer",
            "total_shipments": len(assigned_shipments),
            "active_shipments": active_count,
            "open_emergencies": open_emergencies,
            "low_consumables_count": low_consumables
        }

    # 4. PERSONNEL: Personal Status View
    else:
        per_id = current_user.linked_personnel_id
        personnel = db.query(models.Personnel).filter(models.Personnel.id == per_id).first() if per_id else None
        work_logs_count = db.query(models.PersonnelWorkLog).filter(models.PersonnelWorkLog.personnel_id == per_id).count() if per_id else 0
        station_emergencies = db.query(models.EmergencyEvent).filter(
            models.EmergencyEvent.station_id == current_user.linked_station_id,
            models.EmergencyEvent.status == "open"
        ).count()

        return {
            "role": "personnel",
            "personnel_id": per_id,
            "name": personnel.name if personnel else current_user.username,
            "current_status": personnel.current_status if personnel else "deployed",
            "work_logs_count": work_logs_count,
            "open_station_emergencies": station_emergencies
        }

# -------------------------------------------------------------
# SHIPMENTS ENDPOINTS (Role-Scoped & Ownership-Verified)
# -------------------------------------------------------------
@app.get("/api/shipments", response_model=List[schemas.ShipmentResponse])
def get_shipments(
    status: Optional[str] = Query(None),
    mode: Optional[str] = Query(None),
    destination: Optional[str] = Query(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.CargoShipment).options(
        joinedload(models.CargoShipment.origin),
        joinedload(models.CargoShipment.destination),
        joinedload(models.CargoShipment.current_location),
        joinedload(models.CargoShipment.assigned_officer),
        joinedload(models.CargoShipment.consumables),
        joinedload(models.CargoShipment.handover_confirmations),
        joinedload(models.CargoShipment.weather_logs),
        joinedload(models.CargoShipment.documents)
    )

    # Scoping by Role
    if current_user.role == "shipment_officer":
        query = query.filter(models.CargoShipment.assigned_officer_id == current_user.id)
    elif current_user.role == "station_commander":
        stn = current_user.linked_station_id
        query = query.filter(
            (models.CargoShipment.destination_id == stn) |
            (models.CargoShipment.origin_id == stn) |
            (models.CargoShipment.current_location_id == stn)
        )
    elif current_user.role == "personnel":
        stn = current_user.linked_station_id
        query = query.filter(models.CargoShipment.destination_id == stn)

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

@app.get("/api/shipments/{shipment_id}", response_model=schemas.ShipmentResponse)
def get_shipment_detail(
    shipment_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).options(
        joinedload(models.CargoShipment.origin),
        joinedload(models.CargoShipment.destination),
        joinedload(models.CargoShipment.current_location),
        joinedload(models.CargoShipment.assigned_officer),
        joinedload(models.CargoShipment.consumables),
        joinedload(models.CargoShipment.handover_confirmations),
        joinedload(models.CargoShipment.weather_logs),
        joinedload(models.CargoShipment.documents)
    ).filter(models.CargoShipment.id == shipment_id).first()

    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    # Critical Server-Side Ownership Check (403 Forbidden on mismatch)
    auth.verify_shipment_access(shipment, current_user)
    return shipment

@app.post("/api/routing/preview")
def preview_route(
    payload: schemas.ShipmentCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    legs = db.query(models.TransportLeg).all()
    locations = {loc.id: loc for loc in db.query(models.Location).all()}
    
    route_result = compute_optimal_route(
        legs=legs,
        origin_id=payload.origin_id,
        destination_id=payload.destination_id,
        weight_kg=payload.weight_kg,
        is_hazmat=payload.is_hazmat,
        target_month=payload.target_month or 1,
        locations_dict=locations,
        check_weather=True
    )

    if not route_result.get("success"):
        raise HTTPException(
            status_code=400,
            detail=route_result.get("error", "No viable transport route found satisfying cargo constraints.")
        )

    return route_result

@app.post("/api/weather/route-check", response_model=schemas.WeatherAdvisory)
def check_route_weather(
    waypoints: List[schemas.WaypointCoord],
    current_user: models.User = Depends(auth.get_current_user)
):
    pts = [
        {
            "name": pt.name or f"Waypoint ({pt.lat:.2f}°, {pt.lng:.2f}°)",
            "lat": pt.lat,
            "lng": pt.lng
        }
        for pt in waypoints
    ]
    return evaluate_waypoints_weather(pts)

@app.post("/api/shipments", response_model=schemas.ShipmentResponse, status_code=status.HTTP_201_CREATED)
def create_shipment(
    payload: schemas.ShipmentCreate,
    current_user: models.User = Depends(auth.require_roles("admin", "shipment_officer")),
    db: Session = Depends(get_db)
):
    legs = db.query(models.TransportLeg).all()
    locations = {loc.id: loc for loc in db.query(models.Location).all()}
    
    # Compute route via NetworkX graph Dijkstra engine with real marine waypoints
    route_result = compute_optimal_route(
        legs=legs,
        origin_id=payload.origin_id,
        destination_id=payload.destination_id,
        weight_kg=payload.weight_kg,
        is_hazmat=payload.is_hazmat,
        target_month=payload.target_month or 1,
        locations_dict=locations,
        check_weather=False
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

    # If created by shipment officer, assign to self unless admin assigned someone
    assigned_officer = payload.assigned_officer_id
    if current_user.role == "shipment_officer":
        assigned_officer = current_user.id

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
        assigned_officer_id=assigned_officer,
        status="planned",
        box_label=payload.box_label or "1 of 1",
        created_at=created_now.isoformat(),
        eta=eta_date.strftime("%Y-%m-%d"),
        computed_route_json=json.dumps(computed_legs)
    )
    db.add(shipment)
    db.commit()

    # Create default voyage consumables for this shipment
    default_consumables = [
        models.VoyageConsumable(
            id=f"CON-{shipment_id}-FUEL",
            shipment_id=shipment_id,
            item_name="Marine Diesel / Aviation Fuel",
            unit="liters",
            starting_quantity=15000.0,
            current_quantity=15000.0,
            daily_consumption_rate=350.0
        ),
        models.VoyageConsumable(
            id=f"CON-{shipment_id}-RATIONS",
            shipment_id=shipment_id,
            item_name="Emergency Crew Rations",
            unit="kg",
            starting_quantity=600.0,
            current_quantity=600.0,
            daily_consumption_rate=15.0
        ),
        models.VoyageConsumable(
            id=f"CON-{shipment_id}-WATER",
            shipment_id=shipment_id,
            item_name="Potable Drinking Water",
            unit="liters",
            starting_quantity=2000.0,
            current_quantity=2000.0,
            daily_consumption_rate=50.0
        )
    ]
    db.add_all(default_consumables)
    db.commit()
    db.refresh(shipment)
    return shipment

@app.patch("/api/shipments/{shipment_id}/status", response_model=schemas.ShipmentResponse)
def update_shipment_status(
    shipment_id: str,
    payload: schemas.ShipmentStatusUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    auth.verify_shipment_access(shipment, current_user)

    shipment.status = payload.status
    if payload.current_location_id:
        shipment.current_location_id = payload.current_location_id
    if payload.current_leg_id:
        shipment.current_leg_id = payload.current_leg_id

    db.commit()
    db.refresh(shipment)
    return shipment

@app.post("/api/shipments/{shipment_id}/advance-leg", response_model=schemas.ShipmentResponse)
def advance_shipment_leg(
    shipment_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    auth.verify_shipment_access(shipment, current_user)

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

    # Slightly deplete consumables upon advancing leg
    consumables = db.query(models.VoyageConsumable).filter(models.VoyageConsumable.shipment_id == shipment_id).all()
    for c in consumables:
        c.current_quantity = max(0.0, c.current_quantity - (c.daily_consumption_rate * 2.5))

    db.commit()
    db.refresh(shipment)
    return shipment

@app.get("/api/shipments/{shipment_id}/route-map")
def get_shipment_route_map(
    shipment_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    auth.verify_shipment_access(shipment, current_user)

    locations = {loc.id: loc for loc in db.query(models.Location).all()}
    db_legs_map = {leg.id: leg for leg in db.query(models.TransportLeg).all()}
    
    route_legs = []
    if shipment.computed_route_json:
        try:
            route_legs = json.loads(shipment.computed_route_json)
        except Exception:
            pass

    path_coordinates = []
    full_waypoints = []
    enriched_legs = []
    current_loc = locations.get(shipment.current_location_id)

    orig = locations.get(shipment.origin_id)
    if orig:
        path_coordinates.append({"id": orig.id, "name": orig.name, "lat": orig.latitude, "lng": orig.longitude})

    for leg_entry in route_legs:
        leg_id = leg_entry.get("leg_id")
        db_leg = db_legs_map.get(leg_id)
        
        # Extract or populate waypoints
        leg_waypoints = leg_entry.get("waypoints", [])
        if not leg_waypoints and db_leg and db_leg.waypoints_json:
            try:
                leg_waypoints = json.loads(db_leg.waypoints_json)
            except Exception:
                pass

        dest = locations.get(leg_entry.get("destination_id"))
        if dest and {"id": dest.id, "name": dest.name, "lat": dest.latitude, "lng": dest.longitude} not in path_coordinates:
            path_coordinates.append({"id": dest.id, "name": dest.name, "lat": dest.latitude, "lng": dest.longitude})

        if leg_waypoints:
            if not full_waypoints:
                full_waypoints.extend(leg_waypoints)
            else:
                full_waypoints.extend(leg_waypoints[1:])

        enriched_legs.append({
            **leg_entry,
            "distance_nm": getattr(db_leg, 'distance_nm', None) if db_leg else leg_entry.get("distance_nm"),
            "average_speed_knots": getattr(db_leg, 'average_speed_knots', None) if db_leg else leg_entry.get("average_speed_knots"),
            "waypoints": leg_waypoints
        })

    # Sample key waypoints for weather check
    weather_advisory = None
    if full_waypoints:
        try:
            key_pts = []
            if len(full_waypoints) <= 3:
                for idx, pt in enumerate(full_waypoints):
                    key_pts.append({"name": f"Waypoint {idx+1}", "lat": pt[0], "lng": pt[1]})
            else:
                indices = [0, len(full_waypoints) // 2, len(full_waypoints) - 1]
                names = ["Departure Corridor", "Open Ocean Midpoint", "Destination Sector"]
                for idx, name in zip(indices, names):
                    pt = full_waypoints[idx]
                    key_pts.append({"name": name, "lat": pt[0], "lng": pt[1]})
            weather_advisory = evaluate_waypoints_weather(key_pts)
        except Exception:
            pass

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
        "waypoints": full_waypoints,
        "legs": enriched_legs,
        "weather_advisory": weather_advisory
    }

# -------------------------------------------------------------
# SHIPMENT OFFICER SUB-RESOURCES (Handover, Consumables, Weather, Docs, Alternate Route)
# -------------------------------------------------------------
@app.post("/api/shipments/{shipment_id}/handover", response_model=schemas.HandoverConfirmationResponse, status_code=status.HTTP_201_CREATED)
def record_handover_confirmation(
    shipment_id: str,
    payload: schemas.HandoverConfirmationCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    auth.verify_shipment_access(shipment, current_user)

    handover_id = f"HND-{uuid.uuid4().hex[:6].upper()}"
    handover = models.HandoverConfirmation(
        id=handover_id,
        shipment_id=shipment_id,
        leg_id=payload.leg_id or shipment.current_leg_id,
        location_id=payload.location_id,
        confirmed_by=current_user.id,
        confirmation_type=payload.confirmation_type,
        notes=payload.notes or "",
        confirmed_at=datetime.datetime.utcnow().isoformat()
    )
    db.add(handover)
    db.commit()
    db.refresh(handover)
    return handover

@app.get("/api/shipments/{shipment_id}/consumables", response_model=List[schemas.VoyageConsumableBase])
def get_shipment_consumables(
    shipment_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    auth.verify_shipment_access(shipment, current_user)
    return db.query(models.VoyageConsumable).filter(models.VoyageConsumable.shipment_id == shipment_id).all()

@app.patch("/api/shipments/{shipment_id}/consumables/{consumable_id}", response_model=schemas.VoyageConsumableBase)
def update_consumable_level(
    shipment_id: str,
    consumable_id: str,
    payload: schemas.VoyageConsumableUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    auth.verify_shipment_access(shipment, current_user)

    consumable = db.query(models.VoyageConsumable).filter(
        models.VoyageConsumable.id == consumable_id,
        models.VoyageConsumable.shipment_id == shipment_id
    ).first()
    if not consumable:
        raise HTTPException(status_code=404, detail="Consumable item not found")

    consumable.current_quantity = max(0.0, payload.current_quantity)
    db.commit()
    db.refresh(consumable)
    return consumable

@app.post("/api/shipments/{shipment_id}/recalculate-alternate-route", response_model=schemas.ShipmentResponse)
def recalculate_alternate_route(
    shipment_id: str,
    payload: schemas.AlternateRouteRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    auth.verify_shipment_access(shipment, current_user)

    # Fetch all legs but filter out avoided mode or specific disrupted routes
    all_legs = db.query(models.TransportLeg).all()
    available_legs = all_legs
    if payload.avoid_mode:
        available_legs = [leg for leg in all_legs if leg.mode != payload.avoid_mode]

    # Recompute route from current location to destination
    locations = {loc.id: loc for loc in db.query(models.Location).all()}
    route_result = compute_optimal_route(
        legs=available_legs,
        origin_id=shipment.current_location_id,
        destination_id=shipment.destination_id,
        weight_kg=shipment.weight_kg,
        is_hazmat=shipment.is_hazmat,
        target_month=1,
        locations_dict=locations
    )

    if not route_result.get("success"):
        raise HTTPException(
            status_code=400,
            detail=route_result.get("error", "No alternate transport corridor available given these weather/operational constraints.")
        )

    new_legs = route_result.get("legs", [])
    shipment.computed_route_json = json.dumps(new_legs)
    if new_legs:
        shipment.current_leg_id = new_legs[0]["leg_id"]
    
    # Log weather note describing re-routing
    wth_id = f"WTH-{uuid.uuid4().hex[:6].upper()}"
    weather_entry = models.WeatherLog(
        id=wth_id,
        shipment_id=shipment_id,
        logged_by=current_user.id,
        condition="Route Diverted / Weather Hazard",
        note=f"Alternate route recomputed: {payload.issue_description}. Avoided mode: {payload.avoid_mode or 'None'}.",
        logged_at=datetime.datetime.utcnow().isoformat()
    )
    db.add(weather_entry)
    db.commit()
    db.refresh(shipment)
    return shipment

@app.post("/api/shipments/{shipment_id}/weather-logs", response_model=schemas.WeatherLogResponse, status_code=status.HTTP_201_CREATED)
def add_weather_log(
    shipment_id: str,
    payload: schemas.WeatherLogCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    auth.verify_shipment_access(shipment, current_user)

    wth_id = f"WTH-{uuid.uuid4().hex[:6].upper()}"
    log = models.WeatherLog(
        id=wth_id,
        shipment_id=shipment_id,
        logged_by=current_user.id,
        condition=payload.condition,
        note=payload.note or "",
        temperature_c=payload.temperature_c,
        wind_speed_knots=payload.wind_speed_knots,
        logged_at=datetime.datetime.utcnow().isoformat()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@app.put("/api/shipments/{shipment_id}/weather-logs/{weather_log_id}", response_model=schemas.WeatherLogResponse)
@app.patch("/api/shipments/{shipment_id}/weather-logs/{weather_log_id}", response_model=schemas.WeatherLogResponse)
def update_weather_log(
    shipment_id: str,
    weather_log_id: str,
    payload: schemas.WeatherLogUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    auth.verify_shipment_access(shipment, current_user)

    log = db.query(models.WeatherLog).filter(
        models.WeatherLog.id == weather_log_id,
        models.WeatherLog.shipment_id == shipment_id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Weather observation log not found")

    # Protect automated system hazard records from being overwritten
    if log.condition == "Route Diverted / Weather Hazard":
        raise HTTPException(
            status_code=400,
            detail="System-generated route hazard records are protected and cannot be modified."
        )

    if payload.condition is not None:
        log.condition = payload.condition
    if payload.note is not None:
        log.note = payload.note
    if payload.temperature_c is not None:
        log.temperature_c = payload.temperature_c
    if payload.wind_speed_knots is not None:
        log.wind_speed_knots = payload.wind_speed_knots

    db.commit()
    db.refresh(log)
    return log

@app.delete("/api/shipments/{shipment_id}/weather-logs/{weather_log_id}")
def delete_weather_log(
    shipment_id: str,
    weather_log_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    auth.verify_shipment_access(shipment, current_user)

    log = db.query(models.WeatherLog).filter(
        models.WeatherLog.id == weather_log_id,
        models.WeatherLog.shipment_id == shipment_id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Weather observation log not found")

    # Protect automated system hazard records from deletion
    if log.condition == "Route Diverted / Weather Hazard":
        raise HTTPException(
            status_code=400,
            detail="System-generated route hazard records are protected and cannot be deleted."
        )

    db.delete(log)
    db.commit()
    return {"message": "Weather observation deleted successfully", "id": weather_log_id}

@app.post("/api/shipments/{shipment_id}/documents", response_model=schemas.ShipmentDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_shipment_document(
    shipment_id: str,
    file: UploadFile = File(...),
    document_type: Optional[str] = Form(None),
    file_type: Optional[str] = Form(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    auth.verify_shipment_access(shipment, current_user)

    actual_type = file_type or document_type or "hazmat_cert"
    raw_filename = file.filename or "uploaded_document"
    safe_filename = os.path.basename(raw_filename).strip()
    if not safe_filename:
        safe_filename = "document.pdf"

    _, ext = os.path.splitext(safe_filename)
    ext_clean = ext.lower()
    if ext_clean not in ALLOWED_DOCUMENT_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext_clean}'. Supported formats: {', '.join(sorted(ALLOWED_DOCUMENT_EXTENSIONS))}"
        )

    contents = await file.read()
    size_bytes = len(contents)
    if size_bytes == 0:
        raise HTTPException(status_code=400, detail="Cannot upload empty file.")
    if size_bytes > MAX_DOCUMENT_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File exceeds maximum allowed size of {MAX_DOCUMENT_SIZE_BYTES // (1024 * 1024)}MB.")

    file_size_kb = round(size_bytes / 1024.0, 1)
    doc_id = f"DOC-{uuid.uuid4().hex[:6].upper()}"

    # Generate secure stored filename to prevent directory traversal
    safe_storage_name = re.sub(r'[^a-zA-Z0-9._-]', '_', safe_filename)
    stored_filename = f"{doc_id}_{safe_storage_name}"
    stored_path = os.path.join(UPLOAD_DIR, stored_filename)

    with open(stored_path, "wb") as f:
        f.write(contents)

    doc = models.ShipmentDocument(
        id=doc_id,
        shipment_id=shipment_id,
        uploaded_by=current_user.id,
        file_name=safe_filename,
        file_type=actual_type,
        file_size_kb=file_size_kb,
        uploaded_at=datetime.datetime.utcnow().isoformat()
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@app.get("/api/shipments/{shipment_id}/documents/{document_id}/download")
def download_shipment_document(
    shipment_id: str,
    document_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    auth.verify_shipment_access(shipment, current_user)

    doc = db.query(models.ShipmentDocument).filter(
        models.ShipmentDocument.id == document_id,
        models.ShipmentDocument.shipment_id == shipment_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document record not found")

    target_file = None
    if os.path.exists(UPLOAD_DIR):
        for fname in os.listdir(UPLOAD_DIR):
            if fname.startswith(f"{document_id}_"):
                target_file = os.path.join(UPLOAD_DIR, fname)
                break

    if not target_file or not os.path.exists(target_file):
        safe_fallback_name = re.sub(r'[^a-zA-Z0-9._-]', '_', doc.file_name)
        fallback_path = os.path.join(UPLOAD_DIR, f"{document_id}_{safe_fallback_name}")
        with open(fallback_path, "wb") as f:
            f.write(f"PolarLogix Expedition Document\nID: {doc.id}\nFile: {doc.file_name}\nType: {doc.file_type}\nUploaded At: {doc.uploaded_at}\n".encode("utf-8"))
        target_file = fallback_path

    return FileResponse(
        path=target_file,
        filename=doc.file_name,
        media_type="application/octet-stream"
    )

# -------------------------------------------------------------
# INVENTORY ENDPOINTS (Strict Station Scoping)
# -------------------------------------------------------------
@app.get("/api/inventory", response_model=List[schemas.InventoryResponse])
def get_inventory(
    location_id: Optional[str] = Query(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.InventoryItem).options(joinedload(models.InventoryItem.location))

    # Station Commander authorization check
    if current_user.role == "station_commander":
        stn = current_user.linked_station_id
        if location_id and location_id != stn:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Station commander only has access to station '{stn}', not '{location_id}'."
            )
        query = query.filter(models.InventoryItem.location_id == stn)
    elif current_user.role == "personnel":
        stn = current_user.linked_station_id
        query = query.filter(models.InventoryItem.location_id == stn)
    elif location_id:
        query = query.filter(models.InventoryItem.location_id == location_id)

    return query.all()

@app.post("/api/inventory/{location_id}", response_model=schemas.InventoryResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_inventory(
    location_id: str,
    payload: schemas.InventoryCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    auth.verify_station_access(location_id, current_user)

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

@app.patch("/api/inventory/{item_id}", response_model=schemas.InventoryResponse)
def update_inventory_item(
    item_id: str,
    payload: schemas.InventoryUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(models.InventoryItem).options(
        joinedload(models.InventoryItem.location)
    ).filter(models.InventoryItem.id == item_id).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory item '{item_id}' not found"
        )

    if current_user.role not in ["admin", "station_commander"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Role '{current_user.role}' is not authorized to edit inventory items."
        )

    auth.verify_station_access(item.location_id, current_user)

    if payload.quantity is not None:
        item.quantity = payload.quantity
    if payload.minimum_threshold is not None:
        item.minimum_threshold = payload.minimum_threshold
    if payload.item_name is not None:
        item.item_name = payload.item_name
    if payload.category is not None:
        item.category = payload.category
    if payload.unit is not None:
        item.unit = payload.unit

    db.commit()
    db.refresh(item)
    return item

@app.delete("/api/inventory/{item_id}")
def delete_inventory_item(
    item_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory item '{item_id}' not found"
        )

    if current_user.role not in ["admin", "station_commander"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Role '{current_user.role}' is not authorized to delete inventory items."
        )

    auth.verify_station_access(item.location_id, current_user)

    db.delete(item)
    db.commit()
    return {"message": "Inventory item deleted successfully", "id": item_id}

# -------------------------------------------------------------
# PERSONNEL & WORK STATUS ENDPOINTS (Strict Personnel Scoping)
# -------------------------------------------------------------
@app.get("/api/personnel", response_model=List[schemas.PersonnelResponse])
def get_personnel(
    station: Optional[str] = Query(None),
    season: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    institution: Optional[str] = Query(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Personnel).options(joinedload(models.Personnel.work_logs))

    # Scoping by Role
    if current_user.role == "station_commander":
        stn = current_user.linked_station_id
        target_name = "Bharati" if stn == "LOC-BHA" else "Maitri"
        if station and target_name not in station:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Station commander cannot query personnel of other stations ({station})."
            )
        query = query.filter(models.Personnel.assigned_station.ilike(f"%{target_name}%"))
    elif current_user.role == "personnel":
        query = query.filter(models.Personnel.id == current_user.linked_personnel_id)
    elif station:
        query = query.filter(models.Personnel.assigned_station.ilike(f"%{station}%"))

    if season:
        query = query.filter(models.Personnel.season_type == season)
    if category:
        query = query.filter(models.Personnel.personnel_category == category)
    if institution:
        query = query.filter(models.Personnel.affiliated_institution.ilike(f"%{institution}%"))

    return query.all()

@app.get("/api/personnel/{personnel_id}", response_model=schemas.PersonnelResponse)
def get_personnel_detail(
    personnel_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce strict server-side ownership (403 Forbidden if personnel attempts to read another personnel's profile)
    auth.verify_personnel_access(personnel_id, current_user, db)

    personnel = db.query(models.Personnel).options(
        joinedload(models.Personnel.work_logs)
    ).filter(models.Personnel.id == personnel_id).first()
    if not personnel:
        raise HTTPException(status_code=404, detail="Personnel record not found")
    return personnel

@app.get("/api/personnel/me/profile", response_model=schemas.PersonnelResponse)
def get_my_personnel_profile(
    current_user: models.User = Depends(auth.require_roles("personnel", "station_commander")),
    db: Session = Depends(get_db)
):
    per_id = current_user.linked_personnel_id
    if not per_id:
        raise HTTPException(status_code=404, detail="No personnel record linked to this account")
    
    personnel = db.query(models.Personnel).options(
        joinedload(models.Personnel.work_logs)
    ).filter(models.Personnel.id == per_id).first()
    if not personnel:
        raise HTTPException(status_code=404, detail="Linked personnel record not found")
    return personnel

@app.post("/api/personnel/me/work-status", response_model=schemas.PersonnelWorkLogResponse, status_code=status.HTTP_201_CREATED)
def post_work_status(
    payload: schemas.PersonnelWorkLogCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    per_id = current_user.linked_personnel_id or "PER-001"
    work_id = f"WRK-{uuid.uuid4().hex[:6].upper()}"
    work_entry = models.PersonnelWorkLog(
        id=work_id,
        personnel_id=per_id,
        user_id=current_user.id,
        status_text=payload.status_text,
        task_category=payload.task_category or "Station Operations",
        logged_at=datetime.datetime.utcnow().isoformat()
    )
    db.add(work_entry)
    db.commit()
    db.refresh(work_entry)
    return work_entry

@app.post("/api/personnel", response_model=schemas.PersonnelResponse, status_code=status.HTTP_201_CREATED)
def create_personnel(
    payload: schemas.PersonnelCreate,
    current_user: models.User = Depends(auth.require_roles("admin", "station_commander")),
    db: Session = Depends(get_db)
):
    per_id = f"PER-{uuid.uuid4().hex[:5].upper()}"
    new_per = models.Personnel(
        id=per_id,
        name=payload.name,
        role=payload.role,
        affiliated_institution=payload.affiliated_institution or "NCPOR",
        personnel_category=payload.personnel_category or "permanent_staff",
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

# -------------------------------------------------------------
# CONNECTED EMERGENCY SYSTEM (Single Source of Truth)
# -------------------------------------------------------------
@app.get("/api/emergencies", response_model=List[schemas.EmergencyResponse])
def get_emergencies(
    status: Optional[str] = Query(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.EmergencyEvent).options(
        joinedload(models.EmergencyEvent.station),
        joinedload(models.EmergencyEvent.shipment),
        joinedload(models.EmergencyEvent.reporter)
    )

    if status:
        query = query.filter(models.EmergencyEvent.status == status)

    all_emergencies = query.order_by(models.EmergencyEvent.reported_at.desc()).all()

    # Super Admin sees ALL emergencies
    if current_user.role == "admin":
        return all_emergencies

    # Station Commander: sees emergencies tied to their station OR shipments headed to their station
    if current_user.role == "station_commander":
        stn = current_user.linked_station_id
        filtered = []
        for emg in all_emergencies:
            if emg.station_id == stn:
                filtered.append(emg)
            elif emg.shipment and (emg.shipment.destination_id == stn or emg.shipment.origin_id == stn):
                filtered.append(emg)
        return filtered

    # Shipment Officer: sees emergencies tied to their assigned shipments OR reported by them
    if current_user.role == "shipment_officer":
        filtered = []
        for emg in all_emergencies:
            if emg.reported_by_user_id == current_user.id:
                filtered.append(emg)
            elif emg.shipment and emg.shipment.assigned_officer_id == current_user.id:
                filtered.append(emg)
        return filtered

    # Personnel: sees emergencies at their station OR reported by them
    if current_user.role == "personnel":
        stn = current_user.linked_station_id
        filtered = []
        for emg in all_emergencies:
            if emg.reported_by_user_id == current_user.id:
                filtered.append(emg)
            elif emg.station_id == stn:
                filtered.append(emg)
        return filtered

    return all_emergencies

@app.post("/api/emergencies", response_model=schemas.EmergencyResponse, status_code=status.HTTP_201_CREATED)
def create_emergency(
    payload: schemas.EmergencyCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    emg_id = f"EMG-{datetime.datetime.utcnow().strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"
    now_str = datetime.datetime.utcnow().isoformat()

    # Default station association if personnel or commander
    station_id = payload.station_id
    if not station_id and current_user.linked_station_id:
        station_id = current_user.linked_station_id

    # If tied to a shipment, deduce destination station if station_id is empty
    if payload.shipment_id and not station_id:
        shp = db.query(models.CargoShipment).filter(models.CargoShipment.id == payload.shipment_id).first()
        if shp:
            station_id = shp.destination_id

    new_emg = models.EmergencyEvent(
        id=emg_id,
        station_id=station_id,
        shipment_id=payload.shipment_id,
        reported_by_user_id=current_user.id,
        reported_by_role=current_user.role,
        event_type=payload.event_type,
        severity=payload.severity,
        description=payload.description,
        reported_at=now_str,
        status="open",
        response_log=f"{now_str[:16].replace('T', ' ')}: Emergency incident reported by {current_user.username} ({current_user.role})."
    )
    db.add(new_emg)
    db.commit()
    db.refresh(new_emg)
    return new_emg

@app.patch("/api/emergencies/{emergency_id}", response_model=schemas.EmergencyResponse)
def update_emergency(
    emergency_id: str,
    payload: schemas.EmergencyUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    emg = db.query(models.EmergencyEvent).filter(models.EmergencyEvent.id == emergency_id).first()
    if not emg:
        raise HTTPException(status_code=404, detail="Emergency event not found")

    if payload.status:
        emg.status = payload.status
    if payload.response_log:
        now_stamp = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M')
        emg.response_log = f"{emg.response_log}\n{now_stamp} ({current_user.username}): {payload.response_log}"

    db.commit()
    db.refresh(emg)
    return emg
