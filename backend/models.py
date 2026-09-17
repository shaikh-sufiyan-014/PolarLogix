from sqlalchemy import Column, String, Float, Boolean, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # admin, station_commander, shipment_officer, personnel
    linked_station_id = Column(String, ForeignKey("locations.id"), nullable=True)
    linked_personnel_id = Column(String, ForeignKey("personnel.id"), nullable=True)
    created_at = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())

    linked_station = relationship("Location", foreign_keys=[linked_station_id])
    linked_personnel = relationship("Personnel", foreign_keys=[linked_personnel_id])

class Location(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # depot, transfer, station
    region = Column(String, default="antarctic") # antarctic, arctic, himalayan, transit_hub, depot
    programme = Column(String, default="antarctic_programme") # antarctic_programme, arctic_programme, himalayan_programme
    current_season = Column(String, default="summer") # summer, winter
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    code = Column(String, nullable=False)
    established_year = Column(Integer, nullable=True)
    is_international_research_base = Column(Boolean, default=False)
    capacity_summer = Column(Integer, nullable=True)
    capacity_winter = Column(Integer, nullable=True)
    capacity_note = Column(String, nullable=True)
    distance_from_ship_access_km = Column(Float, nullable=True)
    requires_overland_transfer = Column(Boolean, default=False)
    research_areas = Column(Text, nullable=True)

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
    average_speed_knots = Column(Float, nullable=True)
    distance_nm = Column(Float, nullable=True)
    waypoints_json = Column(Text, nullable=True) # Stored JSON string of [[lat, lng], ...] coordinates

    origin = relationship("Location", foreign_keys=[origin_id])
    destination = relationship("Location", foreign_keys=[destination_id])

class CargoShipment(Base):
    __tablename__ = "cargo_shipments"

    id = Column(String, primary_key=True, index=True)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False) # food, fuel, scientific_equipment, spare_parts, hazmat, personal_effects
    weight_kg = Column(Float, nullable=False)
    is_hazmat = Column(Boolean, default=False)
    origin_id = Column(String, ForeignKey("locations.id"), nullable=False)
    destination_id = Column(String, ForeignKey("locations.id"), nullable=False)
    current_location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    current_leg_id = Column(String, ForeignKey("transport_legs.id"), nullable=True)
    assigned_officer_id = Column(String, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="planned") # planned, in_transit, at_transfer_point, delivered, on_hold
    box_label = Column(String, default="1 of 1")
    created_at = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())
    eta = Column(String, nullable=True)
    computed_route_json = Column(Text, nullable=True) # Stored JSON path string

    origin = relationship("Location", foreign_keys=[origin_id])
    destination = relationship("Location", foreign_keys=[destination_id])
    current_location = relationship("Location", foreign_keys=[current_location_id])
    current_leg = relationship("TransportLeg", foreign_keys=[current_leg_id])
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id])

    consumables = relationship("VoyageConsumable", back_populates="shipment", cascade="all, delete-orphan")
    handover_confirmations = relationship("HandoverConfirmation", back_populates="shipment", cascade="all, delete-orphan")
    weather_logs = relationship("WeatherLog", back_populates="shipment", cascade="all, delete-orphan")
    documents = relationship("ShipmentDocument", back_populates="shipment", cascade="all, delete-orphan")

class VoyageConsumable(Base):
    __tablename__ = "voyage_consumables"

    id = Column(String, primary_key=True, index=True)
    shipment_id = Column(String, ForeignKey("cargo_shipments.id"), nullable=False)
    item_name = Column(String, nullable=False) # Marine Fuel, Freeze-Dried Food, Potable Water, Medical Kits
    unit = Column(String, nullable=False) # liters, kg, units
    starting_quantity = Column(Float, nullable=False)
    current_quantity = Column(Float, nullable=False)
    daily_consumption_rate = Column(Float, default=15.0)

    shipment = relationship("CargoShipment", back_populates="consumables")

class HandoverConfirmation(Base):
    __tablename__ = "handover_confirmations"

    id = Column(String, primary_key=True, index=True)
    shipment_id = Column(String, ForeignKey("cargo_shipments.id"), nullable=False)
    leg_id = Column(String, nullable=True)
    location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    confirmed_by = Column(String, ForeignKey("users.id"), nullable=False)
    confirmation_type = Column(String, nullable=False) # received, handed_off
    notes = Column(Text, default="")
    confirmed_at = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())

    shipment = relationship("CargoShipment", back_populates="handover_confirmations")
    location = relationship("Location")
    user = relationship("User")

class WeatherLog(Base):
    __tablename__ = "weather_logs"

    id = Column(String, primary_key=True, index=True)
    shipment_id = Column(String, ForeignKey("cargo_shipments.id"), nullable=False)
    logged_by = Column(String, ForeignKey("users.id"), nullable=False)
    condition = Column(String, nullable=False) # e.g. "Blizzard Warning", "Calm Seas", "Pack Ice Formation"
    note = Column(Text, default="")
    temperature_c = Column(Float, nullable=True)
    wind_speed_knots = Column(Float, nullable=True)
    logged_at = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())

    shipment = relationship("CargoShipment", back_populates="weather_logs")
    user = relationship("User")

class ShipmentDocument(Base):
    __tablename__ = "shipment_documents"

    id = Column(String, primary_key=True, index=True)
    shipment_id = Column(String, ForeignKey("cargo_shipments.id"), nullable=False)
    uploaded_by = Column(String, ForeignKey("users.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # hazmat_cert, customs_paperwork, packing_manifest, inspection_report
    file_size_kb = Column(Float, default=150.0)
    uploaded_at = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())

    shipment = relationship("CargoShipment", back_populates="documents")
    user = relationship("User")

class Personnel(Base):
    __tablename__ = "personnel"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    affiliated_institution = Column(String, default="NCPOR", nullable=False) # NCPOR, IIT Bombay, CSIR-NIO, GSI, AIIMS, ISRO-SAC
    personnel_category = Column(String, default="permanent_staff", nullable=False) # permanent_staff, project_scientist, contract_specialist, visiting_researcher
    assigned_station = Column(String, nullable=False) # Maitri Research Station, Bharati Research Station, Himadri Arctic Station, Himansh Himalayan Station, Cape Town, Goa Depot
    season_type = Column(String, nullable=False) # summer, winter
    deployment_start = Column(String, nullable=False)
    deployment_end = Column(String, nullable=False)
    current_status = Column(String, default="deployed") # in_transit, deployed, returned

    work_logs = relationship("PersonnelWorkLog", back_populates="personnel", cascade="all, delete-orphan")

class PersonnelWorkLog(Base):
    __tablename__ = "personnel_work_logs"

    id = Column(String, primary_key=True, index=True)
    personnel_id = Column(String, ForeignKey("personnel.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    status_text = Column(String, nullable=False)
    task_category = Column(String, default="Station Operations")
    logged_at = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())

    personnel = relationship("Personnel", back_populates="work_logs")
    user = relationship("User")

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
    station_id = Column(String, ForeignKey("locations.id"), nullable=True)
    shipment_id = Column(String, ForeignKey("cargo_shipments.id"), nullable=True)
    reported_by_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    reported_by_role = Column(String, nullable=True)
    event_type = Column(String, nullable=False)
    severity = Column(String, nullable=False) # low, medium, high, critical
    description = Column(String, nullable=False)
    reported_at = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())
    status = Column(String, default="open") # open, resolved
    response_log = Column(Text, default="")

    station = relationship("Location")
    shipment = relationship("CargoShipment")
    reporter = relationship("User", foreign_keys=[reported_by_user_id])
