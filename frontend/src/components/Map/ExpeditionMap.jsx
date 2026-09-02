import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Compass, Ship, Plane, Navigation, ShieldCheck } from 'lucide-react';

// Custom Leaflet Icons using SVG Data URIs
const createCustomIcon = (color, label) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#FFFFFF"></circle>
    </svg>
  `;
  return L.divIcon({
    html: `<div class="relative flex items-center justify-center">${svg}<span class="absolute -bottom-5 text-[10px] font-bold text-slate-800 dark:text-white bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded shadow border border-slate-300 dark:border-slate-700 whitespace-nowrap">${label}</span></div>`,
    className: 'custom-map-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const locationIcons = {
  'LOC-GOA': createCustomIcon('#0EA5E9', 'India Depot'),
  'LOC-CPT': createCustomIcon('#F59E0B', 'Cape Town'),
  'LOC-MAI': createCustomIcon('#34D399', 'Maitri Stn'),
  'LOC-BHA': createCustomIcon('#22D3EE', 'Bharati Stn')
};

const defaultLocations = [
  { id: 'LOC-GOA', name: 'India Depot (Goa)', lat: 15.3991, lng: 73.8052, type: 'Depot' },
  { id: 'LOC-CPT', name: 'Cape Town Transfer Point', lat: -33.9249, lng: 18.4241, type: 'Transfer Hub' },
  { id: 'LOC-MAI', name: 'Maitri Research Station', lat: -70.7667, lng: 11.7333, type: 'Station (Prydz Bay)' },
  { id: 'LOC-BHA', name: 'Bharati Research Station', lat: -69.4072, lng: 76.1896, type: 'Station (Larsemann Hills)' }
];

const legColors = {
  ship: '#3B82F6',
  aircraft: '#06B6D4',
  cargo_flight: '#8B5CF6',
  helicopter: '#10B981'
};

// Component to dynamically fit map bounds
function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [coords, map]);
  return null;
}

export default function ExpeditionMap({ activeRouteCoordinates = null, legs = [] }) {
  const [mapCenter] = useState([-20.0, 45.0]); // Centered over Indian Ocean / Southern Ocean

  // Fixed route lines for overview
  const defaultPolylines = [
    // Goa -> Cape Town (Ship)
    { from: [15.3991, 73.8052], to: [-33.9249, 18.4241], mode: 'ship', label: 'Sea Freight (14d)' },
    // Cape Town -> Maitri (Air & Ship)
    { from: [-33.9249, 18.4241], to: [-70.7667, 11.7333], mode: 'aircraft', label: 'Air Bridge (3d)' },
    // Cape Town -> Bharati (Air & Ship)
    { from: [-33.9249, 18.4241], to: [-69.4072, 76.1896], mode: 'ship', label: 'S.A. Agulhas II Voyage (20d)' },
    // Direct Cargo Flight Goa -> Bharati
    { from: [15.3991, 73.8052], to: [-69.4072, 76.1896], mode: 'cargo_flight', label: 'NCPOR Direct Cargo Flight (2d)' },
    // Inter-station Heli
    { from: [-70.7667, 11.7333], to: [-69.4072, 76.1896], mode: 'helicopter', label: 'Inter-Station Air Transfer (1d)' }
  ];

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
      
      {/* Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs space-y-1.5 shadow-md">
        <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Route Legend</div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1 bg-blue-500 rounded"></span>
          <span className="text-slate-600 dark:text-slate-400">Sea Freight Voyage</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1 bg-cyan-500 rounded"></span>
          <span className="text-slate-600 dark:text-slate-400">Intercontinental Air</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1 bg-purple-500 rounded"></span>
          <span className="text-slate-600 dark:text-slate-400">Direct Cargo Flight</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1 bg-emerald-500 rounded"></span>
          <span className="text-slate-600 dark:text-slate-400">Station Helicopter</span>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={3}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Locations Markers */}
        {defaultLocations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={locationIcons[loc.id] || createCustomIcon('#0EA5E9', loc.name)}
          >
            <Popup className="custom-popup">
              <div className="p-1 space-y-1">
                <div className="font-bold text-sm text-slate-900">{loc.name}</div>
                <div className="text-xs text-slate-600">Type: {loc.type}</div>
                <div className="text-[11px] text-sky-600 font-mono">
                  Coordinates: {loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Polylines */}
        {activeRouteCoordinates && activeRouteCoordinates.length > 1 ? (
          <>
            <Polyline
              positions={activeRouteCoordinates.map(c => [c.lat, c.lng])}
              pathOptions={{ color: '#0EA5E9', weight: 4, dashArray: '8, 8' }}
            />
            <FitBounds coords={activeRouteCoordinates} />
          </>
        ) : (
          defaultPolylines.map((line, idx) => (
            <Polyline
              key={idx}
              positions={[line.from, line.to]}
              pathOptions={{
                color: legColors[line.mode] || '#3B82F6',
                weight: line.mode === 'cargo_flight' ? 3 : 2.5,
                dashArray: line.mode === 'aircraft' ? '6, 6' : line.mode === 'cargo_flight' ? '4, 4' : undefined,
                opacity: 0.8
              }}
            >
              <Tooltip sticky>{line.label}</Tooltip>
            </Polyline>
          ))
        )}

      </MapContainer>
    </div>
  );
}
