import 'leaflet/dist/leaflet.css';

import { divIcon, latLngBounds } from 'leaflet';
import { useEffect } from 'react';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';

export type LiveMapPoint = {
  lat: number;
  lng: number;
};

export type LiveMapProps = {
  currentPosition?: LiveMapPoint | null;
  sourcePosition?: LiveMapPoint | null;
  destinationPosition?: LiveMapPoint | null;
  routePoints?: LiveMapPoint[];
  halts?: Array<LiveMapPoint & { name: string; day: number; sequence: number; type: string; arrival?: string | null; departure?: string | null }>;
  supportLocations?: Array<LiveMapPoint & { type: 'FOOD' | 'WATER'; label?: string }>;
  providerLocations?: Array<LiveMapPoint & { name: string; serviceType?: string | null; availability?: string | null; foodCapacity?: number | null; waterCapacity?: number | null }>;
};

const createMarkerIcon = (color: string) =>
  divIcon({
    className: '',
    html: `
      <span style="
        display: inline-block;
        width: 18px;
        height: 18px;
        border-radius: 9999px;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.08), 0 8px 16px rgba(15, 23, 42, 0.18);
        box-sizing: border-box;
      " />
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

const providerMarkerIcon = (serviceType: string | null | undefined, foodCapacity: number | null | undefined, waterCapacity: number | null | undefined) => {
  const type = String(serviceType || '').toUpperCase();
  const hasFood = type === 'FOOD' || type === 'BOTH' || Number(foodCapacity) > 0;
  const hasWater = type === 'WATER' || type === 'BOTH' || Number(waterCapacity) > 0;
  const emoji = hasFood && hasWater ? '🍱💧' : hasFood ? '🍱' : hasWater ? '💧' : '●';
  const color = hasFood && hasWater ? '#7c3aed' : hasFood ? '#f97316' : hasWater ? '#06b6d4' : '#64748b';
  return divIcon({ className: '', html: `<span style="display:inline-grid;place-items:center;min-width:24px;height:24px;padding:2px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 4px 12px rgba(15,23,42,.22);font-size:12px;line-height:1">${emoji}</span>`, iconSize: [24, 24], iconAnchor: [12, 12] });
};

function FitMapToPoints({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return;
    }

    const bounds = latLngBounds(points);
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
  }, [map, points]);

  return null;
}

export function LiveMap({
  currentPosition,
  sourcePosition,
  destinationPosition,
  routePoints,
  halts = [],
  supportLocations = [],
  providerLocations = [],
}: LiveMapProps) {
  const routeCoordinates = (routePoints ?? []).map((point) => [point.lat, point.lng] as [number, number]);
  const markerPoints = [sourcePosition, destinationPosition, currentPosition, ...halts, ...supportLocations, ...providerLocations]
    .filter((point): point is LiveMapPoint => Boolean(point))
    .map((point) => [point.lat, point.lng] as [number, number]);
  const center = currentPosition ?? sourcePosition ?? destinationPosition ?? { lat: 20.5937, lng: 78.9629 };

  return (
    <div className="h-[320px] w-full overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 sm:h-[420px]">
      <MapContainer center={[center.lat, center.lng]} scrollWheelZoom className="h-full w-full" zoom={7}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routeCoordinates.length > 1 ? <Polyline positions={routeCoordinates} color="#0ea5e9" weight={5} opacity={0.85} /> : null}
        {sourcePosition ? <Marker position={[sourcePosition.lat, sourcePosition.lng]} icon={createMarkerIcon('#22c55e')}><Popup>Start</Popup></Marker> : null}
        {currentPosition ? <Marker position={[currentPosition.lat, currentPosition.lng]} icon={createMarkerIcon('#0284c7')}><Popup>Current Wari location</Popup></Marker> : null}
        {destinationPosition ? <Marker position={[destinationPosition.lat, destinationPosition.lng]} icon={createMarkerIcon('#475569')}><Popup>Destination</Popup></Marker> : null}
        {halts.map((halt) => <Marker key={`halt-${halt.name}-${halt.sequence}`} position={[halt.lat, halt.lng]} icon={createMarkerIcon('#a855f7')}><Popup><strong>{halt.name}</strong><br />Day {halt.day} · Stop {halt.sequence}<br />{halt.type}{halt.arrival ? <><br />Arrival: {halt.arrival}</> : null}{halt.departure ? <><br />Departure: {halt.departure}</> : null}</Popup></Marker>)}
        {supportLocations.map((location, index) => <CircleMarker key={`support-${location.type}-${location.lat}-${location.lng}-${index}`} center={[location.lat, location.lng]} radius={7} pathOptions={{ color: location.type === 'FOOD' ? '#f97316' : '#06b6d4', fillColor: location.type === 'FOOD' ? '#fb923c' : '#22d3ee', fillOpacity: 0.85 }}><Popup>{location.type === 'FOOD' ? 'Food support' : 'Water support'}{location.label ? <><br />{location.label}</> : null}</Popup></CircleMarker>)}
        {providerLocations.map((provider) => <Marker key={`provider-${provider.name}-${provider.lat}-${provider.lng}`} position={[provider.lat, provider.lng]} icon={providerMarkerIcon(provider.serviceType, provider.foodCapacity, provider.waterCapacity)}><Popup><strong>{provider.name}</strong><br />{provider.serviceType || 'Service Provider'}<br />Food: {Number(provider.foodCapacity) > 0 ? `${provider.foodCapacity} packets` : 'Not available'}<br />Water: {Number(provider.waterCapacity) > 0 ? `${provider.waterCapacity} litres` : 'Not available'}<br />Status: {provider.availability || 'Unknown'}<br />📍 {provider.lat.toFixed(6)}, {provider.lng.toFixed(6)}</Popup></Marker>)}
        <FitMapToPoints points={routeCoordinates.length > 1 ? routeCoordinates : markerPoints} />
      </MapContainer>
    </div>
  );
}

export default LiveMap;
