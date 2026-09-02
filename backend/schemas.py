from pydantic import BaseModel, Field
from typing import List, Optional, Any

class LocationBase(BaseModel):
    id: str
    name: str
    type: str
    current_season: str
    latitude: float
    longitude: float
    code: str

    class Config:
        from_attributes = True

class TransportLegBase(BaseModel):
    id: str
    origin_id: str
    destination_id: str
    mode: str
    duration_days: int
    capacity_kg: float
    hazmat_allowed: bool
    available_months: str

    class Config:
        from_attributes = True

class ShipmentCreate(BaseModel):
    description: str
    category: str
    weight_kg: float
    is_hazmat: bool = False
    origin_id: str
    destination_id: str
    box_label: Optional[str] = "1 of 1"
    target_month: Optional[int] = 1 # Default January

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
    status: str
    box_label: str
    created_at: str
    eta: Optional[str] = None
    computed_route_json: Optional[str] = None
    
    # Expanded relationships for full detail
    origin: Optional[LocationBase] = None
    destination: Optional[LocationBase] = None
    current_location: Optional[LocationBase] = None

    class Config:
        from_attributes = True

class PersonnelCreate(BaseModel):
    name: str
    role: str
    assigned_station: str
    season_type: str
    deployment_start: str
    deployment_end: str
    current_status: str = "deployed"

class PersonnelResponse(PersonnelCreate):
    id: str

    class Config:
        from_attributes = True

class InventoryCreate(BaseModel):
    location_id: str
    item_name: str
    category: str
    quantity: float
    unit: str
    minimum_threshold: float

class InventoryResponse(InventoryCreate):
    id: str
    location: Optional[LocationBase] = None

    class Config:
        from_attributes = True

class EmergencyCreate(BaseModel):
    station_id: str
    event_type: str
    severity: str
    description: str

class EmergencyUpdate(BaseModel):
    status: Optional[str] = None
    response_log: Optional[str] = None

class EmergencyResponse(BaseModel):
    id: str
    station_id: str
    event_type: str
    severity: str
    description: str
    reported_at: str
    status: str
    response_log: Optional[str] = None
    station: Optional[LocationBase] = None

    class Config:
        from_attributes = True
