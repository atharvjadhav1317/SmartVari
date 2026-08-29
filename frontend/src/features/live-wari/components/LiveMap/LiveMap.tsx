import 'leaflet/dist/leaflet.css';

import { divIcon, latLngBounds } from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';

export type LiveMapPoint = {
  lat: number;
  lng: number;
};

export type LiveMapProps = {
  currentPosition: LiveMapPoint;
  sourcePosition: LiveMapPoint;
  destinationPosition: LiveMapPoint;
  routePoints?: LiveMapPoint[];
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
}: LiveMapProps) {
  const routeCoordinates = routePoints && routePoints.length > 0
    ? routePoints.map((point) => [point.lat, point.lng] as [number, number])
    : [
        [sourcePosition.lat, sourcePosition.lng] as [number, number],
        [currentPosition.lat, currentPosition.lng] as [number, number],
        [destinationPosition.lat, destinationPosition.lng] as [number, number],
      ];

  const allPoints = [
    [sourcePosition.lat, sourcePosition.lng],
    [currentPosition.lat, currentPosition.lng],
    [destinationPosition.lat, destinationPosition.lng],
  ] as [number, number][];

  return (
    <div className="h-[320px] w-full overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 sm:h-[420px]">
      <MapContainer center={[currentPosition.lat, currentPosition.lng]} scrollWheelZoom className="h-full w-full" zoom={12}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[sourcePosition.lat, sourcePosition.lng]} icon={createMarkerIcon('#22c55e')} />
        <Marker position={[currentPosition.lat, currentPosition.lng]} icon={createMarkerIcon('#0284c7')} />
        <Marker position={[destinationPosition.lat, destinationPosition.lng]} icon={createMarkerIcon('#475569')} />
        <Polyline positions={routeCoordinates} color="#0ea5e9" weight={5} opacity={0.8} />
        <FitMapToPoints points={allPoints} />
      </MapContainer>
    </div>
  );
}

export default LiveMap;
