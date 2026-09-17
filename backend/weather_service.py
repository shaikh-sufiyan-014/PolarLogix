import os
import json
import logging
import datetime
from typing import Dict, Any, List, Optional
import requests

logger = logging.getLogger("weather_service")

# Path to weather thresholds file
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
THRESHOLDS_FILE = os.path.join(DATA_DIR, "weather_thresholds.json")

def load_weather_thresholds() -> Dict[str, float]:
    """Loads max safe wave height and wind speed thresholds from JSON configuration."""
    if os.path.exists(THRESHOLDS_FILE):
        try:
            with open(THRESHOLDS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {
                    "max_safe_wave_height_m": float(data.get("max_safe_wave_height_m", 4.0)),
                    "max_safe_wind_speed_knots": float(data.get("max_safe_wind_speed_knots", 35.0))
                }
        except Exception as e:
            logger.warning(f"Failed to load weather thresholds from {THRESHOLDS_FILE}: {e}")
    
    # Standard NCPOR maritime safety defaults
    return {
        "max_safe_wave_height_m": 4.0,
        "max_safe_wind_speed_knots": 35.0
    }

def get_marine_conditions(latitude: float, longitude: float, timeout_sec: float = 8.0) -> Dict[str, Any]:
    """
    Calls Open-Meteo Marine Weather API using Python's requests library and returns
    the CURRENT / nearest hourly wave_height and wind_wave_height values (in meters)
    as well as wind speed in knots for that exact coordinate.

    If the API call fails (network issue, API down, non-200), the system will NOT crash
    or silently skip the check; it returns a clear error message.
    """
    lat = float(latitude)
    lon = float(longitude)
    wave_height_m = None
    wind_wave_height_m = None
    wind_speed_knots = None
    fetched_time = None

    # 1. Open-Meteo Marine API request with hourly and current wave parameters
    marine_url = (
        f"https://marine-api.open-meteo.com/v1/marine"
        f"?latitude={lat:.4f}&longitude={lon:.4f}"
        f"&current=wave_height,wind_wave_height"
        f"&hourly=wave_height,wind_wave_height"
    )
    print(f"[WEATHER API CALL] Requesting: {marine_url}", flush=True)

    try:
        resp = requests.get(marine_url, timeout=timeout_sec)
        print(f"[WEATHER API RESPONSE] Status: {resp.status_code}, Data: {resp.text}", flush=True)
        if resp.status_code == 200:
            data = resp.json()
            
            # Check current field first
            current = data.get("current", {})
            if current and current.get("wave_height") is not None:
                wave_height_m = round(float(current["wave_height"]), 2)
                wind_wave_height_m = round(float(current.get("wind_wave_height", 0.0) or 0.0), 2)
                fetched_time = current.get("time")
            else:
                # Fallback to nearest hourly slot
                hourly = data.get("hourly", {})
                times = hourly.get("time", [])
                waves = hourly.get("wave_height", [])
                wind_waves = hourly.get("wind_wave_height", [])
                if waves and len(waves) > 0:
                    for i in range(len(waves)):
                        if waves[i] is not None:
                            wave_height_m = round(float(waves[i]), 2)
                            wind_wave_height_m = round(float(wind_waves[i] or 0.0), 2) if i < len(wind_waves) else 0.0
                            fetched_time = times[i] if i < len(times) else None
                            break
        else:
            logger.warning(f"Open-Meteo Marine API returned status {resp.status_code} for ({lat},{lon})")

    except Exception as e:
        print(f"[WEATHER API ERROR] Marine API request failed for ({lat},{lon}): {e}", flush=True)
        logger.warning(f"Open-Meteo Marine API request failed for ({lat},{lon}): {e}")

    # 2. Open-Meteo Forecast API request for wind speed in KNOTS
    forecast_url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat:.4f}&longitude={lon:.4f}"
        f"&current=wind_speed_10m"
        f"&wind_speed_unit=kn"
    )
    print(f"[WEATHER API CALL] Requesting: {forecast_url}", flush=True)

    try:
        resp_f = requests.get(forecast_url, timeout=timeout_sec)
        print(f"[WEATHER API RESPONSE] Status: {resp_f.status_code}, Data: {resp_f.text}", flush=True)
        if resp_f.status_code == 200:
            f_data = resp_f.json()
            f_curr = f_data.get("current", {})
            if f_curr and f_curr.get("wind_speed_10m") is not None:
                wind_speed_knots = round(float(f_curr["wind_speed_10m"]), 1)
    except Exception as e:
        print(f"[WEATHER API ERROR] Forecast API request failed for ({lat},{lon}): {e}", flush=True)
        logger.warning(f"Open-Meteo Forecast API request failed for ({lat},{lon}): {e}")

    is_available = (wave_height_m is not None)

    if not is_available:
        return {
            "available": False,
            "latitude": lat,
            "longitude": lon,
            "wave_height_m": None,
            "wind_wave_height_m": None,
            "wind_speed_knots": None,
            "time": None,
            "message": "Unable to fetch live weather data, proceeding without weather verification"
        }

    return {
        "available": True,
        "latitude": lat,
        "longitude": lon,
        "wave_height_m": wave_height_m,
        "wind_wave_height_m": wind_wave_height_m,
        "wind_speed_knots": wind_speed_knots,
        "time": fetched_time,
        "message": f"Live marine conditions: wave height {wave_height_m}m, wind wave {wind_wave_height_m}m"
    }

