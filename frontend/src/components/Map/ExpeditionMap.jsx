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
      <div class="absolute -bottom-5 flex items-center space-x-1 bg-white/95 px-1.5 py-0.5 rounded shadow-md border border-slate-300 whitespace-nowrap">
        ${badge ? `<span class="text-[9px] font-extrabold uppercase px-1 rounded bg-sky-500/20 text-sky-600">${badge}</span>` : ''}
        <span class="text-[10px] font-bold text-slate-800">${label}</span>
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
    <div className="relative w-full h-[490px] rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
      
      {/* Map Header & Filter Badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 shadow-lg flex items-center space-x-2">
        <Globe className="w-4 h-4 text-sky-500 animate-spin-slow" />
        <span className="capitalize">
          {programmeFilter === 'all' ? 'All 4 NCPOR Field Stations' : programmeFilter.replace('_', ' ')}
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600">
          {displayedLocations.length} Active Nodes
        </span>
      </div>

      {/* Legend & Status Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-xl text-xs space-y-2 shadow-xl max-w-xs">
        <div className="font-bold text-slate-900 flex items-center justify-between">
          <span>Polar Route Network</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 font-semibold">
            NCPOR 2026
          </span>
        </div>
        
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500 flex-shrink-0"></span>
            <span className="text-slate-600">Antarctic (Maitri & Bharati)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0"></span>
            <span className="text-slate-600">Arctic (Himadri, Svalbard)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></span>
            <span className="text-slate-600">Himalayan (Himansh Glacier Base)</span>
          </div>
        </div>

        {weatherAdvisory && (
          <div className="pt-2 border-t border-slate-200 space-y-1">
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
