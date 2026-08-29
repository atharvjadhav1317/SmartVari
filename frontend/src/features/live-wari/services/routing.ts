export type RoutePoint = {
  lat: number;
  lng: number;
};

export type RoadRouteResult = {
  coordinates: Array<[number, number]>;
  distance: number;
  duration: number;
  waypoints: RoutePoint[];
  geometry: Array<[number, number]>;
};

const decodePolyline = (encoded: string): Array<[number, number]> => {
  const coordinates: Array<[number, number]> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
};

export async function fetchRoadRoute(points: RoutePoint[]): Promise<RoadRouteResult> {
  if (points.length < 2) {
    throw new Error('At least two route points are required for OSRM routing.');
  }

  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`OSRM route request failed with status ${response.status}`);
  }

  const data = await response.json();
  const route = data?.routes?.[0];

  if (!route) {
    throw new Error('OSRM returned no route geometry.');
  }

  const geometry = Array.isArray(route.geometry?.coordinates)
    ? route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number])
    : Array.isArray(route.geometry) && typeof route.geometry[0] === 'string'
      ? decodePolyline(route.geometry[0]).map(([lat, lng]) => [lat, lng] as [number, number])
      : points.map((point) => [point.lat, point.lng] as [number, number]);

  return {
    coordinates: geometry,
    distance: Number(route.distance ?? 0),
    duration: Number(route.duration ?? 0),
    waypoints: points,
    geometry,
  };
}
