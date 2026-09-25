import os
import sys
import json

output_path = 'POLARLOGIX_MASTER_CODEBASE.md'

sections = [
    ('1. Documentation & Architecture Blueprints', [
        ('README.md', 'Project overview, setup instructions, and high-level mission goals'),
        ('implementation_plan.md', 'Comprehensive system architecture, requirements specifications, and implementation roadmap'),
    ]),
    ('2. Backend Core Services & Data Layer', [
        ('backend/requirements.txt', 'Python backend dependencies (FastAPI, Uvicorn, SQLAlchemy, Pydantic, HTTPX, PyJWT, Passlib, SeaRoute)'),
        ('backend/database.py', 'Database engine configuration, session maker, base declarative model for SQLite'),
        ('backend/models.py', 'SQLAlchemy ORM models: User, Location, TransportLeg, Shipment, ShipmentLeg, InventoryItem, WeatherCache, EmergencyAlert, Personnel, OfflineSyncRecord'),
        ('backend/schemas.py', 'Pydantic request/response schemas, validation models, enums for status/modes/roles'),
        ('backend/auth.py', 'JWT token generation/decoding, password hashing with bcrypt, role-based dependency checks'),
        ('backend/weather_service.py', 'Live Open-Meteo polar weather client, in-memory/DB caching with 15-min TTL, polar hazard & blizzard simulation'),
        ('backend/routing.py', 'Multi-modal polar Dijkstra routing engine, SeaRoute maritime path generation, weather hazard risk penalty computation'),
        ('backend/main.py', 'FastAPI application router, REST endpoints, CORS setup, error handlers, offline sync APIs, role-protected endpoints'),
        ('backend/seed.py', 'Database seeder: realistic NCPOR expedition data, Maitri/Bharati/Himadri stations, routes, inventory, personnel, demo users'),
    ]),
    ('3. Backend Static Data Assets', [
        ('backend/data/locations.json', 'Polar research stations, transit ports, airfields, ice runways, geo coordinates & capabilities'),
        ('backend/data/transport_legs.json', 'Pre-configured multi-modal transit legs (Vessel, Air, Overland Piston-Bully traverse) with distance & cost'),
        ('backend/data/weather_thresholds.json', 'Extreme polar weather thresholds (wind speed, temperature, visibility) by transport modality'),
    ]),
    ('4. Backend Test & Verification Suites', [
        ('backend/test_api.py', 'Basic API health, stations, and routes validation test'),
        ('backend/test_security_rbac.py', 'Role-Based Access Control security tests (Station Commander, Logistics Officer, Station Member, Admin)'),
        ('backend/test_weather_advisory.py', 'Weather hazard evaluation, blizzard trigger, and route reroute advisory tests'),
        ('backend/test_routing.py', 'Multi-modal Dijkstra pathfinding and waypoint sequence tests'),
        ('backend/test_searoute_integration.py', 'SeaRoute integration test for ocean navigation avoidance of land masses'),
        ('backend/test_multileg_advancement.py', 'Multi-leg polar shipment stage progression and completion tests'),
        ('backend/test_offline_sync_api.py', 'Offline sync batch upload, transaction replay, and idempotency tests'),
        ('backend/test_cors_security.py', 'CORS origin, headers, and security middleware validation'),
        ('backend/test_ncpor_upgrade.py', 'NCPOR domain upgrade test suite validating all polar stations and realistic entities'),
        ('backend/test_data_seed.py', 'Data integrity verification for database seed execution'),
        ('backend/verify_status.py', 'Verification script to print backend entity counts and status summary'),
    ]),
    ('5. Frontend Configuration & PWA Assets', [
        ('frontend/package.json', 'Frontend npm dependencies (React 19, Lucide React, Leaflet, React-Leaflet, Axios, IDB)'),
        ('frontend/vite.config.js', 'Vite configuration and dev server setup'),
        ('frontend/index.html', 'HTML5 entry point, polar web app title, meta tags, font links'),
        ('frontend/public/manifest.json', 'Progressive Web App (PWA) manifest for polar station offline installation'),
        ('frontend/public/sw.js', 'PWA Service Worker: Network-first caching strategy with offline fallback for static & API assets'),
        ('frontend/.gitignore', 'Frontend git ignore configuration'),
        ('frontend/.oxlintrc.json', 'Linter configuration for modern JavaScript/JSX'),
        ('frontend/README.md', 'Frontend documentation and setup instructions'),
    ]),
    ('6. Frontend Core & Styling System', [
        ('frontend/src/main.jsx', 'React root entry point, Service Worker registration, theme wrapper'),
        ('frontend/src/App.jsx', 'Master application component, client-side routing, protected route wrappers, global overlays'),
        ('frontend/src/index.css', 'Design tokens, dark polar theme, glassmorphism, responsive grid, high-contrast blizzard mode'),
        ('frontend/src/App.css', 'App-level component animation styles, scrollbars, status glows'),
    ]),
    ('7. Frontend Services & Offline Layer', [
        ('frontend/src/services/api.js', 'Axios HTTP client with auth token interceptors, offline fallback hooks, and API methods'),
        ('frontend/src/services/db.js', 'IndexedDB wrapper using idb library for offline entity storage (stations, shipments, inventory)'),
        ('frontend/src/services/syncQueue.js', 'Transactional offline mutation queue: queueing, background replay, conflict resolution'),
    ]),
    ('8. Frontend Context Providers', [
        ('frontend/src/context/AuthContext.jsx', 'JWT authentication context: login, logout, user profile, role helper functions'),
        ('frontend/src/context/ConnectivityContext.jsx', 'Real-time network state tracker: online/offline/degraded detection, auto-sync triggers'),
        ('frontend/src/context/ThemeContext.jsx', 'Theme management (Polar Dark / High-Contrast Arctic Daylight mode)'),
    ]),
    ('9. Frontend Reusable UI Components', [
        ('frontend/src/components/Navbar.jsx', 'Top navigation bar with role switcher, station indicator, connectivity status, auth controls'),
        ('frontend/src/components/OfflineBanner.jsx', 'Live banner warning users of offline mode, pending queued sync items, and reconnect triggers'),
        ('frontend/src/components/SyncStatusWidget.jsx', 'Floating sync status widget showing queued transactions, sync progress, and retry actions'),
        ('frontend/src/components/StatusBadge.jsx', 'Reusable status badge component for shipment, inventory, and emergency priority levels'),
        ('frontend/src/components/LoadingSkeleton.jsx', 'Glassmorphic loading skeleton component for asynchronous data loading states'),
        ('frontend/src/components/ErrorBoundary.jsx', 'React error boundary catching rendering failures with fallback recovery UI'),
        ('frontend/src/components/Map/ExpeditionMap.jsx', 'Interactive Leaflet polar expedition map with custom markers, multi-modal polylines, weather popups'),
    ]),
    ('10. Frontend Role Views & Expedition Pages', [
        ('frontend/src/pages/Login.jsx', 'Authentication page with quick-login buttons for demo roles (Commander, Logistics, Member, Admin)'),
        ('frontend/src/pages/Dashboard.jsx', 'Main overview dashboard with KPI cards, quick actions, active expeditions, and alerts'),
        ('frontend/src/pages/StationCommanderDashboard.jsx', 'Station Commander command center: station status, fuel/ration gauges, emergency protocols, clearance approvals'),
        ('frontend/src/pages/ShipmentOfficerDashboard.jsx', 'Logistics Officer operations center: active shipments, stage progression, cargo manifests, dispatch'),
        ('frontend/src/pages/ShipmentTracker.jsx', 'Shipment detail & tracking page with timeline, waypoints, temperature logs, driver/pilot notes'),
        ('frontend/src/pages/ShipmentPlanner.jsx', 'Multi-leg route planner: source/destination selection, cargo definition, multi-modal path computation'),
        ('frontend/src/pages/RouteExplorer.jsx', 'Interactive route network browser: transit leg details, modality filter, live weather conditions'),
        ('frontend/src/pages/InventoryDashboard.jsx', 'Station life-support inventory tracker: fuel reserves, medical supplies, food rations, reorder thresholds'),
        ('frontend/src/pages/PersonnelDashboard.jsx', 'Expedition personnel roster: medical fitness, station assignment, contact details, role distribution'),
        ('frontend/src/pages/PersonnelManager.jsx', 'Station personnel management: deployment assignments, medical status updates, station capacity'),
        ('frontend/src/pages/EmergencyResponse.jsx', 'Emergency response command center: SOS broadcasting, blizzard lockdown, fuel leak triage, incident logs'),
        ('frontend/test_offline_architecture.js', 'Headless test script validating IndexedDB schema and Sync Queue replay logic'),
    ]),
]

