import pytest
from unittest.mock import patch, MagicMock
import requests
from weather_service import get_marine_conditions, evaluate_waypoints_weather, load_weather_thresholds

def test_live_open_meteo_marine_api_call_near_cape_town():
    """
    LIVE API VERIFICATION TEST:
    Performs an actual successful API call to real coordinate near Cape Town
    (latitude -33.9, longitude 18.4) using requests, confirming live wave_height
    and wind_wave_height values are returned and logged.
    """
    lat, lon = -33.9, 18.4
    conditions = get_marine_conditions(lat, lon)

    print(f"\n[LIVE API RESULT] Coordinate: ({lat}, {lon})")
    print(f"  Available: {conditions['available']}")
    print(f"  Wave Height: {conditions['wave_height_m']} meters")
    print(f"  Wind Wave Height: {conditions['wind_wave_height_m']} meters")
    print(f"  Wind Speed: {conditions['wind_speed_knots']} knots")
    print(f"  Timestamp: {conditions['time']}")

    assert conditions["available"] is True, "Expected live API call to succeed"
    assert conditions["wave_height_m"] is not None
    # Real ocean wave height off Cape Town typically 0.5m to 12.0m
    assert 0.1 <= conditions["wave_height_m"] <= 15.0
    assert conditions["latitude"] == lat
    assert conditions["longitude"] == lon

def test_weather_api_failure_handling_does_not_crash_or_assume_safe():
    """
    FAILURE HANDLING TEST:
    If Open-Meteo API fails (network issue, API down), system must NOT crash or silently skip.
    It returns a clear message: 'Unable to fetch live weather data, proceeding without weather verification'.
    """
    with patch("requests.get", side_effect=requests.exceptions.ConnectTimeout("Connection timed out")):
        conditions = get_marine_conditions(-45.0, 40.0)
        assert conditions["available"] is False
        assert conditions["wave_height_m"] is None
        assert "Unable to fetch live weather data, proceeding without weather verification" in conditions["message"]

        # Waypoint evaluation must gracefully surface warning
        waypoints = [{"lat": -45.0, "lng": 40.0, "name": "Southern Ocean Corridor"}]
        evaluation = evaluate_waypoints_weather(waypoints)

        assert not evaluation["adverse_weather_detected"]
        assert len(evaluation["waypoints"]) == 1
        assert evaluation["waypoints"][0]["status"] == "unavailable"
        assert any("Unable to fetch live weather data" in w for w in evaluation["warnings"])

def test_wave_height_threshold_exceeded_triggers_advisory():
    """
    THRESHOLD EXCEEDED ADVISORY TEST:
    Tests that a wave height exceeding max_safe_wave_height_m flags the route with:
    'Adverse weather detected near [...] — wave height of Xm exceeds safe threshold of Ym'
    and recommends delaying departure by 2-3 days.
    """
    mock_high_wave = {
        "available": True,
        "latitude": -50.0,
        "longitude": 30.0,
        "wave_height_m": 5.4, # Exceeds 4.0m safe limit!
        "wind_wave_height_m": 1.2,
        "wind_speed_knots": 28.0,
        "time": "2026-09-13T12:00",
        "message": "Live conditions fetched"
    }

    test_waypoints = [{"lat": -50.0, "lng": 30.0, "name": "Roaring Forties Waypoint"}]
    custom_thresholds = {"max_safe_wave_height_m": 4.0, "max_safe_wind_speed_knots": 35.0}

    with patch("weather_service.get_marine_conditions", return_value=mock_high_wave):
        evaluation = evaluate_waypoints_weather(test_waypoints, thresholds=custom_thresholds)

        assert evaluation["adverse_weather_detected"] is True
        assert evaluation["methodology"] == "Live marine weather check"
        assert evaluation["suggested_delay_days"] in [2, 3]
        assert "recommend delaying departure by 2-3 days" in evaluation["suggested_action"].lower()

        # Check exact warning message pattern
        warning_msg = evaluation["warnings"][0]
        assert "Adverse weather detected near" in warning_msg
        assert "wave height of 5.4m exceeds safe threshold of 4.0m" in warning_msg
