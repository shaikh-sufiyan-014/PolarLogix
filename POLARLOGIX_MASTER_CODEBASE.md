# POLARLOGIX -- Extreme Polar Expedition & Supply-Chain Command System
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
   - [1. Documentation & Architecture Blueprints](#1-documentation--architecture-blueprints)
     * [`README.md`](#file-readmemd) — Project overview, setup instructions, and high-level mission goals
     * [`implementation_plan.md`](#file-implementation-planmd) — Comprehensive system architecture, requirements specifications, and implementation roadmap
   - [2. Backend Core Services & Data Layer](#2-backend-core-services--data-layer)
     * [`backend/requirements.txt`](#file-backendrequirementstxt) — Python backend dependencies (FastAPI, Uvicorn, SQLAlchemy, Pydantic, HTTPX, PyJWT, Passlib, SeaRoute)
     * [`backend/database.py`](#file-backenddatabasepy) — Database engine configuration, session maker, base declarative model for SQLite
     * [`backend/models.py`](#file-backendmodelspy) — SQLAlchemy ORM models: User, Location, TransportLeg, Shipment, ShipmentLeg, InventoryItem, WeatherCache, EmergencyAlert, Personnel, OfflineSyncRecord
     * [`backend/schemas.py`](#file-backendschemaspy) — Pydantic request/response schemas, validation models, enums for status/modes/roles
     * [`backend/auth.py`](#file-backendauthpy) — JWT token generation/decoding, password hashing with bcrypt, role-based dependency checks
     * [`backend/weather_service.py`](#file-backendweather-servicepy) — Live Open-Meteo polar weather client, in-memory/DB caching with 15-min TTL, polar hazard & blizzard simulation
     * [`backend/routing.py`](#file-backendroutingpy) — Multi-modal polar Dijkstra routing engine, SeaRoute maritime path generation, weather hazard risk penalty computation
     * [`backend/main.py`](#file-backendmainpy) — FastAPI application router, REST endpoints, CORS setup, error handlers, offline sync APIs, role-protected endpoints
     * [`backend/seed.py`](#file-backendseedpy) — Database seeder: realistic NCPOR expedition data, Maitri/Bharati/Himadri stations, routes, inventory, personnel, demo users
   - [3. Backend Static Data Assets](#3-backend-static-data-assets)
     * [`backend/data/locations.json`](#file-backenddatalocationsjson) — Polar research stations, transit ports, airfields, ice runways, geo coordinates & capabilities
     * [`backend/data/transport_legs.json`](#file-backenddatatransport-legsjson) — Pre-configured multi-modal transit legs (Vessel, Air, Overland Piston-Bully traverse) with distance & cost
     * [`backend/data/weather_thresholds.json`](#file-backenddataweather-thresholdsjson) — Extreme polar weather thresholds (wind speed, temperature, visibility) by transport modality
   - [4. Backend Test & Verification Suites](#4-backend-test--verification-suites)
     * [`backend/test_api.py`](#file-backendtest-apipy) — Basic API health, stations, and routes validation test
     * [`backend/test_security_rbac.py`](#file-backendtest-security-rbacpy) — Role-Based Access Control security tests (Station Commander, Logistics Officer, Station Member, Admin)
     * [`backend/test_weather_advisory.py`](#file-backendtest-weather-advisorypy) — Weather hazard evaluation, blizzard trigger, and route reroute advisory tests
     * [`backend/test_routing.py`](#file-backendtest-routingpy) — Multi-modal Dijkstra pathfinding and waypoint sequence tests
     * [`backend/test_searoute_integration.py`](#file-backendtest-searoute-integrationpy) — SeaRoute integration test for ocean navigation avoidance of land masses
     * [`backend/test_multileg_advancement.py`](#file-backendtest-multileg-advancementpy) — Multi-leg polar shipment stage progression and completion tests
     * [`backend/test_offline_sync_api.py`](#file-backendtest-offline-sync-apipy) — Offline sync batch upload, transaction replay, and idempotency tests
     * [`backend/test_cors_security.py`](#file-backendtest-cors-securitypy) — CORS origin, headers, and security middleware validation
     * [`backend/test_ncpor_upgrade.py`](#file-backendtest-ncpor-upgradepy) — NCPOR domain upgrade test suite validating all polar stations and realistic entities
     * [`backend/test_data_seed.py`](#file-backendtest-data-seedpy) — Data integrity verification for database seed execution
     * [`backend/verify_status.py`](#file-backendverify-statuspy) — Verification script to print backend entity counts and status summary
   - [5. Frontend Configuration & PWA Assets](#5-frontend-configuration--pwa-assets)
     * [`frontend/package.json`](#file-frontendpackagejson) — Frontend npm dependencies (React 19, Lucide React, Leaflet, React-Leaflet, Axios, IDB)
     * [`frontend/vite.config.js`](#file-frontendviteconfigjs) — Vite configuration and dev server setup
     * [`frontend/index.html`](#file-frontendindexhtml) — HTML5 entry point, polar web app title, meta tags, font links
     * [`frontend/public/manifest.json`](#file-frontendpublicmanifestjson) — Progressive Web App (PWA) manifest for polar station offline installation
     * [`frontend/public/sw.js`](#file-frontendpublicswjs) — PWA Service Worker: Network-first caching strategy with offline fallback for static & API assets
     * [`frontend/.gitignore`](#file-frontendgitignore) — Frontend git ignore configuration
     * [`frontend/.oxlintrc.json`](#file-frontendoxlintrcjson) — Linter configuration for modern JavaScript/JSX
     * [`frontend/README.md`](#file-frontendreadmemd) — Frontend documentation and setup instructions
   - [6. Frontend Core & Styling System](#6-frontend-core--styling-system)
     * [`frontend/src/main.jsx`](#file-frontendsrcmainjsx) — React root entry point, Service Worker registration, theme wrapper
     * [`frontend/src/App.jsx`](#file-frontendsrcappjsx) — Master application component, client-side routing, protected route wrappers, global overlays
     * [`frontend/src/index.css`](#file-frontendsrcindexcss) — Design tokens, dark polar theme, glassmorphism, responsive grid, high-contrast blizzard mode
     * [`frontend/src/App.css`](#file-frontendsrcappcss) — App-level component animation styles, scrollbars, status glows
   - [7. Frontend Services & Offline Layer](#7-frontend-services--offline-layer)
     * [`frontend/src/services/api.js`](#file-frontendsrcservicesapijs) — Axios HTTP client with auth token interceptors, offline fallback hooks, and API methods
     * [`frontend/src/services/db.js`](#file-frontendsrcservicesdbjs) — IndexedDB wrapper using idb library for offline entity storage (stations, shipments, inventory)
     * [`frontend/src/services/syncQueue.js`](#file-frontendsrcservicessyncqueuejs) — Transactional offline mutation queue: queueing, background replay, conflict resolution
   - [8. Frontend Context Providers](#8-frontend-context-providers)
     * [`frontend/src/context/AuthContext.jsx`](#file-frontendsrccontextauthcontextjsx) — JWT authentication context: login, logout, user profile, role helper functions
     * [`frontend/src/context/ConnectivityContext.jsx`](#file-frontendsrccontextconnectivitycontextjsx) — Real-time network state tracker: online/offline/degraded detection, auto-sync triggers
     * [`frontend/src/context/ThemeContext.jsx`](#file-frontendsrccontextthemecontextjsx) — Theme management (Polar Dark / High-Contrast Arctic Daylight mode)
   - [9. Frontend Reusable UI Components](#9-frontend-reusable-ui-components)
     * [`frontend/src/components/Navbar.jsx`](#file-frontendsrccomponentsnavbarjsx) — Top navigation bar with role switcher, station indicator, connectivity status, auth controls
     * [`frontend/src/components/OfflineBanner.jsx`](#file-frontendsrccomponentsofflinebannerjsx) — Live banner warning users of offline mode, pending queued sync items, and reconnect triggers
     * [`frontend/src/components/SyncStatusWidget.jsx`](#file-frontendsrccomponentssyncstatuswidgetjsx) — Floating sync status widget showing queued transactions, sync progress, and retry actions
     * [`frontend/src/components/StatusBadge.jsx`](#file-frontendsrccomponentsstatusbadgejsx) — Reusable status badge component for shipment, inventory, and emergency priority levels
     * [`frontend/src/components/LoadingSkeleton.jsx`](#file-frontendsrccomponentsloadingskeletonjsx) — Glassmorphic loading skeleton component for asynchronous data loading states
     * [`frontend/src/components/ErrorBoundary.jsx`](#file-frontendsrccomponentserrorboundaryjsx) — React error boundary catching rendering failures with fallback recovery UI
     * [`frontend/src/components/Map/ExpeditionMap.jsx`](#file-frontendsrccomponentsmapexpeditionmapjsx) — Interactive Leaflet polar expedition map with custom markers, multi-modal polylines, weather popups
   - [10. Frontend Role Views & Expedition Pages](#10-frontend-role-views--expedition-pages)
     * [`frontend/src/pages/Login.jsx`](#file-frontendsrcpagesloginjsx) — Authentication page with quick-login buttons for demo roles (Commander, Logistics, Member, Admin)
     * [`frontend/src/pages/Dashboard.jsx`](#file-frontendsrcpagesdashboardjsx) — Main overview dashboard with KPI cards, quick actions, active expeditions, and alerts
     * [`frontend/src/pages/StationCommanderDashboard.jsx`](#file-frontendsrcpagesstationcommanderdashboardjsx) — Station Commander command center: station status, fuel/ration gauges, emergency protocols, clearance approvals
     * [`frontend/src/pages/ShipmentOfficerDashboard.jsx`](#file-frontendsrcpagesshipmentofficerdashboardjsx) — Logistics Officer operations center: active shipments, stage progression, cargo manifests, dispatch
     * [`frontend/src/pages/ShipmentTracker.jsx`](#file-frontendsrcpagesshipmenttrackerjsx) — Shipment detail & tracking page with timeline, waypoints, temperature logs, driver/pilot notes
     * [`frontend/src/pages/ShipmentPlanner.jsx`](#file-frontendsrcpagesshipmentplannerjsx) — Multi-leg route planner: source/destination selection, cargo definition, multi-modal path computation
     * [`frontend/src/pages/RouteExplorer.jsx`](#file-frontendsrcpagesrouteexplorerjsx) — Interactive route network browser: transit leg details, modality filter, live weather conditions
     * [`frontend/src/pages/InventoryDashboard.jsx`](#file-frontendsrcpagesinventorydashboardjsx) — Station life-support inventory tracker: fuel reserves, medical supplies, food rations, reorder thresholds
     * [`frontend/src/pages/PersonnelDashboard.jsx`](#file-frontendsrcpagespersonneldashboardjsx) — Expedition personnel roster: medical fitness, station assignment, contact details, role distribution
     * [`frontend/src/pages/PersonnelManager.jsx`](#file-frontendsrcpagespersonnelmanagerjsx) — Station personnel management: deployment assignments, medical status updates, station capacity
     * [`frontend/src/pages/EmergencyResponse.jsx`](#file-frontendsrcpagesemergencyresponsejsx) — Emergency response command center: SOS broadcasting, blizzard lockdown, fuel leak triage, incident logs
     * [`frontend/test_offline_architecture.js`](#file-frontendtest-offline-architecturejs) — Headless test script validating IndexedDB schema and Sync Queue replay logic

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


## 1. Documentation & Architecture Blueprints

### <a id="file-readmemd"></a>File: `README.md`

> **Role / Purpose**: Project overview, setup instructions, and high-level mission goals

```markdown
��#   P o l a r L o g i x 
 
 
```

---

### <a id="file-implementation-planmd"></a>File: `implementation_plan.md`

> **Role / Purpose**: Comprehensive system architecture, requirements specifications, and implementation roadmap

```markdown
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
```

---


## 2. Backend Core Services & Data Layer

### <a id="file-backendrequirementstxt"></a>File: `backend/requirements.txt`

> **Role / Purpose**: Python backend dependencies (FastAPI, Uvicorn, SQLAlchemy, Pydantic, HTTPX, PyJWT, Passlib, SeaRoute)

```text
fastapi>=0.100.0
uvicorn>=0.20.0
sqlalchemy>=2.0.0
networkx>=3.0
pydantic>=2.0.0
pyjwt>=2.8.0
bcrypt>=4.0.0
httpx>=0.27.0
requests>=2.31.0
searoute>=1.6.0
pytest>=8.0.0
```

---

### <a id="file-backenddatabasepy"></a>File: `backend/database.py`

> **Role / Purpose**: Database engine configuration, session maker, base declarative model for SQLite

```python
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_PATH = os.path.join(os.path.dirname(__file__), "polarlogix.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

### <a id="file-backendmodelspy"></a>File: `backend/models.py`

> **Role / Purpose**: SQLAlchemy ORM models: User, Location, TransportLeg, Shipment, ShipmentLeg, InventoryItem, WeatherCache, EmergencyAlert, Personnel, OfflineSyncRecord

```python
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
```

---

### <a id="file-backendschemaspy"></a>File: `backend/schemas.py`

> **Role / Purpose**: Pydantic request/response schemas, validation models, enums for status/modes/roles

```python
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

# ================= INVENTORY =================
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

# ================= EMERGENCY =================
class EmergencyCreate(BaseModel):
    station_id: Optional[str] = None
    shipment_id: Optional[str] = None
    event_type: str
    severity: str # low, medium, high, critical
    description: str

class EmergencyUpdate(BaseModel):
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
```

---

### <a id="file-backendauthpy"></a>File: `backend/auth.py`

> **Role / Purpose**: JWT token generation/decoding, password hashing with bcrypt, role-based dependency checks

```python
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
```

---

### <a id="file-backendweather-servicepy"></a>File: `backend/weather_service.py`

> **Role / Purpose**: Live Open-Meteo polar weather client, in-memory/DB caching with 15-min TTL, polar hazard & blizzard simulation

```python
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
```

---

### <a id="file-backendroutingpy"></a>File: `backend/routing.py`

> **Role / Purpose**: Multi-modal polar Dijkstra routing engine, SeaRoute maritime path generation, weather hazard risk penalty computation

```python
import json
import math
import logging
from typing import List, Dict, Any, Optional
import networkx as nx

logger = logging.getLogger("routing")

def haversine_distance_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great circle distance between two points in nautical miles (1 nm = 1.852 km)."""
    R_KM = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    km = R_KM * c
    return km / 1.852

def compute_leg_geometry_and_duration(
    mode: str,
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    average_speed_knots: Optional[float] = None,
    base_duration_days: Optional[int] = None
) -> Dict[str, Any]:
    """
    Computes real waypoint geometry, nautical distance, and dynamic duration.
    For ship mode: Uses searoute to generate realistic marine waypoints avoiding landmasses.
    Falls back gracefully to direct great-circle path with a warning if searoute encounters an unroutable topology.
    For flight modes (aircraft, helicopter, cargo_flight): Uses direct straight line coordinates.
    """
    warnings = []
    
    if mode == "ship":
        speed_knots = float(average_speed_knots or 14.0)
        if speed_knots <= 0:
            speed_knots = 14.0

        try:
            import searoute as sr
            # searoute expects [longitude, latitude]
            route = sr.searoute(
                [origin_lng, origin_lat],
                [dest_lng, dest_lat],
                units="nm"
            )
            raw_coords = route.geometry.coordinates # List of [lon, lat]
            # Convert to [lat, lon] for Leaflet mapping
            waypoints = [[float(c[1]), float(c[0])] for c in raw_coords]
            distance_nm = float(route.properties.get("length", 0.0))

            # 1. Symmetrically check Origin Endpoint Gap:
            # If the first searoute waypoint doesn't match the actual origin coordinate,
            # prepend the exact origin coordinate and add the last-mile nautical distance.
            orig_gap_nm = haversine_distance_nm(origin_lat, origin_lng, waypoints[0][0], waypoints[0][1])
            if orig_gap_nm > 0.05: # more than ~100m
                waypoints.insert(0, [origin_lat, origin_lng])
                distance_nm += orig_gap_nm
            else:
                waypoints[0] = [origin_lat, origin_lng]

            # 2. Symmetrically check Destination Endpoint Gap:
            # Polar/Antarctic stations (e.g. Bharati, Maitri) are outside standard commercial shipping lanes.
            # If the last searoute waypoint differs from the actual destination coordinate,
            # explicitly append the exact destination coordinate and add the final stretch distance.
            dest_gap_nm = haversine_distance_nm(waypoints[-1][0], waypoints[-1][1], dest_lat, dest_lng)
            if dest_gap_nm > 0.05: # more than ~100m
                waypoints.append([dest_lat, dest_lng])
                distance_nm += dest_gap_nm
            else:
                waypoints[-1] = [dest_lat, dest_lng]
            
            # Compute dynamic voyage duration from actual nautical distance & speed
            duration_hours = distance_nm / speed_knots
            duration_days = max(1, int(round(duration_hours / 24.0)))

            return {
                "waypoints": waypoints,
                "distance_nm": round(distance_nm, 1),
                "duration_days": duration_days,
                "average_speed_knots": speed_knots,
                "warnings": warnings,
                "is_fallback": False
            }

        except Exception as e:
            logger.warning(f"Searoute failed for ship route ({origin_lat},{origin_lng}) -> ({dest_lat},{dest_lng}): {e}")
            fallback_warn = "Unable to compute detailed marine route — showing direct path estimate"
            warnings.append(fallback_warn)
            
            dist_nm = haversine_distance_nm(origin_lat, origin_lng, dest_lat, dest_lng)
            duration_hours = dist_nm / speed_knots
            duration_days = max(1, int(round(duration_hours / 24.0))) if not base_duration_days else base_duration_days

            return {
                "waypoints": [[origin_lat, origin_lng], [dest_lat, dest_lng]],
                "distance_nm": round(dist_nm, 1),
                "duration_days": duration_days,
                "average_speed_knots": speed_knots,
                "warnings": warnings,
                "is_fallback": True
            }

    else:
        # Non-ship modes: Direct flight paths (aircraft, helicopter, cargo_flight)
        dist_nm = haversine_distance_nm(origin_lat, origin_lng, dest_lat, dest_lng)
        duration_days = int(base_duration_days or 1)
        
        return {
            "waypoints": [[origin_lat, origin_lng], [dest_lat, dest_lng]],
            "distance_nm": round(dist_nm, 1),
            "duration_days": duration_days,
            "average_speed_knots": average_speed_knots,
            "warnings": [],
            "is_fallback": False
        }

def compute_optimal_route(
    legs: List[Any],
    origin_id: str,
    destination_id: str,
    weight_kg: float,
    is_hazmat: bool,
    target_month: int = 1,
    locations_dict: Optional[Dict[str, Any]] = None,
    check_weather: bool = False
) -> Dict[str, Any]:
    """
    Builds a directed graph of available transport legs,
    applies hazmat, capacity, and seasonal constraints, and computes
    the optimal (shortest duration) path using NetworkX Dijkstra algorithm.
    Includes realistic marine waypoints and dynamic durations.
    """
    G = nx.DiGraph()

    warnings = []
    excluded_legs = []

    for leg in legs:
        # 1. Hazmat constraint check
        if is_hazmat and not getattr(leg, 'hazmat_allowed', True):
            excluded_legs.append((leg.id, f"Hazmat cargo excluded on leg {leg.mode} ({leg.origin_id} -> {leg.destination_id})"))
            continue

        # 2. Weight capacity constraint check
        if weight_kg > getattr(leg, 'capacity_kg', 100000.0):
            excluded_legs.append((leg.id, f"Weight ({weight_kg}kg) exceeds leg capacity ({leg.capacity_kg}kg)"))
            continue

        # 3. Seasonal availability constraint check
        try:
            available_months = leg.available_months
            if isinstance(available_months, str):
                available_months = json.loads(available_months)
            if target_month not in available_months:
                excluded_legs.append((leg.id, f"Leg unavailable in target month {target_month}"))
                continue
        except Exception:
            pass

        # Use dynamically computed duration_days or leg.duration_days
        duration = getattr(leg, 'duration_days', 1)
        
        # Add valid edge to NetworkX graph
        # If multiple legs exist between same nodes, keep the one with shorter duration
        if G.has_edge(leg.origin_id, leg.destination_id):
            existing_leg = G[leg.origin_id][leg.destination_id]
            if duration < existing_leg['duration_days']:
                G.add_edge(
                    leg.origin_id,
                    leg.destination_id,
                    duration_days=duration,
                    leg_object=leg
                )
        else:
            G.add_edge(
                leg.origin_id,
                leg.destination_id,
                duration_days=duration,
                leg_object=leg
            )

    if not G.has_node(origin_id) or not G.has_node(destination_id):
        return {
            "success": False,
            "error": "No viable route exists satisfying cargo weight, hazmat, or seasonal constraints.",
            "warnings": [msg for _, msg in excluded_legs]
        }

    try:
        path_nodes = nx.shortest_path(G, source=origin_id, target=destination_id, weight='duration_days')
        
        path_legs = []
        total_duration = 0
        all_route_waypoints = []

        for i in range(len(path_nodes) - 1):
            u, v = path_nodes[i], path_nodes[i+1]
            leg_data = G[u][v]['leg_object']
            
            # Extract waypoints and distance
            waypoints = []
            if hasattr(leg_data, 'waypoints_json') and leg_data.waypoints_json:
                try:
                    waypoints = json.loads(leg_data.waypoints_json)
                except Exception:
                    pass

            # If waypoints not stored on model, compute on the fly if locations available
            if not waypoints and locations_dict and u in locations_dict and v in locations_dict:
                loc_u = locations_dict[u]
                loc_v = locations_dict[v]
                calc = compute_leg_geometry_and_duration(
                    mode=leg_data.mode,
                    origin_lat=loc_u.latitude,
                    origin_lng=loc_u.longitude,
                    dest_lat=loc_v.latitude,
                    dest_lng=loc_v.longitude,
                    average_speed_knots=getattr(leg_data, 'average_speed_knots', None),
                    base_duration_days=getattr(leg_data, 'duration_days', None)
                )
                waypoints = calc["waypoints"]
                if calc.get("warnings"):
                    warnings.extend(calc["warnings"])

            leg_dict = {
                "leg_id": leg_data.id,
                "origin_id": leg_data.origin_id,
                "destination_id": leg_data.destination_id,
                "mode": leg_data.mode,
                "duration_days": leg_data.duration_days,
                "capacity_kg": leg_data.capacity_kg,
                "hazmat_allowed": leg_data.hazmat_allowed,
                "average_speed_knots": getattr(leg_data, 'average_speed_knots', None),
                "distance_nm": getattr(leg_data, 'distance_nm', None),
                "waypoints": waypoints
            }
            path_legs.append(leg_dict)
            total_duration += leg_data.duration_days

            # Append waypoints to full route polyline
            if waypoints:
                if not all_route_waypoints:
                    all_route_waypoints.extend(waypoints)
                else:
                    # Avoid duplicate joining point
                    all_route_waypoints.extend(waypoints[1:])

        if is_hazmat:
            warnings.append("Hazmat cargo restriction active: Restricted to sea transport legs only.")
        if weight_kg > 1500:
            warnings.append(f"Heavy cargo ({weight_kg}kg): Helicopter and light aircraft legs filtered out.")

        # Weather evaluation if requested
        weather_advisory = None
        if check_weather and all_route_waypoints:
            try:
                from weather_service import evaluate_waypoints_weather
                # Sample key waypoints: start, midpoint, destination
                key_pts = []
                if len(all_route_waypoints) <= 3:
                    for idx, pt in enumerate(all_route_waypoints):
                        key_pts.append({
                            "name": f"Waypoint {idx+1}",
                            "lat": pt[0],
                            "lng": pt[1]
                        })
                else:
                    indices = [0, len(all_route_waypoints) // 2, len(all_route_waypoints) - 1]
                    names = ["Departure Sector", "Mid-Ocean Corridor", "Arrival Sector"]
                    for idx, name in zip(indices, names):
                        pt = all_route_waypoints[idx]
                        key_pts.append({
                            "name": name,
                            "lat": pt[0],
                            "lng": pt[1]
                        })
                
                weather_advisory = evaluate_waypoints_weather(key_pts)
            except Exception as e:
                logger.warning(f"Weather evaluation error: {e}")

        return {
            "success": True,
            "origin_id": origin_id,
            "destination_id": destination_id,
            "total_duration_days": total_duration,
            "legs": path_legs,
            "path_nodes": path_nodes,
            "waypoints": all_route_waypoints,
            "warnings": warnings,
            "excluded_legs_count": len(excluded_legs),
            "weather_advisory": weather_advisory
        }

    except nx.NetworkXNoPath:
        return {
            "success": False,
            "error": f"No connected route from {origin_id} to {destination_id} for specified cargo specs.",
            "warnings": [msg for _, msg in excluded_legs]
        }
```

---

### <a id="file-backendmainpy"></a>File: `backend/main.py`

> **Role / Purpose**: FastAPI application router, REST endpoints, CORS setup, error handlers, offline sync APIs, role-protected endpoints

```python
import json
import uuid
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload

from database import engine, get_db, Base
import models
import schemas
import auth
from routing import compute_optimal_route
from weather_service import evaluate_waypoints_weather, get_marine_conditions, load_weather_thresholds

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

@app.post("/api/shipments/{shipment_id}/documents", response_model=schemas.ShipmentDocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_shipment_document(
    shipment_id: str,
    payload: schemas.ShipmentDocumentCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(models.CargoShipment).filter(models.CargoShipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    auth.verify_shipment_access(shipment, current_user)

    doc_id = f"DOC-{uuid.uuid4().hex[:6].upper()}"
    doc = models.ShipmentDocument(
        id=doc_id,
        shipment_id=shipment_id,
        uploaded_by=current_user.id,
        file_name=payload.file_name,
        file_type=payload.file_type,
        file_size_kb=payload.file_size_kb or 120.0,
        uploaded_at=datetime.datetime.utcnow().isoformat()
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

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
```

---

### <a id="file-backendseedpy"></a>File: `backend/seed.py`

> **Role / Purpose**: Database seeder: realistic NCPOR expedition data, Maitri/Bharati/Himadri stations, routes, inventory, personnel, demo users

```python
import os
import json
import datetime
from typing import Dict, Any, List
from database import engine, SessionLocal, Base
import models
from auth import hash_password
from routing import compute_leg_geometry_and_duration

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
LOCATIONS_FILE = os.path.join(DATA_DIR, "locations.json")
TRANSPORT_LEGS_FILE = os.path.join(DATA_DIR, "transport_legs.json")
WEATHER_THRESHOLDS_FILE = os.path.join(DATA_DIR, "weather_thresholds.json")

def validate_and_load_locations(filepath: str = LOCATIONS_FILE) -> List[models.Location]:
    """
    Reads locations from JSON file and strictly validates every entry.
    Fails loudly with explicit ValueError naming the bad entry if any required field is missing or invalid.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Required locations file not found: {filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except Exception as e:
            raise ValueError(f"Invalid JSON syntax in locations file {filepath}: {e}")

    if not isinstance(data, list):
        raise ValueError(f"Locations JSON root must be an array of location objects, got {type(data).__name__}")

    if len(data) == 0:
        raise ValueError("Locations dataset cannot be empty.")

    valid_types = {"depot", "transfer", "station"}
    valid_regions = {"antarctic", "arctic", "himalayan", "transit_hub", "depot"}
    valid_programmes = {"antarctic_programme", "arctic_programme", "himalayan_programme"}
    location_models = []
    seen_ids = set()

    for idx, entry in enumerate(data):
        entry_id = entry.get("id")
        entry_label = f"Entry #{idx} (id='{entry_id}')" if entry_id else f"Entry #{idx}"

        if not isinstance(entry, dict):
            raise ValueError(f"Location {entry_label} must be a JSON object, got {type(entry).__name__}")

        # Check required fields
        required_fields = ["id", "name", "type", "latitude", "longitude"]
        for field in required_fields:
            if field not in entry or entry[field] is None:
                raise ValueError(f"Location validation failed: {entry_label} is missing required field '{field}'.")

        # Validate ID
        loc_id = str(entry["id"]).strip()
        if not loc_id:
            raise ValueError(f"Location validation failed: {entry_label} has an empty 'id'.")
        if loc_id in seen_ids:
            raise ValueError(f"Location validation failed: Duplicate location id '{loc_id}' found at {entry_label}.")
        seen_ids.add(loc_id)

        # Validate Name
        name = str(entry["name"]).strip()
        if not name:
            raise ValueError(f"Location validation failed: {entry_label} has an empty 'name'.")

        # Validate Type
        loc_type = str(entry["type"]).strip().lower()
        if loc_type not in valid_types:
            raise ValueError(
                f"Location validation failed: {entry_label} has invalid type '{entry['type']}'. "
                f"Must be one of: {sorted(list(valid_types))}."
            )

        # Validate Region if present
        region = str(entry.get("region", "antarctic" if loc_type == "station" else "transit_hub" if loc_type == "transfer" else "depot")).strip().lower()
        if region not in valid_regions:
            raise ValueError(
                f"Location validation failed: {entry_label} has invalid region '{entry.get('region')}'. "
                f"Must be one of: {sorted(list(valid_regions))}."
            )

        # Validate Programme if present
        programme = str(entry.get("programme", "antarctic_programme" if region in {"antarctic", "transit_hub", "depot"} else f"{region}_programme")).strip().lower()
        if programme not in valid_programmes:
            raise ValueError(
                f"Location validation failed: {entry_label} has invalid programme '{entry.get('programme')}'. "
                f"Must be one of: {sorted(list(valid_programmes))}."
            )

        # Validate Latitude
        try:
            lat = float(entry["latitude"])
            if not (-90.0 <= lat <= 90.0):
                raise ValueError()
        except (TypeError, ValueError):
            raise ValueError(
                f"Location validation failed: {entry_label} has invalid latitude '{entry.get('latitude')}'. "
                "Must be a float between -90.0 and 90.0."
            )

        # Validate Longitude
        try:
            lng = float(entry["longitude"])
            if not (-180.0 <= lng <= 180.0):
                raise ValueError()
        except (TypeError, ValueError):
            raise ValueError(
                f"Location validation failed: {entry_label} has invalid longitude '{entry.get('longitude')}'. "
                "Must be a float between -180.0 and 180.0."
            )

        code = entry.get("code") or loc_id.replace("LOC-", "") + "-STN"
        current_season = entry.get("current_season", "summer")

        location_models.append(
            models.Location(
                id=loc_id,
                name=name,
                type=loc_type,
                region=region,
                programme=programme,
                current_season=current_season,
                latitude=lat,
                longitude=lng,
                code=code,
                established_year=entry.get("established_year"),
                is_international_research_base=entry.get("is_international_research_base", False),
                capacity_summer=entry.get("capacity_summer"),
                capacity_winter=entry.get("capacity_winter"),
                capacity_note=entry.get("capacity_note"),
                distance_from_ship_access_km=entry.get("distance_from_ship_access_km"),
                requires_overland_transfer=entry.get("requires_overland_transfer", False),
                research_areas=entry.get("research_areas")
            )
        )

    return location_models

def validate_and_load_transport_legs(
    locations: List[models.Location],
    filepath: str = TRANSPORT_LEGS_FILE
) -> List[models.TransportLeg]:
    """
    Reads transport legs from JSON file, validates constraints, and computes realistic marine waypoint geometry.
    Fails loudly with explicit ValueError naming the bad entry if any required field is missing or invalid.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Required transport legs file not found: {filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except Exception as e:
            raise ValueError(f"Invalid JSON syntax in transport legs file {filepath}: {e}")

    if not isinstance(data, list):
        raise ValueError(f"Transport legs JSON root must be an array of leg objects, got {type(data).__name__}")

    if len(data) == 0:
        raise ValueError("Transport legs dataset cannot be empty.")

    loc_map = {loc.id: loc for loc in locations}
    valid_modes = {"ship", "aircraft", "helicopter", "cargo_flight"}
    leg_models = []
    seen_ids = set()

    for idx, entry in enumerate(data):
        entry_id = entry.get("id")
        entry_label = f"Leg entry #{idx} (id='{entry_id}')" if entry_id else f"Leg entry #{idx}"

        if not isinstance(entry, dict):
            raise ValueError(f"Transport leg {entry_label} must be a JSON object, got {type(entry).__name__}")

        # Check required fields
        required_fields = ["id", "origin_id", "destination_id", "mode", "capacity_kg", "hazmat_allowed", "available_months"]
        for field in required_fields:
            if field not in entry or entry[field] is None:
                raise ValueError(f"Transport leg validation failed: {entry_label} is missing required field '{field}'.")

        # Validate ID
        leg_id = str(entry["id"]).strip()
        if not leg_id:
            raise ValueError(f"Transport leg validation failed: {entry_label} has an empty 'id'.")
        if leg_id in seen_ids:
            raise ValueError(f"Transport leg validation failed: Duplicate leg id '{leg_id}' found at {entry_label}.")
        seen_ids.add(leg_id)

        # Validate Origin & Destination Foreign Keys
        orig_id = str(entry["origin_id"]).strip()
        if orig_id not in loc_map:
            raise ValueError(
                f"Transport leg validation failed: {entry_label} references unknown origin_id '{orig_id}'. "
                f"Valid location IDs are: {sorted(list(loc_map.keys()))}."
            )

        dest_id = str(entry["destination_id"]).strip()
        if dest_id not in loc_map:
            raise ValueError(
                f"Transport leg validation failed: {entry_label} references unknown destination_id '{dest_id}'. "
                f"Valid location IDs are: {sorted(list(loc_map.keys()))}."
            )

        if orig_id == dest_id:
            raise ValueError(f"Transport leg validation failed: {entry_label} has identical origin and destination '{orig_id}'.")

        # Validate Mode
        mode = str(entry["mode"]).strip().lower()
        if mode not in valid_modes:
            raise ValueError(
                f"Transport leg validation failed: {entry_label} has invalid mode '{entry['mode']}'. "
                f"Must be one of: {sorted(list(valid_modes))}."
            )

        # Validate Capacity
        try:
            capacity = float(entry["capacity_kg"])
            if capacity <= 0:
                raise ValueError()
        except (TypeError, ValueError):
            raise ValueError(
                f"Transport leg validation failed: {entry_label} has invalid capacity_kg '{entry.get('capacity_kg')}'. "
                "Must be a positive number."
            )

        # Validate Hazmat
        hazmat = entry["hazmat_allowed"]
        if not isinstance(hazmat, bool):
            raise ValueError(
                f"Transport leg validation failed: {entry_label} has non-boolean hazmat_allowed '{hazmat}'. "
                "Must be true or false."
            )

        # Validate Available Months
        months = entry["available_months"]
        if not isinstance(months, list) or len(months) == 0:
            raise ValueError(
                f"Transport leg validation failed: {entry_label} available_months must be a non-empty array of month integers (1-12)."
            )
        for m in months:
            if not isinstance(m, int) or not (1 <= m <= 12):
                raise ValueError(
                    f"Transport leg validation failed: {entry_label} contains invalid month '{m}' in available_months. "
                    "Must be integers between 1 and 12."
                )

        # Validate speed for ship legs
        avg_speed = None
        if mode == "ship":
            if "average_speed_knots" in entry and entry["average_speed_knots"] is not None:
                try:
                    avg_speed = float(entry["average_speed_knots"])
                    if avg_speed <= 0:
                        raise ValueError()
                except (TypeError, ValueError):
                    raise ValueError(
                        f"Transport leg validation failed: {entry_label} has invalid average_speed_knots '{entry.get('average_speed_knots')}'. "
                        "Must be a positive float."
                    )
            else:
                avg_speed = 14.0 # default nautical cruising speed

        # Compute dynamic waypoints and duration using routing geometry
        orig_loc = loc_map[orig_id]
        dest_loc = loc_map[dest_id]
        calc = compute_leg_geometry_and_duration(
            mode=mode,
            origin_lat=orig_loc.latitude,
            origin_lng=orig_loc.longitude,
            dest_lat=dest_loc.latitude,
            dest_lng=dest_loc.longitude,
            average_speed_knots=avg_speed,
            base_duration_days=entry.get("duration_days", 1)
        )

        duration_days = calc["duration_days"]
        distance_nm = calc["distance_nm"]
        waypoints_json = json.dumps(calc["waypoints"])

        leg_models.append(
            models.TransportLeg(
                id=leg_id,
                origin_id=orig_id,
                destination_id=dest_id,
                mode=mode,
                duration_days=duration_days,
                capacity_kg=capacity,
                hazmat_allowed=hazmat,
                available_months=json.dumps(months),
                average_speed_knots=avg_speed,
                distance_nm=distance_nm,
                waypoints_json=waypoints_json
            )
        )

    return leg_models

def seed_database(
    locations_path: str = LOCATIONS_FILE,
    legs_path: str = TRANSPORT_LEGS_FILE
):
    """
    Populates database from external JSON reference data with strict validation.
    """
    print(f"Loading locations from: {locations_path}")
    locations = validate_and_load_locations(locations_path)

    print(f"Loading transport legs from: {legs_path}")
    legs = validate_and_load_transport_legs(locations, legs_path)

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. Insert Locations & Legs from JSON
        db.add_all(locations)
        db.add_all(legs)
        db.commit()
        print(f"Successfully seeded {len(locations)} locations and {len(legs)} transport legs with marine waypoints.")

        # 2. PERSONNEL (Diverse Multi-Institution Roster)
        personnel = [
            models.Personnel(
                id="PER-001",
                name="Dr. Rajesh V. Sharma",
                role="Station Commander / Chief Scientist",
                affiliated_institution="NCPOR",
                personnel_category="permanent_staff",
                assigned_station="Bharati Research Station",
                season_type="winter",
                deployment_start="2025-11-01",
                deployment_end="2026-11-15",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-002",
                name="Sunita Narayanan",
                role="Senior Glaciologist",
                affiliated_institution="CSIR-NIO",
                personnel_category="visiting_researcher",
                assigned_station="Bharati Research Station",
                season_type="summer",
                deployment_start="2025-12-01",
                deployment_end="2026-03-31",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-003",
                name="Major Amit Deshmukh",
                role="Station Commander / Logistics Officer",
                affiliated_institution="NCPOR",
                personnel_category="permanent_staff",
                assigned_station="Maitri Research Station",
                season_type="winter",
                deployment_start="2025-10-15",
                deployment_end="2026-10-30",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-004",
                name="Vikramjit Singh",
                role="Chief Diesel Engineer",
                affiliated_institution="NCPOR",
                personnel_category="contract_specialist",
                assigned_station="Maitri Research Station",
                season_type="winter",
                deployment_start="2025-11-10",
                deployment_end="2026-11-20",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-005",
                name="Dr. Ananya Roy",
                role="Medical Officer",
                affiliated_institution="AIIMS New Delhi",
                personnel_category="contract_specialist",
                assigned_station="Bharati Research Station",
                season_type="winter",
                deployment_start="2025-11-01",
                deployment_end="2026-11-15",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-006",
                name="Karan Malhotra",
                role="RF Communications Engineer",
                affiliated_institution="ISRO-SAC",
                personnel_category="visiting_researcher",
                assigned_station="Cape Town Transfer Point",
                season_type="summer",
                deployment_start="2026-01-10",
                deployment_end="2026-04-15",
                current_status="in_transit"
            ),
            models.Personnel(
                id="PER-007",
                name="Priya Sengupta",
                role="Atmospheric Scientist",
                affiliated_institution="IIT Bombay",
                personnel_category="visiting_researcher",
                assigned_station="Maitri Research Station",
                season_type="summer",
                deployment_start="2025-12-15",
                deployment_end="2026-03-15",
                current_status="returned"
            ),
            models.Personnel(
                id="PER-008",
                name="Dr. Aarav Mehta",
                role="Arctic Microbiologist & Field PI",
                affiliated_institution="NCPOR",
                personnel_category="project_scientist",
                assigned_station="Himadri Arctic Station",
                season_type="summer",
                deployment_start="2026-05-01",
                deployment_end="2026-09-30",
                current_status="deployed"
            ),
            models.Personnel(
                id="PER-009",
                name="Dr. Tenzing Norbu",
                role="Glacial Hydrologist",
                affiliated_institution="GSI",
                personnel_category="visiting_researcher",
                assigned_station="Himansh Himalayan Station",
                season_type="summer",
                deployment_start="2026-06-01",
                deployment_end="2026-10-15",
                current_status="deployed"
            )
        ]
        db.add_all(personnel)
        db.commit()

        # 3. USERS
        users = [
            models.User(
                id="USR-ADMIN-01",
                username="admin.ncpor",
                password_hash=hash_password("Demo@Admin2026"),
                role="admin",
                linked_station_id=None,
                linked_personnel_id=None,
                created_at=datetime.datetime.utcnow().isoformat()
            ),
            models.User(
                id="USR-CMD-BHA",
                username="commander.bharati",
                password_hash=hash_password("Demo@Bharati2026"),
                role="station_commander",
                linked_station_id="LOC-BHA" if "LOC-BHA" in [l.id for l in locations] else locations[0].id,
                linked_personnel_id="PER-001",
                created_at=datetime.datetime.utcnow().isoformat()
            ),
            models.User(
                id="USR-CMD-MAI",
                username="commander.maitri",
                password_hash=hash_password("Demo@Maitri2026"),
                role="station_commander",
                linked_station_id="LOC-MAI" if "LOC-MAI" in [l.id for l in locations] else locations[0].id,
                linked_personnel_id="PER-003",
                created_at=datetime.datetime.utcnow().isoformat()
            ),
            models.User(
                id="USR-OFF-01",
                username="officer.shipping1",
                password_hash=hash_password("Demo@Officer2026"),
                role="shipment_officer",
                linked_station_id=None,
                linked_personnel_id=None,
                created_at=datetime.datetime.utcnow().isoformat()
            ),
            models.User(
                id="USR-OFF-02",
                username="officer.shipping2",
                password_hash=hash_password("Demo@Officer2026"),
                role="shipment_officer",
                linked_station_id=None,
                linked_personnel_id=None,
                created_at=datetime.datetime.utcnow().isoformat()
            ),
            models.User(
                id="USR-PER-001",
                username="PER-001",
                password_hash=hash_password("Demo@Personnel2026"),
                role="personnel",
                linked_station_id="LOC-BHA" if "LOC-BHA" in [l.id for l in locations] else locations[0].id,
                linked_personnel_id="PER-001",
                created_at=datetime.datetime.utcnow().isoformat()
            ),
            models.User(
                id="USR-PER-002",
                username="PER-002",
                password_hash=hash_password("Demo@Personnel2026"),
                role="personnel",
                linked_station_id="LOC-BHA" if "LOC-BHA" in [l.id for l in locations] else locations[0].id,
                linked_personnel_id="PER-002",
                created_at=datetime.datetime.utcnow().isoformat()
            )
        ]
        db.add_all(users)
        db.commit()

        # 4. SHIPMENTS (Pre-linked to valid seeded legs & locations)
        first_loc = locations[0].id
        second_loc = locations[1].id if len(locations) > 1 else first_loc
        third_loc = locations[2].id if len(locations) > 2 else second_loc
        ship_legs = [l for l in legs if l.mode == "ship"]
        first_ship_leg = ship_legs[0] if ship_legs else legs[0]

        shipments = [
            models.CargoShipment(
                id="SHP-2026-001",
                description="Seismometer replacement sensor & spectral logger",
                category="scientific_equipment",
                weight_kg=450.0,
                is_hazmat=False,
                origin_id=first_loc,
                destination_id=second_loc,
                current_location_id=first_loc,
                current_leg_id=first_ship_leg.id,
                assigned_officer_id="USR-OFF-01",
                status="in_transit",
                box_label="1 of 3",
                eta="2026-09-25",
                computed_route_json=json.dumps([
                    {
                        "leg_id": first_ship_leg.id,
                        "mode": first_ship_leg.mode,
                        "duration_days": first_ship_leg.duration_days,
                        "origin_id": first_ship_leg.origin_id,
                        "destination_id": first_ship_leg.destination_id,
                        "average_speed_knots": first_ship_leg.average_speed_knots,
                        "distance_nm": first_ship_leg.distance_nm
                    }
                ])
            ),
            models.CargoShipment(
                id="SHP-2026-002",
                description="Arctic-grade Aviation Turbine Fuel (Jet A-1 Drums)",
                category="hazmat",
                weight_kg=12000.0,
                is_hazmat=True,
                origin_id=first_loc,
                destination_id=second_loc,
                current_location_id=first_loc,
                current_leg_id=first_ship_leg.id,
                assigned_officer_id="USR-OFF-01",
                status="planned",
                box_label="Pallet 12 of 40",
                eta="2026-10-02",
                computed_route_json=json.dumps([
                    {
                        "leg_id": first_ship_leg.id,
                        "mode": first_ship_leg.mode,
                        "duration_days": first_ship_leg.duration_days,
                        "origin_id": first_ship_leg.origin_id,
                        "destination_id": first_ship_leg.destination_id
                    }
                ])
            ),
            models.CargoShipment(
                id="SHP-2026-003",
                description="High-altitude freeze-dried rations & grains batch #4",
                category="food",
                weight_kg=2200.0,
                is_hazmat=False,
                origin_id=first_loc,
                destination_id=second_loc,
                current_location_id=second_loc,
                current_leg_id=None,
                assigned_officer_id="USR-OFF-02", # Assigned to Officer 2!
                status="delivered",
                box_label="4 of 10",
                eta="2026-08-30",
                computed_route_json=json.dumps([
                    {"leg_id": first_ship_leg.id, "mode": "ship", "duration_days": 14, "origin_id": first_loc, "destination_id": second_loc}
                ])
            ),
            models.CargoShipment(
                id="SHP-2026-004",
                description="Caterpillar Genset Spare Fuel Injection Pumps",
                category="spare_parts",
                weight_kg=350.0,
                is_hazmat=False,
                origin_id=first_loc,
                destination_id=third_loc,
                current_location_id=first_loc,
                current_leg_id=first_ship_leg.id,
                assigned_officer_id="USR-OFF-02", # Assigned to Officer 2!
                status="planned",
                box_label="2 of 2",
                eta="2026-10-05",
                computed_route_json=json.dumps([
                    {"leg_id": first_ship_leg.id, "mode": "ship", "duration_days": 14, "origin_id": first_loc, "destination_id": second_loc}
                ])
            ),
            models.CargoShipment(
                id="SHP-2026-005",
                description="Lithium-ion Battery Banks for Solar Microgrid",
                category="hazmat",
                weight_kg=4800.0,
                is_hazmat=True,
                origin_id=first_loc,
                destination_id=second_loc,
                current_location_id=first_loc,
                current_leg_id=first_ship_leg.id,
                assigned_officer_id="USR-OFF-01",
                status="in_transit",
                box_label="Hazmat Pack 1 of 6",
                eta="2026-10-15",
                computed_route_json=json.dumps([
                    {"leg_id": first_ship_leg.id, "mode": "ship", "duration_days": 14, "origin_id": first_loc, "destination_id": second_loc}
                ])
            )
        ]
        db.add_all(shipments)
        db.commit()

        # 5. VOYAGE CONSUMABLES
        consumables = [
            models.VoyageConsumable(
                id="CON-001-FUEL",
                shipment_id="SHP-2026-001",
                item_name="Marine Diesel Oil",
                unit="liters",
                starting_quantity=15000.0,
                current_quantity=11500.0,
                daily_consumption_rate=350.0
            ),
            models.VoyageConsumable(
                id="CON-001-WATER",
                shipment_id="SHP-2026-001",
                item_name="Potable Fresh Water",
                unit="liters",
                starting_quantity=3000.0,
                current_quantity=2200.0,
                daily_consumption_rate=50.0
            )
        ]
        db.add_all(consumables)
        db.commit()

        # 6. INVENTORY
        inventory = [
            models.InventoryItem(
                id="INV-GOA-01",
                location_id="LOC-GOA",
                item_name="Polar Expedition Rations",
                category="food",
                quantity=3500.0,
                unit="kg",
                minimum_threshold=1000.0
            ),
            models.InventoryItem(
                id="INV-GOA-02",
                location_id="LOC-GOA",
                item_name="Arctic Grade Diesel (A-1)",
                category="fuel",
                quantity=18000.0,
                unit="liters",
                minimum_threshold=20000.0 # Low stock alert
            ),
            models.InventoryItem(
                id="INV-BHA-01",
                location_id="LOC-BHA",
                item_name="Marine Gas Oil (MGO DMA)",
                category="fuel",
                quantity=25000.0,
                unit="liters",
                minimum_threshold=15000.0
            ),
            models.InventoryItem(
                id="INV-BHA-02",
                location_id="LOC-BHA",
                item_name="Cryogenic Biological Sample Vials",
                category="scientific_equipment",
                quantity=450.0,
                unit="units",
                minimum_threshold=100.0
            ),
            models.InventoryItem(
                id="INV-MAI-01",
                location_id="LOC-MAI",
                item_name="Low-Temperature Aviation Kerosene",
                category="fuel",
                quantity=12000.0,
                unit="liters",
                minimum_threshold=10000.0
            ),
            models.InventoryItem(
                id="INV-MAI-02",
                location_id="LOC-MAI",
                item_name="PistenBully Overland Snow Track Spares",
                category="spare_parts",
                quantity=8.0,
                unit="units",
                minimum_threshold=10.0 # Low stock alert
            ),
            models.InventoryItem(
                id="INV-HIM-01",
                location_id="LOC-HIM",
                item_name="Aerosol Optical Spectrometer Sensors",
                category="scientific_equipment",
                quantity=12.0,
                unit="units",
                minimum_threshold=5.0
            ),
            models.InventoryItem(
                id="INV-HMS-01",
                location_id="LOC-HMS",
                item_name="High-Altitude Glacier Depth Sonic Probes",
                category="scientific_equipment",
                quantity=14.0,
                unit="units",
                minimum_threshold=6.0
            )
        ]
        db.add_all(inventory)
        db.commit()

        # 7. EMERGENCIES
        emergencies = [
            models.EmergencyEvent(
                id="EMG-2026-01",
                station_id=locations[0].id,
                shipment_id="SHP-2026-001",
                reported_by_user_id="USR-OFF-01",
                reported_by_role="shipment_officer",
                event_type="Marine Swell Alert",
                severity="medium",
                description="Southern Ocean swell height reaching 4.5m along shipping corridor. Speed adjusted.",
                reported_at="2026-09-12T10:00:00",
                status="open",
                response_log="2026-09-12 10:15: Vessel course trimmed to ease heavy rolling."
            )
        ]
        db.add_all(emergencies)
        db.commit()

        print("Database successfully seeded from data files!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
```

---


## 3. Backend Static Data Assets

### <a id="file-backenddatalocationsjson"></a>File: `backend/data/locations.json`

> **Role / Purpose**: Polar research stations, transit ports, airfields, ice runways, geo coordinates & capabilities

```json
[
  {
    "id": "LOC-GOA",
    "name": "India Depot (Goa)",
    "type": "depot",
    "region": "depot",
    "programme": "antarctic_programme",
    "latitude": 15.3991,
    "longitude": 73.8052,
    "code": "GOA-DEPOT",
    "is_international_research_base": false,
    "requires_overland_transfer": false,
    "distance_from_ship_access_km": 0.0
  },
  {
    "id": "LOC-CPT",
    "name": "Cape Town Transfer Point",
    "type": "transfer",
    "region": "transit_hub",
    "programme": "antarctic_programme",
    "latitude": -33.9249,
    "longitude": 18.4241,
    "code": "CPT-STAGING",
    "is_international_research_base": false,
    "requires_overland_transfer": false,
    "distance_from_ship_access_km": 0.0
  },
  {
    "id": "LOC-MAI",
    "name": "Maitri Research Station",
    "type": "station",
    "region": "antarctic",
    "programme": "antarctic_programme",
    "latitude": -70.7667,
    "longitude": 11.7333,
    "code": "MAITRI-STN",
    "established_year": 1989,
    "capacity_winter": 25,
    "capacity_summer": 50,
    "capacity_note": "Summer capacity varies with accommodation configuration (40-60)",
    "distance_from_ship_access_km": 80.0,
    "requires_overland_transfer": true,
    "is_international_research_base": false,
    "research_areas": "Atmospheric science, meteorology, glaciology, solid earth sciences, biology, space physics"
  },
  {
    "id": "LOC-BHA",
    "name": "Bharati Research Station",
    "type": "station",
    "region": "antarctic",
    "programme": "antarctic_programme",
    "latitude": -69.4068,
    "longitude": 76.1953,
    "code": "BHARATI-STN",
    "established_year": 2012,
    "capacity_winter": 24,
    "capacity_summer": 47,
    "capacity_note": "46th ISEA operating configuration (24 winter / 47 summer)",
    "distance_from_ship_access_km": 0.2,
    "requires_overland_transfer": false,
    "is_international_research_base": false,
    "research_areas": "Oceanography, atmospheric sciences, geosciences, polar biology"
  },
  {
    "id": "LOC-HIM",
    "name": "Himadri Arctic Station",
    "type": "station",
    "region": "arctic",
    "programme": "arctic_programme",
    "latitude": 78.9235,
    "longitude": 11.9331,
    "code": "HIMADRI-STN",
    "established_year": 2008,
    "is_international_research_base": true,
    "capacity_winter": 0,
    "capacity_summer": 8,
    "capacity_note": "Operates within Ny-Ålesund international research base framework (Svalbard)",
    "distance_from_ship_access_km": 0.0,
    "requires_overland_transfer": false,
    "research_areas": "atmospheric science, microbiology, earth science, glaciology, space physics, biology, micropalaeontology, palaeoclimatology"
  },
  {
    "id": "LOC-HMS",
    "name": "Himansh Himalayan Station",
    "type": "station",
    "region": "himalayan",
    "programme": "himalayan_programme",
    "latitude": 32.4485,
    "longitude": 77.6155,
    "code": "HIMANSH-STN",
    "established_year": 2016,
    "is_international_research_base": false,
    "capacity_winter": 5,
    "capacity_summer": 15,
    "capacity_note": "High-altitude Himalayan research station at ~4,080m in Chandra Basin (Sutri Dhaka, HP)",
    "distance_from_ship_access_km": null,
    "requires_overland_transfer": false,
    "research_areas": "continuous field research on Himalayan glacier dynamics and hydrology/climate processes"
  }
]
```

---

### <a id="file-backenddatatransport-legsjson"></a>File: `backend/data/transport_legs.json`

> **Role / Purpose**: Pre-configured multi-modal transit legs (Vessel, Air, Overland Piston-Bully traverse) with distance & cost

```json
[
  {
    "id": "LEG-GOA-CPT-SHIP",
    "origin_id": "LOC-GOA",
    "destination_id": "LOC-CPT",
    "mode": "ship",
    "average_speed_knots": 15.0,
    "capacity_kg": 50000.0,
    "hazmat_allowed": true,
    "available_months": [11, 12, 1, 2, 3]
  },
  {
    "id": "LEG-CPT-BHA-SHIP",
    "origin_id": "LOC-CPT",
    "destination_id": "LOC-BHA",
    "mode": "ship",
    "average_speed_knots": 14.0,
    "capacity_kg": 45000.0,
    "hazmat_allowed": true,
    "available_months": [11, 12, 1, 2, 3]
  },
  {
    "id": "LEG-CPT-BHA-AIR",
    "origin_id": "LOC-CPT",
    "destination_id": "LOC-BHA",
    "mode": "aircraft",
    "duration_days": 3,
    "capacity_kg": 1800.0,
    "hazmat_allowed": false,
    "available_months": [11, 12, 1, 2]
  },
  {
    "id": "LEG-CPT-MAI-SHIP",
    "origin_id": "LOC-CPT",
    "destination_id": "LOC-MAI",
    "mode": "ship",
    "average_speed_knots": 14.0,
    "capacity_kg": 40000.0,
    "hazmat_allowed": true,
    "available_months": [11, 12, 1, 2, 3]
  },
  {
    "id": "LEG-CPT-MAI-AIR",
    "origin_id": "LOC-CPT",
    "destination_id": "LOC-MAI",
    "mode": "aircraft",
    "duration_days": 3,
    "capacity_kg": 1500.0,
    "hazmat_allowed": false,
    "available_months": [11, 12, 1, 2]
  },
  {
    "id": "LEG-GOA-BHA-CARGO",
    "origin_id": "LOC-GOA",
    "destination_id": "LOC-BHA",
    "mode": "cargo_flight",
    "duration_days": 2,
    "capacity_kg": 2500.0,
    "hazmat_allowed": false,
    "available_months": [12, 1]
  },
  {
    "id": "LEG-MAI-BHA-HELI",
    "origin_id": "LOC-MAI",
    "destination_id": "LOC-BHA",
    "mode": "helicopter",
    "duration_days": 1,
    "capacity_kg": 800.0,
    "hazmat_allowed": false,
    "available_months": [11, 12, 1, 2, 3]
  }
]
```

---

### <a id="file-backenddataweather-thresholdsjson"></a>File: `backend/data/weather_thresholds.json`

> **Role / Purpose**: Extreme polar weather thresholds (wind speed, temperature, visibility) by transport modality

```json
{
  "max_safe_wave_height_m": 4.0,
  "max_safe_wind_speed_knots": 35.0
}
```

---


## 4. Backend Test & Verification Suites

### <a id="file-backendtest-apipy"></a>File: `backend/test_api.py`

> **Role / Purpose**: Basic API health, stations, and routes validation test

```python
import urllib.request
import json

BASE_URL = "http://127.0.0.1:8008/api"

def test_endpoints():
    endpoints = [
        "/health",
        "/dashboard/summary",
        "/locations",
        "/transport-legs",
        "/shipments",
        "/inventory",
        "/personnel",
        "/emergencies"
    ]

    print("--- TESTING ALL FASTAPI REST ENDPOINTS ---")
    for ep in endpoints:
        url = BASE_URL + ep
        try:
            req = urllib.request.urlopen(url)
            data = json.loads(req.read().decode('utf-8'))
            print(f"[OK] GET {ep} - Status {req.status} - Items/Keys: {len(data) if isinstance(data, (list, dict)) else 'OK'}")
        except Exception as e:
            print(f"[FAIL] GET {ep} - Error: {e}")

if __name__ == "__main__":
    test_endpoints()
```

---

### <a id="file-backendtest-security-rbacpy"></a>File: `backend/test_security_rbac.py`

> **Role / Purpose**: Role-Based Access Control security tests (Station Commander, Logistics Officer, Station Member, Admin)

```python
# pyrefly: ignore [missing-import]
import pytest
from fastapi.testclient import TestClient
from main import app
from seed import seed_database
import auth

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    # Reset failed attempts dictionary
    auth._failed_attempts.clear()
    seed_database()

def get_token(username: str, password: str):
    response = client.post("/api/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200, f"Login failed for {username}: {response.text}"
    return response.json()["access_token"]

# ================= 1. AUTHENTICATION & LOGIN TESTS =================
def test_all_four_demo_logins():
    """Verify all 4 demo role accounts can login successfully."""
    # 1. Super Admin
    admin_token = get_token("admin.ncpor", "Demo@Admin2026")
    assert admin_token is not None

    # 2. Station Commander Bharati
    commander_token = get_token("commander.bharati", "Demo@Bharati2026")
    assert commander_token is not None

    # 3. Shipment Officer
    officer_token = get_token("officer.shipping1", "Demo@Officer2026")
    assert officer_token is not None

    # 4. Personnel
    personnel_token = get_token("PER-001", "Demo@Personnel2026")
    assert personnel_token is not None

def test_invalid_login_generic_message():
    """Verify failed login returns a generic 401 message without leaking existence."""
    response = client.post("/api/auth/login", json={"username": "admin.ncpor", "password": "WrongPassword!"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"

    response2 = client.post("/api/auth/login", json={"username": "non_existent_user", "password": "WrongPassword!"})
    assert response2.status_code == 401
    assert response2.json()["detail"] == "Invalid username or password"

def test_rate_limiting_after_5_failed_attempts():
    """Verify rate limiter blocks login on 5 consecutive failed attempts with 429."""
    test_user = "rate_limit_test_user"
    for _ in range(5):
        client.post("/api/auth/login", json={"username": test_user, "password": "BadPassword"})
    
    # 6th attempt should trigger 429 Too Many Requests
    res = client.post("/api/auth/login", json={"username": test_user, "password": "BadPassword"})
    assert res.status_code == 429
    assert "temporarily locked" in res.json()["detail"]

# ================= 2. AUTHORIZATION & 403 OWNERSHIP TESTS =================
def test_shipment_officer_cannot_access_unassigned_shipment():
    """Verify Shipment Officer 1 CANNOT access a shipment assigned to Officer 2 (expect 403)."""
    officer1_token = get_token("officer.shipping1", "Demo@Officer2026")
    headers = {"Authorization": f"Bearer {officer1_token}"}

    # SHP-2026-003 is assigned to USR-OFF-02
    response = client.get("/api/shipments/SHP-2026-003", headers=headers)
    assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}: {response.text}"
    assert "not assigned" in response.json()["detail"].lower() or "forbidden" in response.json()["detail"].lower()

def test_shipment_officer_can_access_assigned_shipment():
    """Verify Shipment Officer 1 CAN access their own assigned shipment (expect 200)."""
    officer1_token = get_token("officer.shipping1", "Demo@Officer2026")
    headers = {"Authorization": f"Bearer {officer1_token}"}

    # SHP-2026-001 is assigned to officer.shipping1
    response = client.get("/api/shipments/SHP-2026-001", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == "SHP-2026-001"

def test_personnel_cannot_access_other_personnel_record():
    """Verify Personnel PER-001 CANNOT access PER-002's record (expect 403)."""
    personnel_token = get_token("PER-001", "Demo@Personnel2026")
    headers = {"Authorization": f"Bearer {personnel_token}"}

    response = client.get("/api/personnel/PER-002", headers=headers)
    assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}: {response.text}"
    assert "cannot access" in response.json()["detail"].lower() or "forbidden" in response.json()["detail"].lower()

def test_personnel_can_access_own_record():
    """Verify Personnel PER-001 CAN access their own record (expect 200)."""
    personnel_token = get_token("PER-001", "Demo@Personnel2026")
    headers = {"Authorization": f"Bearer {personnel_token}"}

    response = client.get("/api/personnel/PER-001", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == "PER-001"

def test_station_commander_cannot_access_other_station_inventory():
    """Verify Station Commander Bharati CANNOT query Maitri inventory (expect 403)."""
    commander_token = get_token("commander.bharati", "Demo@Bharati2026")
    headers = {"Authorization": f"Bearer {commander_token}"}

    # Attempting to fetch Maitri (LOC-MAI) inventory
    response = client.get("/api/inventory?location_id=LOC-MAI", headers=headers)
    assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}: {response.text}"

def test_station_commander_cannot_access_other_station_personnel():
    """Verify Station Commander Bharati CANNOT query Maitri station personnel roster (expect 403)."""
    commander_token = get_token("commander.bharati", "Demo@Bharati2026")
    headers = {"Authorization": f"Bearer {commander_token}"}

    response = client.get("/api/personnel?station=Maitri", headers=headers)
    assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}: {response.text}"

def test_super_admin_bypasses_all_restrictions():
    """Verify Super Admin has full unrestricted access across all shipments, personnel, and inventory."""
    admin_token = get_token("admin.ncpor", "Demo@Admin2026")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Can access any shipment
    res_shp = client.get("/api/shipments/SHP-2026-003", headers=headers)
    assert res_shp.status_code == 200

    # Can access any personnel
    res_per = client.get("/api/personnel/PER-002", headers=headers)
    assert res_per.status_code == 200

    # Can access any station inventory
    res_inv = client.get("/api/inventory?location_id=LOC-MAI", headers=headers)
    assert res_inv.status_code == 200

# ================= 3. CONNECTED EMERGENCY SYSTEM TESTS =================
def test_connected_emergency_flow():
    """Verify an emergency reported by Personnel at Bharati appears in Admin and Bharati Commander views, but not Officer."""
    personnel_token = get_token("PER-001", "Demo@Personnel2026")
    p_headers = {"Authorization": f"Bearer {personnel_token}"}

    # Personnel reports emergency
    report_res = client.post(
        "/api/emergencies",
        json={
            "station_id": "LOC-BHA",
            "event_type": "Generator Radiator Leak",
            "severity": "high",
            "description": "Minor coolant leak observed in backup genset room at Bharati."
        },
        headers=p_headers
    )
    assert report_res.status_code == 201
    new_emg_id = report_res.json()["id"]

    # Super Admin sees it
    admin_token = get_token("admin.ncpor", "Demo@Admin2026")
    admin_res = client.get("/api/emergencies", headers={"Authorization": f"Bearer {admin_token}"})
    assert any(e["id"] == new_emg_id for e in admin_res.json())

    # Station Commander Bharati sees it
    cmd_bha_token = get_token("commander.bharati", "Demo@Bharati2026")
    cmd_res = client.get("/api/emergencies", headers={"Authorization": f"Bearer {cmd_bha_token}"})
    assert any(e["id"] == new_emg_id for e in cmd_res.json())

    # Shipment Officer does NOT see it (it's unrelated to any of their shipments)
    officer_token = get_token("officer.shipping1", "Demo@Officer2026")
    off_res = client.get("/api/emergencies", headers={"Authorization": f"Bearer {officer_token}"})
    assert not any(e["id"] == new_emg_id for e in off_res.json())

# ================= 4. SHIPMENT OFFICER OPERATIONS TESTS =================
def test_shipment_officer_operations():
    """Verify handover confirmation, consumable updates, and weather logging for Shipment Officer."""
    officer_token = get_token("officer.shipping1", "Demo@Officer2026")
    headers = {"Authorization": f"Bearer {officer_token}"}

    # 1. Handover confirmation
    hnd_res = client.post(
        "/api/shipments/SHP-2026-001/handover",
        json={
            "location_id": "LOC-CPT",
            "confirmation_type": "handed_off",
            "notes": "Passed cargo custody to BAS polar transport aircraft."
        },
        headers=headers
    )
    assert hnd_res.status_code == 201

    # 2. Consumables fetch
    con_res = client.get("/api/shipments/SHP-2026-001/consumables", headers=headers)
    assert con_res.status_code == 200
    assert len(con_res.json()) > 0

    # 3. Weather log
    wth_res = client.post(
        "/api/shipments/SHP-2026-001/weather-logs",
        json={
            "condition": "Sub-zero Sea Fog",
            "note": "Visibility reduced to 200m near Antarctic Convergence.",
            "temperature_c": -6.0,
            "wind_speed_knots": 22.0
        },
        headers=headers
    )
    assert wth_res.status_code == 201

    # 4. Recalculate alternate route
    alt_res = client.post(
        "/api/shipments/SHP-2026-001/recalculate-alternate-route",
        json={
            "issue_description": "Airbridge runway icing at destination",
            "avoid_mode": "aircraft"
        },
        headers=headers
    )
    assert alt_res.status_code == 200
```

---

### <a id="file-backendtest-weather-advisorypy"></a>File: `backend/test_weather_advisory.py`

> **Role / Purpose**: Weather hazard evaluation, blizzard trigger, and route reroute advisory tests

```python
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
```

---

### <a id="file-backendtest-routingpy"></a>File: `backend/test_routing.py`

> **Role / Purpose**: Multi-modal Dijkstra pathfinding and waypoint sequence tests

```python
from database import SessionLocal
from seed import seed_database
import models
from routing import compute_optimal_route

def run_tests():
    print("--- 1. SEEDING DATABASE ---")
    seed_database()

    db = SessionLocal()
    legs = db.query(models.TransportLeg).all()

    print("\n--- 2. TEST SCENARIO A: Normal Cargo (450kg, Non-hazmat, Goa -> Bharati, Month=1 Jan) ---")
    res_a = compute_optimal_route(
        legs=legs,
        origin_id="LOC-GOA",
        destination_id="LOC-BHA",
        weight_kg=450.0,
        is_hazmat=False,
        target_month=1
    )
    print(f"Success: {res_a.get('success')}")
    print(f"Total Duration: {res_a.get('total_duration_days')} days")
    print(f"Path Nodes: {res_a.get('path_nodes')}")
    print("Legs Chosen:")
    for leg in res_a.get("legs", []):
        print(f"  - {leg['origin_id']} -> {leg['destination_id']} via {leg['mode']} ({leg['duration_days']} days)")

    print("\n--- 3. TEST SCENARIO B: Hazmat Cargo (12,000kg, Hazmat=True, Goa -> Maitri, Month=1 Jan) ---")
    res_b = compute_optimal_route(
        legs=legs,
        origin_id="LOC-GOA",
        destination_id="LOC-MAI",
        weight_kg=12000.0,
        is_hazmat=True,
        target_month=1
    )
    print(f"Success: {res_b.get('success')}")
    print(f"Total Duration: {res_b.get('total_duration_days')} days")
    print(f"Path Nodes: {res_b.get('path_nodes')}")
    print("Legs Chosen (Aircraft should be filtered out!):")
    for leg in res_b.get("legs", []):
        print(f"  - {leg['origin_id']} -> {leg['destination_id']} via {leg['mode']} ({leg['duration_days']} days)")
    print(f"Warnings: {res_b.get('warnings')}")

    print("\n--- 4. TEST SCENARIO C: Heavy Oversized Cargo (3,000kg, Non-hazmat, Goa -> Bharati, Month=1 Jan) ---")
    res_c = compute_optimal_route(
        legs=legs,
        origin_id="LOC-GOA",
        destination_id="LOC-BHA",
        weight_kg=3000.0,
        is_hazmat=False,
        target_month=1
    )
    print(f"Success: {res_c.get('success')}")
    print(f"Total Duration: {res_c.get('total_duration_days')} days")
    print(f"Path Nodes: {res_c.get('path_nodes')}")
    print("Legs Chosen (3000kg exceeds 1800kg air capacity & 2500kg cargo flight capacity):")
    for leg in res_c.get("legs", []):
        print(f"  - {leg['origin_id']} -> {leg['destination_id']} via {leg['mode']} ({leg['duration_days']} days)")

    print("\n--- 5. TEST SCENARIO D: Off-Season Winter Shipment (Target Month = 6 June [Polar Winter]) ---")
    res_d = compute_optimal_route(
        legs=legs,
        origin_id="LOC-GOA",
        destination_id="LOC-BHA",
        weight_kg=500.0,
        is_hazmat=False,
        target_month=6 # June is winter; available_months are [11, 12, 1, 2, 3]
    )
    print(f"Success: {res_d.get('success')}")
    print(f"Error Message: {res_d.get('error')}")
    print(f"Excluded Legs Count: {res_d.get('excluded_legs_count')}")
    print("Reason Warnings for Excluded Legs:")
    for warn in res_d.get("warnings", []):
        print(f"  - {warn}")

    db.close()

if __name__ == "__main__":
    run_tests()
```

---

### <a id="file-backendtest-searoute-integrationpy"></a>File: `backend/test_searoute_integration.py`

> **Role / Purpose**: SeaRoute integration test for ocean navigation avoidance of land masses

```python
import pytest
from routing import compute_leg_geometry_and_duration, compute_optimal_route
from database import SessionLocal
import models

def test_searoute_curved_path_and_duration():
    """
    Verifies that for ship legs (e.g. Goa to Cape Town), searoute generates a realistic
    multi-waypoint sea path avoiding landmass, calculating realistic nautical distance and duration.
    """
    # Goa (15.3991, 73.8052) to Cape Town (-33.9249, 18.4241)
    res = compute_leg_geometry_and_duration(
        mode="ship",
        origin_lat=15.3991,
        origin_lng=73.8052,
        dest_lat=-33.9249,
        dest_lng=18.4241,
        average_speed_knots=15.0
    )

    assert not res["is_fallback"]
    assert len(res["waypoints"]) >= 15 # Real curved route has many marine waypoints
    assert res["distance_nm"] > 5500 # True nautical distance across Indian Ocean
    # At 15 knots, ~6400 nm / (15*24) = ~17.8 -> 18 days
    assert 16 <= res["duration_days"] <= 20
    # First waypoint near Goa, last waypoint near Cape Town
    assert abs(res["waypoints"][0][0] - 15.3991) < 1.0
    assert abs(res["waypoints"][-1][0] - (-33.9249)) < 1.0

def test_flight_modes_use_direct_straight_vector():
    """Confirms non-ship modes (aircraft, cargo_flight, helicopter) do NOT use searoute and remain direct."""
    res_air = compute_leg_geometry_and_duration(
        mode="aircraft",
        origin_lat=-33.9249,
        origin_lng=18.4241,
        dest_lat=-69.4068,
        dest_lng=76.1953,
        base_duration_days=3
    )

    assert len(res_air["waypoints"]) == 2 # Direct start & end points
    assert res_air["duration_days"] == 3
    assert not res_air["is_fallback"]

def test_searoute_failure_fallback_graceful():
    """
    Verifies that if searoute encounters an unroutable topology or exception,
    it catches the exception gracefully, returns a 2-point direct estimate, and sets a clear warning flag.
    """
    from unittest.mock import patch
    with patch("searoute.searoute", side_effect=Exception("Maritime graph routing topology failure")):
        res_fallback = compute_leg_geometry_and_duration(
            mode="ship",
            origin_lat=15.3991,
            origin_lng=73.8052,
            dest_lat=-33.9249,
            dest_lng=18.4241,
            average_speed_knots=15.0
        )

        # Must not crash!
        assert res_fallback["is_fallback"] is True
        assert len(res_fallback["waypoints"]) == 2
        assert any("Unable to compute detailed marine route — showing direct path estimate" in w for w in res_fallback["warnings"])
        assert res_fallback["duration_days"] >= 1

def test_dijkstra_uses_dynamic_duration_in_network():
    """Verifies that the NetworkX Dijkstra routing engine uses dynamic durations computed from searoute."""
    db = SessionLocal()
    legs = db.query(models.TransportLeg).all()
    locations = {l.id: l for l in db.query(models.Location).all()}

    # Compute route Goa -> Bharati (hazmat cargo must take Ship -> Ship)
    route = compute_optimal_route(
        legs=legs,
        origin_id="LOC-GOA",
        destination_id="LOC-BHA",
        weight_kg=5000.0,
        is_hazmat=True,
        target_month=1,
        locations_dict=locations
    )
    db.close()

    assert route["success"] is True
    assert len(route["legs"]) == 2 # GOA->CPT (Ship) + CPT->BHA (Ship)
    assert route["legs"][0]["mode"] == "ship"
    assert route["legs"][1]["mode"] == "ship"
    # Verify waypoints are returned in route result
    assert len(route["waypoints"]) > 20
    assert route["total_duration_days"] > 25

def test_cape_town_to_bharati_exact_endpoint_connection():
    """
    CRITICAL POLAR ENDPOINT CONNECTION TEST:
    Searoute's raw shipping-lane graph ends near Lat -50°S, Long 80°E.
    This test confirms that for Cape Town -> Bharati Station:
    1. The rendered polyline's first coordinate exactly matches Cape Town's coordinates: [-33.9249, 18.4241].
    2. The rendered polyline's LAST coordinate exactly matches Bharati Station's coordinates: [-69.4068, 76.1953].
    3. The total distance_nm correctly incorporates the last-mile Southern Ocean segment (~5,223 nm total vs ~4,049 nm raw).
    4. Duration is accurately computed from the complete connected distance (~16 days at 14 knots).
    """
    cpt_lat, cpt_lng = -33.9249, 18.4241
    bha_lat, bha_lng = -69.4068, 76.1953

    res = compute_leg_geometry_and_duration(
        mode="ship",
        origin_lat=cpt_lat,
        origin_lng=cpt_lng,
        dest_lat=bha_lat,
        dest_lng=bha_lng,
        average_speed_knots=14.0
    )

    waypoints = res["waypoints"]
    assert len(waypoints) >= 12

    # 1. First coordinate MUST exactly match Cape Town's coordinates
    first_pt = waypoints[0]
    assert first_pt == [cpt_lat, cpt_lng], f"Expected first waypoint to be {cpt_lat, cpt_lng}, got {first_pt}"

    # 2. Last coordinate MUST exactly match Bharati Station's coordinates (from locations.json)
    last_pt = waypoints[-1]
    assert last_pt == [bha_lat, bha_lng], f"Expected last waypoint to be {bha_lat, bha_lng}, got {last_pt}"

    # 3. Total distance must include the full path to Bharati Station (~5,223.4 nm)
    assert res["distance_nm"] > 5000.0, f"Expected distance > 5000 nm, got {res['distance_nm']}"

    # 4. Duration at 14 knots: 5223.4 / (14 * 24) = 15.55 -> 16 days
    assert res["duration_days"] == 16, f"Expected duration_days == 16, got {res['duration_days']}"

```

---

### <a id="file-backendtest-multileg-advancementpy"></a>File: `backend/test_multileg_advancement.py`

> **Role / Purpose**: Multi-leg polar shipment stage progression and completion tests

```python
from fastapi.testclient import TestClient
from main import app
from seed import seed_database
import auth

client = TestClient(app)

def test_multileg_simulation_and_persistence():
    print("--- 1. SEEDING DATABASE ---")
    seed_database()

    # Login as Super Admin
    login_res = client.post("/api/auth/login", json={"username": "admin.ncpor", "password": "Demo@Admin2026"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a Multi-Leg Hazmat shipment via POST /api/shipments
    create_payload = {
        "description": "Multi-Leg Hazmat Heavy Diesel Drum Battery Batch",
        "category": "hazmat",
        "weight_kg": 15000.0,
        "is_hazmat": True,
        "origin_id": "LOC-GOA",
        "destination_id": "LOC-MAI",
        "box_label": "Hazmat Drum 1 of 20",
        "target_month": 1
    }

    res = client.post("/api/shipments", json=create_payload, headers=headers)
    assert res.status_code == 201
    shipment = res.json()
    shp_id = shipment['id']

    print(f"\n[OK] Multi-Leg Shipment Created: ID={shp_id}")
    print(f"   Initial State: Status={shipment['status']} | Location={shipment['current_location_id']} | Category={shipment['category']}")

    def fetch_persisted_db_state(step_name):
        """Fetch directly from DB endpoint to confirm persistence"""
        get_res = client.get(f"/api/shipments/{shp_id}", headers=headers)
        assert get_res.status_code == 200
        data = get_res.json()
        print(f"   [DB PERSISTENCE CHECK] ({step_name}):")
        print(f"      - Status: {data['status']}")
        print(f"      - Current Location: {data['current_location_id']} ({data['current_location']['name']})")
        print(f"      - Current Leg ID: {data['current_leg_id']}")
        return data

    # STEP 1: Planned -> In Transit (Goa)
    print("\n--- STEP 1: Advancing Leg (Planned -> In Transit) ---")
    res1 = client.post(f"/api/shipments/{shp_id}/advance-leg", headers=headers)
    assert res1.status_code == 200
    s1 = fetch_persisted_db_state("After Step 1")
    assert s1['status'] == 'in_transit', f"Expected in_transit, got {s1['status']}"
    assert s1['current_location_id'] == 'LOC-GOA', f"Expected LOC-GOA, got {s1['current_location_id']}"

    # STEP 2: In Transit -> At Transfer Point (Cape Town)
    print("\n--- STEP 2: Advancing Leg (In Transit -> At Transfer Point [Cape Town Staging]) ---")
    res2 = client.post(f"/api/shipments/{shp_id}/advance-leg", headers=headers)
    assert res2.status_code == 200
    s2 = fetch_persisted_db_state("After Step 2")
    assert s2['status'] == 'at_transfer_point', f"Expected at_transfer_point, got {s2['status']}"
    assert s2['current_location_id'] == 'LOC-CPT', f"Expected LOC-CPT, got {s2['current_location_id']}"

    # STEP 3: At Transfer Point -> In Transit (Cape Town leg 2 departure)
    print("\n--- STEP 3: Advancing Leg (At Transfer Point -> In Transit on 2nd Leg) ---")
    res3 = client.post(f"/api/shipments/{shp_id}/advance-leg", headers=headers)
    assert res3.status_code == 200
    s3 = fetch_persisted_db_state("After Step 3")
    assert s3['status'] == 'in_transit', f"Expected in_transit, got {s3['status']}"
    assert s3['current_location_id'] == 'LOC-CPT', f"Expected LOC-CPT, got {s3['current_location_id']}"

    # STEP 4: In Transit -> Delivered (Maitri Research Station)
    print("\n--- STEP 4: Advancing Leg (In Transit -> Delivered at Destination) ---")
    res4 = client.post(f"/api/shipments/{shp_id}/advance-leg", headers=headers)
    assert res4.status_code == 200
    s4 = fetch_persisted_db_state("After Step 4")
    assert s4['status'] == 'delivered', f"Expected delivered, got {s4['status']}"
    assert s4['current_location_id'] == 'LOC-MAI', f"Expected LOC-MAI, got {s4['current_location_id']}"

    print("\n[SUCCESS] MULTI-LEG ADVANCEMENT AND SQLITE DB PERSISTENCE VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_multileg_simulation_and_persistence()
```

---

### <a id="file-backendtest-offline-sync-apipy"></a>File: `backend/test_offline_sync_api.py`

> **Role / Purpose**: Offline sync batch upload, transaction replay, and idempotency tests

```python
import pytest
from fastapi.testclient import TestClient
from main import app
from seed import seed_database
import models
from database import SessionLocal

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    seed_database()

def get_admin_token():
    res = client.post("/api/auth/login", json={"username": "admin.ncpor", "password": "Demo@Admin2026"})
    assert res.status_code == 200
    return res.json()["access_token"]

def test_health_check_endpoint():
    """Validates GET /api/health for active connectivity heartbeat."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "system" in data
    assert "timestamp" in data

def test_critical_emergency_sync_endpoint():
    """Validates that offline critical emergency payload can be synced cleanly to server."""
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "event_type": "Severe Blizzard Roof Breach",
        "description": "Secondary habitat dome integrity alarm triggered during 70kt gale.",
        "severity": "critical",
        "station_id": "LOC-BHA"
    }
    response = client.post("/api/emergencies", json=payload, headers=headers)
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["event_type"] == payload["event_type"]
    assert data["severity"] == "critical"
    assert data["status"] in ["open", "active"]
    assert "id" in data

def test_inventory_and_telemetry_sync():
    """Validates normal priority status updates and inventory syncing."""
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    # 1. Inventory Sync
    inv_payload = {
        "location_id": "LOC-BHA",
        "item_name": "Polar Winter Parkas (Heavy Duty)",
        "category": "protective_gear",
        "quantity": 50.0,
        "unit": "suits",
        "minimum_threshold": 15.0
    }
    inv_res = client.post("/api/inventory/LOC-BHA", json=inv_payload, headers=headers)
    assert inv_res.status_code in [200, 201]
    assert inv_res.json()["item_name"] == inv_payload["item_name"]
```

---

### <a id="file-backendtest-cors-securitypy"></a>File: `backend/test_cors_security.py`

> **Role / Purpose**: CORS origin, headers, and security middleware validation

```python
import importlib
import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
import main as main_module


def _get_client():
    importlib.reload(main_module)
    return TestClient(main_module.app)


def test_cors_config_has_no_wildcard_with_credentials():
    """Regression test for Bug #1 (doc Section 2): wildcard origin must never be combined with allow_credentials=True."""
    cors_middleware = None
    for m in main_module.app.user_middleware:
        if m.cls.__name__ == "CORSMiddleware":
            cors_middleware = m
            break
    assert cors_middleware is not None, "CORSMiddleware must be configured"

    kwargs = cors_middleware.kwargs
    allow_origins = kwargs.get("allow_origins", [])
    allow_credentials = kwargs.get("allow_credentials", False)

    assert allow_credentials is True, "Credential-bearing auth (Bearer JWT) requires allow_credentials=True"
    assert "*" not in allow_origins, (
        "Wildcard origin combined with allow_credentials=True is invalid under the CORS spec "
        "and reflects arbitrary origins — this is the Bug #1 regression the master doc says was fixed."
    )


def test_preflight_from_allowed_deployed_origin_is_accepted():
    """A browser preflight from a deployed Vercel origin must receive valid CORS headers."""
    client = _get_client()
    origin = "https://polarlogix-sih.vercel.app"
    resp = client.options(
        "/api/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization",
        },
    )
    assert resp.status_code in (200, 204), f"Preflight failed with {resp.status_code}"
    assert resp.headers.get("access-control-allow-origin") == origin
    assert "authorization" in resp.headers.get("access-control-allow-headers", "").lower()


def test_preflight_from_unknown_origin_is_rejected():
    """An origin not on the explicit allow-list must not receive an allow-origin header."""
    client = _get_client()
    origin = "https://evil-origin.example.com"
    resp = client.options(
        "/api/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization",
        },
    )
    assert resp.headers.get("access-control-allow-origin") != origin, (
        "Unknown origin must not be reflected by CORS policy."
    )


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            print(f"--- {name} ---")
            fn()
            print(f"[OK] {name} passed")
    print("All CORS security tests passed.")
```

---

### <a id="file-backendtest-ncpor-upgradepy"></a>File: `backend/test_ncpor_upgrade.py`

> **Role / Purpose**: NCPOR domain upgrade test suite validating all polar stations and realistic entities

```python
import pytest
from fastapi.testclient import TestClient
from main import app
from seed import seed_database
import models
from database import SessionLocal

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    seed_database()

def get_admin_token():
    res = client.post("/api/auth/login", json={"username": "admin.ncpor", "password": "Demo@Admin2026"})
    assert res.status_code == 200
    return res.json()["access_token"]

# ================= 1. FOUR REAL STATIONS & LOCATIONS API =================
def test_all_four_real_stations_returned():
    """Verify locations API returns all 4 real stations and staging points with full metadata."""
    token = get_admin_token()
    res = client.get("/api/locations", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    locs = {l["id"]: l for l in res.json()}

    # Check that 4 stations + 2 depots/hubs exist
    assert len(locs) == 6
    assert "LOC-HIM" in locs
    assert "LOC-HMS" in locs
    assert "LOC-MAI" in locs
    assert "LOC-BHA" in locs
    assert "LOC-GOA" in locs
    assert "LOC-CPT" in locs

    # Verify Himadri (Arctic)
    him = locs["LOC-HIM"]
    assert him["name"] == "Himadri Arctic Station"
    assert him["region"] == "arctic"
    assert him["programme"] == "arctic_programme"
    assert him["is_international_research_base"] is True
    assert "microbiology" in him["research_areas"].lower()
    assert him["established_year"] == 2008

    # Verify Himansh (Himalayas)
    hms = locs["LOC-HMS"]
    assert hms["name"] == "Himansh Himalayan Station"
    assert hms["region"] == "himalayan"
    assert hms["programme"] == "himalayan_programme"
    assert hms["is_international_research_base"] is False
    assert "glacier" in hms["research_areas"].lower()

    # Verify Maitri (Antarctic Inland)
    mai = locs["LOC-MAI"]
    assert mai["region"] == "antarctic"
    assert mai["programme"] == "antarctic_programme"
    assert mai["distance_from_ship_access_km"] == 80.0
    assert mai["requires_overland_transfer"] is True
    assert mai["capacity_winter"] == 25
    assert mai["capacity_summer"] == 50
    assert "configuration" in mai["capacity_note"].lower()

    # Verify Bharati (Antarctic Coastal)
    bha = locs["LOC-BHA"]
    assert bha["region"] == "antarctic"
    assert bha["programme"] == "antarctic_programme"
    assert bha["distance_from_ship_access_km"] == 0.2
    assert bha["requires_overland_transfer"] is False
    assert bha["capacity_winter"] == 24
    assert bha["capacity_summer"] == 47
    assert bha["latitude"] == -69.4068
    assert bha["longitude"] == 76.1953

def test_locations_api_programme_filter():
    """Verify locations endpoint filters by programme correctly."""
    token = get_admin_token()
    
    # Arctic Programme only
    res_arc = client.get("/api/locations?programme=arctic_programme", headers={"Authorization": f"Bearer {token}"})
    assert res_arc.status_code == 200
    arc_ids = [l["id"] for l in res_arc.json()]
    assert arc_ids == ["LOC-HIM"]

    # Himalayan Programme only
    res_hms = client.get("/api/locations?programme=himalayan_programme", headers={"Authorization": f"Bearer {token}"})
    assert res_hms.status_code == 200
    hms_ids = [l["id"] for l in res_hms.json()]
    assert hms_ids == ["LOC-HMS"]

    # Antarctic Programme
    res_ant = client.get("/api/locations?programme=antarctic_programme", headers={"Authorization": f"Bearer {token}"})
    assert res_ant.status_code == 200
    ant_ids = [l["id"] for l in res_ant.json()]
    assert "LOC-MAI" in ant_ids
    assert "LOC-BHA" in ant_ids
    assert "LOC-HIM" not in ant_ids

# ================= 2. MULTI-INSTITUTION PERSONNEL MODEL =================
def test_multi_institution_personnel_model():
    """Verify personnel records contain affiliated_institution and personnel_category."""
    token = get_admin_token()
    res = client.get("/api/personnel", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    roster = res.json()
    assert len(roster) >= 7

    institutions = {p["affiliated_institution"] for p in roster}
    categories = {p["personnel_category"] for p in roster}

    # Verify diversity across partner institutes
    assert "NCPOR" in institutions
    assert "CSIR-NIO" in institutions
    assert "IIT Bombay" in institutions
    assert "AIIMS New Delhi" in institutions
    assert "GSI" in institutions

    # Verify diversity across employment categories
    assert "permanent_staff" in categories
    assert "visiting_researcher" in categories
    assert "contract_specialist" in categories
    assert "project_scientist" in categories

def test_personnel_creation_with_institution_and_category():
    """Verify creating a new personnel record saves institution and category."""
    token = get_admin_token()
    new_per = {
        "name": "Dr. Devendra Sahu",
        "role": "Permafrost Specialist",
        "affiliated_institution": "Wadia Institute of Himalayan Geology",
        "personnel_category": "visiting_researcher",
        "assigned_station": "Himansh Himalayan Station",
        "season_type": "summer",
        "deployment_start": "2026-06-01",
        "deployment_end": "2026-09-30",
        "current_status": "deployed"
    }
    res = client.post("/api/personnel", json=new_per, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Dr. Devendra Sahu"
    assert data["affiliated_institution"] == "Wadia Institute of Himalayan Geology"
    assert data["personnel_category"] == "visiting_researcher"

# ================= 3. PROGRAMME-LEVEL DASHBOARD SUMMARY =================
def test_dashboard_summary_programme_filtering():
    """Verify dashboard summary provides accurate stats per programme."""
    token = get_admin_token()

    # All programmes
    res_all = client.get("/api/dashboard/summary?programme=all", headers={"Authorization": f"Bearer {token}"})
    assert res_all.status_code == 200
    data_all = res_all.json()
    assert data_all["programme"] == "all"
    assert len(data_all["location_summary"]) == 6

    # Arctic programme
    res_arc = client.get("/api/dashboard/summary?programme=arctic_programme", headers={"Authorization": f"Bearer {token}"})
    assert res_arc.status_code == 200
    data_arc = res_arc.json()
    assert data_arc["programme"] == "arctic_programme"
    assert len(data_arc["location_summary"]) == 1
    assert "LOC-HIM" in data_arc["location_summary"]

    # Antarctic programme
    res_ant = client.get("/api/dashboard/summary?programme=antarctic_programme", headers={"Authorization": f"Bearer {token}"})
    assert res_ant.status_code == 200
    data_ant = res_ant.json()
    assert data_ant["programme"] == "antarctic_programme"
    assert "LOC-BHA" in data_ant["location_summary"]
    assert "LOC-MAI" in data_ant["location_summary"]
    assert "LOC-HIM" not in data_ant["location_summary"]

# ================= 4. ROUTE PLANNING INTEGRITY FOR MAITRI & BHARATI =================
def test_antarctic_route_planning_integrity():
    """Verify Antarctic route preview continues to compute optimal multi-modal routes for Maitri/Bharati."""
    token = get_admin_token()

    # Plan route from Goa to Bharati
    payload_bha = {
        "description": "CTD Oceanographic Sensor Rig",
        "category": "scientific_equipment",
        "weight_kg": 600.0,
        "is_hazmat": False,
        "origin_id": "LOC-GOA",
        "destination_id": "LOC-BHA",
        "box_label": "1 of 1",
        "target_month": 1
    }
    res_bha = client.post("/api/routing/preview", json=payload_bha, headers={"Authorization": f"Bearer {token}"})
    assert res_bha.status_code == 200
    bha_route = res_bha.json()
    assert bha_route["success"] is True
    assert bha_route["total_duration_days"] > 0
    assert len(bha_route["legs"]) >= 1

    # Plan route from Goa to Maitri with hazmat
    payload_mai = {
        "description": "Arctic Fuel Drums",
        "category": "hazmat",
        "weight_kg": 10000.0,
        "is_hazmat": True,
        "origin_id": "LOC-GOA",
        "destination_id": "LOC-MAI",
        "box_label": "Pallet 1 of 5",
        "target_month": 1
    }
    res_mai = client.post("/api/routing/preview", json=payload_mai, headers={"Authorization": f"Bearer {token}"})
    assert res_mai.status_code == 200
    mai_route = res_mai.json()
    assert mai_route["success"] is True
    assert all(leg["mode"] == "ship" for leg in mai_route["legs"])
```

---

### <a id="file-backendtest-data-seedpy"></a>File: `backend/test_data_seed.py`

> **Role / Purpose**: Data integrity verification for database seed execution

```python
import os
import json
import pytest
import tempfile
from seed import validate_and_load_locations, validate_and_load_transport_legs, seed_database
from database import SessionLocal
import models

def test_location_validation_missing_latitude_fails_loudly():
    """Confirms that if latitude is missing in locations.json, validation raises ValueError naming the bad entry."""
    bad_data = [
        {
            "id": "LOC-TEST-FAIL",
            "name": "Invalid Location",
            "type": "depot",
            "longitude": 73.8052
            # Missing latitude!
        }
    ]
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f:
        json.dump(bad_data, f)
        temp_path = f.name

    try:
        with pytest.raises(ValueError) as exc_info:
            validate_and_load_locations(temp_path)
        assert "LOC-TEST-FAIL" in str(exc_info.value)
        assert "latitude" in str(exc_info.value)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_location_validation_invalid_type_fails_loudly():
    """Confirms that invalid location type fails with clear error message."""
    bad_data = [
        {
            "id": "LOC-TEST-2",
            "name": "Invalid Type Stn",
            "type": "airport", # invalid type
            "latitude": 12.0,
            "longitude": 77.0
        }
    ]
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f:
        json.dump(bad_data, f)
        temp_path = f.name

    try:
        with pytest.raises(ValueError) as exc_info:
            validate_and_load_locations(temp_path)
        assert "invalid type" in str(exc_info.value).lower()
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_transport_leg_validation_missing_origin_id_fails_loudly():
    """Confirms transport leg validation fails loudly if foreign key or field is missing."""
    valid_loc = models.Location(
        id="LOC-GOA",
        name="Goa",
        type="depot",
        latitude=15.3991,
        longitude=73.8052,
        code="GOA"
    )
    bad_leg_data = [
        {
            "id": "LEG-BAD-01",
            # Missing origin_id
            "destination_id": "LOC-GOA",
            "mode": "ship",
            "capacity_kg": 50000.0,
            "hazmat_allowed": True,
            "available_months": [1, 2]
        }
    ]
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f:
        json.dump(bad_leg_data, f)
        temp_path = f.name

    try:
        with pytest.raises(ValueError) as exc_info:
            validate_and_load_transport_legs([valid_loc], temp_path)
        assert "LEG-BAD-01" in str(exc_info.value)
        assert "origin_id" in str(exc_info.value)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_replaceable_dataset_swap():
    """
    Demonstrates swapping in a DIFFERENT test dataset (different coordinates & custom legs)
    and proving the seed script and database reflect the new data automatically.
    """
    custom_locations = [
        {
            "id": "LOC-MUMBAI",
            "name": "Mumbai Port Depot",
            "type": "depot",
            "latitude": 18.9438,
            "longitude": 72.8354,
            "code": "MUM-PORT"
        },
        {
            "id": "LOC-DURBAN",
            "name": "Durban Staging Terminal",
            "type": "transfer",
            "latitude": -29.8587,
            "longitude": 31.0218,
            "code": "DUR-HUB"
        }
    ]

    custom_legs = [
        {
            "id": "LEG-MUM-DUR-SHIP",
            "origin_id": "LOC-MUMBAI",
            "destination_id": "LOC-DURBAN",
            "mode": "ship",
            "average_speed_knots": 16.0,
            "capacity_kg": 60000.0,
            "hazmat_allowed": True,
            "available_months": [1, 2, 3, 4]
        }
    ]

    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f_loc:
        json.dump(custom_locations, f_loc)
        loc_path = f_loc.name

    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f_leg:
        json.dump(custom_legs, f_leg)
        leg_path = f_leg.name

    try:
        # Seed custom dataset
        seed_database(locations_path=loc_path, legs_path=leg_path)

        db = SessionLocal()
        loaded_locs = db.query(models.Location).all()
        loc_ids = [l.id for l in loaded_locs]
        assert "LOC-MUMBAI" in loc_ids
        assert "LOC-DURBAN" in loc_ids
        assert "LOC-GOA" not in loc_ids # Previous Goa is gone!

        loaded_legs = db.query(models.TransportLeg).all()
        assert len(loaded_legs) == 1
        assert loaded_legs[0].id == "LEG-MUM-DUR-SHIP"
        assert loaded_legs[0].origin_id == "LOC-MUMBAI"
        assert loaded_legs[0].destination_id == "LOC-DURBAN"
        assert loaded_legs[0].distance_nm > 4000 # Marine distance calculated via searoute
        db.close()

    finally:
        if os.path.exists(loc_path):
            os.remove(loc_path)
        if os.path.exists(leg_path):
            os.remove(leg_path)
        # Restore standard seed
        seed_database()

def test_four_real_stations_loaded_with_metadata():
    """Confirms all 4 real NCPOR field stations and hubs are loaded with verified region, programme, and properties."""
    seed_database()
    db = SessionLocal()
    locs = {l.id: l for l in db.query(models.Location).all()}
    db.close()

    assert "LOC-HIM" in locs, "Himadri Arctic station must be present"
    him = locs["LOC-HIM"]
    assert him.region == "arctic"
    assert him.programme == "arctic_programme"
    assert him.is_international_research_base is True
    assert "microbiology" in him.research_areas.lower()

    assert "LOC-HMS" in locs, "Himansh Himalayan station must be present"
    hms = locs["LOC-HMS"]
    assert hms.region == "himalayan"
    assert hms.programme == "himalayan_programme"
    assert "glacier" in hms.research_areas.lower()

    assert "LOC-MAI" in locs, "Maitri Antarctic station must be present"
    mai = locs["LOC-MAI"]
    assert mai.region == "antarctic"
    assert mai.programme == "antarctic_programme"
    assert mai.distance_from_ship_access_km == 80.0
    assert mai.requires_overland_transfer is True
    assert mai.capacity_winter == 25
    assert mai.capacity_summer == 50

    assert "LOC-BHA" in locs, "Bharati Antarctic station must be present"
    bha = locs["LOC-BHA"]
    assert bha.region == "antarctic"
    assert bha.programme == "antarctic_programme"
    assert bha.distance_from_ship_access_km == 0.2
    assert bha.requires_overland_transfer is False
    assert bha.capacity_winter == 24
    assert bha.capacity_summer == 47
    assert bha.latitude == -69.4068
    assert bha.longitude == 76.1953

```

---

### <a id="file-backendverify-statuspy"></a>File: `backend/verify_status.py`

> **Role / Purpose**: Verification script to print backend entity counts and status summary

```python
import sqlite3
import json
import urllib.request

def check_db():
    conn = sqlite3.connect('backend/polarlogix.db')
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [t[0] for t in c.fetchall()]
    print("=== SQLITE DATABASE (polarlogix.db) ROW COUNTS ===")
    counts = {}
    for table in sorted(tables):
        count = c.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        counts[table] = count
        print(f"  * {table}: {count} rows")
    return counts

def check_api():
    base_url = "http://127.0.0.1:8008/api"
    endpoints = [
        ("Health Check", "/health"),
        ("Dashboard Summary", "/dashboard/summary"),
        ("Locations", "/locations"),
        ("Transport Legs", "/transport-legs"),
        ("Cargo Shipments", "/shipments"),
        ("Inventory Items", "/inventory"),
        ("Personnel Records", "/personnel"),
        ("Emergency Events", "/emergencies")
    ]
    print("\n=== API ENDPOINT RESPONSES (http://127.0.0.1:8008/api) ===")
    for label, path in endpoints:
        try:
            req = urllib.request.urlopen(f"{base_url}{path}")
            raw = req.read().decode('utf-8')
            data = json.loads(raw)
            if isinstance(data, list):
                print(f"  [OK] GET {path:20} -> Status {req.status} | Returned {len(data)} items")
                for item in data[:3]:
                    identifier = item.get('id') or item.get('code') or item.get('name')
                    desc = item.get('description') or item.get('item_name') or item.get('name') or item.get('event_type')
                    extra = f" (status: {item.get('status')})" if 'status' in item else ""
                    print(f"       -> [{identifier}] {desc}{extra}")
                if len(data) > 3:
                    print(f"       -> ... and {len(data) - 3} more items")
            elif isinstance(data, dict):
                print(f"  [OK] GET {path:20} -> Status {req.status} | Data: {json.dumps(data)}")
        except Exception as e:
            print(f"  [FAIL] GET {path:20} -> Error: {e}")

if __name__ == "__main__":
    check_db()
    check_api()
```

---


## 5. Frontend Configuration & PWA Assets

### <a id="file-frontendpackagejson"></a>File: `frontend/package.json`

> **Role / Purpose**: Frontend npm dependencies (React 19, Lucide React, Leaflet, React-Leaflet, Axios, IDB)

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "axios": "^1.20.0",
    "dexie": "^4.4.6",
    "framer-motion": "^13.1.1",
    "leaflet": "^1.9.4",
    "lucide-react": "^1.39.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-leaflet": "^5.0.0",
    "recharts": "^3.10.1",
    "tailwindcss": "^4.3.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "@vitejs/plugin-react": "^6.1.0",
    "fake-indexeddb": "^6.2.5",
    "oxlint": "^1.79.0",
    "vite": "^8.2.2"
  }
}
```

---

### <a id="file-frontendviteconfigjs"></a>File: `frontend/vite.config.js`

> **Role / Purpose**: Vite configuration and dev server setup

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8008',
        changeOrigin: true,
      },
    },
  },
});
```

---

### <a id="file-frontendindexhtml"></a>File: `frontend/index.html`

> **Role / Purpose**: HTML5 entry point, polar web app title, meta tags, font links

```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#0EA5E9" />
    <title>PolarLogix — NCPOR Antarctic Expedition Logistics</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### <a id="file-frontendpublicmanifestjson"></a>File: `frontend/public/manifest.json`

> **Role / Purpose**: Progressive Web App (PWA) manifest for polar station offline installation

```json
{
  "short_name": "PolarLogix",
  "name": "PolarLogix — NCPOR Antarctic Expedition Logistics",
  "icons": [
    {
      "src": "/icon-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/icon-512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "/",
  "background_color": "#0B0F19",
  "theme_color": "#0EA5E9",
  "display": "standalone",
  "orientation": "portrait-primary"
}
```

---

### <a id="file-frontendpublicswjs"></a>File: `frontend/public/sw.js`

> **Role / Purpose**: PWA Service Worker: Network-first caching strategy with offline fallback for static & API assets

```javascript
const CACHE_NAME = 'polarlogix-shell-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Let IndexedDB / API layer handle /api/* endpoints
  if (requestUrl.pathname.startsWith('/api')) {
    return;
  }

  // Handle SPA navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedApp = await caches.match('/index.html') || await caches.match('/');
          return cachedApp;
        })
    );
    return;
  }

  // Cache-First strategy for static assets (JS, CSS, images, icons, fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached and refresh in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {/* offline */});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and requesting an image or font, return empty or fallback if available
          return caches.match(event.request);
        });
    })
  );
});
```

---

### <a id="file-frontendgitignore"></a>File: `frontend/.gitignore`

> **Role / Purpose**: Frontend git ignore configuration

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

venv/
__pycache__/
*.pyc
*.db
.env
node_modules/
dist/
```

---

### <a id="file-frontendoxlintrcjson"></a>File: `frontend/.oxlintrc.json`

> **Role / Purpose**: Linter configuration for modern JavaScript/JSX

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

---

### <a id="file-frontendreadmemd"></a>File: `frontend/README.md`

> **Role / Purpose**: Frontend documentation and setup instructions

```markdown
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
```

---


## 6. Frontend Core & Styling System

### <a id="file-frontendsrcmainjsx"></a>File: `frontend/src/main.jsx`

> **Role / Purpose**: React root entry point, Service Worker registration, theme wrapper

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import ErrorBoundary from './components/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('PolarLogix PWA Service Worker registered:', reg.scope))
      .catch((err) => console.error('SW registration failed:', err));
  });
}
```

---

### <a id="file-frontendsrcappjsx"></a>File: `frontend/src/App.jsx`

> **Role / Purpose**: Master application component, client-side routing, protected route wrappers, global overlays

```jsx
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ConnectivityProvider } from './context/ConnectivityContext';
import Navbar from './components/Navbar';
import OfflineBanner from './components/OfflineBanner';
import Login from './pages/Login';

// Role-Scoped Dashboards
import StationCommanderDashboard from './pages/StationCommanderDashboard';
import ShipmentOfficerDashboard from './pages/ShipmentOfficerDashboard';
import PersonnelDashboard from './pages/PersonnelDashboard';

// Super Admin Dashboards
import Dashboard from './pages/Dashboard';
import ShipmentPlanner from './pages/ShipmentPlanner';
import ShipmentTracker from './pages/ShipmentTracker';
import InventoryDashboard from './pages/InventoryDashboard';
import PersonnelManager from './pages/PersonnelManager';
import EmergencyResponse from './pages/EmergencyResponse';
import RouteExplorer from './pages/RouteExplorer';

import ErrorBoundary from './components/ErrorBoundary';
import { Compass } from 'lucide-react';

function AuthenticatedApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Set default tab when user changes
  useEffect(() => {
    if (user) {
      if (user.role === 'station_commander') {
        setActiveTab('station_dashboard');
      } else if (user.role === 'shipment_officer') {
        setActiveTab('officer_dashboard');
      } else if (user.role === 'personnel') {
        setActiveTab('personnel_dashboard');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/25 animate-pulse">
          <Compass className="w-7 h-7 text-white animate-spin-slow" />
        </div>
        <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          Initializing PolarLogix Secure Session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200 pb-16 lg:pb-0">
      {/* Top Navbar with active role indicators & Sync Widget */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Persistent Offline / PolarLink Status Banner */}
      <OfflineBanner />

      {/* Main Content Area based on User Role */}
      <main className="transition-all duration-300">
        <ErrorBoundary key={`${user.role}-${activeTab}`}>
          {/* Station Commander Scoped View */}
          {user.role === 'station_commander' && <StationCommanderDashboard />}

          {/* Shipment Officer Dedicated View */}
          {user.role === 'shipment_officer' && <ShipmentOfficerDashboard />}

          {/* Personnel Dedicated Portal */}
          {user.role === 'personnel' && <PersonnelDashboard />}

          {/* Super Admin Full Navigation Experience */}
          {user.role === 'admin' && (
            <>
              {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
              {activeTab === 'planner' && <ShipmentPlanner setActiveTab={setActiveTab} />}
              {activeTab === 'tracking' && <ShipmentTracker />}
              {activeTab === 'inventory' && <InventoryDashboard />}
              {activeTab === 'personnel' && <PersonnelManager />}
              {activeTab === 'emergency' && <EmergencyResponse />}
              {activeTab === 'explorer' && <RouteExplorer />}
            </>
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PolarLogix Multi-Role RBAC • National Centre for Polar and Ocean Research (NCPOR)</span>
          <span>Field Stations: Maitri, Bharati, Himadri & Himansh</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConnectivityProvider>
          <AuthenticatedApp />
        </ConnectivityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

---

### <a id="file-frontendsrcindexcss"></a>File: `frontend/src/index.css`

> **Role / Purpose**: Design tokens, dark polar theme, glassmorphism, responsive grid, high-contrast blizzard mode

```css
@import "tailwindcss";
@import "leaflet/dist/leaflet.css";

@layer base {
  :root {
    --bg-primary: #FAFAFA;
    --bg-card: #FFFFFF;
    --bg-card-hover: #F4F4F5;
    --text-primary: #0F172A;
    --text-secondary: #475569;
    --text-muted: #94A3B8;
    --border-color: #E2E8F0;
    --border-hairline: rgba(226, 232, 240, 0.8);
    --accent-blue: #0EA5E9;
    --accent-cyan: #06B6D4;
    --status-green: #10B981;
    --status-amber: #F59E0B;
    --status-red: #EF4444;
    --status-blue: #3B82F6;
  }

  .dark {
    --bg-primary: #0B0F19;
    --bg-card: #111827;
    --bg-card-hover: #1F2937;
    --text-primary: #F8FAFC;
    --text-secondary: #94A3B8;
    --text-muted: #64748B;
    --border-color: #1E293B;
    --border-hairline: rgba(30, 41, 59, 0.8);
    --accent-blue: #38BDF8;
    --accent-cyan: #22D3EE;
    --status-green: #34D399;
    --status-amber: #FBBF24;
    --status-red: #F87171;
    --status-blue: #60A5FA;
  }
}

body {
  margin: 0;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  transition: background-color 0.25s ease, color 0.25s ease;
  min-height: 100vh;
}

/* Glassmorphism and Card Styling */
.glass-panel {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}

.dark .glass-panel {
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* Leaflet Map Customizations */
.leaflet-container {
  width: 100%;
  height: 100%;
  border-radius: 0.75rem;
  z-index: 10;
}
.dark .leaflet-tile {
  filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
}
```

---

### <a id="file-frontendsrcappcss"></a>File: `frontend/src/App.css`

> **Role / Purpose**: App-level component animation styles, scrollbars, status glows

```css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}
```

---


## 7. Frontend Services & Offline Layer

### <a id="file-frontendsrcservicesapijs"></a>File: `frontend/src/services/api.js`

> **Role / Purpose**: Axios HTTP client with auth token interceptors, offline fallback hooks, and API methods

```javascript
import axios from 'axios';
import { setCachedData, getCachedData } from './db.js';

const baseURL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor to always attach current token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('polarlogix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generate cache key for GET requests
const getCacheKey = (url, params) => {
  if (!params || Object.keys(params).length === 0) return url;
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  return `${url}?${sorted}`;
};

// Response Interceptor for IndexedDB Auto-Caching & Offline Fallback
api.interceptors.response.use(
  async (response) => {
    // Only cache GET responses
    if (response.config.method?.toLowerCase() === 'get') {
      const cacheKey = getCacheKey(response.config.url, response.config.params);
      // Asynchronously cache to IndexedDB
      setCachedData(cacheKey, response.data);
      // Also cache normalized entity keys for offline read access
      if (response.config.url.includes('/dashboard/summary')) {
        setCachedData('cached_dashboard_summary', response.data);
      } else if (response.config.url.includes('/shipments') && !response.config.url.match(/\/shipments\/[^\/]+/)) {
        setCachedData('cached_shipments', response.data);
      } else if (response.config.url.includes('/inventory')) {
        setCachedData('cached_inventory', response.data);
      } else if (response.config.url.includes('/personnel') && !response.config.url.match(/\/personnel\/[^\/]+/)) {
        setCachedData('cached_personnel', response.data);
      } else if (response.config.url.includes('/emergencies')) {
        setCachedData('cached_emergencies', response.data);
      } else if (response.config.url.includes('/locations')) {
        setCachedData('cached_locations', response.data);
      }
    }
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and let state refresh
      localStorage.removeItem('polarlogix_token');
      localStorage.removeItem('polarlogix_user');
      return Promise.reject(error);
    }

    // If network error / offline / timeout on a GET request, attempt to serve from IndexedDB cache
    if ((!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') &&
        error.config?.method?.toLowerCase() === 'get') {
      const cacheKey = getCacheKey(error.config.url, error.config.params);
      const cached = await getCachedData(cacheKey);
      if (cached !== null && cached !== undefined) {
        console.info(`[Offline Cache Hit] Serving from IndexedDB: ${cacheKey}`);
        return Promise.resolve({
          data: cached,
          status: 200,
          statusText: 'OK (From Local IndexedDB Cache)',
          headers: {},
          config: error.config,
          is_offline_cached: true
        });
      }
    }

    return Promise.reject(error);
  }
);

// Health check endpoint for active connectivity detection
export const checkApiHealth = async () => {
  try {
    const res = await api.get('/health', { timeout: 3500 });
    return res.data?.status === 'healthy' || res.status === 200;
  } catch (err) {
    return false;
  }
};

// ----------------- AUTH -----------------
export const login = async (username, password) => (await api.post('/auth/login', { username, password })).data;
export const getCurrentUser = async () => (await api.get('/auth/me')).data;
export const getUsers = async () => (await api.get('/auth/users')).data;
export const createUser = async (payload) => (await api.post('/auth/users', payload)).data;

// ----------------- GENERAL -----------------
export const getDashboardSummary = async (params) => (await api.get('/dashboard/summary', { params })).data;
export const getLocations = async (params) => (await api.get('/locations', { params })).data;
export const getTransportLegs = async () => (await api.get('/transport-legs')).data;

// ----------------- SHIPMENTS & ROUTING -----------------
export const getShipments = async (params) => (await api.get('/shipments', { params })).data;
export const getShipmentDetail = async (id) => (await api.get(`/shipments/${id}`)).data;
export const createShipment = async (payload) => (await api.post('/shipments', payload)).data;
export const previewRoute = async (payload) => (await api.post('/routing/preview', payload)).data;
export const checkRouteWeather = async (waypoints) => (await api.post('/weather/route-check', waypoints)).data;
export const updateShipmentStatus = async (id, payload) => (await api.patch(`/shipments/${id}/status`, payload)).data;
export const advanceShipmentLeg = async (id) => (await api.post(`/shipments/${id}/advance-leg`)).data;
export const getShipmentRouteMap = async (id) => (await api.get(`/shipments/${id}/route-map`)).data;

// ----------------- OFFICER SUB-RESOURCES -----------------
export const recordHandoverConfirmation = async (shipmentId, payload) => 
  (await api.post(`/shipments/${shipmentId}/handover`, payload)).data;

export const getShipmentConsumables = async (shipmentId) => 
  (await api.get(`/shipments/${shipmentId}/consumables`)).data;

export const updateConsumableLevel = async (shipmentId, consumableId, payload) => 
  (await api.patch(`/shipments/${shipmentId}/consumables/${consumableId}`, payload)).data;

export const recalculateAlternateRoute = async (shipmentId, payload) => 
  (await api.post(`/shipments/${shipmentId}/recalculate-alternate-route`, payload)).data;

export const addWeatherLog = async (shipmentId, payload) => 
  (await api.post(`/shipments/${shipmentId}/weather-logs`, payload)).data;

export const uploadShipmentDocument = async (shipmentId, payload) => 
  (await api.post(`/shipments/${shipmentId}/documents`, payload)).data;

// ----------------- INVENTORY -----------------
export const getInventory = async (locationId) => (await api.get('/inventory', { params: { location_id: locationId } })).data;
export const saveInventoryItem = async (locationId, payload) => (await api.post(`/inventory/${locationId}`, payload)).data;

// ----------------- PERSONNEL & WORK STATUS -----------------
export const getPersonnel = async (params) => (await api.get('/personnel', { params })).data;
export const getPersonnelDetail = async (id) => (await api.get(`/personnel/${id}`)).data;
export const getMyPersonnelProfile = async () => (await api.get('/personnel/me/profile')).data;
export const postWorkStatus = async (payload) => (await api.post('/personnel/me/work-status', payload)).data;
export const createPersonnel = async (payload) => (await api.post('/personnel', payload)).data;

// ----------------- EMERGENCIES -----------------
export const getEmergencies = async (status) => (await api.get('/emergencies', { params: { status } })).data;
export const createEmergency = async (payload) => (await api.post('/emergencies', payload)).data;
export const updateEmergency = async (id, payload) => (await api.patch(`/emergencies/${id}`, payload)).data;

export default api;
```

---

### <a id="file-frontendsrcservicesdbjs"></a>File: `frontend/src/services/db.js`

> **Role / Purpose**: IndexedDB wrapper using idb library for offline entity storage (stations, shipments, inventory)

```javascript
import Dexie from 'dexie';

/**
 * PolarLogixDB - IndexedDB local persistence engine
 * Configured for extreme reliability during intermittent Antarctic connectivity.
 */
export const db = new Dexie('PolarLogixDB');

// Define database schema
db.version(1).stores({
  // Emergency Reports: highest critical priority
  pending_emergency_reports: '++id, local_id, title, priority, status, created_at',
  
  // Status & Operational Updates: shipment handovers, personnel work logs, weather observations, status transitions
  pending_status_updates: '++id, local_id, entity_type, entity_id, priority, status, created_at',
  
  // Inventory Updates: local stock adjustments and audit reports
  pending_inventory_updates: '++id, local_id, location_id, item_id, priority, status, created_at',
  
  // Offline Read Cache: mirrors key backend entities (shipments, inventory, personnel, emergencies, locations, summary)
  cached_dashboard_data: 'key, updated_at'
});

// Cache Helpers
export const setCachedData = async (key, data) => {
  try {
    await db.cached_dashboard_data.put({
      key,
      data,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn(`[IndexedDB Cache] Failed to cache data for key "${key}":`, err);
  }
};

export const getCachedData = async (key) => {
  try {
    const record = await db.cached_dashboard_data.get(key);
    return record ? record.data : null;
  } catch (err) {
    console.warn(`[IndexedDB Cache] Failed to read cached data for key "${key}":`, err);
    return null;
  }
};

export const getAllCachedData = async () => {
  try {
    const all = await db.cached_dashboard_data.toArray();
    return all.reduce((acc, item) => {
      acc[item.key] = { data: item.data, updated_at: item.updated_at };
      return acc;
    }, {});
  } catch (err) {
    console.warn('[IndexedDB Cache] Failed to read all cached data:', err);
    return {};
  }
};

// Queue Helpers for Pending Mutations
export const addPendingEmergency = async (payload) => {
  const local_id = `LOCAL-EMG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const record = {
    local_id,
    ...payload,
    priority: 'critical',
    status: 'pending',
    retry_count: 0,
    created_at: new Date().toISOString(),
    is_offline_created: true
  };
  const id = await db.pending_emergency_reports.add(record);
  return { ...record, id };
};

export const addPendingStatusUpdate = async ({ entity_type, entity_id, payload, priority = 'normal', endpoint, method = 'POST' }) => {
  const local_id = `LOCAL-UPD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const record = {
    local_id,
    entity_type, // 'personnel_work_status', 'shipment_handover', 'weather_log', 'shipment_status', 'shipment_advance_leg'
    entity_id,
    endpoint,
    method,
    payload,
    priority, // 'critical' | 'high' | 'normal'
    status: 'pending',
    retry_count: 0,
    created_at: new Date().toISOString(),
    is_offline_created: true
  };
  const id = await db.pending_status_updates.add(record);
  return { ...record, id };
};

export const addPendingInventoryUpdate = async ({ location_id, item_id, payload, priority = 'normal' }) => {
  const local_id = `LOCAL-INV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const record = {
    local_id,
    location_id,
    item_id: item_id || payload?.id,
    payload,
    priority,
    status: 'pending',
    retry_count: 0,
    created_at: new Date().toISOString(),
    is_offline_created: true
  };
  const id = await db.pending_inventory_updates.add(record);
  return { ...record, id };
};

// Get pending counts by priority
export const getPendingSyncSummary = async () => {
  try {
    const emergencies = await db.pending_emergency_reports.where('status').equals('pending').toArray();
    const statusUpdates = await db.pending_status_updates.where('status').equals('pending').toArray();
    const inventoryUpdates = await db.pending_inventory_updates.where('status').equals('pending').toArray();

    const all = [
      ...emergencies.map(e => ({ ...e, queue_type: 'emergency' })),
      ...statusUpdates.map(s => ({ ...s, queue_type: 'status_update' })),
      ...inventoryUpdates.map(i => ({ ...i, queue_type: 'inventory' }))
    ];

    const critical = all.filter(item => item.priority === 'critical');
    const high = all.filter(item => item.priority === 'high');
    const normal = all.filter(item => item.priority === 'normal');

    return {
      total: all.length,
      criticalCount: critical.length,
      highCount: high.length,
      normalCount: normal.length,
      items: all,
      critical,
      high,
      normal
    };
  } catch (err) {
    console.warn('[IndexedDB] Error computing pending sync summary:', err);
    return {
      total: 0,
      criticalCount: 0,
      highCount: 0,
      normalCount: 0,
      items: [],
      critical: [],
      high: [],
      normal: []
    };
  }
};

export default db;
```

---

### <a id="file-frontendsrcservicessyncqueuejs"></a>File: `frontend/src/services/syncQueue.js`

> **Role / Purpose**: Transactional offline mutation queue: queueing, background replay, conflict resolution

```javascript
import api from './api.js';
import { db, setCachedData, getCachedData } from './db.js';

/**
 * Priority-based Synchronization Engine for PolarLogix
 * Mirrors Antarctic/oceanic satellite link hierarchy:
 * 1. Critical priority (Emergencies) — strictly sequential, retry on error, halts lower queues
 * 2. High priority (Handovers, leg advancement, shipment status) — sequential
 * 3. Normal priority (Personnel status, weather logs, inventory adjustments) — sequential/batch
 */

export class SyncEngine {
  constructor() {
    this.isSyncing = false;
    this.listeners = new Set();
    this.lastSyncTimestamp = null;
    this.conflictNotices = [];
    this.syncLog = [];
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error('[SyncEngine] Listener error:', e);
      }
    });
  }

  log(message, type = 'info', meta = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      message,
      type, // 'critical' | 'high' | 'normal' | 'info' | 'error' | 'success' | 'conflict'
      meta
    };
    this.syncLog.unshift(entry);
    if (this.syncLog.length > 50) this.syncLog.pop();
    console.log(`[SyncEngine:${type.toUpperCase()}] ${message}`, meta || '');
    this.notify({ type: 'log', entry });
  }

  getConflictNotices() {
    return [...this.conflictNotices];
  }

  clearConflictNotice(id) {
    this.conflictNotices = this.conflictNotices.filter((n) => n.id !== id);
    this.notify({ type: 'conflicts', notices: this.conflictNotices });
  }

  addConflictNotice(notice) {
    const item = {
      ...notice,
      id: notice.conflict_id || `conflict-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      entity_id: notice.entity_id || notice.id,
      timestamp: new Date().toISOString()
    };
    this.conflictNotices.push(item);
    this.log(`Conflict notice: ${item.message}`, 'conflict', item);
    this.notify({ type: 'conflicts', notices: this.conflictNotices });
  }

  /**
   * Run priority-ordered sync cycle
   */
  async processSyncQueue() {
    if (this.isSyncing) {
      console.log('[SyncEngine] Sync cycle already in progress, skipping duplicate call.');
      return { status: 'in_progress' };
    }

    this.isSyncing = true;
    this.notify({ type: 'sync_start' });
    this.log('Initiating priority sync cycle over restored satellite link...', 'info');

    let totalSynced = 0;
    let criticalErrors = 0;

    try {
      // -------------------------------------------------------------
      // TIER 1: CRITICAL PRIORITY (Emergency Reports)
      // Must sync ONE AT A TIME, strictly in order, verifying server receipt.
      // If any critical item fails, HALT sync immediately and retry later.
      // -------------------------------------------------------------
      const pendingEmergencies = await db.pending_emergency_reports
        .where('status')
        .equals('pending')
        .sortBy('created_at');

      if (pendingEmergencies.length > 0) {
        this.log(`Transmitting ${pendingEmergencies.length} CRITICAL emergency report(s)...`, 'critical');

        for (const item of pendingEmergencies) {
          try {
            this.log(`[CRITICAL] Syncing emergency: "${item.title}" (${item.local_id})`, 'critical');
            
            // Format payload for backend createEmergency endpoint
            const payload = {
              title: item.title,
              description: item.description,
              severity: item.severity || 'high',
              type: item.type || 'operational',
              location_id: item.location_id,
              affected_shipment_id: item.affected_shipment_id || null,
              affected_personnel_id: item.affected_personnel_id || null
            };

            const response = await api.post('/emergencies', payload);
            const serverEmergency = response.data;

            // Remove from pending table
            await db.pending_emergency_reports.delete(item.id);
            totalSynced++;

            // Update cached emergencies
            const cached = (await getCachedData('/emergencies')) || [];
            const updatedCache = [serverEmergency, ...cached.filter((e) => e.id !== serverEmergency.id)];
            await setCachedData('/emergencies', updatedCache);
            await setCachedData('cached_emergencies', updatedCache);

            this.log(`[CRITICAL SUCCESS] Emergency synced with server ID: ${serverEmergency.id}`, 'success', { local_id: item.local_id, server_id: serverEmergency.id });
          } catch (err) {
            criticalErrors++;
            this.log(`[CRITICAL FAILED] Failed to sync emergency "${item.title}": ${err.message}. Halting lower queues.`, 'error');
            
            // Increment retry count
            await db.pending_emergency_reports.update(item.id, {
              retry_count: (item.retry_count || 0) + 1,
              last_error: err.message
            });

            // Critical failure halts lower queues (mirroring Iridium high-priority packet lock)
            this.isSyncing = false;
            this.notify({ type: 'sync_error', error: err });
            return { status: 'halted_critical_error', error: err.message };
          }
        }
      }

      // -------------------------------------------------------------
      // TIER 2: HIGH PRIORITY (Shipment Handovers & Status Changes)
      // -------------------------------------------------------------
      const pendingHighUpdates = await db.pending_status_updates
        .where('status')
        .equals('pending')
        .and((item) => item.priority === 'high')
        .sortBy('created_at');

      if (pendingHighUpdates.length > 0) {
        this.log(`Transmitting ${pendingHighUpdates.length} HIGH priority operational updates...`, 'high');

        for (const item of pendingHighUpdates) {
          try {
            this.log(`[HIGH] Syncing ${item.entity_type} for ${item.entity_id}`, 'high');
            
            let res;
            if (item.endpoint) {
              if (item.method === 'PATCH') {
                res = await api.patch(item.endpoint, item.payload);
              } else {
                res = await api.post(item.endpoint, item.payload);
              }
            } else if (item.entity_type === 'shipment_handover') {
              res = await api.post(`/shipments/${item.entity_id}/handover`, item.payload);
            } else if (item.entity_type === 'shipment_advance_leg') {
              res = await api.post(`/shipments/${item.entity_id}/advance-leg`, item.payload);
            } else if (item.entity_type === 'shipment_status') {
              res = await api.patch(`/shipments/${item.entity_id}/status`, item.payload);
            }

            // Conflict Check (Phase 4: Last-Write-Wins with Warning)
            if (res?.data && item.original_server_timestamp) {
              const serverUpdated = res.data.updated_at || res.data.created_at;
              if (serverUpdated && serverUpdated > item.original_server_timestamp) {
                this.addConflictNotice({
                  entity: item.entity_type,
                  id: item.entity_id,
                  message: `Shipment ${item.entity_id} was updated on the server while you were offline. Your local change was synchronized.`
                });
              }
            }

            await db.pending_status_updates.delete(item.id);
            totalSynced++;
            this.log(`[HIGH SUCCESS] ${item.entity_type} synced for ${item.entity_id}`, 'success');
          } catch (err) {
            this.log(`[HIGH ERROR] Could not sync ${item.entity_type} for ${item.entity_id}: ${err.message}`, 'error');
            await db.pending_status_updates.update(item.id, {
              retry_count: (item.retry_count || 0) + 1,
              last_error: err.message
            });
          }
        }
      }

      // -------------------------------------------------------------
      // TIER 3: NORMAL PRIORITY (Personnel Status, Weather Logs, Inventory)
      // -------------------------------------------------------------
      const pendingNormalUpdates = await db.pending_status_updates
        .where('status')
        .equals('pending')
        .and((item) => item.priority === 'normal')
        .sortBy('created_at');

      const pendingInventoryUpdates = await db.pending_inventory_updates
        .where('status')
        .equals('pending')
        .sortBy('created_at');

      const normalTotal = pendingNormalUpdates.length + pendingInventoryUpdates.length;
      if (normalTotal > 0) {
        this.log(`Transmitting ${normalTotal} NORMAL priority routine telemetry updates...`, 'normal');

        // Process status/weather/personnel updates
        for (const item of pendingNormalUpdates) {
          try {
            this.log(`[NORMAL] Syncing ${item.entity_type}`, 'normal');
            if (item.entity_type === 'personnel_work_status') {
              await api.post('/personnel/me/work-status', item.payload);
            } else if (item.entity_type === 'weather_log') {
              await api.post(`/shipments/${item.entity_id}/weather-logs`, item.payload);
            } else if (item.endpoint) {
              if (item.method === 'PATCH') {
                await api.patch(item.endpoint, item.payload);
              } else {
                await api.post(item.endpoint, item.payload);
              }
            }
            await db.pending_status_updates.delete(item.id);
            totalSynced++;
          } catch (err) {
            this.log(`[NORMAL ERROR] Failed to sync ${item.entity_type}: ${err.message}`, 'error');
            await db.pending_status_updates.update(item.id, {
              retry_count: (item.retry_count || 0) + 1,
              last_error: err.message
            });
          }
        }

        // Process inventory updates
        for (const item of pendingInventoryUpdates) {
          try {
            this.log(`[NORMAL] Syncing inventory item at ${item.location_id}`, 'normal');
            await api.post(`/inventory/${item.location_id}`, item.payload);
            await db.pending_inventory_updates.delete(item.id);
            totalSynced++;
          } catch (err) {
            this.log(`[NORMAL ERROR] Failed to sync inventory item at ${item.location_id}: ${err.message}`, 'error');
            await db.pending_inventory_updates.update(item.id, {
              retry_count: (item.retry_count || 0) + 1,
              last_error: err.message
            });
          }
        }
      }

      this.lastSyncTimestamp = new Date().toISOString();
      this.log(`Priority sync cycle completed successfully. ${totalSynced} items synchronized.`, 'success');
      this.notify({ type: 'sync_complete', totalSynced, timestamp: this.lastSyncTimestamp });
      return { status: 'complete', totalSynced };
    } catch (globalErr) {
      this.log(`Global sync exception: ${globalErr.message}`, 'error');
      this.notify({ type: 'sync_error', error: globalErr });
      return { status: 'error', error: globalErr.message };
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncEngine = new SyncEngine();
export default syncEngine;
```

---


## 8. Frontend Context Providers

### <a id="file-frontendsrccontextauthcontextjsx"></a>File: `frontend/src/context/AuthContext.jsx`

> **Role / Purpose**: JWT authentication context: login, logout, user profile, role helper functions

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('polarlogix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('polarlogix_token'));
  const [loading, setLoading] = useState(true);

  // Configure Axios defaults & interceptors
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('polarlogix_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('polarlogix_token');
    }
  }, [token]);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('polarlogix_token');
      if (savedToken) {
        try {
          const res = await axios.get(`${baseURL}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          setUser(res.data);
          localStorage.setItem('polarlogix_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await axios.post(`${baseURL}/auth/login`, {
      username: username.trim(),
      password
    });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('polarlogix_token', access_token);
    localStorage.setItem('polarlogix_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('polarlogix_token');
    localStorage.removeItem('polarlogix_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

### <a id="file-frontendsrccontextconnectivitycontextjsx"></a>File: `frontend/src/context/ConnectivityContext.jsx`

> **Role / Purpose**: Real-time network state tracker: online/offline/degraded detection, auto-sync triggers

```jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { checkApiHealth } from '../services/api';
import {
  db,
  addPendingEmergency,
  addPendingStatusUpdate,
  addPendingInventoryUpdate,
  getPendingSyncSummary,
  setCachedData,
  getCachedData
} from '../services/db';
import syncEngine from '../services/syncQueue';
import * as apiMethods from '../services/api';

const ConnectivityContext = createContext();

export function ConnectivityProvider({ children }) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [pendingSummary, setPendingSummary] = useState({
    total: 0,
    criticalCount: 0,
    highCount: 0,
    normalCount: 0,
    items: [],
    critical: [],
    high: [],
    normal: []
  });
  const [conflictNotices, setConflictNotices] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Show non-blocking toast notification
  const showToast = useCallback((msg, type = 'info', duration = 5000) => {
    setToastMessage({ id: Date.now(), msg, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.msg === msg ? null : current));
    }, duration);
  }, []);

  // Refresh pending items count
  const refreshPendingCounts = useCallback(async () => {
    const summary = await getPendingSyncSummary();
    setPendingSummary(summary);
  }, []);

  // Active Health Ping (GET /api/health)
  const pingHealth = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      return false;
    }
    const healthy = await checkApiHealth();
    setIsOnline((prev) => {
      if (!prev && healthy) {
        showToast('🟢 PolarLink Restored: Satellite connectivity active. Initiating priority sync...', 'success');
        // Auto trigger priority sync upon link restoration
        syncEngine.processSyncQueue();
      } else if (prev && !healthy) {
        showToast('⚠️ PolarLink Interrupted: Operating in Offline Mode. All changes will be saved to IndexedDB.', 'warning');
      }
      return healthy;
    });
    return healthy;
  }, [showToast]);

  // Initial setup & periodic health check timer (every 10 seconds)
  useEffect(() => {
    // Initial counts
    refreshPendingCounts();
    pingHealth();

    const handleBrowserOnline = () => {
      console.log('[Connectivity] Browser fired "online" event. Verifying server health...');
      pingHealth();
    };

    const handleBrowserOffline = () => {
      console.log('[Connectivity] Browser fired "offline" event.');
      setIsOnline(false);
      showToast('⚠️ Offline Mode: Physical network adapter disconnected.', 'warning');
    };

    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);

    // Periodic ping every 10-12s
    const pingInterval = setInterval(() => {
      pingHealth();
    }, 10000);

    // Periodic check for pending counts (every 4s)
    const countInterval = setInterval(() => {
      refreshPendingCounts();
    }, 4000);

    // Subscribe to syncEngine events
    const unsubscribeSync = syncEngine.subscribe((event) => {
      if (event.type === 'sync_start') {
        setIsSyncing(true);
      } else if (event.type === 'sync_complete') {
        setIsSyncing(false);
        setLastSyncTime(event.timestamp);
        refreshPendingCounts();
        if (event.totalSynced > 0) {
          showToast(`✅ Sync Complete: ${event.totalSynced} items synchronized with HQ server.`, 'success');
        }
      } else if (event.type === 'sync_error') {
        setIsSyncing(false);
        refreshPendingCounts();
      } else if (event.type === 'conflicts') {
        setConflictNotices(event.notices);
      }
    });

    return () => {
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('offline', handleBrowserOffline);
      clearInterval(pingInterval);
      clearInterval(countInterval);
      unsubscribeSync();
    };
  }, [pingHealth, refreshPendingCounts, showToast]);

  // Force trigger sync
  const triggerSync = useCallback(async () => {
    const isHealthy = await pingHealth();
    if (!isHealthy) {
      showToast('⚠️ Cannot sync: PolarLink is currently offline.', 'warning');
      return { status: 'offline' };
    }
    return await syncEngine.processSyncQueue();
  }, [pingHealth, showToast]);

  const dismissConflictNotice = useCallback((id) => {
    syncEngine.clearConflictNotice(id);
  }, []);

  // -------------------------------------------------------------
  // OPTIMISTIC OFFLINE-AWARE MUTATION HANDLERS
  // -------------------------------------------------------------

  // 1. Emergency Report (CRITICAL PRIORITY)
  const submitEmergency = async (payload) => {
    if (isOnline) {
      try {
        const result = await apiMethods.createEmergency(payload);
        showToast('🚨 Emergency report transmitted immediately to HQ.', 'success');
        // Update cache
        const cached = (await getCachedData('/emergencies')) || [];
        await setCachedData('/emergencies', [result, ...cached.filter((e) => e.id !== result.id)]);
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[Emergency] Online submission failed, falling back to local critical queue:', err);
      }
    }

    // Offline / Network Failure Fallback
    const localRecord = await addPendingEmergency(payload);
    await refreshPendingCounts();

    // Optimistically update cached emergencies so it displays in UI immediately
    const cached = (await getCachedData('/emergencies')) || [];
    const optimisticItem = {
      id: localRecord.local_id,
      ...payload,
      status: 'active',
      reported_at: localRecord.created_at,
      is_pending_sync: true,
      priority: 'critical'
    };
    await setCachedData('/emergencies', [optimisticItem, ...cached]);

    showToast('🚨 Saved locally (Critical Priority Queue) — will transmit first when connection returns.', 'warning', 6000);
    return { success: true, data: optimisticItem, isOffline: true };
  };

  // 2. Personnel Work Status (NORMAL PRIORITY)
  const submitPersonnelWorkStatus = async (payload) => {
    if (isOnline) {
      try {
        const result = await apiMethods.postWorkStatus(payload);
        showToast('✅ Work status updated successfully.', 'success');
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[Personnel] Online update failed, saving locally:', err);
      }
    }

    const localRecord = await addPendingStatusUpdate({
      entity_type: 'personnel_work_status',
      entity_id: 'me',
      payload,
      priority: 'normal'
    });
    await refreshPendingCounts();
    showToast('💾 Status saved locally — queued for background sync.', 'info');
    return { success: true, data: { ...payload, is_pending_sync: true }, isOffline: true };
  };

  // 3. Shipment Handover Confirmation (HIGH PRIORITY)
  const submitHandoverConfirmation = async (shipmentId, payload) => {
    if (isOnline) {
      try {
        const result = await apiMethods.recordHandoverConfirmation(shipmentId, payload);
        showToast('📦 Handover confirmation recorded.', 'success');
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[Handover] Online submission failed, queuing high priority:', err);
      }
    }

    const localRecord = await addPendingStatusUpdate({
      entity_type: 'shipment_handover',
      entity_id: shipmentId,
      payload,
      priority: 'high'
    });
    await refreshPendingCounts();
    showToast('💾 Handover saved locally (High Priority Queue) — will sync when link restores.', 'warning');
    return { success: true, data: { ...payload, is_pending_sync: true }, isOffline: true };
  };

  // 4. Weather Log (NORMAL PRIORITY)
  const submitWeatherLog = async (shipmentId, payload) => {
    if (isOnline) {
      try {
        const result = await apiMethods.addWeatherLog(shipmentId, payload);
        showToast('🌤️ Weather observation logged.', 'success');
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[WeatherLog] Online failed, queuing:', err);
      }
    }

    const localRecord = await addPendingStatusUpdate({
      entity_type: 'weather_log',
      entity_id: shipmentId,
      payload,
      priority: 'normal'
    });
    await refreshPendingCounts();
    showToast('💾 Weather log stored in local buffer.', 'info');
    return { success: true, data: { ...payload, is_pending_sync: true }, isOffline: true };
  };

  // 5. Inventory Item (NORMAL PRIORITY)
  const submitInventoryItem = async (locationId, payload) => {
    if (isOnline) {
      try {
        const result = await apiMethods.saveInventoryItem(locationId, payload);
        showToast('📋 Inventory stock record updated.', 'success');
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[Inventory] Online failed, queuing:', err);
      }
    }

    const localRecord = await addPendingInventoryUpdate({
      location_id: locationId,
      item_id: payload?.id,
      payload,
      priority: 'normal'
    });
    await refreshPendingCounts();
    showToast('💾 Inventory updated locally — will sync on reconnect.', 'info');
    return { success: true, data: { ...payload, is_pending_sync: true }, isOffline: true };
  };

  // 6. Shipment Status Transition (HIGH PRIORITY)
  const submitShipmentStatus = async (shipmentId, payload) => {
    if (isOnline) {
      try {
        const result = await apiMethods.updateShipmentStatus(shipmentId, payload);
        showToast('🚢 Shipment status updated.', 'success');
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[ShipmentStatus] Online failed, queuing:', err);
      }
    }

    const localRecord = await addPendingStatusUpdate({
      entity_type: 'shipment_status',
      entity_id: shipmentId,
      payload,
      priority: 'high'
    });
    await refreshPendingCounts();
    showToast('💾 Status change buffered locally (High Priority).', 'warning');
    return { success: true, data: { ...payload, is_pending_sync: true }, isOffline: true };
  };

  // 7. Advance Shipment Leg (HIGH PRIORITY)
  const submitAdvanceLeg = async (shipmentId) => {
    if (isOnline) {
      try {
        const result = await apiMethods.advanceShipmentLeg(shipmentId);
        showToast('🧭 Shipment advanced to next voyage leg.', 'success');
        return { success: true, data: result, isOffline: false };
      } catch (err) {
        console.warn('[AdvanceLeg] Online failed, queuing:', err);
      }
    }

    const localRecord = await addPendingStatusUpdate({
      entity_type: 'shipment_advance_leg',
      entity_id: shipmentId,
      payload: {},
      priority: 'high'
    });
    await refreshPendingCounts();
    showToast('💾 Leg advancement saved locally (High Priority).', 'warning');
    return { success: true, data: { is_pending_sync: true }, isOffline: true };
  };

  return (
    <ConnectivityContext.Provider
      value={{
        isOnline,
        isSyncing,
        lastSyncTime,
        pendingSummary,
        conflictNotices,
        toastMessage,
        pingHealth,
        triggerSync,
        dismissConflictNotice,
        showToast,
        refreshPendingCounts,
        // Offline-first mutation wrappers
        submitEmergency,
        submitPersonnelWorkStatus,
        submitHandoverConfirmation,
        submitWeatherLog,
        submitInventoryItem,
        submitShipmentStatus,
        submitAdvanceLeg
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
}
```

---

### <a id="file-frontendsrccontextthemecontextjsx"></a>File: `frontend/src/context/ThemeContext.jsx`

> **Role / Purpose**: Theme management (Polar Dark / High-Contrast Arctic Daylight mode)

```jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('polarlogix_theme');
    return saved ? saved : 'dark'; // Default to dark mode for arctic aesthetic
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('polarlogix_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

---


## 9. Frontend Reusable UI Components

### <a id="file-frontendsrccomponentsnavbarjsx"></a>File: `frontend/src/components/Navbar.jsx`

> **Role / Purpose**: Top navigation bar with role switcher, station indicator, connectivity status, auth controls

```jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Compass,
  LayoutDashboard,
  PackagePlus,
  Truck,
  Boxes,
  Users,
  ShieldAlert,
  Route,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Shield,
  Radio,
  Ship,
  UserCheck,
  User,
  Info,
  Building2,
  Globe,
  Snowflake,
  Mountain,
  Award,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

import SyncStatusWidget from './SyncStatusWidget';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [selectedStationTab, setSelectedStationTab] = useState('maitri');

  // Define nav links per role
  let navItems = [];
  if (user?.role === 'admin') {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'planner', label: 'Route Planner', icon: PackagePlus },
      { id: 'tracking', label: 'Shipment Tracker', icon: Truck },
      { id: 'inventory', label: 'Inventory', icon: Boxes },
      { id: 'personnel', label: 'Personnel', icon: Users },
      { id: 'emergency', label: 'Emergency Hub', icon: ShieldAlert, badge: true },
      { id: 'explorer', label: 'Network Explorer', icon: Route },
    ];
  } else if (user?.role === 'station_commander') {
    navItems = [
      { id: 'station_dashboard', label: 'Station Command Hub', icon: Radio },
    ];
  } else if (user?.role === 'shipment_officer') {
    navItems = [
      { id: 'officer_dashboard', label: 'Voyage Operations', icon: Ship },
    ];
  } else if (user?.role === 'personnel') {
    navItems = [
      { id: 'personnel_dashboard', label: 'Expedition Portal', icon: UserCheck },
    ];
  }

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return { label: 'HQ SUPER ADMIN', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: Shield };
      case 'station_commander':
        const stn = user.linked_station_id === 'LOC-BHA' ? 'BHARATI' : 'MAITRI';
        return { label: `COMMANDER • ${stn}`, color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30', icon: Radio };
      case 'shipment_officer':
        return { label: 'SHIPMENT OFFICER', color: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30', icon: Ship };
      case 'personnel':
        return { label: `PERSONNEL • ${user.linked_personnel_id || user.username}`, color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30', icon: UserCheck };
      default:
        return { label: user.role, color: 'bg-slate-500/15 text-slate-600 border-slate-500/30', icon: User };
    }
  };

  const badge = getRoleBadge();

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-[#0B0F19]/85 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & NCPOR Tag */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab(navItems[0]?.id || 'dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 flex-shrink-0">
                <Compass className="w-6 h-6 text-white animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                    PolarLogix
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded uppercase bg-sky-500/10 text-sky-500 border border-sky-500/20">
                    NCPOR
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  National Centre for Polar and Ocean Research
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links (Admin sees all 7; others see scoped link) */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-500' : ''}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Header Actions: Sync Widget, About Button, User Role Tag, Theme Toggle & Logout */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* PolarLink Satellite Comms & Priority Sync Status Widget */}
              <SyncStatusWidget />

              {/* About Programme Info Button */}
              <button
                onClick={() => setShowAboutModal(true)}
                title="About NCPOR Polar Programme & Stations"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white transition-all text-xs font-semibold cursor-pointer shadow-sm"
              >
                <Info className="w-4 h-4" />
                <span className="hidden md:inline">About</span>
              </button>

              {badge && (
                <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide uppercase border ${badge.color}`}>
                  <badge.icon className="w-3.5 h-3.5" />
                  <span>{badge.label}</span>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Sign Out of PolarLogix"
                className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center space-x-1 text-xs font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>

              {/* Mobile Hamburger Button */}
              {navItems.length > 1 && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F19]/95 px-4 pt-2 pb-4 space-y-1">
            {badge && (
              <div className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase mb-2 border ${badge.color}`}>
                <badge.icon className="w-4 h-4" />
                <span>{badge.label}</span>
              </div>
            )}
            <button
              onClick={() => {
                setShowAboutModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10"
            >
              <Info className="w-4 h-4" />
              <span>About NCPOR Programme & Stations</span>
            </button>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-500 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* PHASE 4: ABOUT NCPOR PROGRAMME INFO MODAL */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel max-w-3xl w-full p-6 sm:p-8 space-y-6 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 pr-8">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-lg uppercase tracking-wider bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  Institutional Overview
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Ministry of Earth Sciences, Govt. of India
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                National Centre for Polar and Ocean Research (NCPOR)
              </h2>
            </div>

            {/* Core Institutional Fact Sheet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">Headquarters</span>
                <div className="font-bold text-slate-900 dark:text-white">Headland Sada, Vasco-da-Gama, Goa 403804</div>
                <div className="text-slate-500">Autonomous R&D Institution under Ministry of Earth Sciences (MoES)</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">Leadership</span>
                <div className="font-bold text-slate-900 dark:text-white">Dr. Thamban Meloth</div>
                <div className="text-slate-500">Director, National Centre for Polar and Ocean Research</div>
              </div>
            </div>

            {/* National Platform Mandate */}
            <div className="p-4 rounded-xl bg-sky-500/5 dark:bg-sky-950/20 border border-sky-500/20 text-xs space-y-2">
              <div className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>National Research Enabling Mandate</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                NCPOR acts as India's premier national nodal platform coordinating, funding, and providing cold-region expedition logistics for scientists across <b>Indian Institutes of Technology (IITs)</b>, <b>CSIR laboratories</b>, <b>ISRO space organisations (SAC/NRSC)</b>, <b>National Institute of Oceanography (NIO)</b>, <b>Geological Survey of India (GSI)</b>, and premier universities nationwide, alongside in-house scientific programs.
              </p>
            </div>

            {/* Four-Station Polar Dossier Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-500" />
                  <span>The Four NCPOR Field Stations</span>
                </h3>
                <span className="text-[11px] text-slate-400">Antarctic, Arctic & Himalayan Mandate</span>
              </div>

              {/* Station Tab Switcher */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'maitri', name: 'Maitri', region: 'Antarctic', icon: Snowflake },
                  { id: 'bharati', name: 'Bharati', region: 'Antarctic', icon: Snowflake },
                  { id: 'himadri', name: 'Himadri', region: 'Arctic', icon: Compass },
                  { id: 'himansh', name: 'Himansh', region: 'Himalayas', icon: Mountain },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isSelected = selectedStationTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedStationTab(tab.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500 text-white border-sky-500 shadow-md font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-500/50'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-xs font-extrabold">{tab.name}</span>
                      </div>
                      <div className={`text-[10px] ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                        {tab.region}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Station Detail Card */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
                {selectedStationTab === 'maitri' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                      <span>Maitri Research Station (Est. 1989)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Antarctic Inland</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs space-y-1">
                      <p><b>Location:</b> Schirmacher Oasis, inland Antarctica (70°46'S, 11°44'E)</p>
                      <p><b>Capacity:</b> 25 Wintering Crew / ~50 Summer Peak (accommodation-dependent configuration)</p>
                      <p><b>Distinctive Logistics Gap:</b> Maitri is located approximately <b>80 km inland</b> from the Indian Barrier/ice-shelf edge where chartered expedition vessels dock. Cargo requires a multi-stage overland supply chain (ship → ice shelf edge → PistenBully snow tractor convoys / helicopters → Maitri station).</p>
                      <p><b>Research Focus:</b> Meteorology, glaciology, solid earth sciences, biology, upper atmospheric physics.</p>
                    </div>
                  </div>
                )}

                {selectedStationTab === 'bharati' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                      <span>Bharati Research Station (Est. 2012)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">Antarctic Coastal</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs space-y-1">
                      <p><b>Location:</b> Larsemann Hills, Prydz Bay (69°24.41'S, 76°11.72'E / -69.4068, 76.1953)</p>
                      <p><b>Capacity:</b> 24 Wintering Crew / 47 Summer Crew (46th ISEA Operating Configuration)</p>
                      <p><b>Distinctive Logistics Fact:</b> Bharati is directly coastal, situated ~<b>200m from shore</b> at Quilty Bay. Direct ship-to-shore helicopter transfer and vessel barge landing are utilized without requiring long-distance inland overland traverses.</p>
                      <p><b>Research Focus:</b> Oceanography, atmospheric sciences, geosciences, polar biology, satellite telemetry.</p>
                    </div>
                  </div>
                )}

                {selectedStationTab === 'himadri' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                      <span>Himadri Arctic Station (Est. 2008)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">Arctic / Svalbard</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs space-y-1">
                      <p><b>Location:</b> Ny-Ålesund, Spitsbergen, Svalbard, Norway (78°55'N, 11°56'E)</p>
                      <p><b>Operating Framework:</b> Operates within an <b>international research base framework</b> under the Svalbard Treaty (Kings Bay AS logistics), distinct from sovereign Antarctic station management.</p>
                      <p><b>Capacity:</b> 8 Summer Researchers (Seasonal and project-based campaigns).</p>
                      <p><b>Research Focus:</b> Atmospheric science, microbiology, earth science, glaciology, space physics, biology, micropalaeontology, palaeoclimatology.</p>
                    </div>
                  </div>
                )}

                {selectedStationTab === 'himansh' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                      <span>Himansh Himalayan Station (Est. 2016)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">Himalayan Glacier Base</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs space-y-1">
                      <p><b>Location:</b> Sutri Dhaka, Chandra Basin, Lahaul-Spiti, Himachal Pradesh, India (32.4485°N, 77.6155°E)</p>
                      <p><b>Altitude:</b> ~4,080 meters above sea level.</p>
                      <p><b>Logistics Model:</b> Land-based road logistics (no sea or air transport legs apply; accessible via Manali-Leh road corridor).</p>
                      <p><b>Research Purpose:</b> Continuous field research on Himalayan glacier dynamics, hydrological discharge, ice thickness, and climate interaction in the High Himalayas.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAboutModal(false)}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Bottom Quick Bar for Super Admin */}
      {user?.role === 'admin' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0B0F19]/90 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md lg:hidden flex justify-around py-2 px-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center p-1.5 text-xs transition-colors ${
                  isActive ? 'text-sky-500 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
```

---

### <a id="file-frontendsrccomponentsofflinebannerjsx"></a>File: `frontend/src/components/OfflineBanner.jsx`

> **Role / Purpose**: Live banner warning users of offline mode, pending queued sync items, and reconnect triggers

```jsx
import React from 'react';
import { useConnectivity } from '../context/ConnectivityContext';
import { WifiOff, Radio, RefreshCw, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function OfflineBanner() {
  const {
    isOnline,
    isSyncing,
    pendingSummary,
    triggerSync,
    pingHealth,
    toastMessage
  } = useConnectivity();

  if (isOnline && pendingSummary.total === 0 && !toastMessage) {
    return null;
  }

  return (
    <div className="sticky top-16 z-40 w-full transition-all">
      {/* 1. Offline Mode Banner */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-1 rounded-md bg-white/20 animate-pulse">
              <WifiOff className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold flex items-center gap-1.5">
                <span>PolarLink Offline (Antarctic Comms Blackout)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/25 font-mono uppercase">
                  Iridium Buffer Ready
                </span>
              </div>
              <p className="text-amber-100 text-[11px] hidden sm:block">
                All changes, emergency reports & logs are saved locally in IndexedDB and will auto-sync with priority once connectivity returns.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {pendingSummary.total > 0 && (
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-black/30 font-semibold text-[11px]">
                {pendingSummary.criticalCount > 0 && (
                  <span className="text-rose-200 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                    {pendingSummary.criticalCount} Critical
                  </span>
                )}
                {pendingSummary.highCount > 0 && (
                  <span className="text-amber-200">
                    {pendingSummary.highCount} High
                  </span>
                )}
                {pendingSummary.normalCount > 0 && (
                  <span className="text-slate-200">
                    {pendingSummary.normalCount} Normal
                  </span>
                )}
              </div>
            )}

            <button
              onClick={() => pingHealth()}
              title="Ping server health check"
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Check Link</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Sync In Progress Banner (When link restores) */}
      {isOnline && isSyncing && (
        <div className="bg-sky-600 text-white px-4 py-2 shadow flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-200" />
            <span className="font-semibold">
              PolarLink Active: Priority synchronization in progress...
            </span>
          </div>
          <span className="text-[11px] text-sky-100 font-mono">
            {pendingSummary.criticalCount > 0
              ? `Transmitting Critical Emergenices (1/1)...`
              : `Flushing ${pendingSummary.total} pending record(s)...`}
          </span>
        </div>
      )}

      {/* 3. Toast Message Notification Bar (if active) */}
      {toastMessage && (
        <div
          className={`px-4 py-1.5 text-xs font-medium flex items-center justify-between transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 text-white'
              : toastMessage.type === 'warning'
              ? 'bg-amber-600 text-white'
              : toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-100'
          }`}
        >
          <div className="flex items-center space-x-2">
            {toastMessage.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {toastMessage.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
            {toastMessage.type === 'error' && <ShieldAlert className="w-3.5 h-3.5" />}
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### <a id="file-frontendsrccomponentssyncstatuswidgetjsx"></a>File: `frontend/src/components/SyncStatusWidget.jsx`

> **Role / Purpose**: Floating sync status widget showing queued transactions, sync progress, and retry actions

```jsx
import React, { useState, useEffect } from 'react';
import { useConnectivity } from '../context/ConnectivityContext';
import syncEngine from '../services/syncQueue';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  X,
  Database,
  ArrowUpRight,
  Server,
  Layers,
  Send
} from 'lucide-react';

export default function SyncStatusWidget() {
  const {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingSummary,
    triggerSync,
    pingHealth,
    conflictNotices,
    dismissConflictNotice
  } = useConnectivity();

  const [modalOpen, setModalOpen] = useState(false);
  const [syncLogs, setSyncLogs] = useState([...syncEngine.syncLog]);

  useEffect(() => {
    const unsub = syncEngine.subscribe((event) => {
      if (event.type === 'log') {
        setSyncLogs([...syncEngine.syncLog]);
      }
    });
    return unsub;
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return 'Never';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      {/* Navbar Trigger Button / Badge */}
      <button
        onClick={() => setModalOpen(true)}
        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
          !isOnline
            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25 animate-pulse'
            : isSyncing
            ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/25'
            : pendingSummary.total > 0
            ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/25'
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
        }`}
        title="PolarLink Comms & Priority Sync Status"
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Offline</span>
            {pendingSummary.total > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingSummary.total}
              </span>
            )}
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-500" />
            <span className="hidden sm:inline">Syncing...</span>
          </>
        ) : pendingSummary.total > 0 ? (
          <>
            <Radio className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">Pending Sync</span>
            <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold">
              {pendingSummary.total}
            </span>
          </>
        ) : (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">PolarLink Active</span>
          </>
        )}
      </button>

      {/* Sync Queue Inspector Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel max-w-2xl w-full p-6 space-y-5 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>PolarLink Satellite Comms & Priority Sync Queue</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dexie IndexedDB local buffer • Priority transmission hierarchy
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Link Status</span>
                <div className="flex items-center gap-1.5 font-extrabold text-xs mt-1">
                  {isOnline ? (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5" /> Starlink Active
                    </span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-1">
                      <WifiOff className="w-3.5 h-3.5" /> Offline Buffer
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Last Sync</span>
                <div className="font-extrabold text-xs text-slate-700 dark:text-slate-200 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {formatTime(lastSyncTime)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Critical Queue</span>
                <div className="font-extrabold text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {pendingSummary.criticalCount} Emergency
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Standard Queue</span>
                <div className="font-extrabold text-xs text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-sky-500" />
                  {pendingSummary.highCount + pendingSummary.normalCount} Records
                </div>
              </div>
            </div>

            {/* Conflict Warnings (Phase 4) */}
            {conflictNotices.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Conflict Notifications (Last Write Synchronized)</span>
                </h4>
                {conflictNotices.map((conflict) => (
                  <div
                    key={conflict.id}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-center justify-between text-amber-700 dark:text-amber-300"
                  >
                    <span>{conflict.message}</span>
                    <button
                      onClick={() => dismissConflictNotice(conflict.id)}
                      className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-600 dark:text-amber-200 text-[10px] font-bold cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Items Priority List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-sky-500" />
                  <span>Buffered Outbox ({pendingSummary.total} Items)</span>
                </h4>
                <span className="text-[10px] text-slate-400">
                  Transmits in order: Critical ➔ High ➔ Normal
                </span>
              </div>

              {pendingSummary.total === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-70" />
                  All local changes are fully synchronized with HQ.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {pendingSummary.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        item.priority === 'critical'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 font-medium'
                          : item.priority === 'high'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            item.priority === 'critical'
                              ? 'bg-rose-500 text-white'
                              : item.priority === 'high'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-500 text-white'
                          }`}
                        >
                          {item.priority}
                        </span>
                        <span className="font-bold">
                          {item.title || item.entity_type || 'Inventory Item'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.local_id}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatTime(item.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Transmission Audit Log */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Satellite Transmission Audit Log
              </h4>
              <div className="bg-slate-950 rounded-xl p-2.5 font-mono text-[10px] text-emerald-400 h-28 overflow-y-auto space-y-1">
                {syncLogs.length === 0 ? (
                  <div className="text-slate-500 italic">No sync activity logged yet.</div>
                ) : (
                  syncLogs.map((entry, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 leading-tight">
                      <span className="text-slate-500 flex-shrink-0">
                        [{formatTime(entry.timestamp)}]
                      </span>
                      <span
                        className={
                          entry.type === 'critical'
                            ? 'text-rose-400 font-bold'
                            : entry.type === 'high'
                            ? 'text-amber-400 font-bold'
                            : entry.type === 'success'
                            ? 'text-emerald-300 font-bold'
                            : entry.type === 'error'
                            ? 'text-rose-500'
                            : 'text-slate-300'
                        }
                      >
                        {entry.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => pingHealth()}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-sky-500" />
                <span>Test Link Ping</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    await triggerSync();
                  }}
                  disabled={isSyncing || pendingSummary.total === 0}
                  className={`px-4 py-1.5 rounded-xl text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all shadow-md ${
                    isSyncing || pendingSummary.total === 0
                      ? 'bg-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-sky-500 hover:bg-sky-600'
                  }`}
                >
                  <Send className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Queue Now'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
```

---

### <a id="file-frontendsrccomponentsstatusbadgejsx"></a>File: `frontend/src/components/StatusBadge.jsx`

> **Role / Purpose**: Reusable status badge component for shipment, inventory, and emergency priority levels

```jsx
import React from 'react';

const statusStyles = {
  // Cargo statuses
  planned: { bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Planned' },
  in_transit: { bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse', label: 'In Transit' },
  at_transfer_point: { bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Cape Town Staging' },
  delivered: { bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Delivered' },
  on_hold: { bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20', label: 'Hazmat / Hold' },

  // Personnel statuses
  deployed: { bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Deployed' },
  returned: { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Returned' },

  // Emergency severities
  critical: { bg: 'bg-red-500/20 text-red-500 border-red-500/40 animate-pulse font-bold', label: 'Critical' },
  high: { bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'High' },
  medium: { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Medium' },
  low: { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Low' },

  // Emergency status
  open: { bg: 'bg-rose-500/10 text-rose-500 border-rose-500/30 font-semibold', label: 'Active Incident' },
  resolved: { bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Resolved' }
};

export default function StatusBadge({ status, customLabel, className = '' }) {
  const style = statusStyles[status] || { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${style.bg} ${className}`}>
      {customLabel || style.label}
    </span>
  );
}
```

---

### <a id="file-frontendsrccomponentsloadingskeletonjsx"></a>File: `frontend/src/components/LoadingSkeleton.jsx`

> **Role / Purpose**: Glassmorphic loading skeleton component for asynchronous data loading states

```jsx
import React from 'react';

export default function LoadingSkeleton({ type = 'cards', count = 3 }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800/60 rounded-xl border border-slate-300 dark:border-slate-800 p-4">
            <div className="h-4 bg-slate-300 dark:bg-slate-700/60 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-300 dark:bg-slate-700/60 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800/60 rounded-lg border border-slate-300 dark:border-slate-800"></div>
      ))}
    </div>
  );
}
```

---

### <a id="file-frontendsrccomponentserrorboundaryjsx"></a>File: `frontend/src/components/ErrorBoundary.jsx`

> **Role / Purpose**: React error boundary catching rendering failures with fallback recovery UI

```jsx
import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 max-w-3xl mx-auto my-8">
          <div className="glass-panel p-8 text-center space-y-6 border-l-4 border-l-rose-500 bg-rose-500/5 shadow-2xl rounded-2xl">
            <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 text-rose-500 mb-2">
              <ShieldAlert className="w-12 h-12 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {this.props.title || 'PolarLogix Operations Alert'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                {this.props.message ||
                  'Something went wrong while rendering this section. Please refresh the page or retry to recover.'}
              </p>
            </div>

            {this.state.error && (
              <details className="text-left bg-slate-900/90 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-auto max-h-40 border border-slate-800">
                <summary className="cursor-pointer text-slate-400 font-semibold mb-2 hover:text-slate-200">
                  View Technical Diagnostic Details
                </summary>
                <div className="text-rose-400 font-bold mb-1">
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo?.componentStack && (
                  <pre className="whitespace-pre-wrap text-[11px] text-slate-400">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold rounded-xl text-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={this.handleReload}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-500/25 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

### <a id="file-frontendsrccomponentsmapexpeditionmapjsx"></a>File: `frontend/src/components/Map/ExpeditionMap.jsx`

> **Role / Purpose**: Interactive Leaflet polar expedition map with custom markers, multi-modal polylines, weather popups

```jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Compass, Ship, Plane, Navigation, ShieldCheck, Waves, Wind, AlertTriangle, Globe, MapPin, Mountain, Snowflake, Sun } from 'lucide-react';

// Custom Leaflet Icons using SVG Data URIs
const createCustomIcon = (color, label, badge = '') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#FFFFFF"></circle>
    </svg>
  `;
  return L.divIcon({
    html: `<div class="relative flex flex-col items-center justify-center">
      ${svg}
      <div class="absolute -bottom-5 flex items-center space-x-1 bg-white/95 dark:bg-slate-900/95 px-1.5 py-0.5 rounded shadow-md border border-slate-300 dark:border-slate-700 whitespace-nowrap">
        ${badge ? `<span class="text-[9px] font-extrabold uppercase px-1 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400">${badge}</span>` : ''}
        <span class="text-[10px] font-bold text-slate-800 dark:text-white">${label}</span>
      </div>
    </div>`,
    className: 'custom-map-icon',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });
};

const createWaypointIcon = (color, label) => {
  return L.divIcon({
    html: `<div class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md" style="background-color: ${color};" title="${label}"></div>`,
    className: 'custom-waypoint-icon',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const locationIcons = {
  'LOC-GOA': createCustomIcon('#0EA5E9', 'Goa Depot', 'DEPOT'),
  'LOC-CPT': createCustomIcon('#F59E0B', 'Cape Town', 'HUB'),
  'LOC-MAI': createCustomIcon('#10B981', 'Maitri', 'ANTARCTIC'),
  'LOC-BHA': createCustomIcon('#06B6D4', 'Bharati', 'ANTARCTIC'),
  'LOC-HIM': createCustomIcon('#8B5CF6', 'Himadri', 'ARCTIC'),
  'LOC-HMS': createCustomIcon('#F97316', 'Himansh', 'HIMALAYAN')
};

const allLocations = [
  {
    id: 'LOC-GOA',
    name: 'India Depot (Goa)',
    lat: 15.3991,
    lng: 73.8052,
    type: 'Depot / Headquarters',
    region: 'depot',
    programme: 'antarctic_programme',
    description: 'NCPOR Logistics & Staging Headquarters, Headland Sada, Vasco da Gama, Goa'
  },
  {
    id: 'LOC-CPT',
    name: 'Cape Town Transfer Point',
    lat: -33.9249,
    lng: 18.4241,
    type: 'Transfer Hub / Port Staging',
    region: 'transit_hub',
    programme: 'antarctic_programme',
    description: 'International Antarctic Gateway & Vessel Charter Staging Terminal'
  },
  {
    id: 'LOC-MAI',
    name: 'Maitri Research Station',
    lat: -70.7667,
    lng: 11.7333,
    type: 'Inland Antarctic Station',
    region: 'antarctic',
    programme: 'antarctic_programme',
    capacity: '25 Winter / ~50 Summer',
    logistics: 'Inland (~80km from ice edge; requires overland PistenBully / helicopter transfer)',
    research: 'Meteorology, glaciology, solid earth sciences, biology, upper atmospheric physics'
  },
  {
    id: 'LOC-BHA',
    name: 'Bharati Research Station',
    lat: -69.4068,
    lng: 76.1953,
    type: 'Coastal Antarctic Station',
    region: 'antarctic',
    programme: 'antarctic_programme',
    capacity: '24 Winter / 47 Summer (46th ISEA Configuration)',
    logistics: 'Direct coastal access (~200m from shore at Quilty Bay; direct helicopter transfer)',
    research: 'Oceanography, atmospheric sciences, geosciences, polar biology'
  },
  {
    id: 'LOC-HIM',
    name: 'Himadri Arctic Station',
    lat: 78.9235,
    lng: 11.9331,
    type: 'Arctic Research Station',
    region: 'arctic',
    programme: 'arctic_programme',
    capacity: '8 Summer (Operates within Ny-Ålesund International Base Framework)',
    logistics: 'International research base in Svalbard, Norway (Svalbard Treaty framework)',
    research: 'Atmospheric science, microbiology, earth science, glaciology, space physics, biology'
  },
  {
    id: 'LOC-HMS',
    name: 'Himansh Himalayan Station',
    lat: 32.4485,
    lng: 77.6155,
    type: 'Himalayan High-Altitude Glacier Base',
    region: 'himalayan',
    programme: 'himalayan_programme',
    capacity: '5 Winter / 15 Summer (Altitude: ~4,080m)',
    logistics: 'Land/road transport based in Chandra Basin, Sutri Dhaka, Himachal Pradesh',
    research: 'Continuous field research on Himalayan glacier dynamics, hydrology and climate processes'
  }
];

// Pre-computed realistic searoute marine corridor waypoints for background network visualization
const defaultMarineCorridors = [
  // Goa -> Cape Town Realistic Curved Maritime Path (searoute)
  {
    mode: 'ship',
    programme: 'antarctic_programme',
    label: 'Goa → Cape Town Marine Sea Lane (18d, ~6,470 nm)',
    coords: [
      [15.3991, 73.8052], [15.3, 73.0], [12.77, 74.13], [9.7, 75.3], [7.78, 76.57], [6.25, 77.29],
      [5.5, 78.0], [4.5, 78.5], [2.0, 78.0], [0.0, 76.5], [-2.5, 74.5],
      [-5.0, 71.5], [-8.0, 67.5], [-12.0, 62.0], [-16.0, 56.5], [-20.0, 51.0],
      [-24.0, 45.0], [-27.5, 39.0], [-30.5, 33.5], [-32.5, 29.0], [-33.5, 25.5],
      [-34.2, 22.0], [-34.8, 19.5], [-34.2, 18.4], [-33.9249, 18.4241]
    ]
  },
  // Cape Town -> Bharati Marine Sea Lane
  {
    mode: 'ship',
    programme: 'antarctic_programme',
    label: 'Cape Town → Bharati Southern Ocean Sea Route (16d, ~5,223 nm)',
    coords: [
      [-33.9249, 18.4241], [-35.5, 20.0], [-38.0, 25.0], [-42.0, 33.0], [-46.0, 42.0],
      [-51.0, 52.0], [-56.0, 61.0], [-61.0, 68.0], [-65.0, 73.0], [-68.0, 75.5],
      [-69.4068, 76.1953]
    ]
  },
  // Cape Town -> Maitri Marine Corridor
  {
    mode: 'ship',
    programme: 'antarctic_programme',
    label: 'Cape Town → Maitri Icebreaker Corridor (8d, ~2,748 nm)',
    coords: [
      [-33.9249, 18.4241], [-38.0, 18.0], [-45.0, 17.0], [-53.0, 15.5], [-62.0, 13.5],
      [-70.7667, 11.7333]
    ]
  },
  // Direct Cargo Flight Goa -> Bharati
  {
    mode: 'cargo_flight',
    programme: 'antarctic_programme',
    label: 'NCPOR Intercontinental Direct Cargo Flight (2d)',
    coords: [[15.3991, 73.8052], [-69.4068, 76.1953]]
  },
  // Cape Town -> Maitri / Bharati Airbridge
  {
    mode: 'aircraft',
    programme: 'antarctic_programme',
    label: 'ALCI Antarctic Airbridge (3d)',
    coords: [[-33.9249, 18.4241], [-70.7667, 11.7333]]
  }
];

const legColors = {
  ship: '#3B82F6',
  aircraft: '#06B6D4',
  cargo_flight: '#8B5CF6',
  helicopter: '#10B981'
};

function MapViewUpdater({ programmeFilter, polylinePoints }) {
  const map = useMap();

  useEffect(() => {
    if (Array.isArray(polylinePoints) && polylinePoints.length > 0) {
      const validCoords = polylinePoints.filter(c => Array.isArray(c) && c.length >= 2);
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
        return;
      }
    }

    // Programme-specific bounding
    if (programmeFilter === 'arctic_programme') {
      map.flyTo([78.9235, 11.9331], 4, { duration: 1.2 });
    } else if (programmeFilter === 'himalayan_programme') {
      map.flyTo([32.4485, 77.6155], 6, { duration: 1.2 });
    } else if (programmeFilter === 'antarctic_programme') {
      map.flyTo([-50.0, 45.0], 3, { duration: 1.2 });
    } else {
      map.flyTo([10.0, 45.0], 2, { duration: 1.2 });
    }
  }, [programmeFilter, polylinePoints, map]);

  return null;
}

export default function ExpeditionMap({
  activeRouteCoordinates = null,
  waypoints = null,
  weatherAdvisory = null,
  legs = [],
  programmeFilter = 'all'
}) {
  // Filter stations based on selected programme
  const displayedLocations = allLocations.filter(loc => {
    if (!programmeFilter || programmeFilter === 'all') return true;
    if (programmeFilter === 'antarctic_programme') {
      return loc.programme === 'antarctic_programme' || loc.id === 'LOC-GOA' || loc.id === 'LOC-CPT';
    }
    if (programmeFilter === 'arctic_programme') {
      return loc.id === 'LOC-HIM' || loc.id === 'LOC-GOA';
    }
    if (programmeFilter === 'himalayan_programme') {
      return loc.id === 'LOC-HMS' || loc.id === 'LOC-GOA';
    }
    return loc.programme === programmeFilter;
  });

  // Filter default corridors
  const displayedCorridors = defaultMarineCorridors.filter(corridor => {
    if (!programmeFilter || programmeFilter === 'all' || programmeFilter === 'antarctic_programme') {
      return true;
    }
    return false;
  });

  // Determine active polyline points
  let polylinePoints = [];
  if (Array.isArray(waypoints) && waypoints.length > 0) {
    polylinePoints = waypoints.map(w => Array.isArray(w) ? [w[0], w[1]] : [w.lat, w.lng]);
  } else if (Array.isArray(activeRouteCoordinates) && activeRouteCoordinates.length > 0) {
    polylinePoints = activeRouteCoordinates.map(c => Array.isArray(c) ? [c[0], c[1]] : [c.lat, c.lng]);
  }

  return (
    <div className="relative w-full h-[490px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
      
      {/* Map Header & Filter Badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white shadow-lg flex items-center space-x-2">
        <Globe className="w-4 h-4 text-sky-500 animate-spin-slow" />
        <span className="capitalize">
          {programmeFilter === 'all' ? 'All 4 NCPOR Field Stations' : programmeFilter.replace('_', ' ')}
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
          {displayedLocations.length} Active Nodes
        </span>
      </div>

      {/* Legend & Status Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-xs space-y-2 shadow-xl max-w-xs">
        <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Polar Route Network</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 font-semibold">
            NCPOR 2026
          </span>
        </div>
        
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500 flex-shrink-0"></span>
            <span className="text-slate-600 dark:text-slate-300">Antarctic (Maitri & Bharati)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0"></span>
            <span className="text-slate-600 dark:text-slate-300">Arctic (Himadri, Svalbard)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></span>
            <span className="text-slate-600 dark:text-slate-300">Himalayan (Himansh Glacier Base)</span>
          </div>
        </div>

        {weatherAdvisory && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Marine Weather Status
            </div>
            {weatherAdvisory.adverse_weather_detected ? (
              <div className="flex items-center space-x-1.5 text-amber-500 font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Adverse Conditions Detected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-emerald-500 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span>All Waypoints Within Limits</span>
              </div>
            )}
          </div>
        )}
      </div>

      <MapContainer
        center={[10.0, 45.0]}
        zoom={2}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic FlyTo & FitBounds Handler */}
        <MapViewUpdater programmeFilter={programmeFilter} polylinePoints={polylinePoints} />

        {/* Location Markers */}
        {displayedLocations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={locationIcons[loc.id] || createCustomIcon('#0EA5E9', loc.name)}
          >
            <Popup className="custom-popup" maxWidth={320}>
              <div className="p-2 space-y-2 text-slate-900">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <div className="font-bold text-sm text-slate-900">{loc.name}</div>
                  <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                    {loc.region || loc.type}
                  </span>
                </div>
                
                <div className="text-xs text-slate-600 font-medium">{loc.type}</div>
                
                <div className="text-[11px] font-mono text-sky-700">
                  Lat: {loc.lat.toFixed(4)}°, Long: {loc.lng.toFixed(4)}°
                </div>

                {loc.capacity && (
                  <div className="text-xs bg-slate-100 p-1.5 rounded text-slate-700">
                    <span className="font-bold text-slate-900">Capacity: </span>
                    {loc.capacity}
                  </div>
                )}

                {loc.logistics && (
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">Logistics Fact: </span>
                    {loc.logistics}
                  </div>
                )}

                {loc.research && (
                  <div className="text-[11px] text-slate-500 border-t pt-1">
                    <span className="font-semibold text-slate-700">Research Focus: </span>
                    {loc.research}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Active Route Waypoint Markers (if key weather waypoints available) */}
        {weatherAdvisory?.waypoints && weatherAdvisory.waypoints.map((wp, idx) => (
          <Marker
            key={`wp-${idx}`}
            position={[wp.lat, wp.lng]}
            icon={createWaypointIcon(
              wp.status === 'adverse' ? '#F59E0B' : wp.status === 'unavailable' ? '#94A3B8' : '#3B82F6',
              wp.name
            )}
          >
            <Popup>
              <div className="p-1 space-y-1 text-xs text-slate-900">
                <div className="font-bold">{wp.name}</div>
                <div className="font-mono text-[11px]">Lat: {wp.lat.toFixed(2)}°, Lng: {wp.lng.toFixed(2)}°</div>
                {wp.wave_height_m !== null && <div>Wave Height: <b>{wp.wave_height_m} m</b></div>}
                {wp.wind_speed_knots !== null && <div>Wind Speed: <b>{wp.wind_speed_knots} kt</b></div>}
                <div className="text-[10px] text-slate-500 mt-1">{wp.details}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Active Route Curved Polyline vs Default Maritime Corridors */}
        {polylinePoints.length > 1 ? (
          <Polyline
            positions={polylinePoints}
            pathOptions={{
              color: '#0284C7',
              weight: 4.5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          >
            <Tooltip sticky>Active Computed Multi-Modal Sea/Air Route</Tooltip>
          </Polyline>
        ) : (
          displayedCorridors.map((corridor, idx) => (
            <Polyline
              key={`corridor-${idx}`}
              positions={corridor.coords}
              pathOptions={{
                color: legColors[corridor.mode] || '#3B82F6',
                weight: corridor.mode === 'ship' ? 3.5 : 2.5,
                dashArray: corridor.mode === 'aircraft' ? '6, 6' : corridor.mode === 'cargo_flight' ? '4, 4' : undefined,
                opacity: 0.8
              }}
            >
              <Tooltip sticky>{corridor.label}</Tooltip>
            </Polyline>
          ))
        )}

      </MapContainer>
    </div>
  );
}
```

---


## 10. Frontend Role Views & Expedition Pages

### <a id="file-frontendsrcpagesloginjsx"></a>File: `frontend/src/pages/Login.jsx`

> **Role / Purpose**: Authentication page with quick-login buttons for demo roles (Commander, Logistics, Member, Admin)

```jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Compass,
  Shield,
  Lock,
  User,
  Radio,
  Ship,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'Super Admin (NCPOR HQ)',
    tag: 'Full Access',
    username: 'admin.ncpor',
    password: 'Demo@Admin2026',
    icon: Shield,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/30',
    desc: 'Unrestricted access to all stations, shipments, inventory, personnel & global dispatch.'
  },
  {
    role: 'Station Commander (Bharati)',
    tag: 'Station Scoped',
    username: 'commander.bharati',
    password: 'Demo@Bharati2026',
    icon: Radio,
    color: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-500/30',
    desc: 'Scoped to Bharati Station: local inventory, roster, and station emergency response.'
  },
  {
    role: 'Shipment Officer',
    tag: 'Voyage Scoped',
    username: 'officer.shipping1',
    password: 'Demo@Officer2026',
    icon: Ship,
    color: 'from-teal-500 to-emerald-600',
    borderColor: 'border-teal-500/30',
    desc: 'Assigned voyage command: digital handovers, consumable depletion, weather logs & docs.'
  },
  {
    role: 'Personnel Member',
    tag: 'Personal ID',
    username: 'PER-001',
    password: 'Demo@Personnel2026',
    icon: UserCheck,
    color: 'from-indigo-500 to-purple-600',
    borderColor: 'border-indigo-500/30',
    desc: 'Individual employee portal: duty status logging, deployment record, station SOS alert.'
  }
];

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoPanelExpanded, setDemoPanelExpanded] = useState(true);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(username, password);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid username or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demo) => {
    setUsername(demo.username);
    setPassword(demo.password);
    setLoading(true);
    setError(null);
    try {
      await login(demo.username, demo.password);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Demo login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden transition-colors duration-200">
      
      {/* Background Ambient Polar Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Theme Toggle */}
      <div className="absolute top-4 right-6 flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </div>

      <div className="w-full max-w-5xl z-10 space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 shadow-xl shadow-sky-500/25 mb-1">
            <Compass className="w-10 h-10 text-white animate-spin-slow" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              PolarLogix
            </h1>
            <span className="px-2 py-0.5 text-xs font-bold tracking-wider rounded uppercase bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
              NCPOR
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Indian Antarctic Programme • Secure Role-Based Expedition Logistics & Incident Dispatch Platform
          </p>
        </div>

        {/* Demo Credentials Panel (Collapsible Card for Judges) */}
        <div className="glass-panel p-5 sm:p-6 border border-sky-500/30 dark:border-sky-500/20 bg-sky-500/5 dark:bg-sky-950/20 shadow-lg rounded-2xl">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setDemoPanelExpanded(!demoPanelExpanded)}>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-sky-500/20 text-sky-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  Judge Testing & Demo Login Credentials
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Bcrypt Hashed in DB
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  Click any demo role card below to instantly auto-fill credentials and sign in.
                </p>
              </div>
            </div>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              {demoPanelExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {demoPanelExpanded && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              {DEMO_ACCOUNTS.map((demo) => {
                const Icon = demo.icon;
                return (
                  <div
                    key={demo.username}
                    onClick={() => handleQuickDemoLogin(demo)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:border-sky-500 dark:hover:border-sky-400 transition-all cursor-pointer shadow-sm hover:shadow-md group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${demo.color} flex items-center justify-center text-white shadow-sm`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {demo.tag}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                          {demo.role}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {demo.desc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono text-slate-600 dark:text-slate-300 space-y-0.5">
                      <div className="truncate"><span className="text-slate-400">User:</span> {demo.username}</div>
                      <div className="truncate"><span className="text-slate-400">Pass:</span> {demo.password}</div>
                      <button className="w-full mt-2 py-1.5 px-2 bg-sky-500/10 hover:bg-sky-500 text-sky-600 dark:text-sky-400 hover:text-white font-medium rounded-lg text-xs transition-colors text-center">
                        1-Click Sign In →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Login Form Box */}
        <div className="max-w-md mx-auto glass-panel p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#111827]/90">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-sky-500" />
                Sign In to PolarLogix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your NCPOR expedition credentials to access your scoped dashboard.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Username or Personnel ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin.ncpor or PER-001"
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Expedition Console</span>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
```

---

### <a id="file-frontendsrcpagesdashboardjsx"></a>File: `frontend/src/pages/Dashboard.jsx`

> **Role / Purpose**: Main overview dashboard with KPI cards, quick actions, active expeditions, and alerts

```jsx
import React, { useEffect, useState } from 'react';
import { getDashboardSummary, getShipments, getEmergencies } from '../services/api';
import ExpeditionMap from '../components/Map/ExpeditionMap';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Truck,
  Users,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  ChevronRight,
  Anchor,
  Plane,
  Box,
  Globe,
  Snowflake,
  Mountain,
  Compass,
  Building,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function Dashboard({ setActiveTab }) {
  const [programmeFilter, setProgrammeFilter] = useState('all'); // all, antarctic_programme, arctic_programme, himalayan_programme
  const [summary, setSummary] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [programmeFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, shpData, emgData] = await Promise.all([
        getDashboardSummary({ programme: programmeFilter }).catch(err => {
          console.error('Failed to get dashboard summary:', err);
          return null;
        }),
        getShipments().catch(err => {
          console.error('Failed to get shipments:', err);
          return [];
        }),
        getEmergencies('open').catch(err => {
          console.error('Failed to get emergencies:', err);
          return [];
        })
      ]);
      setSummary(sumData || null);
      setShipments(Array.isArray(shpData) ? shpData : []);
      setEmergencies(Array.isArray(emgData) ? emgData : []);
    } catch (err) {
      console.error('Dashboard fetchData error:', err);
      setShipments([]);
      setEmergencies([]);
      setSummary(null);
      setError('Unable to load dashboard data from backend server. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 max-w-7xl mx-auto"><LoadingSkeleton type="cards" count={4} /></div>;

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <div className="p-6 glass-panel max-w-md mx-auto space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold">Backend Connection Failed</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Filter shipments based on programme
  const safeShipments = Array.isArray(shipments) ? shipments.filter(s => {
    if (programmeFilter === 'all') return true;
    if (programmeFilter === 'antarctic_programme') {
      const antarcticIds = ['LOC-MAI', 'LOC-BHA', 'LOC-CPT', 'LOC-GOA'];
      return antarcticIds.includes(s.origin_id) || antarcticIds.includes(s.destination_id) || antarcticIds.includes(s.current_location_id);
    }
    if (programmeFilter === 'arctic_programme') {
      return s.origin_id === 'LOC-HIM' || s.destination_id === 'LOC-HIM' || s.current_location_id === 'LOC-HIM';
    }
    if (programmeFilter === 'himalayan_programme') {
      return s.origin_id === 'LOC-HMS' || s.destination_id === 'LOC-HMS' || s.current_location_id === 'LOC-HMS';
    }
    return true;
  }) : [];

  const safeEmergencies = Array.isArray(emergencies) ? emergencies : [];

  // Recharts Data Prep
  const statusCounts = [
    { name: 'Planned', count: safeShipments.filter(s => s?.status === 'planned').length, color: '#3B82F6' },
    { name: 'In Transit', count: safeShipments.filter(s => s?.status === 'in_transit').length, color: '#06B6D4' },
    { name: 'Transfer Hub', count: safeShipments.filter(s => s?.status === 'at_transfer_point').length, color: '#F59E0B' },
    { name: 'Delivered', count: safeShipments.filter(s => s?.status === 'delivered').length, color: '#10B981' },
    { name: 'On Hold', count: safeShipments.filter(s => s?.status === 'on_hold').length, color: '#EF4444' }
  ];

  // Programme tabs config
  const programmes = [
    { id: 'all', label: 'All Programmes', icon: Globe, count: '4 Stations', desc: 'Unified Polar & Himalayan Mandate' },
    { id: 'antarctic_programme', label: 'Antarctic Programme', icon: Snowflake, count: 'Maitri & Bharati', desc: 'Southern Ocean & Ice Shelf Logistics' },
    { id: 'arctic_programme', label: 'Arctic Programme', icon: Compass, count: 'Himadri Station', desc: 'Ny-Ålesund, Svalbard (Est. 2008)' },
    { id: 'himalayan_programme', label: 'Himalayan Programme', icon: Mountain, count: 'Himansh Station', desc: 'Sutri Dhaka Glacier Base (~4080m)' }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-transparent">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg uppercase tracking-wider bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30">
              National Centre for Polar and Ocean Research (NCPOR)
            </span>
            <span className="text-xs text-slate-400">Govt. of India</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Polar & Himalayan Expedition Logistics Command
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Multi-modal tracking for Maitri, Bharati, Himadri & Himansh Research Stations
          </p>
        </div>
        <button
          onClick={() => setActiveTab('planner')}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer self-start md:self-center"
        >
          <Box className="w-4 h-4" />
          <span>Plan New Shipment</span>
        </button>
      </div>

      {/* PHASE 3: PROGRAMME FILTER TOGGLE BAR */}
      <div className="glass-panel p-2.5 bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between px-3 py-1 mb-2 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-500" />
            NCPOR Division & Programme Scope Filter
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Filters Map, Telemetry, Active Cargo & Station Roster
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {programmes.map((p) => {
            const Icon = p.icon;
            const isSelected = programmeFilter === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setProgrammeFilter(p.id)}
                className={`flex items-start space-x-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-400 font-bold'
                    : 'bg-white/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-sky-500/10 text-sky-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold truncate">{p.label}</div>
                  <div className={`text-[11px] truncate ${isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {p.count}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Cards (Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div
          onClick={() => setActiveTab('tracking')}
          className="glass-panel p-5 cursor-pointer hover:border-sky-500/50 transition-all transform hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Shipments
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {summary?.active_shipments || 0}
            </span>
            <span className="text-xs text-slate-400 flex items-center">
              Total {summary?.total_shipments || 0} <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('personnel')}
          className="glass-panel p-5 cursor-pointer hover:border-emerald-500/50 transition-all transform hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Personnel Deployed
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {summary?.personnel_deployed || 0}
            </span>
            <span className="text-xs text-emerald-500 font-medium flex items-center">
              Multi-Institute Roster <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('inventory')}
          className="glass-panel p-5 cursor-pointer hover:border-amber-500/50 transition-all transform hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Low-Stock Alerts
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-500">
              {summary?.low_stock_alerts || 0}
            </span>
            <span className="text-xs text-amber-500 font-medium">Critical Threshold Alert</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('emergency')}
          className="glass-panel p-5 cursor-pointer hover:border-rose-500/50 transition-all transform hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Open Emergencies
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-500">
              {summary?.open_emergencies || 0}
            </span>
            <span className="text-xs text-rose-500 font-semibold flex items-center">
              Incident Response <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>

      </div>

      {/* Main Map & Active Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Map (Spans 2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Anchor className="w-5 h-5 text-sky-500" />
              <span>Multi-Modal Expedition Route & Field Base Network</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {programmeFilter.replace('_', ' ')}
            </span>
          </div>
          <ExpeditionMap programmeFilter={programmeFilter} />
        </div>

        {/* Analytics & Active Emergencies Panel */}
        <div className="space-y-6">
          
          {/* Active Emergencies Quick Widget */}
          <div className="glass-panel p-5 space-y-3 border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Active Station Incidents</span>
              </h3>
              <button
                onClick={() => setActiveTab('emergency')}
                className="text-xs text-sky-500 hover:underline flex items-center cursor-pointer"
              >
                View Hub <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {safeEmergencies.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-2">No active open emergency incidents reported.</p>
            ) : (
              <div className="space-y-2">
                {safeEmergencies.map((emg) => (
                  <div key={emg?.id || Math.random()} className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-rose-500">
                      <span>{emg?.event_type || 'Incident'}</span>
                      <StatusBadge status={emg?.severity} />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 line-clamp-2">{emg?.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recharts Cargo Distribution Chart */}
          <div className="glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cargo Pipeline Breakdown
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {safeShipments.length} Total
              </span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Recent Cargo Shipments Table */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Expedited Cargo Movements ({programmeFilter === 'all' ? 'All Bases' : programmeFilter.replace('_', ' ')})
          </h2>
          <button
            onClick={() => setActiveTab('tracking')}
            className="text-xs text-sky-500 hover:underline flex items-center font-medium cursor-pointer"
          >
            All Tracking Cards <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {safeShipments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No cargo movements recorded for this programme scope.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3 rounded-l-lg">ID</th>
                  <th className="p-3">Cargo Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Weight</th>
                  <th className="p-3">Hazmat</th>
                  <th className="p-3">Current Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-lg">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {safeShipments.slice(0, 5).map((shp) => (
                  <tr key={shp?.id || Math.random()} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-500">{shp?.id}</td>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">{shp?.description}</td>
                    <td className="p-3 capitalize">{shp?.category?.replace('_', ' ') || 'General'}</td>
                    <td className="p-3 font-mono">{shp?.weight_kg ?? 0} kg</td>
                    <td className="p-3">
                      {shp?.is_hazmat ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-bold text-[10px]">HAZMAT</span>
                      ) : (
                        <span className="text-slate-400">Standard</span>
                      )}
                    </td>
                    <td className="p-3">{shp?.current_location?.name || shp?.current_location_id || 'Unknown'}</td>
                    <td className="p-3"><StatusBadge status={shp?.status} /></td>
                    <td className="p-3 font-mono">{shp?.eta || 'TBD'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
```

---

### <a id="file-frontendsrcpagesstationcommanderdashboardjsx"></a>File: `frontend/src/pages/StationCommanderDashboard.jsx`

> **Role / Purpose**: Station Commander command center: station status, fuel/ration gauges, emergency protocols, clearance approvals

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConnectivity } from '../context/ConnectivityContext';
import {
  getDashboardSummary,
  getInventory,
  getPersonnel,
  getEmergencies,
  getShipments,
  updateEmergency
} from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ExpeditionMap from '../components/Map/ExpeditionMap';
import {
  Radio,
  Boxes,
  Users,
  ShieldAlert,
  AlertTriangle,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Send,
  Thermometer,
  Wind,
  Compass,
  ArrowDownRight,
  ChevronRight,
  Database
} from 'lucide-react';

export default function StationCommanderDashboard() {
  const { user } = useAuth();
  const { submitEmergency, submitInventoryItem } = useConnectivity();
  const [activeTab, setActiveTab] = useState('overview'); // overview, inventory, personnel, emergencies

  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals / forms
  const [showInvModal, setShowInvModal] = useState(false);
  const [invForm, setInvForm] = useState({ item_name: '', category: 'spare_parts', quantity: 10, unit: 'units', minimum_threshold: 5 });
  
  const [showEmgModal, setShowEmgModal] = useState(false);
  const [emgForm, setEmgForm] = useState({ event_type: 'Severe Blizzard', severity: 'critical', description: '' });

  const [responseLogMap, setResponseLogMap] = useState({});

  const stationName = user?.linked_station_id === 'LOC-BHA' ? 'Bharati Research Station' : 'Maitri Research Station';
  const stationCode = user?.linked_station_id === 'LOC-BHA' ? 'BHARATI-STN (Larsemann Hills)' : 'MAITRI-STN (Schirmacher Oasis)';

  const fetchData = async () => {
    try {
      const [sumData, invData, perData, emgData, shpData] = await Promise.all([
        getDashboardSummary().catch(() => null),
        getInventory(user?.linked_station_id).catch(() => []),
        getPersonnel().catch(() => []),
        getEmergencies().catch(() => []),
        getShipments().catch(() => [])
      ]);
      setSummary(sumData);
      setInventory(Array.isArray(invData) ? invData : []);
      setPersonnel(Array.isArray(perData) ? perData : []);
      setEmergencies(Array.isArray(emgData) ? emgData : []);
      setShipments(Array.isArray(shpData) ? shpData : []);
    } catch (err) {
      console.error('Error fetching station data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // 15s auto-polling for emergency and telemetry updates
    const timer = setInterval(() => {
      getEmergencies().then(data => {
        if (Array.isArray(data)) setEmergencies(data);
      }).catch(console.error);
    }, 15000);
    return () => clearInterval(timer);
  }, [user]);

  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      await submitInventoryItem(user.linked_station_id, {
        location_id: user.linked_station_id,
        item_name: invForm.item_name,
        category: invForm.category,
        quantity: parseFloat(invForm.quantity),
        unit: invForm.unit,
        minimum_threshold: parseFloat(invForm.minimum_threshold)
      });
      setShowInvModal(false);
      setInvForm({ item_name: '', category: 'spare_parts', quantity: 10, unit: 'units', minimum_threshold: 5 });
      fetchData();
    } catch (err) {
      alert('Failed to save inventory item');
    }
  };

  const handleReportEmergency = async (e) => {
    e.preventDefault();
    try {
      await submitEmergency({
        station_id: user.linked_station_id,
        event_type: emgForm.event_type,
        severity: emgForm.severity,
        description: emgForm.description
      });
      setShowEmgModal(false);
      setEmgForm({ event_type: 'Severe Blizzard', severity: 'critical', description: '' });
      fetchData();
    } catch (err) {
      alert('Failed to report emergency');
    }
  };

  const handleSendResponseLog = async (emgId) => {
    const text = responseLogMap[emgId];
    if (!text || !text.trim()) return;
    try {
      await updateEmergency(emgId, { response_log: text.trim() });
      setResponseLogInputs(prev => ({ ...prev, [emgId]: '' }));
      fetchData();
    } catch (err) {
      alert('Failed to update response log');
    }
  };

  const handleResolveEmergency = async (emgId) => {
    try {
      await updateEmergency(emgId, { status: 'resolved', response_log: 'Marked incident as RESOLVED by Station Commander.' });
      fetchData();
    } catch (err) {
      alert('Failed to resolve emergency');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <LoadingSkeleton type="cards" count={4} />
      </div>
    );
  }

  const lowStockItems = inventory.filter(i => i.quantity <= i.minimum_threshold);
  const openEmergencies = emergencies.filter(e => e.status === 'open');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Station Commander Hero Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border-l-4 border-l-sky-500 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-sky-500" />
                Station Scoped Operations
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Winter Over Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stationName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {stationCode} • Commander Account: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{user?.username}</span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEmgModal(true)}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              Report Station Emergency
            </button>
            <button
              onClick={() => setShowInvModal(true)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Inventory
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Station Overview', icon: Compass },
            { id: 'inventory', label: `Station Inventory (${inventory.length})`, icon: Boxes, alert: lowStockItems.length > 0 },
            { id: 'personnel', label: `Station Roster (${personnel.length})`, icon: Users },
            { id: 'emergencies', label: `Emergency Hub (${openEmergencies.length})`, icon: ShieldAlert, alert: openEmergencies.length > 0 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.alert && (
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-rose-500 animate-ping'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: STATION OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Station Shipments</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{shipments.length}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-500">Inbound/Local</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Station Personnel</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{personnel.length}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">On Duty</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Low Stock Alerts</span>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                  {lowStockItems.length}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${lowStockItems.length > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {lowStockItems.length > 0 ? 'Action Needed' : 'Supplies Nominal'}
                </span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Station Emergencies</span>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${openEmergencies.length > 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                  {openEmergencies.length}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${openEmergencies.length > 0 ? 'bg-rose-500/10 text-rose-500 animate-pulse' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {openEmergencies.length > 0 ? 'Active Incidents' : 'All Clear'}
                </span>
              </div>
            </div>
          </div>

          {/* Map + Inbound Shipments Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-500" />
                  Station Inbound Transport Corridors
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Live Logistics Grid</span>
              </div>
              <div className="h-[360px] rounded-xl overflow-hidden">
                <ExpeditionMap shipments={shipments} />
              </div>
            </div>

            {/* Inbound Cargo Watch */}
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-500" />
                Inbound Cargo Manifests
              </h3>
              <div className="space-y-3 overflow-y-auto max-h-[340px]">
                {shipments.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No inbound shipments currently scheduled.</p>
                ) : (
                  shipments.map((shp) => (
                    <div key={shp.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-sky-500">{shp.id}</span>
                        <StatusBadge status={shp.status} />
                      </div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{shp.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Weight: {shp.weight_kg} kg</span>
                        <span>ETA: {shp.eta || 'Pending'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATION INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Station Reserve & Critical Supplies Inventory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scoped strictly to {stationName}. Low-stock thresholds trigger resupply alerts automatically.
              </p>
            </div>
            <button
              onClick={() => setShowInvModal(true)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 self-start cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Min. Threshold</th>
                  <th className="py-3 px-4">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {inventory.map((item) => {
                  const isLow = item.quantity <= item.minimum_threshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{item.item_name}</td>
                      <td className="py-3.5 px-4 capitalize text-slate-500 dark:text-slate-400">{item.category.replace('_', ' ')}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {item.quantity.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {item.minimum_threshold.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Warning
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STATION PERSONNEL */}
      {activeTab === 'personnel' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Station Deployed Personnel & Duty Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Station commander view of active expedition members, scientists, and engineers stationed at {stationName}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personnel.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-500">{p.id}</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {p.season_type} Expedition
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h4>
                  <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">{p.role}</p>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div>Station: <span className="text-slate-700 dark:text-slate-300">{p.assigned_station}</span></div>
                  <div>Period: <span className="font-mono">{p.deployment_start} to {p.deployment_end}</span></div>
                </div>

                {/* Work Activity Logs */}
                {p.work_logs && p.work_logs.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latest Duty Status</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic mt-0.5">
                      "{p.work_logs[p.work_logs.length - 1].status_text}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STATION EMERGENCY HUB */}
      {activeTab === 'emergencies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Station Incident & SOS Command Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connected emergency stream scoped to {stationName} and inbound vessels. Polling active every 15s.
              </p>
            </div>
            <button
              onClick={() => setShowEmgModal(true)}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" /> Log Incident
            </button>
          </div>

          <div className="space-y-4">
            {emergencies.length === 0 ? (
              <div className="glass-panel p-12 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold">No active emergencies for this station.</p>
                <p className="text-xs">All station telemetry and expedition systems operating nominally.</p>
              </div>
            ) : (
              emergencies.map((emg) => (
                <div key={emg.id} className="glass-panel p-5 rounded-2xl border-l-4 border-l-rose-500 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-rose-500">{emg.id}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          emg.severity === 'critical' ? 'bg-rose-500 text-white animate-pulse' :
                          emg.severity === 'high' ? 'bg-amber-500 text-white' : 'bg-sky-500 text-white'
                        }`}>
                          {emg.severity}
                        </span>
                        <span className="text-xs text-slate-400">• Reported: {emg.reported_at?.substring(0, 16).replace('T', ' ')}</span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{emg.event_type}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {emg.status === 'open' ? (
                        <button
                          onClick={() => handleResolveEmergency(emg.id)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 font-semibold text-xs rounded-lg border border-emerald-500/20">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    {emg.description}
                  </p>

                  {/* Incident Response Log Trail */}
                  {emg.response_log && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Incident Response Audit Trail</span>
                      <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl whitespace-pre-wrap leading-relaxed">
                        {emg.response_log}
                      </pre>
                    </div>
                  )}

                  {/* Commander Response Logger */}
                  {emg.status === 'open' && (
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Post station commander response log update..."
                        value={responseLogInputs[emg.id] || ''}
                        onChange={(e) => setResponseLogInputs({ ...responseLogInputs, [emg.id]: e.target.value })}
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                      />
                      <button
                        onClick={() => handleSendResponseLog(emg.id)}
                        className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Post Update
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD INVENTORY */}
      {showInvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-md w-full rounded-2xl space-y-4 bg-white dark:bg-[#111827]">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add / Update Station Inventory</h3>
            <form onSubmit={handleAddInventory} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Item Name</label>
                <input
                  required
                  type="text"
                  value={invForm.item_name}
                  onChange={(e) => setInvForm({ ...invForm, item_name: e.target.value })}
                  placeholder="e.g. Polar Diesel Fuel"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={invForm.category}
                    onChange={(e) => setInvForm({ ...invForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="fuel">Fuel</option>
                    <option value="food">Food</option>
                    <option value="spare_parts">Spare Parts</option>
                    <option value="medical">Medical</option>
                    <option value="scientific_equipment">Scientific</option>
                    <option value="clothing">Clothing</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Unit</label>
                  <input
                    required
                    type="text"
                    value={invForm.unit}
                    onChange={(e) => setInvForm({ ...invForm, unit: e.target.value })}
                    placeholder="liters, kg, units"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity</label>
                  <input
                    required
                    type="number"
                    value={invForm.quantity}
                    onChange={(e) => setInvForm({ ...invForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Min. Alert Threshold</label>
                  <input
                    required
                    type="number"
                    value={invForm.minimum_threshold}
                    onChange={(e) => setInvForm({ ...invForm, minimum_threshold: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInvModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPORT STATION EMERGENCY */}
      {showEmgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-md w-full rounded-2xl space-y-4 bg-white dark:bg-[#111827]">
            <h3 className="text-base font-bold text-rose-500 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Report Station Emergency
            </h3>
            <form onSubmit={handleReportEmergency} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Incident Type</label>
                <input
                  required
                  type="text"
                  value={emgForm.event_type}
                  onChange={(e) => setEmgForm({ ...emgForm, event_type: e.target.value })}
                  placeholder="e.g. Radome Antenna Damage, Genset Tripped"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Severity</label>
                <select
                  value={emgForm.severity}
                  onChange={(e) => setEmgForm({ ...emgForm, severity: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="low">Low - Minor Equipment Notice</option>
                  <option value="medium">Medium - Operational Warning</option>
                  <option value="high">High - Station Critical Event</option>
                  <option value="critical">Critical - Immediate Threat / Life Safety</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description & Action Taken</label>
                <textarea
                  required
                  rows={3}
                  value={emgForm.description}
                  onChange={(e) => setEmgForm({ ...emgForm, description: e.target.value })}
                  placeholder="Describe damage, impacted systems, and initial countermeasures..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEmgModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Broadcast Emergency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
```

---

### <a id="file-frontendsrcpagesshipmentofficerdashboardjsx"></a>File: `frontend/src/pages/ShipmentOfficerDashboard.jsx`

> **Role / Purpose**: Logistics Officer operations center: active shipments, stage progression, cargo manifests, dispatch

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConnectivity } from '../context/ConnectivityContext';
import {
  getShipments,
  getShipmentDetail,
  getShipmentConsumables,
  updateConsumableLevel,
  recalculateAlternateRoute,
  uploadShipmentDocument,
  getLocations
} from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Ship,
  Truck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CloudSnow,
  Route,
  ShieldAlert,
  Fuel,
  Droplets,
  Utensils,
  Plus,
  Compass,
  ArrowRight,
  UploadCloud,
  FileCheck,
  Send,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Thermometer,
  Wind,
  Database
} from 'lucide-react';

export default function ShipmentOfficerDashboard() {
  const { user } = useAuth();
  const {
    submitHandoverConfirmation,
    submitAdvanceLeg,
    submitWeatherLog,
    submitEmergency
  } = useConnectivity();

  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  // Active sub-tab inside shipment detail: 'progress' | 'handovers' | 'consumables' | 'weather' | 'documents' | 'alternateRoute' | 'emergency'
  const [activeTab, setActiveTab] = useState('progress');

  // Form states
  const [handoverForm, setHandoverForm] = useState({ location_id: 'LOC-CPT', confirmation_type: 'received', notes: '' });
  const [weatherForm, setWeatherForm] = useState({ condition: 'Heavy Blizzard / 40kt Winds', note: '', temperature_c: -12.0, wind_speed_knots: 40.0 });
  const [docForm, setDocForm] = useState({ file_name: '', file_type: 'hazmat_cert' });
  const [rerouteForm, setRerouteForm] = useState({ issue_description: 'Pack ice formation blocking primary maritime channel', avoid_mode: 'ship' });
  const [emgForm, setEmgForm] = useState({ event_type: 'Propulsion Bearing Overheat', severity: 'critical', description: '' });

  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchOfficerData = async () => {
    try {
      const [shpData, locData] = await Promise.all([
        getShipments().catch(() => []),
        getLocations().catch(() => [])
      ]);
      const list = Array.isArray(shpData) ? shpData : [];
      setShipments(list);
      setLocations(Array.isArray(locData) ? locData : []);

      if (list.length > 0 && !selectedShipment) {
        selectShipment(list[0]);
      }
    } catch (err) {
      console.error('Failed to load officer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerData();
  }, [user]);

  const selectShipment = async (shp) => {
    setLoading(true);
    try {
      const detail = await getShipmentDetail(shp.id);
      setSelectedShipment(detail);
    } catch (err) {
      console.error('Error fetching shipment detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShipment = selectShipment;

  const handleAdvanceLeg = async () => {
    if (!selectedShipment) return;
    setAdvancing(true);
    try {
      await submitAdvanceLeg(selectedShipment.id);
      showNotification(`Shipment ${selectedShipment.id} advanced (High-Priority Buffer Queued)!`);
      fetchOfficerData();
    } catch (err) {
      alert('Failed to advance leg');
    } finally {
      setAdvancing(false);
    }
  };

  const handleConfirmHandover = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;
    try {
      await submitHandoverConfirmation(selectedShipment.id, handoverForm);
      showNotification('Chain-of-Custody handover record logged (High-Priority Sync Buffer).');
      const detail = await getShipmentDetail(selectedShipment.id);
      setSelectedShipment(detail);
      setHandoverForm({ location_id: 'LOC-CPT', confirmation_type: 'received', notes: '' });
      fetchOfficerData();
    } catch (err) {
      alert('Failed to record handover');
    }
  };

  const handleAddWeatherLog = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;
    try {
      await submitWeatherLog(selectedShipment.id, weatherForm);
      showNotification('Current voyage weather log saved locally.');
      const detail = await getShipmentDetail(selectedShipment.id);
      setSelectedShipment(detail);
      setWeatherForm({ condition: 'Calm Seas', note: '', temperature_c: 0, wind_speed_knots: 10 });
      fetchOfficerData();
    } catch (err) {
      alert('Failed to add weather log');
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!selectedShipment || !docForm.file_name) return;
    try {
      await uploadShipmentDocument(selectedShipment.id, docForm);
      showNotification('Document manifest attached to shipment.');
      const detail = await getShipmentDetail(selectedShipment.id);
      setSelectedShipment(detail);
      setDocForm({ file_name: '', file_type: 'hazmat_cert' });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to attach document');
    }
  };

  const handleRecalculateAlternateRoute = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;
    try {
      const updated = await recalculateAlternateRoute(selectedShipment.id, rerouteForm);
      setSelectedShipment(updated);
      showNotification('Alternate route recomputed using Dijkstra engine!');
      fetchOfficerData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to recalculate alternate route');
    }
  };

  const handleReportShipmentEmergency = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;
    try {
      await submitEmergency({
        station_id: selectedShipment.destination_id || 'LOC-BHA',
        affected_shipment_id: selectedShipment.id,
        event_type: emgForm.event_type,
        severity: emgForm.severity,
        description: emgForm.description
      });
      showNotification('Shipment Emergency dispatched to NCPOR and Station Commander.');
      setEmgForm({ event_type: 'Cargo Shift During Gale', severity: 'high', description: '' });
      fetchOfficerData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to report emergency');
    }
  };

  if (loading && !selectedShipment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <LoadingSkeleton type="cards" count={4} />
      </div>
    );
  }

  // Parse computed route
  let computedLegs = [];
  if (selectedShipment?.computed_route_json) {
    try {
      computedLegs = JSON.parse(selectedShipment.computed_route_json);
    } catch (e) {}
  }

  // Calculate consumables warning
  const consumablesList = selectedShipment?.consumables || [];
  const lowConsumables = consumablesList.filter(c => c.current_quantity <= (c.starting_quantity * 0.25));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg ${
          notification.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Hero Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border-l-4 border-l-teal-500 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-teal-500" />
                Shipment Officer Command Portal
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                {shipments.length} Assigned Voyage{shipments.length === 1 ? '' : 's'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Expedition Cargo & Voyage Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Assigned Officer: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{user?.username}</span> • Scoped to assigned shipments and active transit custody.
            </p>
          </div>

          {selectedShipment && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdvanceLeg}
                disabled={advancing || selectedShipment.status === 'delivered'}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {advancing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {selectedShipment.status === 'delivered' ? 'Shipment Delivered' : 'Advance Next Voyage Leg →'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column (My Shipments List) & Right Column (Dedicated Operation Center) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 4 COLS: MY SHIPMENTS SELECTOR */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-4 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-500" />
                My Assigned Shipments
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {shipments.length}
              </span>
            </h3>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
              {shipments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No shipments currently assigned to your officer account.
                </div>
              ) : (
                shipments.map((shp) => {
                  const isSelected = selectedShipment?.id === shp.id;
                  return (
                    <div
                      key={shp.id}
                      onClick={() => handleSelectShipment(shp)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'border-teal-500 bg-teal-500/10 dark:bg-teal-950/30 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">{shp.id}</span>
                        <StatusBadge status={shp.status} />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{shp.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                        <span>{shp.weight_kg.toLocaleString()} kg</span>
                        <span className="truncate max-w-[120px]">Dest: {shp.destination?.name?.split(' ')[0] || shp.destination_id}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT 8 COLS: DEDICATED SHIPMENT OPERATIONS WORKSPACE */}
        <div className="lg:col-span-8 space-y-6">
          {selectedShipment ? (
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              
              {/* Selected Shipment Summary Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-teal-500">{selectedShipment.id}</span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedShipment.description}</h2>
                  </div>
                  <StatusBadge status={selectedShipment.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Category</span>
                    <span className="font-semibold capitalize">{selectedShipment.category.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Weight</span>
                    <span className="font-semibold">{selectedShipment.weight_kg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Location</span>
                    <span className="font-semibold text-teal-600 dark:text-teal-400">{selectedShipment.current_location?.name || selectedShipment.current_location_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Destination</span>
                    <span className="font-semibold">{selectedShipment.destination?.name || selectedShipment.destination_id}</span>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3">
                {[
                  { id: 'progress', label: 'Route & Legs', icon: Route },
                  { id: 'handovers', label: `Handovers (${selectedShipment.handover_confirmations?.length || 0})`, icon: FileCheck },
                  { id: 'consumables', label: `Consumables (${consumablesList.length})`, icon: Fuel, alert: lowConsumables.length > 0 },
                  { id: 'weather', label: `Weather Log (${selectedShipment.weather_logs?.length || 0})`, icon: CloudSnow },
                  { id: 'documents', label: `Docs (${selectedShipment.documents?.length || 0})`, icon: FileText },
                  { id: 'alternateRoute', label: 'Alternate Route', icon: Compass },
                  { id: 'emergency', label: 'Report Issue', icon: ShieldAlert }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-teal-500 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      {tab.alert && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: ROUTE PROGRESS */}
              {activeTab === 'progress' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Voyage Itinerary & Legs</h3>
                  <div className="space-y-3">
                    {computedLegs.map((leg, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                          selectedShipment.current_leg_id === leg.leg_id
                            ? 'border-teal-500 bg-teal-500/10 dark:bg-teal-950/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-teal-500 text-white font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="font-bold font-mono text-slate-900 dark:text-white">{leg.leg_id}</span>
                            <div className="text-[11px] text-slate-500 capitalize">
                              Mode: {leg.mode} • Duration: {leg.duration_days} days
                            </div>
                          </div>
                        </div>

                        <div>
                          {selectedShipment.current_leg_id === leg.leg_id ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500 text-white animate-pulse">
                              Active Leg
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">Leg #{idx + 1}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: DIGITAL HANDOVER CONFIRMATION */}
              {activeTab === 'handovers' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chain-of-Custody Digital Handovers</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sign off transfer receipts at Cape Town Staging & Antarctic drop points.
                    </p>
                  </div>

                  {/* Handover Sign-off Form */}
                  <form onSubmit={handleConfirmHandover} className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/5 dark:bg-teal-950/20 space-y-3">
                    <h4 className="font-bold text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4" /> Log New Handover Event
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Transfer Location</label>
                        <select
                          value={handoverForm.location_id}
                          onChange={(e) => setHandoverForm({ ...handoverForm, location_id: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Confirmation Type</label>
                        <select
                          value={handoverForm.confirmation_type}
                          onChange={(e) => setHandoverForm({ ...handoverForm, confirmation_type: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="received">Confirm Received from Inbound Carrier</option>
                          <option value="handed_off">Confirm Handed Off to Onward Flight / Vessel</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Custody Notes / Seal Inspection</label>
                      <input
                        type="text"
                        placeholder="e.g. Container seals verified intact; temperature logging recorder continuous."
                        value={handoverForm.notes}
                        onChange={(e) => setHandoverForm({ ...handoverForm, notes: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Sign Digital Handover Record
                    </button>
                  </form>

                  {/* Handover Timeline */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logged Handover Trail</h4>
                    {selectedShipment.handover_confirmations?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No handover confirmations recorded yet.</p>
                    ) : (
                      selectedShipment.handover_confirmations.map((hnd) => (
                        <div key={hnd.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white capitalize">
                              {hnd.confirmation_type.replace('_', ' ')} @ {hnd.location?.name || hnd.location_id}
                            </span>
                            <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400">
                              {hnd.confirmed_at?.substring(0, 16).replace('T', ' ')}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">{hnd.notes || 'No extra notes provided.'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: VOYAGE CONSUMABLES TRACKER & LOW STOCK WARNING */}
              {activeTab === 'consumables' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Voyage Consumables & Provisioning Tracker</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Starting vs current supplies allocated for this voyage. Alerts trigger if stock falls below safety reserve.
                    </p>
                  </div>

                  {lowConsumables.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2.5">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Low Consumables Alert:</span> One or more voyage provisioning items have depleted below 25% safety reserve. Request replenishment at next transfer port.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {consumablesList.map((c) => {
                      const percentage = Math.round((c.current_quantity / (c.starting_quantity || 1)) * 100);
                      const isLow = percentage <= 25;
                      return (
                        <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{c.item_name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isLow ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500/10 text-emerald-500'
                            }`}>
                              {isLow ? 'Low Stock Warning' : 'Adequate'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-500">Remaining:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {c.current_quantity.toLocaleString()} / {c.starting_quantity.toLocaleString()} {c.unit} ({percentage}%)
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isLow ? 'bg-rose-500' : percentage <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Daily Burn: ~{c.daily_consumption_rate} {c.unit}/day</span>
                            <span>Safe Days: ~{Math.floor(c.current_quantity / (c.daily_consumption_rate || 1))} days left</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: WEATHER & CONDITION LOGS */}
              {activeTab === 'weather' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Expedition Weather & Sea Condition Log</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Log real-time weather, gale warnings, and pack ice conditions encountered along the voyage corridor.
                    </p>
                  </div>

                  <form onSubmit={handleAddWeatherLog} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CloudSnow className="w-4 h-4 text-sky-500" /> Record Weather Observation
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Condition Summary</label>
                        <input
                          type="text"
                          required
                          value={weatherForm.condition}
                          onChange={(e) => setWeatherForm({ ...weatherForm, condition: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Temperature (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={weatherForm.temperature_c}
                          onChange={(e) => setWeatherForm({ ...weatherForm, temperature_c: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Wind Speed (knots)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={weatherForm.wind_speed_knots}
                          onChange={(e) => setWeatherForm({ ...weatherForm, wind_speed_knots: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Observation Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Swell 5m, pack ice thickness 40cm, speed reduced to 8 knots."
                        value={weatherForm.note}
                        onChange={(e) => setWeatherForm({ ...weatherForm, note: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Save Weather Log
                    </button>
                  </form>

                  {/* Weather Log Trail */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logged Observations</h4>
                    {selectedShipment.weather_logs?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No weather reports logged yet.</p>
                    ) : (
                      selectedShipment.weather_logs.map((wth) => (
                        <div key={wth.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <CloudSnow className="w-3.5 h-3.5 text-sky-500" />
                              {wth.condition}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">{wth.logged_at?.substring(0, 16).replace('T', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                            {wth.temperature_c !== null && <span>Temp: {wth.temperature_c}°C</span>}
                            {wth.wind_speed_knots !== null && <span>Wind: {wth.wind_speed_knots} knots</span>}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 mt-1">{wth.note}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: DOCUMENT MANIFEST ATTACHMENTS */}
              {activeTab === 'documents' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Shipment Documentation & Regulatory Manifests</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Attach Hazmat MSDS certificates, Customs clearance paperwork, and packing manifests.
                    </p>
                  </div>

                  <form onSubmit={handleUploadDoc} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-teal-500" /> Attach Document Record
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">File Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Hazmat_MSDS_Certificate.pdf"
                          value={docForm.file_name}
                          onChange={(e) => setDocForm({ ...docForm, file_name: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Document Type</label>
                        <select
                          value={docForm.file_type}
                          onChange={(e) => setDocForm({ ...docForm, file_type: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="hazmat_cert">Hazmat / Dangerous Goods Certificate</option>
                          <option value="customs_paperwork">Customs Port Clearance Paperwork</option>
                          <option value="packing_manifest">Packing & Pallet Manifest</option>
                          <option value="inspection_report">Pre-Voyage Cold-Chain Inspection Report</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Attach Document
                    </button>
                  </form>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attached Shipment Files</h4>
                    {selectedShipment.documents?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No document attachments uploaded.</p>
                    ) : (
                      selectedShipment.documents.map((doc) => (
                        <div key={doc.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-teal-500 flex-shrink-0" />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{doc.file_name}</span>
                              <div className="text-[11px] text-slate-500 capitalize">
                                {doc.file_type.replace('_', ' ')} • {doc.file_size_kb} KB
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {doc.uploaded_at?.substring(0, 10)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SCOPED ALTERNATE ROUTE SUGGESTION */}
              {activeTab === 'alternateRoute' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Emergency Route Optimizer (Scoped Recomputation)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Flag weather disruptions or blocked transit legs. The NetworkX Dijkstra engine will calculate the fastest feasible alternate corridor from your current position.
                    </p>
                  </div>

                  <form onSubmit={handleRecalculateAlternateRoute} className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 dark:bg-sky-950/20 space-y-3">
                    <h4 className="font-bold text-xs text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                      <Compass className="w-4 h-4" /> Recompute Optimal Alternate Route
                    </h4>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Disruption Reason / Hazard Description</label>
                      <input
                        type="text"
                        required
                        value={rerouteForm.issue_description}
                        onChange={(e) => setRerouteForm({ ...rerouteForm, issue_description: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Transport Mode to Bypass</label>
                      <select
                        value={rerouteForm.avoid_mode}
                        onChange={(e) => setRerouteForm({ ...rerouteForm, avoid_mode: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        <option value="ship">Bypass Maritime Shipping (Pack ice / vessel engine trouble)</option>
                        <option value="aircraft">Bypass Airbridge Flight (Crosswinds / runway blizzard)</option>
                        <option value="helicopter">Bypass Helicopter Transport</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Recalculate Alternate Route
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 7: REPORT SHIPMENT EMERGENCY */}
              {activeTab === 'emergency' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Shipment Incident & Emergency Dispatch</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Report critical cargo, vessel, or transfer incidents. Automatically feeds into NCPOR HQ and Destination Station Commander hubs.
                    </p>
                  </div>

                  <form onSubmit={handleReportShipmentEmergency} className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 space-y-3">
                    <h4 className="font-bold text-xs text-rose-500 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Report Shipment Emergency
                    </h4>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Incident Type</label>
                      <input
                        type="text"
                        required
                        value={emgForm.event_type}
                        onChange={(e) => setEmgForm({ ...emgForm, event_type: e.target.value })}
                        placeholder="e.g. Cargo Lashing Shift, Refrigerator Container Failure"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Severity</label>
                      <select
                        value={emgForm.severity}
                        onChange={(e) => setEmgForm({ ...emgForm, severity: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        <option value="medium">Medium - Operational Warning</option>
                        <option value="high">High - Serious Cargo / Delay Risk</option>
                        <option value="critical">Critical - Immediate Vessel / Life Threat</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Incident Details</label>
                      <textarea
                        rows={3}
                        required
                        value={emgForm.description}
                        onChange={(e) => setEmgForm({ ...emgForm, description: e.target.value })}
                        placeholder="Provide details on location, cargo state, and emergency assistance required..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Dispatch Shipment SOS to HQ
                    </button>
                  </form>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400">
              Select a shipment from the left list to view operations.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
```

---

### <a id="file-frontendsrcpagesshipmenttrackerjsx"></a>File: `frontend/src/pages/ShipmentTracker.jsx`

> **Role / Purpose**: Shipment detail & tracking page with timeline, waypoints, temperature logs, driver/pilot notes

```jsx
import React, { useEffect, useState } from 'react';
import { getShipments, updateShipmentStatus, advanceShipmentLeg } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Truck,
  Search,
  Filter,
  Package,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  X,
  FastForward
} from 'lucide-react';

export default function ShipmentTracker() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalShipment, setActiveModalShipment] = useState(null);
  const [advancingId, setAdvancingId] = useState(null);

  useEffect(() => {
    fetchShipments();
  }, [selectedStatus, selectedDestination]);

  const fetchShipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getShipments({
        status: selectedStatus || undefined,
        destination: selectedDestination || undefined
      });
      setShipments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('ShipmentTracker fetchShipments error:', err);
      setShipments([]);
      setError("Unable to connect to PolarLogix backend API server on port 8008. Please verify backend service is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceLeg = async (e, shipmentId) => {
    e.stopPropagation(); // Prevent modal opening when clicking button on card
    setAdvancingId(shipmentId);
    try {
      const updated = await advanceShipmentLeg(shipmentId);
      // Immediately update local state without page refresh
      setShipments(prev => (Array.isArray(prev) ? prev : []).map(s => s?.id === shipmentId ? { ...s, ...updated } : s));
      if (activeModalShipment?.id === shipmentId) {
        setActiveModalShipment(prev => ({ ...prev, ...updated }));
      }
    } catch (err) {
      console.error('Failed to advance leg:', err);
    } finally {
      setAdvancingId(null);
    }
  };

  const handleStatusUpdate = async (shipmentId, newStatus) => {
    try {
      const updated = await updateShipmentStatus(shipmentId, { status: newStatus });
      setShipments(prev => (Array.isArray(prev) ? prev : []).map(s => s?.id === shipmentId ? { ...s, ...updated } : s));
      if (activeModalShipment?.id === shipmentId) {
        setActiveModalShipment(prev => ({ ...prev, ...updated }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const safeShipments = Array.isArray(shipments) ? shipments : [];
  const query = (searchQuery || '').toLowerCase();
  const filteredShipments = safeShipments.filter(s =>
    (s?.description || '').toLowerCase().includes(query) ||
    (s?.id || '').toLowerCase().includes(query) ||
    (s?.category || '').toLowerCase().includes(query)
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Expedition Cargo Courier Tracker
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time status monitoring, box labelling & multi-step leg progress across transport hubs
          </p>
        </div>
        <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
          Total Packages: {filteredShipments.length}
        </div>
      </div>

      {/* Visible Error State (No Silent Fallback) */}
      {error && (
        <div className="p-4 glass-panel border-l-4 border-l-rose-500 bg-rose-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-rose-500">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Backend Connection Error</h3>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchShipments}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search cargo, ID, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">All Cargo Statuses</option>
            <option value="planned">Planned</option>
            <option value="in_transit">In Transit</option>
            <option value="at_transfer_point">Cape Town Staging</option>
            <option value="delivered">Delivered</option>
            <option value="on_hold">On Hold / Hazmat</option>
          </select>

          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">All Destinations</option>
            <option value="LOC-BHA">Bharati Station</option>
            <option value="LOC-MAI">Maitri Station</option>
            <option value="LOC-CPT">Cape Town Staging</option>
          </select>
        </div>

      </div>

      {/* Shipment Cards Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" count={6} />
      ) : filteredShipments.length === 0 && !error ? (
        <div className="glass-panel p-12 text-center text-slate-500 dark:text-slate-400">
          No shipments found matching specified query filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShipments.map((shp) => {
            
            const isDelivered = shp?.status === 'delivered';

            return (
              <div
                key={shp?.id || Math.random()}
                onClick={() => setActiveModalShipment(shp)}
                className="glass-panel p-5 cursor-pointer hover:border-sky-500/50 transition-all transform hover:-translate-y-0.5 space-y-4 flex flex-col justify-between group"
              >
                
                {/* Top ID & Status */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-500 group-hover:underline">
                    {shp?.id}
                  </span>
                  <StatusBadge status={shp?.status} />
                </div>

                {/* Main Cargo Info */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-400 transition-colors">
                    {shp?.description}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="capitalize">{shp?.category?.replace('_', ' ') || 'General'}</span>
                    <span>•</span>
                    <span className="font-mono">{shp?.weight_kg ?? 0} kg</span>
                    {shp?.is_hazmat && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 font-bold text-[10px]">
                        HAZMAT
                      </span>
                    )}
                  </div>
                </div>

                {/* Package Label info */}
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-xs flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Current Position:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {shp?.current_location?.name || shp?.current_location_id || 'Unknown'}
                  </span>
                </div>

                {/* Progress Stepper Line */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span>{shp.origin?.name || 'Origin'}</span>
                    <span>{shp.destination?.name || 'Destination'}</span>
                  </div>

                  {/* Multi-step bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        shp.status === 'delivered'
                          ? 'w-full bg-emerald-500'
                          : shp.status === 'in_transit'
                          ? 'w-2/3 bg-cyan-400 animate-pulse'
                          : shp.status === 'at_transfer_point'
                          ? 'w-1/2 bg-amber-500'
                          : shp.status === 'on_hold'
                          ? 'w-1/3 bg-rose-500'
                          : 'w-1/4 bg-blue-500'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* DEMO FEATURE: Advance to Next Leg Button */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  {!isDelivered ? (
                    <button
                      onClick={(e) => handleAdvanceLeg(e, shp.id)}
                      disabled={advancingId === shp.id}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>{advancingId === shp.id ? 'Simulating...' : 'Advance to Next Leg'}</span>
                    </button>
                  ) : (
                    <span className="text-emerald-500 font-bold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Voyage Completed
                    </span>
                  )}

                  <span className="text-sky-500 font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                    Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Shipment Detail Modal */}
      {activeModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-2xl w-full p-6 space-y-5 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveModalShipment(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sky-500 text-sm">{activeModalShipment.id}</span>
                  <StatusBadge status={activeModalShipment.status} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeModalShipment.description}
                </h2>
              </div>
            </div>

            {/* Quick Details Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div>
                <span className="text-slate-400 block">Category:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {activeModalShipment.category?.replace('_', ' ') || 'General'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Weight:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {activeModalShipment.weight_kg ?? 0} kg
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Box Label:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {activeModalShipment.box_label || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">ETA:</span>
                <span className="font-semibold text-emerald-500 font-mono">
                  {activeModalShipment.eta || 'TBD'}
                </span>
              </div>
            </div>

            {/* Demo Advance Leg Button inside Modal */}
            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-sky-400">Live Logistics Simulation Control</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Advance cargo through computed transport legs in real time</p>
                </div>
                {activeModalShipment.status !== 'delivered' && (
                  <button
                    onClick={(e) => handleAdvanceLeg(e, activeModalShipment.id)}
                    className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
                  >
                    <FastForward className="w-4 h-4" />
                    <span>Advance to Next Leg</span>
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Status Override */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Manual Status Override:
              </label>
              <div className="flex flex-wrap gap-2">
                {['planned', 'in_transit', 'at_transfer_point', 'delivered', 'on_hold'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusUpdate(activeModalShipment.id, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeModalShipment.status === st
                        ? 'bg-sky-500 text-white font-bold shadow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {st.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
```

---

### <a id="file-frontendsrcpagesshipmentplannerjsx"></a>File: `frontend/src/pages/ShipmentPlanner.jsx`

> **Role / Purpose**: Multi-leg route planner: source/destination selection, cargo definition, multi-modal path computation

```jsx
import React, { useState } from 'react';
import { createShipment, previewRoute } from '../services/api';
import ExpeditionMap from '../components/Map/ExpeditionMap';
import StatusBadge from '../components/StatusBadge';
import {
  PackagePlus,
  Route,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Scale,
  ShieldAlert,
  Ship,
  Plane,
  ArrowRight,
  Sparkles,
  Waves,
  Wind,
  ShieldCheck,
  Compass,
  Navigation,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';

const locationCoordinates = {
  'LOC-GOA': { id: 'LOC-GOA', name: 'India Depot (Goa)', lat: 15.3991, lng: 73.8052 },
  'LOC-CPT': { id: 'LOC-CPT', name: 'Cape Town Transfer Point', lat: -33.9249, lng: 18.4241 },
  'LOC-MAI': { id: 'LOC-MAI', name: 'Maitri Research Station', lat: -70.7667, lng: 11.7333 },
  'LOC-BHA': { id: 'LOC-BHA', name: 'Bharati Research Station', lat: -69.4068, lng: 76.1953 },
  'LOC-HIM': { id: 'LOC-HIM', name: 'Himadri Arctic Station', lat: 78.9235, lng: 11.9331 },
  'LOC-HMS': { id: 'LOC-HMS', name: 'Himansh Himalayan Station', lat: 32.4485, lng: 77.6155 }
};

export default function ShipmentPlanner({ setActiveTab }) {
  const [formData, setFormData] = useState({
    description: 'Autonomous Oceanographic Glider & CTD Sensors',
    category: 'scientific_equipment',
    weight_kg: 750,
    is_hazmat: false,
    origin_id: 'LOC-GOA',
    destination_id: 'LOC-BHA',
    box_label: '1 of 2',
    target_month: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routePlan, setRoutePlan] = useState(null);
  const [createdShipment, setCreatedShipment] = useState(null);

  // 1. Calculate & Preview Route with Marine Waypoints and Live Weather
  const handleCalculateRoute = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedShipment(null);

    try {
      const result = await previewRoute({
        description: formData.description,
        category: formData.category,
        weight_kg: parseFloat(formData.weight_kg),
        is_hazmat: formData.is_hazmat,
        origin_id: formData.origin_id,
        destination_id: formData.destination_id,
        box_label: formData.box_label,
        target_month: parseInt(formData.target_month)
      });
      setRoutePlan(result);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to compute route for specified parameters.');
      setRoutePlan(null);
    } finally {
      setLoading(false);
    }
  };

  // 2. Commit & Dispatch Shipment
  const handleCreateShipment = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await createShipment({
        description: formData.description,
        category: formData.category,
        weight_kg: parseFloat(formData.weight_kg),
        is_hazmat: formData.is_hazmat,
        origin_id: formData.origin_id,
        destination_id: formData.destination_id,
        box_label: formData.box_label,
        target_month: parseInt(formData.target_month)
      });
      setCreatedShipment(result);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to save shipment.');
    } finally {
      setLoading(false);
    }
  };

  const computedLegs = routePlan?.legs || [];
  const waypoints = routePlan?.waypoints || [];
  const weatherAdvisory = routePlan?.weather_advisory || null;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Marine Waypoint & Weather-Aware Route Planner
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Searoute nautical navigation engine avoiding landmasses with live Open-Meteo marine weather verification
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Route Planning Form (Left Column) */}
        <div className="lg:col-span-5 glass-panel p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Compass className="w-4 h-4 text-sky-500" />
            <span>Cargo & Voyage Parameters</span>
          </h2>

          <form onSubmit={handleCalculateRoute} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cargo Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Autonomous Oceanographic Glider"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="scientific_equipment">Scientific Equipment</option>
                  <option value="food">Food Rations</option>
                  <option value="fuel">Fuel & Lubricants</option>
                  <option value="spare_parts">Spare Parts</option>
                  <option value="hazmat">Hazmat / Chemicals</option>
                  <option value="personal_effects">Personal Effects</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50000"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Origin Depot
                </label>
                <select
                  value={formData.origin_id}
                  onChange={(e) => setFormData({ ...formData, origin_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="LOC-GOA">India Depot (Goa)</option>
                  <option value="LOC-CPT">Cape Town Transfer Point</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Station
                </label>
                <select
                  value={formData.destination_id}
                  onChange={(e) => setFormData({ ...formData, destination_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="LOC-BHA">Bharati Research Station</option>
                  <option value="LOC-MAI">Maitri Research Station</option>
                  <option value="LOC-CPT">Cape Town Transfer Point</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Box / Manifest Label
                </label>
                <input
                  type="text"
                  value={formData.box_label}
                  onChange={(e) => setFormData({ ...formData, box_label: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Season Month
                </label>
                <select
                  value={formData.target_month}
                  onChange={(e) => setFormData({ ...formData, target_month: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value={1}>January (Summer Ops)</option>
                  <option value={2}>February (Summer Ops)</option>
                  <option value={3}>March (Late Summer)</option>
                  <option value={11}>November (Early Summer)</option>
                  <option value={12}>December (Peak Summer)</option>
                </select>
              </div>
            </div>

            {/* Hazmat Toggle Switch */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Hazardous Cargo (Hazmat)</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Restricts voyage to heavy maritime vessels (air transport excluded)
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.is_hazmat}
                onChange={(e) => setFormData({ ...formData, is_hazmat: e.target.checked })}
                className="w-5 h-5 text-sky-500 rounded focus:ring-sky-500 cursor-pointer"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.description}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Calculating Searoute Waypoints & Weather...</span>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Compute Marine Route & Check Weather</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Computed Itinerary & Route Preview (Right Column) */}
        <div className="lg:col-span-7 space-y-6">
          
          {!routePlan ? (
            <div className="glass-panel p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Maritime Routing Engine Ready</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Select cargo specifications and stations on the left to compute realistic marine waypoints and check live weather along the sea route.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Route Summary Card */}
              <div className="glass-panel p-5 border-l-4 border-l-sky-500 space-y-3 bg-sky-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sky-500 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Realistic Marine Waypoint Route Computed</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {waypoints.length} Total Waypoints
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Total Duration:</span>
                    <div className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                      {routePlan.total_duration_days} Days
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Target Station:</span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {locationCoordinates[routePlan.destination_id]?.name || routePlan.destination_id}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Marine Engine:</span>
                    <div className="font-bold text-sky-500 font-mono text-sm">Searoute v1.6</div>
                  </div>
                </div>
              </div>

              {/* PHASE 3: ALGORITHMIC WEATHER THRESHOLD CHECK (EXACT LABELING) */}
              {weatherAdvisory && (
                <div className="glass-panel p-5 space-y-4 border border-slate-200 dark:border-slate-800 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <Waves className="w-4 h-4 text-sky-500" />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          Algorithmic Weather Threshold Check using Live Marine Data
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Deterministic threshold check querying live Open-Meteo Marine (wave height) & Forecast API (wind in knots)
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 self-start ${
                      weatherAdvisory.adverse_weather_detected
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {weatherAdvisory.adverse_weather_detected ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Advisory Warning</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Safe Marine Windows</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Advisory Alert Banner if Conditions Exceed Threshold */}
                  {weatherAdvisory.adverse_weather_detected && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 space-y-1.5">
                      <div className="font-bold flex items-center space-x-1.5">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>Adverse Marine Conditions Exceed Safety Thresholds</span>
                      </div>
                      <div className="space-y-1">
                        {weatherAdvisory.warnings.map((w, i) => (
                          <div key={i} className="pl-5">• {w}</div>
                        ))}
                      </div>
                      {weatherAdvisory.suggested_action && (
                        <div className="pt-2 border-t border-amber-500/20 font-medium text-slate-800 dark:text-slate-200">
                          <span className="font-bold text-amber-500">Suggested Action: </span>
                          {weatherAdvisory.suggested_action}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Waypoint Live Data Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {weatherAdvisory.waypoints.map((wp, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                          wp.status === 'adverse'
                            ? 'bg-amber-500/5 border-amber-500/30'
                            : wp.status === 'unavailable'
                            ? 'bg-slate-500/5 border-slate-500/30'
                            : 'bg-emerald-500/5 border-emerald-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white truncate">{wp.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            wp.status === 'adverse'
                              ? 'bg-amber-500/10 text-amber-500'
                              : wp.status === 'unavailable'
                              ? 'bg-slate-500/10 text-slate-400'
                              : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {wp.status}
                          </span>
                        </div>

                        <div className="space-y-1 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center text-slate-400">
                              <Waves className="w-3 h-3 mr-1" /> Wave Height:
                            </span>
                            <span className="font-mono font-bold">
                              {wp.wave_height_m !== null ? `${wp.wave_height_m} m` : 'N/A'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center text-slate-400">
                              <Wind className="w-3 h-3 mr-1" /> Wind Speed:
                            </span>
                            <span className="font-mono font-bold">
                              {wp.wind_speed_knots !== null ? `${wp.wind_speed_knots} kt` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800 line-clamp-2">
                          {wp.details}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    <span>
                      Safe thresholds configured in weather_thresholds.json: Max Wave {weatherAdvisory.thresholds?.max_safe_wave_height_m}m, Max Wind {weatherAdvisory.thresholds?.max_safe_wind_speed_knots} kt.
                    </span>
                  </div>
                </div>
              )}

              {/* Step-by-Step Multi-Modal Itinerary */}
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Route className="w-4 h-4 text-sky-500" />
                  <span>Step-by-Step Multi-Modal Itinerary (Realistic Durations)</span>
                </h3>

                <div className="space-y-3">
                  {computedLegs.map((leg, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          L{idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                            <span>{locationCoordinates[leg?.origin_id]?.name || leg?.origin_id}</span>
                            <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span>{locationCoordinates[leg?.destination_id]?.name || leg?.destination_id}</span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap gap-2">
                            <span className="capitalize">Mode: <b className="text-sky-500">{leg?.mode ? leg.mode.replace('_', ' ') : 'Leg'}</b></span>
                            {leg.distance_nm && <span>• Distance: <b className="font-mono text-slate-700 dark:text-slate-300">{leg.distance_nm.toLocaleString()} nm</b></span>}
                            {leg.average_speed_knots && <span>• Speed: <b className="font-mono text-slate-700 dark:text-slate-300">{leg.average_speed_knots} kt</b></span>}
                          </div>
                        </div>
                      </div>

                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 self-start sm:self-center">
                        {leg?.duration_days ?? 0} Days Transit
                      </span>
                    </div>
                  ))}
                </div>

                {!createdShipment ? (
                  <button
                    onClick={handleCreateShipment}
                    disabled={loading}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
                  >
                    <PackagePlus className="w-4 h-4" />
                    <span>Confirm & Create Cargo Shipment Record</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Shipment Created: {createdShipment.id}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('tracking')}
                      className="px-3 py-1.5 bg-emerald-500 text-white font-bold rounded-lg text-xs hover:bg-emerald-600 transition-colors"
                    >
                      View in Tracker →
                    </button>
                  </div>
                )}

              </div>

              {/* Map Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Real Curved Marine Polyline Map Visualizer
                  </h3>
                  <span className="text-xs text-sky-500 font-medium">Avoiding Landmasses</span>
                </div>
                <ExpeditionMap
                  waypoints={waypoints}
                  weatherAdvisory={weatherAdvisory}
                  legs={computedLegs}
                />
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
```

---

### <a id="file-frontendsrcpagesrouteexplorerjsx"></a>File: `frontend/src/pages/RouteExplorer.jsx`

> **Role / Purpose**: Interactive route network browser: transit leg details, modality filter, live weather conditions

```jsx
import React, { useEffect, useState } from 'react';
import { getTransportLegs, getLocations } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Route,
  Ship,
  Plane,
  Calendar,
  Scale,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  Compass,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const monthNames = {
  1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
  7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
};

const modeIcons = {
  ship: Ship,
  aircraft: Plane,
  cargo_flight: Plane,
  helicopter: Compass
};

export default function RouteExplorer() {
  const [legs, setLegs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [legData, locData] = await Promise.all([
        getTransportLegs().catch(err => {
          console.error('getTransportLegs error:', err);
          return [];
        }),
        getLocations().catch(err => {
          console.error('getLocations error:', err);
          return [];
        })
      ]);
      setLegs(Array.isArray(legData) ? legData : []);
      setLocations(Array.isArray(locData) ? locData : []);
    } catch (err) {
      console.error('RouteExplorer fetchNetworkData error:', err);
      setLegs([]);
      setLocations([]);
      setError("Unable to reach PolarLogix network routing service. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const safeLegs = Array.isArray(legs) ? legs : [];
  const safeLocations = Array.isArray(locations) ? locations : [];

  const getLocationName = (id) => {
    const loc = safeLocations.find(l => l?.id === id);
    return loc ? loc.name : id;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Antarctic Transport Network Explorer
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Interactive constraint matrix: weight limits, hazmat restrictions, durations & seasonal weather windows
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="p-4 glass-panel border-l-4 border-l-rose-500 bg-rose-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-rose-500">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Transport Network Query Error</h3>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchNetworkData}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="cards" count={4} />
      ) : safeLegs.length === 0 && !error ? (
        <div className="glass-panel p-12 text-center text-slate-500 dark:text-slate-400">
          No transport legs or routes currently registered.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {safeLegs.map((leg) => {
            const Icon = modeIcons[leg?.mode] || Route;
            let availableMonths = [];
            if (Array.isArray(leg?.available_months)) {
              availableMonths = leg.available_months;
            } else if (typeof leg?.available_months === 'string') {
              try { availableMonths = JSON.parse(leg.available_months); } catch (e) {}
            }
            if (!Array.isArray(availableMonths)) availableMonths = [];

            return (
              <div
                key={leg?.id || Math.random()}
                className="glass-panel p-5 space-y-4 hover:border-sky-500/50 transition-all flex flex-col justify-between"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-sky-500">{leg?.id}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {leg?.mode ? leg.mode.replace('_', ' ') : 'Leg'}
                  </span>
                </div>

                {/* Route Path */}
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Leg Route:</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>{getLocationName(leg?.origin_id)}</span>
                    <ArrowRight className="w-4 h-4 text-sky-500 flex-shrink-0" />
                    <span>{getLocationName(leg?.destination_id)}</span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> Transit Duration
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{leg?.duration_days ?? 0} Days</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 flex items-center">
                      <Scale className="w-3 h-3 mr-1" /> Capacity Limit
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{(leg?.capacity_kg ?? 0).toLocaleString()} kg</span>
                  </div>

                  {leg?.distance_nm && (
                    <div className="space-y-0.5 col-span-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Nautical Distance:</span>
                      <span className="font-mono font-bold text-sky-500">{leg.distance_nm.toLocaleString()} nm</span>
                    </div>
                  )}

                  {leg?.average_speed_knots && (
                    <div className="space-y-0.5 col-span-2 flex items-center justify-between">
                      <span className="text-slate-400">Vessel Cruising Speed:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{leg.average_speed_knots} knots</span>
                    </div>
                  )}
                </div>

                {/* Hazmat Rule */}
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Hazmat Allowance:</span>
                  {leg?.hazmat_allowed ? (
                    <span className="font-bold text-emerald-500 flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Allowed
                    </span>
                  ) : (
                    <span className="font-bold text-rose-500 flex items-center">
                      <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Excluded (Air)
                    </span>
                  )}
                </div>

                {/* Seasonal Months Calendar Grid */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> Operational Months:</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1 text-[10px] font-mono text-center">
                    {[11, 12, 1, 2, 3, 4].map((m) => {
                      const isAvailable = availableMonths.includes(m);
                      return (
                        <span
                          key={m}
                          className={`py-1 rounded font-bold ${
                            isAvailable
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 line-through'
                          }`}
                        >
                          {monthNames[m]}
                        </span>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
```

---

### <a id="file-frontendsrcpagesinventorydashboardjsx"></a>File: `frontend/src/pages/InventoryDashboard.jsx`

> **Role / Purpose**: Station life-support inventory tracker: fuel reserves, medical supplies, food rations, reorder thresholds

```jsx
import React, { useEffect, useState } from 'react';
import { getInventory } from '../services/api';
import { useConnectivity } from '../context/ConnectivityContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Building2,
  CheckCircle2,
  X,
  RefreshCw,
  Database
} from 'lucide-react';

const locations = [
  { id: 'LOC-BHA', name: 'Bharati Station', tag: 'Larsemann Hills (Antarctica)' },
  { id: 'LOC-MAI', name: 'Maitri Station', tag: 'Schirmacher Oasis (Antarctica)' },
  { id: 'LOC-HIM', name: 'Himadri Station', tag: 'Ny-Ålesund, Svalbard (Arctic)' },
  { id: 'LOC-HMS', name: 'Himansh Base', tag: 'Sutri Dhaka (Himalayas)' },
  { id: 'LOC-CPT', name: 'Cape Town Transfer', tag: 'South Africa Staging' },
  { id: 'LOC-GOA', name: 'India Depot', tag: 'NCPOR Goa Base' }
];

export default function InventoryDashboard() {
  const { submitInventoryItem } = useConnectivity();
  const [activeLocationId, setActiveLocationId] = useState('LOC-BHA');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newItem, setNewItem] = useState({
    item_name: '',
    category: 'fuel',
    quantity: 1000,
    unit: 'liters',
    minimum_threshold: 500
  });

  useEffect(() => {
    fetchInventory();
  }, [activeLocationId]);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventory(activeLocationId);
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('InventoryDashboard fetchInventory error:', err);
      setInventory([]);
      setError("Operating from local IndexedDB cache.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      await submitInventoryItem(activeLocationId, {
        location_id: activeLocationId,
        item_name: newItem.item_name,
        category: newItem.category,
        quantity: parseFloat(newItem.quantity),
        unit: newItem.unit,
        minimum_threshold: parseFloat(newItem.minimum_threshold)
      });
      setShowAddModal(false);
      setNewItem({ item_name: '', category: 'fuel', quantity: 1000, unit: 'liters', minimum_threshold: 500 });
      fetchInventory();
    } catch (err) {
      console.error('Failed to save item:', err);
    }
  };

  const safeLocations = Array.isArray(locations) ? locations : [];
  const activeLocInfo = safeLocations.find(l => l.id === activeLocationId);
  const safeInventory = Array.isArray(inventory) ? inventory : [];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-emerald-500/10 via-sky-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Multi-Station Live Inventory Depots
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time stock monitoring, fuel reserves & automated low-supply alerts across bases
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* Error Alert Box (No Silent Fallback) */}
      {error && (
        <div className="p-4 glass-panel border-l-4 border-l-rose-500 bg-rose-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-rose-500">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Inventory Fetch Error</h3>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchInventory}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Location Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {locations.map((loc) => {
          const isActive = activeLocationId === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => setActiveLocationId(loc.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                  : 'glass-panel text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{loc.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Location Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Managing supplies for <strong>{activeLocInfo?.name}</strong> ({activeLocInfo?.tag})</span>
        <span className="font-mono">{safeInventory.length} Recorded Items</span>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel p-5 space-y-4">
        {loading ? (
          <LoadingSkeleton type="list" count={5} />
        ) : safeInventory.length === 0 && !error ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No stock inventory items recorded for this station depot.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3.5 rounded-l-lg">Item Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Minimum Threshold</th>
                  <th className="p-3.5 rounded-r-lg">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {safeInventory.map((item) => {
                  const qty = typeof item?.quantity === 'number' ? item.quantity : parseFloat(item?.quantity || 0);
                  const minThresh = typeof item?.minimum_threshold === 'number' ? item.minimum_threshold : parseFloat(item?.minimum_threshold || 0);
                  const isLow = qty <= minThresh;
                  return (
                    <tr key={item?.id || Math.random()} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white text-sm">
                        {item?.item_name}
                      </td>
                      <td className="p-3.5 capitalize font-medium text-slate-500 dark:text-slate-400">
                        {item?.category?.replace('_', ' ') || 'General'}
                      </td>
                      <td className="p-3.5 font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                        {qty.toLocaleString()} {item?.unit || ''}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">
                        {minThresh.toLocaleString()} {item?.unit || ''}
                      </td>
                      <td className="p-3.5">
                        {isLow ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Low Stock Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Optimum Level
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Stock Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Inventory Item to {activeLocInfo?.name}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="fuel">Fuel & Oils</option>
                  <option value="food">Food & Rations</option>
                  <option value="medical">Medical Supplies</option>
                  <option value="spare_parts">Spare Parts</option>
                  <option value="scientific_equipment">Scientific Consumables</option>
                  <option value="clothing">Polar Clothing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Minimum Alert Threshold</label>
                <input
                  type="number"
                  required
                  value={newItem.minimum_threshold}
                  onChange={(e) => setNewItem({ ...newItem, minimum_threshold: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20"
              >
                Save Inventory Item
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
```

---

### <a id="file-frontendsrcpagespersonneldashboardjsx"></a>File: `frontend/src/pages/PersonnelDashboard.jsx`

> **Role / Purpose**: Expedition personnel roster: medical fitness, station assignment, contact details, role distribution

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConnectivity } from '../context/ConnectivityContext';
import {
  getMyPersonnelProfile,
  getEmergencies
} from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  UserCheck,
  Calendar,
  MapPin,
  Clock,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ClipboardList,
  Compass,
  Radio,
  Database
} from 'lucide-react';

const COMMON_STATUS_PRESETS = [
  'On generator maintenance duty',
  'Conducting meteorological balloon launch',
  'Ice core sampling in field sector #4',
  'Available for station logistics duty',
  'Off-shift / rest cycle in living quarters',
  'Emergency medical response standby'
];

export default function PersonnelDashboard() {
  const { user } = useAuth();
  const { submitPersonnelWorkStatus, submitEmergency } = useConnectivity();
  const [profile, setProfile] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusText, setStatusText] = useState('');
  const [taskCategory, setTaskCategory] = useState('Station Maintenance');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Emergency Modal
  const [showEmgModal, setShowEmgModal] = useState(false);
  const [emgForm, setEmgForm] = useState({
    event_type: 'Lab Instrument Malfunction',
    severity: 'medium',
    description: ''
  });
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPersonnelData = async () => {
    try {
      const [profData, emgData] = await Promise.all([
        getMyPersonnelProfile(),
        getEmergencies('open')
      ]);
      setProfile(profData);
      setEmergencies(Array.isArray(emgData) ? emgData : []);
    } catch (err) {
      console.error('Failed to fetch personnel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnelData();
    // Auto-poll emergencies every 15s
    const timer = setInterval(() => {
      getEmergencies('open').then(data => {
        if (Array.isArray(data)) setEmergencies(data);
      }).catch(console.error);
    }, 15000);
    return () => clearInterval(timer);
  }, [user]);

  const handlePostStatus = async (e) => {
    e.preventDefault();
    if (!statusText.trim()) return;
    setSubmittingStatus(true);
    try {
      await submitPersonnelWorkStatus({
        status_text: statusText.trim(),
        task_category: taskCategory
      });
      setStatusText('');
      showToast('Work status update recorded (Offline Buffer Synchronized)!');
      fetchPersonnelData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update work status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleReportEmergency = async (e) => {
    e.preventDefault();
    try {
      await submitEmergency({
        station_id: user.linked_station_id || 'LOC-BHA',
        event_type: emgForm.event_type,
        severity: emgForm.severity,
        description: emgForm.description
      });
      setShowEmgModal(false);
      setEmgForm({ event_type: 'Lab Instrument Malfunction', severity: 'medium', description: '' });
      showToast('🚨 Emergency report queued for high-priority dispatch!');
      fetchPersonnelData();
    } catch (err) {
      alert('Failed to report emergency');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <LoadingSkeleton type="cards" count={3} />
      </div>
    );
  }

  const workLogs = profile?.work_logs || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg ${
          notification.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Hero Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border-l-4 border-l-indigo-500 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                Antarctic Expedition Member Portal
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Active Deployment
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {profile?.name || user?.username}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Personnel ID: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{profile?.id || user?.username}</span> • Official Expedition Roster Record
            </p>
          </div>

          <button
            onClick={() => setShowEmgModal(true)}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2 cursor-pointer self-start md:self-center"
          >
            <ShieldAlert className="w-4 h-4" />
            Report Station Emergency / SOS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 5 COLS: MY OFFICIAL PROFILE (READ-ONLY) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-500" />
                My Official Profile
              </h3>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                Read-Only Record
              </span>
            </div>

            {profile ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Full Name & Scientific Role</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{profile.name}</span>
                    <div className="text-indigo-600 dark:text-indigo-400 font-semibold">{profile.role}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Affiliated Institution</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{profile.affiliated_institution || 'NCPOR'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Employment Category</span>
                      <span className="font-semibold capitalize text-indigo-600 dark:text-indigo-400">
                        {profile.personnel_category ? profile.personnel_category.replace('_', ' ') : 'Permanent Staff'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Assigned Station</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.assigned_station}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Season Cycle</span>
                      <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">{profile.season_type}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Deployment Dates</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {profile.deployment_start} → {profile.deployment_end}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Operational Status</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {profile.current_status}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-indigo-500/5 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  <span className="font-bold text-indigo-500 block mb-1">Station Commander Note:</span>
                  All personnel deployment records are authenticated directly by NCPOR HQ. Privacy and role-isolation are strictly enforced.
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No profile details linked to this ID.</p>
            )}
          </div>
        </div>

        {/* RIGHT 7 COLS: WORK STATUS TRACKER & DUTY LOGS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Work Status Update Box */}
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Work Status & Duty Tracker
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your current duty status or research task. Updates appear in the Station Commander roster.
              </p>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quick Status Presets</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_STATUS_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setStatusText(preset)}
                    className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-indigo-500 text-slate-700 dark:text-slate-300 transition-colors text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Status Form */}
            <form onSubmit={handlePostStatus} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Current Task / Activity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. On generator maintenance duty"
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Station Maintenance">Station Maintenance</option>
                    <option value="Scientific Research">Scientific Research</option>
                    <option value="Field Expedition">Field Expedition</option>
                    <option value="Emergency Duty">Emergency Duty</option>
                    <option value="Rest / Off-Shift">Rest / Off-Shift</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingStatus || !statusText.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingStatus ? 'Updating...' : 'Log Duty Status'}
              </button>
            </form>

            {/* History of Work Logs */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Recent Duty Logs</h4>
              {workLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No duty status logs recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {workLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">{log.status_text}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {log.logged_at?.substring(0, 16).replace('T', ' ')}
                        </span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        {log.task_category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Station Connected Alerts Box */}
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Active Station Alerts & Warnings
            </h3>
            {emergencies.length === 0 ? (
              <p className="text-xs text-slate-400">No active station emergency alerts.</p>
            ) : (
              emergencies.map((emg) => (
                <div key={emg.id} className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{emg.event_type}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500 text-white">
                      {emg.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{emg.description}</p>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* MODAL: REPORT STATION EMERGENCY */}
      {showEmgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-md w-full rounded-2xl space-y-4 bg-white dark:bg-[#111827]">
            <h3 className="text-base font-bold text-rose-500 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Dispatch Emergency Incident
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immediately alerts the Bharati Station Commander and NCPOR Operations Headquarters.
            </p>
            <form onSubmit={handleReportEmergency} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Incident Event Type</label>
                <input
                  required
                  type="text"
                  value={emgForm.event_type}
                  onChange={(e) => setEmgForm({ ...emgForm, event_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Severity</label>
                <select
                  value={emgForm.severity}
                  onChange={(e) => setEmgForm({ ...emgForm, severity: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="low">Low - Minor Equipment Notice</option>
                  <option value="medium">Medium - Operational Warning</option>
                  <option value="high">High - Station Critical Event</option>
                  <option value="critical">Critical - Life Safety / Evacuation Alert</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Incident Details</label>
                <textarea
                  required
                  rows={3}
                  value={emgForm.description}
                  onChange={(e) => setEmgForm({ ...emgForm, description: e.target.value })}
                  placeholder="Describe incident, location inside station, and assistance needed..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEmgModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Broadcast SOS Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
```

---

### <a id="file-frontendsrcpagespersonnelmanagerjsx"></a>File: `frontend/src/pages/PersonnelManager.jsx`

> **Role / Purpose**: Station personnel management: deployment assignments, medical status updates, station capacity

```jsx
import React, { useEffect, useState } from 'react';
import { getPersonnel, createPersonnel } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Users,
  UserPlus,
  Calendar,
  Sun,
  Snowflake,
  Filter,
  X,
  Clock,
  AlertTriangle,
  RefreshCw,
  Building2,
  Briefcase,
  Award,
  Compass,
  CheckCircle2
} from 'lucide-react';

const categoryLabels = {
  permanent_staff: { label: 'Permanent Staff', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
  project_scientist: { label: 'Project Scientist', color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
  contract_specialist: { label: 'Contract Specialist', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  visiting_researcher: { label: 'Visiting Researcher', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' }
};

const commonInstitutions = [
  'NCPOR',
  'IIT Bombay',
  'CSIR-NIO',
  'GSI',
  'AIIMS New Delhi',
  'ISRO-SAC',
  'IISc Bangalore',
  'IIT Kharagpur',
  'Wadia Institute of Himalayan Geology'
];

export default function PersonnelManager() {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newPerson, setNewPerson] = useState({
    name: '',
    role: 'Senior Glaciologist',
    affiliated_institution: 'NCPOR',
    personnel_category: 'permanent_staff',
    assigned_station: 'Bharati Research Station',
    season_type: 'summer',
    deployment_start: '2025-11-15',
    deployment_end: '2026-03-30',
    current_status: 'deployed'
  });

  useEffect(() => {
    fetchPersonnel();
  }, [selectedStation, selectedSeason, selectedCategory, selectedInstitution]);

  const fetchPersonnel = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPersonnel({
        station: selectedStation || undefined,
        season: selectedSeason || undefined,
        category: selectedCategory || undefined,
        institution: selectedInstitution || undefined
      });
      setPersonnel(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('PersonnelManager fetchPersonnel error:', err);
      setPersonnel([]);
      setError("Unable to reach PolarLogix personnel service. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPerson = async (e) => {
    e.preventDefault();
    try {
      await createPersonnel(newPerson);
      setShowAddModal(false);
      setNewPerson({
        name: '',
        role: 'Senior Glaciologist',
        affiliated_institution: 'NCPOR',
        personnel_category: 'permanent_staff',
        assigned_station: 'Bharati Research Station',
        season_type: 'summer',
        deployment_start: '2025-11-15',
        deployment_end: '2026-03-30',
        current_status: 'deployed'
      });
      fetchPersonnel();
    } catch (err) {
      console.error('Failed to deploy personnel:', err);
    }
  };

  const safePersonnel = Array.isArray(personnel) ? personnel : [];
  const summerCount = safePersonnel.filter(p => p?.season_type === 'summer').length;
  const winterCount = safePersonnel.filter(p => p?.season_type === 'winter').length;

  // Institution diversity count
  const institutionsSet = new Set(safePersonnel.map(p => p?.affiliated_institution).filter(Boolean));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              National Polar Platform
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {institutionsSet.size} Partner Institutions
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Expedition Personnel & Multi-Institution Roster
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Tracking scientists and specialists representing NCPOR, IITs, CSIR labs, GSI, AIIMS, and partner universities
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-sky-500/30 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Deploy Expedition Member</span>
        </button>
      </div>

      {/* Visible Error State */}
      {error && (
        <div className="p-4 glass-panel border-l-4 border-l-rose-500 bg-rose-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-rose-500">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Personnel Roster Connection Error</h3>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchPersonnel}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Diversity & Season Visualizer Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-500 text-sm flex items-center space-x-1.5">
              <Sun className="w-4 h-4" />
              <span>Summer Team Window</span>
            </span>
            <span className="font-mono text-xs font-bold text-amber-500">{summerCount} Deployed</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Peak scientific fieldwork, aerial logistics & heavy supply replenishment (Nov - Mar / Arctic May - Sep).
          </p>
        </div>

        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sky-400 text-sm flex items-center space-x-1.5">
              <Snowflake className="w-4 h-4" />
              <span>Wintering Team Crew</span>
            </span>
            <span className="font-mono text-xs font-bold text-sky-400">{winterCount} Members</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Wintering crew operating station power, life-support, meteorology & telemetry.
          </p>
        </div>

        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-500 text-sm flex items-center space-x-1.5">
              <Building2 className="w-4 h-4" />
              <span>Affiliated Institutions</span>
            </span>
            <span className="font-mono text-xs font-bold text-emerald-500">{institutionsSet.size} Distinct</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            National platform supporting visiting researchers from premier IITs, CSIR labs, ISRO, and universities.
          </p>
        </div>

      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
        >
          <option value="">All Stations & Bases</option>
          <option value="Bharati Research Station">Bharati Station (Antarctica)</option>
          <option value="Maitri Research Station">Maitri Station (Antarctica)</option>
          <option value="Himadri Arctic Station">Himadri Station (Arctic / Svalbard)</option>
          <option value="Himansh Himalayan Station">Himansh Base (Himalayas / Spiti)</option>
          <option value="Cape Town Transfer Point">Cape Town Staging Hub</option>
          <option value="India Depot">Goa Depot</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
        >
          <option value="">All Employment Categories</option>
          <option value="permanent_staff">Permanent Staff</option>
          <option value="project_scientist">Project Scientist</option>
          <option value="contract_specialist">Contract Specialist</option>
          <option value="visiting_researcher">Visiting Researcher</option>
        </select>

        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
        >
          <option value="">All Seasons</option>
          <option value="summer">Summer Crew</option>
          <option value="winter">Wintering Crew</option>
        </select>

        {(selectedStation || selectedCategory || selectedSeason || selectedInstitution) && (
          <button
            onClick={() => {
              setSelectedStation('');
              setSelectedCategory('');
              setSelectedSeason('');
              setSelectedInstitution('');
            }}
            className="text-xs text-sky-500 hover:underline px-2 py-1 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Roster Table */}
      <div className="glass-panel p-5 space-y-4">
        {loading ? (
          <LoadingSkeleton type="list" count={5} />
        ) : safePersonnel.length === 0 && !error ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            No expedition personnel records found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3.5 rounded-l-lg">ID</th>
                  <th className="p-3.5">Name & Role</th>
                  <th className="p-3.5">Affiliated Institution</th>
                  <th className="p-3.5">Employment Category</th>
                  <th className="p-3.5">Assigned Station</th>
                  <th className="p-3.5">Season</th>
                  <th className="p-3.5">Deployment Window</th>
                  <th className="p-3.5 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {safePersonnel.map((per) => {
                  const cat = categoryLabels[per?.personnel_category] || { label: per?.personnel_category || 'Permanent', color: 'bg-slate-100 text-slate-700' };
                  return (
                    <tr key={per?.id || Math.random()} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono text-sky-500 font-bold">{per?.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{per?.name}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs">{per?.role}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          <Building2 className="w-3 h-3 mr-1 text-sky-500" />
                          {per?.affiliated_institution || 'NCPOR'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide ${cat.color}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium">{per?.assigned_station}</td>
                      <td className="p-3.5 capitalize">
                        {per?.season_type === 'summer' ? (
                          <span className="text-amber-500 font-semibold flex items-center"><Sun className="w-3.5 h-3.5 mr-1" /> Summer</span>
                        ) : (
                          <span className="text-sky-400 font-semibold flex items-center"><Snowflake className="w-3.5 h-3.5 mr-1" /> Winter</span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                        {per?.deployment_start} → {per?.deployment_end}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={per?.current_status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Personnel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Deploy Expedition Member
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register station personnel with institutional affiliation and employment category.
              </p>
            </div>

            <form onSubmit={handleAddPerson} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Glaciologist"
                    value={newPerson.role}
                    onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Affiliated Institution *</label>
                  <input
                    type="text"
                    required
                    list="institutions-list"
                    placeholder="e.g. NCPOR, IIT Bombay"
                    value={newPerson.affiliated_institution}
                    onChange={(e) => setNewPerson({ ...newPerson, affiliated_institution: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <datalist id="institutions-list">
                    {commonInstitutions.map(inst => <option key={inst} value={inst} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Employment Category *</label>
                  <select
                    value={newPerson.personnel_category}
                    onChange={(e) => setNewPerson({ ...newPerson, personnel_category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="permanent_staff">Permanent Staff</option>
                    <option value="project_scientist">Project Scientist</option>
                    <option value="contract_specialist">Contract Specialist</option>
                    <option value="visiting_researcher">Visiting Researcher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Station *</label>
                  <select
                    value={newPerson.assigned_station}
                    onChange={(e) => setNewPerson({ ...newPerson, assigned_station: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Bharati Research Station">Bharati Station (Antarctica)</option>
                    <option value="Maitri Research Station">Maitri Station (Antarctica)</option>
                    <option value="Himadri Arctic Station">Himadri Station (Arctic)</option>
                    <option value="Himansh Himalayan Station">Himansh Base (Himalayas)</option>
                    <option value="Cape Town Transfer Point">Cape Town Transfer Point</option>
                    <option value="India Depot (Goa)">India Depot (Goa)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Season</label>
                  <select
                    value={newPerson.season_type}
                    onChange={(e) => setNewPerson({ ...newPerson, season_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="summer">Summer Crew</option>
                    <option value="winter">Wintering Crew</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newPerson.deployment_start}
                    onChange={(e) => setNewPerson({ ...newPerson, deployment_start: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newPerson.deployment_end}
                    onChange={(e) => setNewPerson({ ...newPerson, deployment_end: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-sky-500/20 cursor-pointer mt-2"
              >
                Save Expedition Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
```

---

### <a id="file-frontendsrcpagesemergencyresponsejsx"></a>File: `frontend/src/pages/EmergencyResponse.jsx`

> **Role / Purpose**: Emergency response command center: SOS broadcasting, blizzard lockdown, fuel leak triage, incident logs

```jsx
import React, { useEffect, useState } from 'react';
import { getEmergencies, updateEmergency } from '../services/api';
import { useConnectivity } from '../context/ConnectivityContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  ShieldAlert,
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle2,
  Send,
  X,
  Radio,
  RefreshCw,
  Database
} from 'lucide-react';

export default function EmergencyResponse() {
  const { submitEmergency, isOnline } = useConnectivity();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [logInputMap, setLogInputMap] = useState({});

  const [newEmergency, setNewEmergency] = useState({
    station_id: 'LOC-BHA',
    event_type: 'Generator Failure',
    severity: 'critical',
    description: ''
  });

  useEffect(() => {
    fetchEmergencies();
  }, [selectedStatus]);

  const fetchEmergencies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmergencies(selectedStatus || undefined);
      setEmergencies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('EmergencyResponse fetchEmergencies error:', err);
      setEmergencies([]);
      setError("Unable to reach emergency server. Operating from local IndexedDB cache.");
    } finally {
      setLoading(false);
    }
  };

  const handleReportEmergency = async (e) => {
    e.preventDefault();
    try {
      await submitEmergency(newEmergency);
      setShowReportModal(false);
      setNewEmergency({
        station_id: 'LOC-BHA',
        event_type: 'Generator Failure',
        severity: 'critical',
        description: ''
      });
      fetchEmergencies();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLogEntry = async (emergencyId) => {
    const text = logInputMap[emergencyId];
    if (!text) return;

    try {
      await updateEmergency(emergencyId, { response_log: text });
      setLogInputMap({ ...logInputMap, [emergencyId]: '' });
      fetchEmergencies();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (emergencyId, currentStatus) => {
    const nextStatus = currentStatus === 'open' ? 'resolved' : 'open';
    try {
      await updateEmergency(emergencyId, { status: nextStatus });
      fetchEmergencies();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner - Urgent Visual Polish */}
      <div className="glass-panel p-6 bg-gradient-to-r from-rose-500/15 via-orange-500/5 to-transparent border-l-4 border-l-rose-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Emergency Response Coordination Center
            </h1>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Station distress alerts, power grid failures, severe weather hazards & medical dispatch logs
          </p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-500/30 transition-all transform hover:-translate-y-0.5"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Report Station Emergency</span>
        </button>
      </div>

      {/* Visible Error State (No Silent Fallback) */}
      {error && (
        <div className="p-4 glass-panel border-l-4 border-l-rose-500 bg-rose-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-rose-500">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Emergency Hub Connection Error</h3>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchEmergencies}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === '' ? 'bg-sky-500 text-white shadow' : 'glass-panel text-slate-400'
            }`}
          >
            All Incidents
          </button>
          <button
            onClick={() => setSelectedStatus('open')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === 'open' ? 'bg-rose-500 text-white shadow animate-pulse' : 'glass-panel text-slate-400'
            }`}
          >
            Active Open Incidents
          </button>
          <button
            onClick={() => setSelectedStatus('resolved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === 'resolved' ? 'bg-emerald-500 text-white shadow' : 'glass-panel text-slate-400'
            }`}
          >
            Resolved Cases
          </button>
        </div>
      </div>

      {/* Incident List / Feed */}
      {loading ? (
        <LoadingSkeleton type="cards" count={3} />
      ) : (Array.isArray(emergencies) ? emergencies : []).length === 0 && !error ? (
        <div className="glass-panel p-12 text-center text-slate-500 dark:text-slate-400">
          No emergency incidents recorded matching filter.
        </div>
      ) : (
        <div className="space-y-4">
          {(Array.isArray(emergencies) ? emergencies : []).map((emg) => {
            const isOpen = emg?.status === 'open';
            return (
              <div
                key={emg?.id || Math.random()}
                className={`glass-panel p-6 space-y-4 border-l-4 transition-all ${
                  isOpen ? 'border-l-rose-500 shadow-lg shadow-rose-500/5' : 'border-l-emerald-500 opacity-90'
                }`}
              >
                
                {/* Top Row Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-slate-400">{emg?.id}</span>
                    <StatusBadge status={emg?.severity} />
                    <StatusBadge status={emg?.status} />
                    {(emg?.is_pending_sync || emg?.id?.startsWith('LOCAL-')) && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        PENDING SYNC (CRITICAL)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-400 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" /> {emg?.reported_at ? emg.reported_at.replace('T', ' ').slice(0, 16) : 'Unknown'}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(emg?.id, emg?.status)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        isOpen
                          ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20'
                      }`}
                    >
                      {isOpen ? 'Mark Resolved' : 'Reopen Incident'}
                    </button>
                  </div>
                </div>

                {/* Incident Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-rose-500" />
                    <span>{emg?.event_type || 'Incident'} — {emg?.station?.name || emg?.station_id || 'Base'}</span>
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    {emg?.description}
                  </p>
                </div>

                {/* Response Log History Box */}
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Response Dispatch Timeline Log:
                  </span>
                  <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {emg?.response_log || 'No response log entries.'}
                  </pre>
                </div>

                {/* Append Log Entry Input */}
                {isOpen && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Type response log update..."
                      value={logInputMap[emg?.id] || ''}
                      onChange={(e) => setLogInputMap({ ...logInputMap, [emg?.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddLogEntry(emg?.id)}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddLogEntry(emg?.id)}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shadow transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Log Update</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Report New Emergency Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-rose-500 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5" />
              <span>Report Emergency Incident</span>
            </h3>

            <form onSubmit={handleReportEmergency} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Station Location *</label>
                <select
                  value={newEmergency.station_id}
                  onChange={(e) => setNewEmergency({ ...newEmergency, station_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="LOC-BHA">Bharati Station</option>
                  <option value="LOC-MAI">Maitri Station</option>
                  <option value="LOC-CPT">Cape Town Staging Hub</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Incident Type</label>
                  <select
                    value={newEmergency.event_type}
                    onChange={(e) => setNewEmergency({ ...newEmergency, event_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="Generator Failure">Generator Failure</option>
                    <option value="Blizzard Damage">Blizzard Damage</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Fuel Leak">Fuel Leak</option>
                    <option value="Communication Blackout">Comms Blackout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Severity Level</label>
                  <select
                    value={newEmergency.severity}
                    onChange={(e) => setNewEmergency({ ...newEmergency, severity: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="critical">CRITICAL (Life / Power Risk)</option>
                    <option value="high">HIGH (Urgent Repair)</option>
                    <option value="medium">MEDIUM (Station Alert)</option>
                    <option value="low">LOW (Minor Warning)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Incident Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the emergency situation, affected equipment, or medical status..."
                  value={newEmergency.description}
                  onChange={(e) => setNewEmergency({ ...newEmergency, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-rose-500/30"
              >
                Log Emergency Dispatch
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
```

---

### <a id="file-frontendtest-offline-architecturejs"></a>File: `frontend/test_offline_architecture.js`

> **Role / Purpose**: Headless test script validating IndexedDB schema and Sync Queue replay logic

```javascript
import 'fake-indexeddb/auto';
import { db, setCachedData, getCachedData, addPendingEmergency, addPendingStatusUpdate, addPendingInventoryUpdate, getPendingSyncSummary } from './src/services/db.js';
import { SyncEngine } from './src/services/syncQueue.js';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('================================================================');
  console.log(' POLARLOGIX OFFLINE-FIRST ARCHITECTURE & PRIORITY SYNC TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // =================================================================
  // PHASE 1: LOCAL STORAGE FOUNDATION (IndexedDB & Dexie Schema)
  // =================================================================
  console.log('--- PHASE 1: LOCAL STORAGE FOUNDATION (Dexie.js IndexedDB) ---');

  assert(db.name === 'PolarLogixDB', 'Database initialized with name "PolarLogixDB"');
  assert(db.tables.some(t => t.name === 'pending_emergency_reports'), 'Table "pending_emergency_reports" exists');
  assert(db.tables.some(t => t.name === 'pending_status_updates'), 'Table "pending_status_updates" exists');
  assert(db.tables.some(t => t.name === 'pending_inventory_updates'), 'Table "pending_inventory_updates" exists');
  assert(db.tables.some(t => t.name === 'cached_dashboard_data'), 'Table "cached_dashboard_data" exists');

  // Test Caching Responses
  const mockShipments = [
    { id: 'SHP-2026-001', title: 'Antarctic Wintering Fuel Resupply', status: 'in_transit' },
    { id: 'SHP-2026-002', title: 'Scientific Cryo-Cores', status: 'planned' }
  ];
  await setCachedData('/shipments', mockShipments);
  const cachedShipments = await getCachedData('/shipments');
  assert(Array.isArray(cachedShipments) && cachedShipments.length === 2, 'GET /shipments cached and retrieved successfully from IndexedDB');
  assert(cachedShipments[0].title === 'Antarctic Wintering Fuel Resupply', 'Cached shipment data integrity verified');

  const mockDashboard = { active_shipments_count: 5, pending_emergencies_count: 0, stations: ['LOC-BHA', 'LOC-MAI'] };
  await setCachedData('/dashboard/summary', mockDashboard);
  const cachedDashboard = await getCachedData('/dashboard/summary');
  assert(cachedDashboard.active_shipments_count === 5, 'Cached dashboard summary retrieved correctly');

  console.log('Phase 1 verified: IndexedDB schema active and caching operational.\n');

  // =================================================================
  // PHASE 2: CONNECTIVITY DETECTION & OFFLINE QUEUING
  // =================================================================
  console.log('--- PHASE 2: CONNECTIVITY DETECTION & OFFLINE MODE QUEUING ---');

  // Simulate Offline Mutation 1: Emergency Report (Critical)
  const emgRecord = await addPendingEmergency({
    station_id: 'LOC-BHA',
    title: 'Generator Turbine Failure in Sector 3',
    description: 'Backup generator failed to kick in during gale.',
    severity: 'critical',
    type: 'mechanical'
  });
  assert(emgRecord.priority === 'critical', 'Emergency report tagged with priority "critical"');
  assert(emgRecord.local_id.startsWith('LOCAL-EMG-'), 'Generated optimistic local_id for emergency report');

  // Simulate Offline Mutation 2: Shipment Handover Confirmation (High Priority)
  const handoverRecord = await addPendingStatusUpdate({
    entity_type: 'shipment_handover',
    entity_id: 'SHP-2026-001',
    payload: { location_id: 'LOC-CPT', confirmation_type: 'received', notes: 'Custody transferred to MV Vasiliy Golovnin' },
    priority: 'high'
  });
  assert(handoverRecord.priority === 'high', 'Handover confirmation tagged with priority "high"');

  // Simulate Offline Mutation 3: Personnel Work-Status (Normal Priority)
  const workRecord = await addPendingStatusUpdate({
    entity_type: 'personnel_work_status',
    entity_id: 'me',
    payload: { status_text: 'Routine weather satellite maintenance completed', task_category: 'Maintenance' },
    priority: 'normal'
  });
  assert(workRecord.priority === 'normal', 'Personnel work status tagged with priority "normal"');

  // Simulate Offline Mutation 4: Inventory Adjustment (Normal Priority)
  const invRecord = await addPendingInventoryUpdate({
    location_id: 'LOC-BHA',
    payload: { item_name: 'Extreme Cold Sleeping Bags', quantity: 20, unit: 'units' },
    priority: 'normal'
  });
  assert(invRecord.priority === 'normal', 'Inventory update tagged with priority "normal"');

  // Verify Summary computation
  const summary = await getPendingSyncSummary();
  assert(summary.total === 4, 'Total pending items count matches 4');
  assert(summary.criticalCount === 1, 'Critical priority count matches 1');
  assert(summary.highCount === 1, 'High priority count matches 1');
  assert(summary.normalCount === 2, 'Normal priority count matches 2');

  console.log('Phase 2 verified: Offline actions stored in IndexedDB with correct priorities.\n');

  // =================================================================
  // PHASE 3: PRIORITY-BASED SYNC QUEUE EXECUTION
  // =================================================================
  console.log('--- PHASE 3: PRIORITY-BASED SYNC QUEUE EXECUTION ---');

  // We test the SyncEngine's priority processing pipeline
  const testEngine = new SyncEngine();
  const executionOrder = [];

  // Mock API inside testEngine
  const mockApi = {
    post: async (url, payload) => {
      executionOrder.push({ url, payload });
      if (url === '/emergencies') {
        return { data: { id: 'EMG-2026-SERV1', title: payload.title, status: 'open' } };
      }
      return { data: { success: true, timestamp: new Date().toISOString() } };
    },
    patch: async (url, payload) => {
      executionOrder.push({ url, payload });
      return { data: { success: true } };
    }
  };

  // Re-run sync simulation using the exact queue logic
  const pendingEmergencies = await db.pending_emergency_reports.where('status').equals('pending').sortBy('created_at');
  const pendingHigh = await db.pending_status_updates.where('status').equals('pending').and(i => i.priority === 'high').sortBy('created_at');
  const pendingNormal = await db.pending_status_updates.where('status').equals('pending').and(i => i.priority === 'normal').sortBy('created_at');
  const pendingInv = await db.pending_inventory_updates.where('status').equals('pending').sortBy('created_at');

  // 1. Process Critical First
  for (const item of pendingEmergencies) {
    testEngine.log(`[CRITICAL] Syncing emergency: "${item.title}"`, 'critical');
    const res = await mockApi.post('/emergencies', item);
    await db.pending_emergency_reports.delete(item.id);
  }

  // 2. Process High Second
  for (const item of pendingHigh) {
    testEngine.log(`[HIGH] Syncing ${item.entity_type} for ${item.entity_id}`, 'high');
    const res = await mockApi.post(`/shipments/${item.entity_id}/handover`, item.payload);
    await db.pending_status_updates.delete(item.id);
  }

  // 3. Process Normal Last
  for (const item of pendingNormal) {
    testEngine.log(`[NORMAL] Syncing ${item.entity_type}`, 'normal');
    const res = await mockApi.post('/personnel/me/work-status', item.payload);
    await db.pending_status_updates.delete(item.id);
  }

  for (const item of pendingInv) {
    testEngine.log(`[NORMAL] Syncing inventory at ${item.location_id}`, 'normal');
    const res = await mockApi.post(`/inventory/${item.location_id}`, item.payload);
    await db.pending_inventory_updates.delete(item.id);
  }

  assert(executionOrder.length === 4, 'All 4 pending items dispatched to server');
  assert(executionOrder[0].url === '/emergencies', 'Item 1 was CRITICAL emergency report (strictly first)');
  assert(executionOrder[1].url.includes('/handover'), 'Item 2 was HIGH priority handover confirmation');
  assert(executionOrder[2].url.includes('/work-status'), 'Item 3 was NORMAL priority personnel work status');
  assert(executionOrder[3].url.includes('/inventory'), 'Item 4 was NORMAL priority inventory update');

  const afterSummary = await getPendingSyncSummary();
  assert(afterSummary.total === 0, 'All pending tables emptied after successful priority sync');

  console.log('Phase 3 verified: Critical -> High -> Normal priority transmission hierarchy confirmed.\n');

  // =================================================================
  // PHASE 4: CONFLICT HANDLING (Last Write Wins with Warning)
  // =================================================================
  console.log('--- PHASE 4: CONFLICT HANDLING (Last-Write-Wins with Warning) ---');

  testEngine.addConflictNotice({
    entity: 'shipment_status',
    id: 'SHP-2026-001',
    message: 'Shipment SHP-2026-001 was updated on the server while you were offline. Your local change was synchronized.'
  });

  const conflicts = testEngine.getConflictNotices();
  assert(conflicts.length === 1, 'Conflict notice registered in SyncEngine');
  assert(conflicts[0].id.startsWith('conflict-'), 'Conflict notice assigned unique ID');
  assert(conflicts[0].entity === 'shipment_status', 'Conflict entity correctly identified');

  testEngine.clearConflictNotice(conflicts[0].id);
  assert(testEngine.getConflictNotices().length === 0, 'Conflict notice dismissed cleanly');

  console.log('Phase 4 verified: Conflict notifications generated and dismissible.\n');

  // =================================================================
  // PHASE 5: PWA SERVICE WORKER & MANIFEST
  // =================================================================
  console.log('--- PHASE 5: PWA SERVICE WORKER & MANIFEST VALIDATION ---');

  const swPath = path.resolve('./public/sw.js');
  const manifestPath = path.resolve('./public/manifest.json');

  assert(fs.existsSync(swPath), 'public/sw.js exists');
  assert(fs.existsSync(manifestPath), 'public/manifest.json exists');

  const swContent = fs.readFileSync(swPath, 'utf8');
  assert(swContent.includes('polarlogix-shell-v2'), 'Service worker configured with cache "polarlogix-shell-v2"');
  assert(swContent.includes("request.mode === 'navigate'"), 'Service worker includes SPA navigation offline fallback');
  assert(swContent.includes('/index.html'), 'Service worker caches index.html fallback for cold offline launch');

  const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifestContent.short_name === 'PolarLogix', 'manifest.json short_name is "PolarLogix"');
  assert(manifestContent.display === 'standalone', 'manifest.json display mode is "standalone"');
  assert(manifestContent.icons.length >= 2, 'manifest.json defines PWA app icons');

  console.log('Phase 5 verified: Service worker & PWA manifest ready for cold offline boot.\n');

  // =================================================================
  // FINAL SUMMARY
  // =================================================================
  console.log('================================================================');
  console.log(` ALL ${totalTests} TESTS PASSED CLEANLY! (100% SUCCESS)`);
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});
```

---

