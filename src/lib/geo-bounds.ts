const KM_PER_LATITUDE_DEGREE = 111;
export const MIN_NEARBY_RADIUS_KM = 0.1;
export const MAX_NEARBY_RADIUS_KM = 50;

export function parseNearbyRadius(value: string | null, fallback = 3): number | null {
  const radius = value === null ? fallback : Number(value);
  if (
    !Number.isFinite(radius) ||
    radius < MIN_NEARBY_RADIUS_KM ||
    radius > MAX_NEARBY_RADIUS_KM
  ) {
    return null;
  }
  return radius;
}

export function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

export function getCoordinateBounds(lat: number, lon: number, radiusKm: number) {
  const latitudeDelta = radiusKm / KM_PER_LATITUDE_DEGREE;
  const longitudeScale = Math.max(Math.abs(Math.cos((lat * Math.PI) / 180)), 0.01);
  const longitudeDelta = radiusKm / (KM_PER_LATITUDE_DEGREE * longitudeScale);

  return {
    minLat: Math.max(-90, lat - latitudeDelta),
    maxLat: Math.min(90, lat + latitudeDelta),
    minLon: Math.max(-180, lon - longitudeDelta),
    maxLon: Math.min(180, lon + longitudeDelta),
  };
}
