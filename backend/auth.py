import os
import time
import datetime
from typing import Optional, List, Dict
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
import models

# Secret key from environment variable with secure fallback for dev
SECRET_KEY = os.getenv("POLARLOGIX_SECRET_KEY", "polarlogix-antarctica-secure-jwt-key-2026-ncpor")
ALGORITHM = "HS256"

# In-memory rate limiting for login attempts
# Stores username -> list of timestamp floats
_failed_attempts: Dict[str, List[float]] = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_WINDOW_SECONDS = 300 # 5 minutes

security = HTTPBearer(auto_error=False)

def check_rate_limit(username: str) -> None:
    now = time.time()
    clean_username = username.strip().lower()
    attempts = _failed_attempts.get(clean_username, [])
    # Keep only attempts within the window
    recent_attempts = [t for t in attempts if now - t < LOCKOUT_WINDOW_SECONDS]
    _failed_attempts[clean_username] = recent_attempts

    if len(recent_attempts) >= MAX_FAILED_ATTEMPTS:
        remaining_wait = int(LOCKOUT_WINDOW_SECONDS - (now - recent_attempts[0]))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked due to {MAX_FAILED_ATTEMPTS} consecutive failed attempts. Please retry in {max(1, remaining_wait)} seconds."
        )

def record_failed_attempt(username: str) -> None:
    clean_username = username.strip().lower()
    if clean_username not in _failed_attempts:
        _failed_attempts[clean_username] = []
    _failed_attempts[clean_username].append(time.time())

def reset_failed_attempts(username: str) -> None:
    clean_username = username.strip().lower()
    if clean_username in _failed_attempts:
        del _failed_attempts[clean_username]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    # Long-lived token for prototype (1 year)
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=365)
    to_encode.update({"exp": expire, "iat": datetime.datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )

def get_current_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    if not auth_header or not auth_header.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = auth_header.credentials
    payload = decode_token(token)
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user

def require_roles(*allowed_roles: str):
    def role_checker(current_user: models.User = Depends(get_current_user)) -> models.User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Role '{current_user.role}' is not authorized to access this resource."
            )
        return current_user
    return role_checker

# Authorization helpers for resource ownership
def verify_station_access(station_id: str, user: models.User) -> bool:
    if user.role == "admin":
        return True
    if user.role == "station_commander":
        if user.linked_station_id == station_id:
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: You only have access to station '{user.linked_station_id}', not '{station_id}'."
        )
    if user.role == "personnel":
        if user.linked_station_id == station_id:
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Station access restricted."
        )
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: Station access not authorized."
    )

def verify_shipment_access(shipment: models.CargoShipment, user: models.User) -> bool:
    if user.role == "admin":
        return True
    if user.role == "shipment_officer":
        if shipment.assigned_officer_id == user.id:
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Shipment '{shipment.id}' is not assigned to officer '{user.username}'."
        )
    if user.role == "station_commander":
        if shipment.destination_id == user.linked_station_id or shipment.origin_id == user.linked_station_id:
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Shipment '{shipment.id}' is not bound for or originating from your station."
        )
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: You do not have permission to access this shipment."
    )

def verify_personnel_access(target_personnel_id: str, user: models.User, db: Session) -> bool:
    if user.role == "admin":
        return True
    if user.role == "personnel":
        if user.linked_personnel_id == target_personnel_id:
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Personnel token '{user.linked_personnel_id}' cannot access personnel record '{target_personnel_id}'."
        )
    if user.role == "station_commander":
        target = db.query(models.Personnel).filter(models.Personnel.id == target_personnel_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Personnel record not found")
        
        # Check matching station
        station = db.query(models.Location).filter(models.Location.id == user.linked_station_id).first()
        station_name = station.name if station else ""
        if station_name and (station_name in target.assigned_station or target.assigned_station in station_name or (user.linked_station_id == "LOC-BHA" and "Bharati" in target.assigned_station) or (user.linked_station_id == "LOC-MAI" and "Maitri" in target.assigned_station)):
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This personnel member is assigned to a different station."
        )
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: Unauthorized to view this personnel record."
    )