def evaluate_waypoints_weather(
    waypoints: List[Dict[str, Any]],
    thresholds: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Evaluates marine weather conditions at key waypoints along a sea route against safe thresholds.
    Flags adverse weather and recommends suggested departure delay (advisory only).
    """
    if thresholds is None:
        thresholds = load_weather_thresholds()

    max_wave = thresholds.get("max_safe_wave_height_m", 4.0)
    max_wind = thresholds.get("max_safe_wind_speed_knots", 35.0)

    evaluated_points = []
    adverse_warnings = []
    unavailable_warnings = []

    print(f"\n[WEATHER EVALUATION] Starting live marine evaluation for {len(waypoints)} waypoint(s)...", flush=True)

    for pt in waypoints:
        lat = float(pt.get("lat", 0.0))
        lng = float(pt.get("lng", 0.0))
        coord_label = f"Lat {lat:.2f}°, Lon {lng:.2f}°"
        name = pt.get("name", f"Waypoint ({coord_label})")

        print(f"\n[WEATHER EVALUATION] Checking Waypoint: '{name}' at ({lat:.4f}, {lng:.4f})", flush=True)
        live_weather = get_marine_conditions(lat, lng)

        if not live_weather.get("available"):
            status = "unavailable"
            detail = f"Unable to fetch live weather data near [{coord_label}], proceeding without weather verification"
            unavailable_warnings.append(detail)
            print(f"[WEATHER EVALUATION RESULT] Waypoint: '{name}' -> UNAVAILABLE", flush=True)
            evaluated_points.append({
                "name": name,
                "lat": lat,
                "lng": lng,
                "wave_height_m": None,
                "wind_wave_height_m": None,
                "wind_speed_knots": None,
                "status": status,
                "details": detail
            })
            continue

        wave_h = live_weather.get("wave_height_m")
        wind_wave_h = live_weather.get("wind_wave_height_m")
        wind_k = live_weather.get("wind_speed_knots")

        is_adverse = False
        reasons = []

        if wave_h is not None and wave_h > max_wave:
            is_adverse = True
            reasons.append(f"wave height of {wave_h}m exceeds safe threshold of {max_wave}m")

        if wind_k is not None and wind_k > max_wind:
            is_adverse = True
            reasons.append(f"wind speed of {wind_k} kt exceeds safe threshold of {max_wind} kt")

        if is_adverse:
            status = "adverse"
            detail = f"Adverse weather detected near [{coord_label}] — {', and '.join(reasons)}"
            adverse_warnings.append(detail)
            print(f"[WEATHER EVALUATION RESULT] Waypoint: '{name}' -> ADVERSE (Wave: {wave_h}m / Max: {max_wave}m, Wind: {wind_k}kt / Max: {max_wind}kt)", flush=True)
        else:
            status = "safe"
            info_parts = []
            if wave_h is not None:
                info_parts.append(f"wave height {wave_h}m (safe ≤ {max_wave}m)")
            if wind_k is not None:
                info_parts.append(f"wind {wind_k} kt (safe ≤ {max_wind} kt)")
            detail = f"Safe conditions: {', '.join(info_parts)}"
            print(f"[WEATHER EVALUATION RESULT] Waypoint: '{name}' -> SAFE (Wave: {wave_h}m, Wind: {wind_k}kt)", flush=True)

        evaluated_points.append({
            "name": name,
            "lat": lat,
            "lng": lng,
            "wave_height_m": wave_h,
            "wind_wave_height_m": wind_wave_h,
            "wind_speed_knots": wind_k,
            "status": status,
            "details": detail
        })

    has_adverse = len(adverse_warnings) > 0
    all_warnings = adverse_warnings + unavailable_warnings

    suggested_action = None
    suggested_delay_days = None

    if has_adverse:
        suggested_delay_days = 2
        suggested_action = (
            f"Advisory Recommendation: Recommend delaying departure by {suggested_delay_days}-3 days "
            "until sea swell and wave height subside below threshold. This is an operational advisory for shipment officer review."
        )
    elif unavailable_warnings:
        suggested_action = "Advisory: One or more waypoints could not be verified with live weather data. Officer visual confirmation recommended."

    return {
        "adverse_weather_detected": has_adverse,
        "methodology": "Live marine weather check",
        "thresholds": thresholds,
        "warnings": all_warnings,
        "suggested_action": suggested_action,
        "suggested_delay_days": suggested_delay_days,
        "waypoints": evaluated_points
    }
