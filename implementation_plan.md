# Implementation Plan - Marine Waypoint Routing & Weather-Aware Polar Logistics

Upgrade PolarLogix's routing architecture into a data-driven system with external JSON configuration, real marine waypoint navigation avoiding landmasses via `searoute`, dynamic voyage durations from actual nautical distance and vessel speeds, and live marine weather threshold advisories via Open-Meteo.

---

## Proposed Changes

### Phase 1: Data-Driven Architecture & Replaceable Reference Data

Create clean external JSON datasets with schema definitions, a database seed/import script with loud validation, and verify replaceable dataset swaps.

#### [NEW] [backend/data/locations.json](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/backend/data/locations.json)
- Store geographic locations: Goa Depot, Cape Town Transfer Point, Maitri Station, Bharati Station.
- Schema: `[{"id": str, "name": str, "type": "depot"|"transfer"|"station", "latitude": float, "longitude": float, "code": str}]`.

#### [NEW] [backend/data/transport_legs.json](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/backend/data/transport_legs.json)
- Store multi-modal transport legs with vessel speeds and capacities.
- Schema: `[{"id": str, "origin_id": str, "destination_id": str, "mode": "ship"|"aircraft"|"helicopter"|"cargo_flight", "average_speed_knots": float, "capacity_kg": float, "hazmat_allowed": bool, "available_months": list[int]}]`.

#### [NEW] [backend/data/weather_thresholds.json](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/backend/data/weather_thresholds.json)
- Store safe marine threshold limits for voyage dispatch advisories.
- Schema: `{"max_safe_wave_height_m": 4.0, "max_safe_wind_speed_knots": 35.0}`.

#### [MODIFY] [backend/models.py](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/backend/models.py)
- Add `average_speed_knots` (Float, nullable=True), `distance_nm` (Float, nullable=True), `waypoints_json` (Text, nullable=True) to `TransportLeg`.

#### [MODIFY] [backend/schemas.py](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/backend/schemas.py)
- Update `TransportLegBase` and route schemas to include `average_speed_knots`, `distance_nm`, and waypoints.
- Add schemas for marine weather check and advisory responses.

#### [MODIFY] [backend/seed.py](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/backend/seed.py)
- Refactor seed script to read from JSON data files (`locations.json`, `transport_legs.json`, `weather_thresholds.json`).
- Implement strict validation: fail loudly with explicit `ValueError` identifying the faulty entry if any required field is missing or invalid.
- Calculate waypoint geometries and dynamic durations for ship legs during seed.

---

### Phase 2: Marine Waypoint-Based Routing (`searoute`)

Replace straight-line sea vectors with realistic maritime paths that avoid landmasses and calculate realistic voyage durations from true nautical distance.

#### [MODIFY] [backend/routing.py](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/backend/routing.py)
- Integrate `searoute` to compute realistic marine paths for all `ship`-mode legs.
- Calculate actual nautical distance ($D_{\text{nm}}$) and duration:
  $$\text{duration\_days} = \max\left(1, \text{round}\left(\frac{D_{\text{nm}}}{\text{average\_speed\_knots} \times 24}\right)\right)$$
- Retain direct great-circle vectors for flight modes (`aircraft`, `helicopter`, `cargo_flight`).
- Update Dijkstra shortest-path calculation to use computed duration.
- Include full waypoint coordinates in route computation results.

#### [MODIFY] [backend/main.py](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/backend/main.py)
- Update `/api/shipments/{shipment_id}/route-map` and `/api/transport-legs` to provide full waypoints array (`[{lat, lng}, ...]`).
- Add `/api/routing/preview` endpoint for frontend route calculation with marine waypoints.

#### [MODIFY] [frontend/src/components/Map/ExpeditionMap.jsx](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/frontend/src/components/Map/ExpeditionMap.jsx)
- Support rendering detailed curved marine waypoint polylines on Leaflet map.
- Display waypoint markers and maritime corridors.

#### [MODIFY] [frontend/src/pages/ShipmentPlanner.jsx](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/frontend/src/pages/ShipmentPlanner.jsx)
- Display computed nautical distances, calculated voyage durations, and marine waypoint itineraries.

---

### Phase 3: Weather-Aware Route Flagging (Open-Meteo Marine API)

Integrate live marine weather conditions along sea route waypoints and compare against thresholds to generate operational advisories.

#### [NEW] [backend/weather_service.py](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/backend/weather_service.py)
- Query Open-Meteo Marine API (`wave_height`) and Forecast API (`wind_speed_10m`) for waypoint coordinates.
- Evaluate 2-3 key waypoints (departure point, open ocean midpoint, destination approach).
- Compare against `weather_thresholds.json`.
- Return weather status, live wave heights, wind speeds, and advisory messages (e.g. recommended departure delay of 2-3 days).
- Clearly label as "algorithmic weather threshold check using live marine data".

#### [MODIFY] [backend/main.py](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/backend/main.py)
- Add `/api/weather/route-check` and integrate weather advisories into route planning and shipment map endpoints.

#### [MODIFY] [frontend/src/pages/ShipmentPlanner.jsx](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/frontend/src/pages/ShipmentPlanner.jsx) & [frontend/src/pages/ShipmentOfficerDashboard.jsx](file:///c:/Users/spyro/.gemini/antigravity/scratch/polarlogix/frontend/src/pages/ShipmentOfficerDashboard.jsx)
- Display the "Algorithmic Weather Threshold Check using Live Marine Data" card with live wave height / wind speed readings at key waypoints, threshold badges, and departure delay recommendations.

---

## Verification Plan

### Automated Tests
1. **Validation & Replaceable Data Test (`backend/test_data_seed.py`)**:
   - Verify strict validation fails on missing fields (`latitude`, `origin_id`, `mode`).
   - Verify swapping `locations.json` / `transport_legs.json` with a test dataset correctly updates database and API returns new data without code changes.
2. **Marine Routing Test (`backend/test_searoute_integration.py`)**:
   - Verify `searoute` generates realistic multi-waypoint path for Goa $\rightarrow$ Cape Town avoiding land.
   - Verify ship leg duration is dynamically calculated from actual nautical distance / speed.
   - Verify flight modes remain direct straight vectors.
3. **Weather Advisory Test (`backend/test_weather_advisory.py`)**:
   - Verify Open-Meteo API fetches live marine data.
   - Verify condition exceeding thresholds triggers the correct advisory flag and suggested delay.
4. **End-to-End Test Suite**:
   - Run all backend tests (`pytest backend/`).

### Manual & UI Verification
1. Open frontend in browser, navigate to **Shipment Planner** and plan a Goa $\rightarrow$ Bharati route.
2. Verify the map renders the curved marine polyline through the Indian Ocean avoiding landmasses.
3. Verify the weather advisory card displays live wave height and wind speed at key waypoints with threshold status.
