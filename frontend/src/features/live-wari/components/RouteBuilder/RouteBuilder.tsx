import 'leaflet/dist/leaflet.css';

import { divIcon, latLngBounds } from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet';

export type RoutePoint = {
  lat: number;
  lng: number;
};

export type Checkpoint = {
  name: string;
  lat: number;
  lng: number;
};

type RouteBuilderProps = {
  routePoints: RoutePoint[];
  checkpoints: Checkpoint[];
  checkpointName: string;
  onCheckpointNameChange: (value: string) => void;
  onAddPoint: (point: RoutePoint) => void;
  onUndoLastPoint: () => void;
  onClearRoute: () => void;
  onAddCheckpoint: () => void;
  onRemoveCheckpoint: (index: number) => void;
};

const defaultCenter: [number, number] = [18.5204, 73.8567];

const createMarkerIcon = (color: string, label?: string) =>
  divIcon({
    className: '',
    html: `
      <span style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 9999px;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.08), 0 8px 16px rgba(15, 23, 42, 0.18);
        box-sizing: border-box;
        color: white;
        font-size: 9px;
        font-weight: 700;
      ">${label ?? ''}</span>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

function MapClickHandler({ onAddPoint }: { onAddPoint: (point: RoutePoint) => void }) {
  useMapEvents({
    click(event) {
      onAddPoint({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

function FitMapToPoints({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length < 2) {
      return;
    }

    const bounds = latLngBounds(points);
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
  }, [map, points]);

  return null;
}

export function RouteBuilder({
  routePoints,
  checkpoints,
  checkpointName,
  onCheckpointNameChange,
  onAddPoint,
  onUndoLastPoint,
  onClearRoute,
  onAddCheckpoint,
  onRemoveCheckpoint,
}: RouteBuilderProps) {
  const routeCoordinates = routePoints.map((point) => [point.lat, point.lng] as [number, number]);

  const mapCenter = routePoints.length > 0
    ? ([routePoints[0].lat, routePoints[0].lng] as [number, number])
    : defaultCenter;

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Route Builder</h2>
            <p className="text-sm text-slate-600">Click the map to add route points in order.</p>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span className="rounded-full bg-slate-100 px-2.5 py-1">Route Points: {routePoints.length}</span>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onUndoLastPoint}
            disabled={routePoints.length === 0}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            Undo Last Point
          </button>

          <button
            type="button"
            onClick={onClearRoute}
            disabled={routePoints.length === 0}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            Clear Route
          </button>
        </div>

        <div className="h-[420px] w-full overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
          <MapContainer center={mapCenter} zoom={6} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler onAddPoint={onAddPoint} />

            {routePoints.map((point, index) => (
              <Marker
                key={`${point.lat}-${point.lng}-${index}`}
                position={[point.lat, point.lng]}
                icon={createMarkerIcon('#0ea5e9', String(index + 1))}
              />
            ))}

            {routePoints.length >= 2 ? (
              <Polyline positions={routeCoordinates} color="#0ea5e9" weight={5} opacity={0.9} />
            ) : null}

            {routePoints.length >= 2 ? <FitMapToPoints points={routeCoordinates} /> : null}

            {checkpoints.map((checkpoint, index) => (
              <Marker
                key={`${checkpoint.name}-${checkpoint.lat}-${checkpoint.lng}-${index}`}
                position={[checkpoint.lat, checkpoint.lng]}
                icon={createMarkerIcon('#f59e0b')}
              />
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Checkpoints</h3>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="checkpoint-name" className="mb-1 block text-sm font-medium text-slate-700">
              Checkpoint name
            </label>
            <input
              id="checkpoint-name"
              type="text"
              value={checkpointName}
              onChange={(event) => onCheckpointNameChange(event.target.value)}
              placeholder="e.g. Temple stop"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-150 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={onAddCheckpoint}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 sm:w-auto"
            >
              Add Checkpoint
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {checkpoints.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
              No checkpoints added yet.
            </p>
          ) : (
            checkpoints.map((checkpoint, index) => (
              <div
                key={`${checkpoint.name}-${checkpoint.lat}-${checkpoint.lng}-${index}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5"
              >
                <div>
                  <p className="font-medium text-slate-800">{checkpoint.name}</p>
                  <p className="text-xs text-slate-500">
                    {checkpoint.lat.toFixed(5)}, {checkpoint.lng.toFixed(5)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveCheckpoint(index)}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default RouteBuilder;