def get_language(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    mapping = {
        '.py': 'python',
        '.js': 'javascript',
        '.jsx': 'jsx',
        '.json': 'json',
        '.css': 'css',
        '.html': 'html',
        '.md': 'markdown',
        '.txt': 'text',
    }
    return mapping.get(ext, '')

def main():
    print("Generating comprehensive master codebase document...")
    total_files = 0
    total_lines = 0

    with open(output_path, 'w', encoding='utf-8') as out:
        out.write("""# POLARLOGIX -- Extreme Polar Expedition & Supply-Chain Command System
## Comprehensive Master Codebase, Architecture Specification & Context Document

> **Document Type**: Complete Master Codebase & Context Repository
> **Target Audience**: AI Coding Assistants, Software Architects, and System Engineers
> **Domain**: National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, India
> **Scope**: Verbatim source code of all backend, frontend, data, and test files with complete architecture guides.

---

## Table of Contents

1. [Executive Summary & System Architecture](#executive-summary--system-architecture)
2. [Domain Overview: NCPOR Polar Expeditions](#domain-overview-ncpor-polar-expeditions)
3. [Architecture & Data Flow Diagrams](#architecture--data-flow-diagrams)
4. [Role-Based Access Control (RBAC) Matrix](#role-based-access-control-rbac-matrix)
5. [Database Schema & Entity Specifications](#database-schema--entity-specifications)
6. [Offline-First Architecture & Sync Engine](#offline-first-architecture--sync-engine)
7. [Weather Advisory & Polar Hazard Engine](#weather-advisory--polar-hazard-engine)
8. [Multi-Modal Polar Routing & SeaRoute Engine](#multi-modal-polar-routing--searoute-engine)
9. [REST API Endpoints Reference](#rest-api-endpoints-reference)
10. [Complete Source Code Listing](#complete-source-code-listing)
""")

        # Add section entries in TOC
        for sec_title, files in sections:
            sec_slug = sec_title.lower().replace(' ', '-').replace('&', '').replace('.', '').replace('/', '')
            out.write(f"   - [{sec_title}](#{sec_slug})\n")
            for fpath, desc in files:
                file_slug = fpath.lower().replace('/', '').replace('\\\\', '').replace('.', '').replace('_', '-').replace(' ', '-')
                out.write(f"     * [`{fpath}`](#file-{file_slug}) — {desc}\n")

        out.write("""
---

## Executive Summary & System Architecture

**PolarLogix** is a specialized mission-critical command and logistics system designed for extreme polar expedition environments (Antarctic and Arctic research operations) under the **National Centre for Polar and Ocean Research (NCPOR)**.

### Core Architectural Pillars:

1. **Robust Multi-Modal Polar Logistics Engine**:
   - Calculates routes across four distinct transportation modalities: **Maritime Vessels** (Ocean transit from Cape Town / Goa), **Icebreaker Routes** (Sea-ice transit through Southern Ocean pack ice), **Polar Airlinks** (DROMLAN intercontinental flights landing on blue-ice runways), and **Overland Piston-Bully Traverses** (Heavy tracked snowcat convoys across continental ice sheets).
   - Integrates `searoute` for maritime routing around land masses combined with custom Dijkstra graph optimization.

2. **Live Open-Meteo Polar Weather & Dynamic Hazard Engine**:
   - Ingests real-time meteorological metrics (sub-zero ambient temperature, 10m wind speeds, blizzard gusts, snowfall, and visibility).
   - Features persistent in-memory and database caching with a 15-minute Time-To-Live (TTL).
   - Evaluates modal weather hazards against calibrated polar thresholds, assigning risk penalty multipliers to routes and triggering automated rerouting advisories.

3. **Offline-First Resilient Architecture**:
   - Built for intermittent satellite connectivity (Iridium / Starlink blackouts).
   - Utilizes a Progressive Web App (PWA) Service Worker (`sw.js`) for network-first/cache-fallback asset serving.
   - Client-side data storage using **IndexedDB** (`idb`).
   - Transactional **Sync Queue** that records offline mutations, provides optimistic UI updates, resolves timestamp conflicts, and automatically replays requests when connectivity is restored.

4. **Cryptographic Role-Based Access Control (RBAC)**:
   - Stateless JWT tokens signed with SHA-256 HMAC.
   - Password hashing with Bcrypt.
   - Strict hierarchical permissions for 4 distinct operational roles:
     * **Station Commander** (`station_commander`): Full station authority, life-support inventory oversight, emergency protocol lockdown, and reroute approvals.
     * **Logistics Officer** (`logistics_officer`): Supply chain coordination, cargo dispatch, multi-leg advancement, and inventory allocation.
     * **Station Member** (`station_member`): Read-only visibility into station status, weather advisories, personal medical roster, and routine notices.
     * **System Administrator** (`admin`): Full unrestricted administrative access.

5. **Aesthetic & High-Performance Polar Frontend**:
   - React 19 + Vite with bespoke modern CSS tokens (Polar Dark, glassmorphic frosted panels, dynamic blizzard alerts, and high-contrast accessibility modes).
   - Leaflet interactive polar map projection with custom station/vessel/aircraft SVG markers and multi-modal color-coded route polylines.

---

## Domain Overview: NCPOR Polar Expeditions

### Primary Research Stations & Strategic Hubs:

- **Maitri Station** (`-70.767° N, 11.733° E`):
  - *Location*: Schirmacher Oasis, Queen Maud Land, East Antarctica.
  - *Operational Profile*: Year-round research station. Inland rocky oasis.
  - *Supply Ingestion*: Blue-ice runway (DROMLAN network) and heavy tracked Piston-Bully snowcat convoys traveling ~100 km inland from the Antarctic ice shelf.

- **Bharati Station** (`-69.407° N, 76.194° E`):
  - *Location*: Larsemann Hills, East Antarctica.
  - *Operational Profile*: India's ultra-modern coastal Antarctic station.
  - *Supply Ingestion*: Deep-water summer vessel mooring, fast-ice offloading, and ship-to-shore heavy-lift helicopter transport.

- **Himadri Station** (`78.928° N, 11.922° E`):
  - *Location*: Ny-Ålesund, Spitsbergen, Svalbard (Norway).
  - *Operational Profile*: India's permanent Arctic research base located at the world's northernmost human settlement.
  - *Supply Ingestion*: Air transport via Longyearbyen (LYR) and Arctic cargo vessels.

- **NCPOR Headquarters** (`15.402° N, 73.805° E`):
  - *Location*: Vasco da Gama, Goa, India.
  - *Operational Profile*: Central command, procurement, and scientific expedition planning base.

- **Cape Town Transit Port** (`-33.900° N, 18.420° E`):
  - *Location*: Cape Town, South Africa.
  - *Operational Profile*: Principal southern hemisphere staging port for Indian Antarctic Expeditions (chartered icebreakers like S.A. Agulhas II / Vasiliy Golovnin).

- **Longyearbyen Hub** (`78.223° N, 15.646° E`):
  - *Location*: Svalbard, Norway.
  - *Operational Profile*: Principal staging airfield and port for Arctic expeditions heading to Himadri.

---

## Architecture & Data Flow Diagrams

### High-Level System Architecture

```text
+-------------------------------------------------------------------------+
|                        CLIENT BROWSER (React 19)                       |
|                                                                         |
|  +---------------------+  +--------------------+  +------------------+  |
|  | Station Commander   |  | Logistics Officer  |  | Emergency Hub    |  |
|  | Dashboard           |  | Planner & Tracker  |  | & Route Explorer |  |
|  +----------+----------+  +---------+----------+  +--------+---------+  |
|             |                       |                      |            |
|             +-----------------------+----------------------+            |
|                                     |                                   |
|                        +------------v------------+                      |
|                        | AuthContext / ConnCtx   |                      |
|                        +------------+------------+                      |
|                                     |                                   |
|             +-----------------------+----------------------+            |
|             | (Online)                                     | (Offline)  |
|  +----------v----------+                        +----------v---------+  |
|  | Axios HTTP Client   |                        | Sync Queue Manager |  |
|  +----------+----------+                        +----------+---------+  |
|             |                                              |            |
|             |                                   +----------v---------+  |
|             |                                   | IndexedDB Storage  |  |
|             |                                   | (polarlogix_db)    |  |
|             |                                   +--------------------+  |
+-------------|-----------------------------------------------------------+
              |
              | REST API Calls (JSON + Bearer JWT)
              v
+-------------------------------------------------------------------------+
|                      BACKEND SERVICE (FastAPI)                          |
|                                                                         |
|  +---------------------+  +--------------------+  +------------------+  |
|  | Auth & Security     |  | Polar Routing      |  | Weather Advisory |  |
|  | RBAC Middleware     |  | Dijkstra + SeaRoute|  | Open-Meteo Client|  |
|  +----------+----------+  +---------+----------+  +--------+---------+  |
|             |                       |                      |            |
|             +-----------------------+----------------------+            |
|                                     |                                   |
|                        +------------v------------+                      |
|                        | SQLAlchemy ORM Engine   |                      |
|                        +------------+------------+                      |
|                                     |                                   |
|                        +------------v------------+                      |
|                        | SQLite (polarlogix.db)  |                      |
|                        +-------------------------+                      |
+-------------------------------------------------------------------------+
```

---

## Role-Based Access Control (RBAC) Matrix

| Operational Capability | Station Commander | Logistics Officer | Station Member | System Admin |
| :--- | :---: | :---: | :---: | :---: |
| View Station Status & Weather | Yes | Yes | Yes | Yes |
| View Shipments & Route Explorer | Yes | Yes | Yes | Yes |
| View Life-Support Inventories | Yes | Yes | Yes | Yes |
| Create New Polar Shipment | Yes | Yes | No | Yes |
| Advance Shipment Multi-Legs | No | Yes | No | Yes |
| Adjust Inventory Quantities | Yes | Yes | No | Yes |
| Trigger Emergency SOS Broadcast | Yes | No | No | Yes |
| Approve Weather Rerouting Plan | Yes | No | No | Yes |
| Manage Expedition Personnel Roster| Yes | No | No | Yes |
| User Admin & Role Reassignment | No | No | No | Yes |

---

## Database Schema & Entity Specifications

The system utilizes SQLite with SQLAlchemy ORM. The relational schema consists of 10 tables:

1. **`users`**: Authentication credentials and RBAC identities.
   - `id` (Integer PK), `username` (String Unique), `hashed_password` (String), `full_name` (String), `role` (Enum: `station_commander`, `logistics_officer`, `station_member`, `admin`), `station_id` (Integer FK -> `locations.id`), `email` (String), `is_active` (Boolean).
2. **`locations`**: Geospatial hubs, stations, ports, and airfields.
   - `id` (Integer PK), `name` (String), `code` (String Unique), `latitude` (Float), `longitude` (Float), `type` (Enum: `station`, `port`, `airfield`, `ice_runway`), `country` (String), `elevation_m` (Float), `description` (Text).
3. **`transport_legs`**: Physical and logistical connections between nodes.
   - `id` (Integer PK), `source_id` (Integer FK), `destination_id` (Integer FK), `transport_mode` (Enum: `vessel`, `air`, `land_traverse`, `icebreaker`), `distance_km` (Float), `estimated_hours` (Float), `fuel_required_liters` (Float), `base_risk_factor` (Float).
4. **`shipments`**: End-to-end expedition cargo dispatches.
   - `id` (Integer PK), `tracking_number` (String Unique), `title` (String), `cargo_type` (Enum: `fuel`, `rations`, `scientific_equipment`, `medical`, `spare_parts`), `priority` (Enum: `routine`, `high`, `critical_emergency`), `status` (Enum: `draft`, `approved`, `in_transit`, `delayed_weather`, `delivered`, `cancelled`), `source_id` (Integer FK), `destination_id` (Integer FK), `total_weight_kg` (Float), `current_leg_index` (Integer), `hazard_notes` (Text).
5. **`shipment_legs`**: Granular multimodal segments composing a complete journey.
   - `id` (Integer PK), `shipment_id` (Integer FK), `leg_index` (Integer), `source_id` (Integer FK), `destination_id` (Integer FK), `transport_mode` (Enum), `status` (Enum: `pending`, `in_progress`, `completed`, `rerouted`, `blocked`), `start_time` (DateTime), `end_time` (DateTime), `assigned_carrier` (String).
6. **`inventory_items`**: Life-support supplies tracked per polar base.
   - `id` (Integer PK), `station_id` (Integer FK), `category` (Enum: `fuel`, `food`, `medical`, `spares`, `equipment`), `item_name` (String), `quantity` (Float), `unit` (String), `min_threshold` (Float), `critical_threshold` (Float), `expiration_date` (DateTime), `storage_zone` (String).
7. **`emergency_alerts`**: Critical incidents, blizzard warnings, and SOS broadcasts.
   - `id` (Integer PK), `station_id` (Integer FK), `alert_type` (Enum: `blizzard`, `fuel_leak`, `medical_emergency`, `equipment_failure`, `communication_blackout`), `severity` (Enum: `low`, `moderate`, `severe`, `critical`), `title` (String), `description` (Text), `timestamp` (DateTime), `resolved` (Boolean), `resolved_by` (String).
8. **`personnel`**: Station crew and winter-over scientists.
   - `id` (Integer PK), `station_id` (Integer FK), `full_name` (String), `designation` (String), `specialization` (String), `medical_fitness_status` (Enum: `fit`, `conditional`, `quarantined`, `evacuate`), `emergency_contact` (String), `joined_date` (DateTime).
9. **`weather_cache`**: Cached Open-Meteo forecasts with 15-minute TTL.
   - `id` (Integer PK), `latitude` (Float), `longitude` (Float), `temperature_c` (Float), `wind_speed_kmh` (Float), `wind_gusts_kmh` (Float), `snowfall_cm` (Float), `visibility_km` (Float), `condition_code` (String), `alert_level` (String), `cached_at` (DateTime).
10. **`offline_sync_records`**: Idempotent tracking of synchronized mutations.
    - `id` (Integer PK), `client_mutation_id` (String Unique), `user_id` (Integer), `action_type` (String), `payload_json` (Text), `status` (String), `timestamp` (DateTime).

---

## Offline-First Architecture & Sync Engine

### 1. IndexedDB Schema (`polarlogix_db`, version 1)
- **`stations`**: Offline mirror of all stations, ports, and runway metadata.
- **`shipments`**: Offline cache of active and historical shipments.
- **`inventory`**: Offline cache of life-support resource quantities.
- **`personnel`**: Offline roster of expedition crew members.
- **`sync_queue`**: Transactional table of pending offline mutations with fields:
  * `id` (Auto-increment PK)
  * `mutationId` (UUID string)
  * `endpoint` (API route, e.g. `/api/shipments/advance`)
  * `method` (`POST`, `PUT`, `DELETE`)
  * `payload` (JSON payload)
  * `timestamp` (ISO datetime)
  * `retryCount` (Integer)

### 2. Synchronization Lifecycle:
1. When offline, any user action (advancing a leg, logging an emergency, updating stock) writes optimistically to the relevant IndexedDB store and appends a record to `sync_queue`.
2. The `ConnectivityContext` monitors `window.navigator.onLine` and conducts periodic heartbeat checks.
3. Upon reconnection, `syncQueue.processQueue()` activates:
   - Reads pending items ordered by `timestamp ASC`.
   - Sends batch payload to `POST /api/sync/batch`.
   - Backend processes mutations idempotently via `client_mutation_id`.
   - Successfully processed items are cleared from `sync_queue` and local caches are updated.

---

## Weather Advisory & Polar Hazard Engine

The `weather_service.py` module communicates with the Open-Meteo Polar Weather API and computes hazard levels based on extreme polar environmental thresholds:

| Condition Parameter | Safe / Normal | Warning (Advisory) | Hazard / Blizzard (No-Go) |
| :--- | :---: | :---: | :---: |
| **Wind Speed** | < 45 km/h | 45 – 70 km/h | > 70 km/h (Katabatic storm) |
| **Wind Gusts** | < 60 km/h | 60 – 90 km/h | > 90 km/h (Structural hazard) |
| **Ambient Temperature** | > -25°C | -25°C to -40°C | < -40°C (Equipment freezing) |
| **Visibility** | > 5.0 km | 1.0 – 5.0 km | < 1.0 km (Whiteout) |
| **Snowfall Rate** | < 2.0 cm/h | 2.0 – 5.0 cm/h | > 5.0 cm/h (Drift accumulation) |

When conditions exceed thresholds for a specific transport modality (e.g. Air flights require >3 km visibility and <50 km/h winds), the routing engine applies risk penalty factors (1.5x to 3.0x time/cost penalty) or blocks the leg completely, triggering the Station Commander's automated rerouting pipeline.

---

## Multi-Modal Polar Routing & SeaRoute Engine

The `routing.py` module integrates a multi-modal Dijkstra shortest-path algorithm across 4 distinct transport networks:
- **Maritime Routes**: Computes realistic oceanic waypoints avoiding continental coastlines using `searoute.searoute`.
- **Airlinks**: Direct great-circle aviation waypoints between intercontinental airfields (Cape Town -> Novo Airbase / Maitri, Goa -> Longyearbyen -> Himadri).
- **Overland Traverses**: Constrained snowcat tracks over ice shelves and continental glaciers (e.g., Maitri to coastal shelf offloading zones).
- **Icebreaker Paths**: Navigable sea-ice channels in Prydz Bay (Bharati) and Queen Maud Land.

---

## REST API Endpoints Reference

### Authentication & Users
- `POST /api/auth/login`: Authenticate with username/password, returns JWT token and user info.
- `GET /api/auth/me`: Retrieve profile of currently authenticated user.

### Stations & Locations
- `GET /api/locations`: List all polar stations, ports, and airfields with coordinates.
- `GET /api/locations/{id}`: Retrieve detailed location profile and current weather.

### Polar Shipments
- `GET /api/shipments`: List active and completed polar shipments.
- `POST /api/shipments`: Create a new multi-leg polar shipment.
- `GET /api/shipments/{id}`: Detailed shipment view with leg breakdown and tracking history.
- `POST /api/shipments/{id}/advance`: Advance the shipment to the next transit leg.
- `POST /api/shipments/{id}/reroute`: Apply alternative route to bypass weather hazards.

### Weather & Polar Hazards
- `GET /api/weather/station/{id}`: Fetch live polar weather and hazard status for a station.
- `GET /api/weather/forecast`: Get 7-day polar weather forecast.
- `POST /api/weather/simulate-hazard`: Trigger simulated extreme polar weather (blizzard, whiteout) for testing.

### Routing & Navigation
- `POST /api/routes/plan`: Calculate optimal multi-modal route between two locations.
- `GET /api/routes/network`: Retrieve the entire connected polar logistics graph.

### Life-Support Inventory
- `GET /api/inventory/station/{id}`: Fetch stock levels (fuel, rations, medical, spares) for a station.
- `PUT /api/inventory/{id}`: Update inventory quantity and log replenishment/consumption.

### Emergency Response
- `GET /api/emergency/alerts`: List active station emergency alerts.
- `POST /api/emergency/broadcast`: Broadcast emergency SOS / lockdown alert across stations.
- `POST /api/emergency/alerts/{id}/resolve`: Resolve an active emergency alert.

### Personnel Roster
- `GET /api/personnel/station/{id}`: Get crew roster for a station.
- `PUT /api/personnel/{id}/status`: Update medical fitness or duty status of a researcher.

### Offline Synchronization
- `POST /api/sync/batch`: Process and resolve queued offline client mutations idempotently.

---

## Complete Source Code Listing

""")

        for sec_title, files in sections:
            sec_slug = sec_title.lower().replace(' ', '-').replace('&', '').replace('.', '').replace('/', '')
            out.write(f"\n## {sec_title}\n\n")
            for fpath, desc in files:
                file_slug = fpath.lower().replace('/', '').replace('\\\\', '').replace('.', '').replace('_', '-').replace(' ', '-')
                lang = get_language(fpath)
                out.write(f"### <a id=\"file-{file_slug}\"></a>File: `{fpath}`\n\n")
                out.write(f"> **Role / Purpose**: {desc}\n\n")

                if os.path.exists(fpath):
                    try:
                        with open(fpath, 'r', encoding='utf-8', errors='replace') as infile:
                            content = infile.read()
                        line_count = len(content.splitlines())
                        total_files += 1
                        total_lines += line_count
                        out.write(f"```{lang}\n")
                        out.write(content)
                        if not content.endswith('\n'):
                            out.write('\n')
                        out.write("```\n\n")
                    except Exception as e:
                        out.write(f"*Error reading file `{fpath}`: {e}*\n\n")
                else:
                    out.write(f"*File not found at `{fpath}`*\n\n")
                out.write("---\n\n")

    print(f"Master markdown file successfully created: '{output_path}'")
    print(f"Total source files included: {total_files}")
    print(f"Total lines of code/docs: {total_lines}")
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"File size: {size_mb:.2f} MB")

if __name__ == '__main__':
    main()
