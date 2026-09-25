from pydantic import BaseModel, Field
from typing import List, Optional, Any

# ================= AUTH & USER SCHEMAS =================
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserBase(BaseModel):
    username: str
    role: str # admin, station_commander, shipment_officer, personnel
    linked_station_id: Optional[str] = None
    linked_personnel_id: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: str

    class Config:
        from_attributes = True

# ================= LOCATION & TRANSPORT =================
class LocationBase(BaseModel):
    id: str
    name: str
    type: str # depot, transfer, station
    region: Optional[str] = "antarctic" # antarctic, arctic, himalayan, transit_hub, depot
    programme: Optional[str] = "antarctic_programme" # antarctic_programme, arctic_programme, himalayan_programme
    current_season: Optional[str] = "summer"
    latitude: float
    longitude: float
    code: Optional[str] = None
    established_year: Optional[int] = None
    is_international_research_base: Optional[bool] = False
    capacity_summer: Optional[int] = None
    capacity_winter: Optional[int] = None
    capacity_note: Optional[str] = None
    distance_from_ship_access_km: Optional[float] = None
    requires_overland_transfer: Optional[bool] = False
    research_areas: Optional[str] = None

    class Config:
        from_attributes = True

class WaypointCoord(BaseModel):
    lat: float
    lng: float
    name: Optional[str] = None

class TransportLegBase(BaseModel):
    id: str
    origin_id: str
    destination_id: str
    mode: str
    duration_days: int
    capacity_kg: float
    hazmat_allowed: bool
    available_months: str
    average_speed_knots: Optional[float] = None
    distance_nm: Optional[float] = None
    waypoints_json: Optional[str] = None

    class Config:
        from_attributes = True

# ================= WEATHER & ROUTE EVALUATION =================
class WaypointWeatherStatus(BaseModel):
    name: str
    lat: float
    lng: float
    wave_height_m: Optional[float] = None
    wind_speed_knots: Optional[float] = None
    status: str # "safe", "adverse", "unavailable"
    details: str

class WeatherAdvisory(BaseModel):
    adverse_weather_detected: bool
    methodology: str = "algorithmic weather threshold check using live marine data"
    thresholds: dict
    warnings: List[str]
    suggested_action: Optional[str] = None
    suggested_delay_days: Optional[int] = None
    waypoints: List[WaypointWeatherStatus]

# ================= SHIPMENT & SUB-RESOURCES =================
class VoyageConsumableBase(BaseModel):
    id: str
    item_name: str
    unit: str
    starting_quantity: float
    current_quantity: float
    daily_consumption_rate: float

    class Config:
        from_attributes = True

class VoyageConsumableUpdate(BaseModel):
    current_quantity: float

class HandoverConfirmationCreate(BaseModel):
    leg_id: Optional[str] = None
    location_id: str
    confirmation_type: str # received, handed_off
    notes: Optional[str] = ""

class HandoverConfirmationResponse(BaseModel):
    id: str
    shipment_id: str
    leg_id: Optional[str] = None
    location_id: str
    confirmed_by: str
    confirmation_type: str
    notes: Optional[str] = ""
    confirmed_at: str
    user: Optional[UserResponse] = None
    location: Optional[LocationBase] = None

    class Config:
        from_attributes = True

class WeatherLogCreate(BaseModel):
    condition: str
    note: Optional[str] = ""
    temperature_c: Optional[float] = None
    wind_speed_knots: Optional[float] = None

class WeatherLogUpdate(BaseModel):
    condition: Optional[str] = None
    note: Optional[str] = None
    temperature_c: Optional[float] = None
    wind_speed_knots: Optional[float] = None

class WeatherLogResponse(BaseModel):
    id: str
    shipment_id: str
    logged_by: str
    condition: str
    note: Optional[str] = ""
    temperature_c: Optional[float] = None
    wind_speed_knots: Optional[float] = None
    logged_at: str
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ShipmentDocumentCreate(BaseModel):
    file_name: str
    file_type: str
    file_size_kb: Optional[float] = 125.0

