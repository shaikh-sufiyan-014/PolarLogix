from sqlalchemy import Column, String, Float, Boolean, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # depot, transfer, station
    current_season = Column(String, default="summer") # summer, winter
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    code = Column(String, nullable=False)

class TransportLeg(Base):
    __tablename__ = "transport_legs"

    id = Column(String, primary_key=True, index=True)
    origin_id = Column(String, ForeignKey("locations.id"), nullable=False)
    destination_id = Column(String, ForeignKey("locations.id"), nullable=False)
    mode = Column(String, nullable=False) # ship, aircraft, helicopter, cargo_flight
    duration_days = Column(Integer, nullable=False)
    capacity_kg = Column(Float, nullable=False)
    hazmat_allowed = Column(Boolean, default=True)
    available_months = Column(String, nullable=False) # JSON array e.g. "[11,12,1,2,3]"

    origin = relationship("Location", foreign_keys=[origin_id])
    destination = relationship("Location", foreign_keys=[destination_id])

class CargoShipment(Base):
    __tablename__ = "cargo_shipments"

    id = Column(String, primary_key=True, index=True)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False) # food, fuel, scientific equipment, spare parts, hazmat, personal effects
    weight_kg = Column(Float, nullable=False)
    is_hazmat = Column(Boolean, default=False)
    origin_id = Column(String, ForeignKey("locations.id"), nullable=False)
    destination_id = Column(String, ForeignKey("locations.id"), nullable=False)
    current_location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    current_leg_id = Column(String, ForeignKey("transport_legs.id"), nullable=True)
    status = Column(String, default="planned") # planned, in_transit, at_transfer_point, delivered, on_hold
    box_label = Column(String, default="1 of 1")
    created_at = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())
    eta = Column(String, nullable=True)
    computed_route_json = Column(Text, nullable=True) # Stored JSON path string

    origin = relationship("Location", foreign_keys=[origin_id])
    destination = relationship("Location", foreign_keys=[destination_id])
    current_location = relationship("Location", foreign_keys=[current_location_id])
    current_leg = relationship("TransportLeg", foreign_keys=[current_leg_id])

class Personnel(Base):
    __tablename__ = "personnel"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    assigned_station = Column(String, nullable=False) # Maitri Station, Bharati Station, Cape Town, Goa Depot
    season_type = Column(String, nullable=False) # summer, winter
    deployment_start = Column(String, nullable=False)
    deployment_end = Column(String, nullable=False)
    current_status = Column(String, default="deployed") # in_transit, deployed, returned

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(String, primary_key=True, index=True)
    location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    item_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    minimum_threshold = Column(Float, nullable=False)

    location = relationship("Location")

class EmergencyEvent(Base):
    __tablename__ = "emergency_events"

    id = Column(String, primary_key=True, index=True)
    station_id = Column(String, ForeignKey("locations.id"), nullable=False)
    event_type = Column(String, nullable=False)
    severity = Column(String, nullable=False) # low, medium, high, critical
    description = Column(String, nullable=False)
    reported_at = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())
    status = Column(String, default="open") # open, resolved
    response_log = Column(Text, default="")

    station = relationship("Location")