class ShipmentDocumentResponse(BaseModel):
    id: str
    shipment_id: str
    uploaded_by: str
    file_name: str
    file_type: str
    file_size_kb: float
    uploaded_at: str
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class AlternateRouteRequest(BaseModel):
    issue_description: str # e.g. "Severe pack ice on sea corridor", "Gale-force blizzard"
    avoid_mode: Optional[str] = None # e.g. "ship" or "aircraft"

class ShipmentCreate(BaseModel):
    description: str
    category: str
    weight_kg: float
    is_hazmat: bool = False
    origin_id: str
    destination_id: str
    box_label: Optional[str] = "1 of 1"
    target_month: Optional[int] = 1 # Default January
    assigned_officer_id: Optional[str] = None

class ShipmentStatusUpdate(BaseModel):
    status: str
    current_location_id: Optional[str] = None
    current_leg_id: Optional[str] = None

class ShipmentResponse(BaseModel):
    id: str
    description: str
    category: str
    weight_kg: float
    is_hazmat: bool
    origin_id: str
    destination_id: str
    current_location_id: str
    current_leg_id: Optional[str] = None
    assigned_officer_id: Optional[str] = None
    status: str
    box_label: str
    created_at: str
    eta: Optional[str] = None
    computed_route_json: Optional[str] = None
    
    # Expanded relationships for full detail
    origin: Optional[LocationBase] = None
    destination: Optional[LocationBase] = None
    current_location: Optional[LocationBase] = None
    assigned_officer: Optional[UserResponse] = None
    consumables: Optional[List[VoyageConsumableBase]] = []
    handover_confirmations: Optional[List[HandoverConfirmationResponse]] = []
    weather_logs: Optional[List[WeatherLogResponse]] = []
    documents: Optional[List[ShipmentDocumentResponse]] = []

    class Config:
        from_attributes = True

# ================= PERSONNEL & WORK STATUS =================
class PersonnelWorkLogCreate(BaseModel):
    status_text: str
    task_category: Optional[str] = "Station Operations"

class PersonnelWorkLogResponse(BaseModel):
    id: str
    personnel_id: str
    user_id: str
    status_text: str
    task_category: str
    logged_at: str
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class PersonnelCreate(BaseModel):
    name: str
    role: str
    affiliated_institution: Optional[str] = "NCPOR"
    personnel_category: Optional[str] = "permanent_staff" # permanent_staff, project_scientist, contract_specialist, visiting_researcher
    assigned_station: str
    season_type: str
    deployment_start: str
    deployment_end: str
    current_status: str = "deployed"

class PersonnelResponse(PersonnelCreate):
    id: str
    work_logs: Optional[List[PersonnelWorkLogResponse]] = []

    class Config:
        from_attributes = True

class PersonnelUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    affiliated_institution: Optional[str] = None
    personnel_category: Optional[str] = None
    assigned_station: Optional[str] = None
    season_type: Optional[str] = None
    deployment_start: Optional[str] = None
    deployment_end: Optional[str] = None
    current_status: Optional[str] = None

# ================= INVENTORY =================
class InventoryCreate(BaseModel):
    location_id: str
    item_name: str
    category: str
    quantity: float
    unit: str
    minimum_threshold: float

class InventoryUpdate(BaseModel):
    quantity: Optional[float] = None
    minimum_threshold: Optional[float] = None
    item_name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None

class InventoryResponse(InventoryCreate):
    id: str
    location: Optional[LocationBase] = None

    class Config:
        from_attributes = True

# ================= EMERGENCY =================
class EmergencyCreate(BaseModel):
    station_id: Optional[str] = None
    shipment_id: Optional[str] = None
    event_type: str
    severity: str # low, medium, high, critical
    description: str

class EmergencyUpdate(BaseModel):
    event_type: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None
    station_id: Optional[str] = None
    status: Optional[str] = None
    response_log: Optional[str] = None

class EmergencyResponse(BaseModel):
    id: str
    station_id: Optional[str] = None
    shipment_id: Optional[str] = None
    reported_by_user_id: Optional[str] = None
    reported_by_role: Optional[str] = None
    event_type: str
    severity: str
    description: str
    reported_at: str
    status: str
    response_log: Optional[str] = None
    station: Optional[LocationBase] = None
    shipment: Optional[ShipmentResponse] = None
    reporter: Optional[UserResponse] = None

    class Config:
        from_attributes = True
