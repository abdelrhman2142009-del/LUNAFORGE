// Simplified two-body circular-orbit model for the LUNAFORGE educational game.
// Constants are standard approximations; perturbations, drag and maneuvering are omitted.
export const EARTH_MU_KM3_S2 = 398600.4418;
export const EARTH_RADIUS_KM = 6371;
export const EARTH_ROTATION_RAD_S = 7.2921159e-5;
export const DEFAULT_ORBIT = Object.freeze({
  altitudeKm: 500,
  inclinationDeg: 51.6,
  raanDeg: 0,
  initialPhaseDeg: 35,
});

const toRadians = (degrees) => (degrees * Math.PI) / 180;
const toDegrees = (radians) => (radians * 180) / Math.PI;
const wrapLongitude = (degrees) => ((degrees + 540) % 360) - 180;

export function getOrbitPeriodSeconds(altitudeKm = DEFAULT_ORBIT.altitudeKm) {
  const radiusKm = EARTH_RADIUS_KM + altitudeKm;
  return 2 * Math.PI * Math.sqrt((radiusKm ** 3) / EARTH_MU_KM3_S2);
}

export function calculateOrbitalState(elapsedSeconds = 0, options = {}) {
  const config = { ...DEFAULT_ORBIT, ...options };
  const radiusKm = EARTH_RADIUS_KM + config.altitudeKm;
  const meanMotion = Math.sqrt(EARTH_MU_KM3_S2 / (radiusKm ** 3));
  const phase = toRadians(config.initialPhaseDeg) + meanMotion * elapsedSeconds;
  const inclination = toRadians(config.inclinationDeg);
  const raan = toRadians(config.raanDeg);

  // Position in an inertial frame for a circular orbit.
  const orbitalX = Math.cos(phase);
  const orbitalY = Math.sin(phase);
  const x = radiusKm * (Math.cos(raan) * orbitalX - Math.sin(raan) * orbitalY * Math.cos(inclination));
  const y = radiusKm * (Math.sin(raan) * orbitalX + Math.cos(raan) * orbitalY * Math.cos(inclination));
  const z = radiusKm * orbitalY * Math.sin(inclination);

  // Approximate Earth-fixed ground track by subtracting Earth's rotation.
  const earthFixedLongitude = Math.atan2(y, x) - EARTH_ROTATION_RAD_S * elapsedSeconds;
  const latitudeRad = Math.atan2(z, Math.sqrt(x * x + y * y));
  const phaseDegrees = ((toDegrees(phase) % 360) + 360) % 360;

  return {
    elapsedSeconds,
    altitudeKm: config.altitudeKm,
    orbitalRadiusKm: radiusKm,
    periodSeconds: getOrbitPeriodSeconds(config.altitudeKm),
    phaseDeg: phaseDegrees,
    latitudeDeg: toDegrees(latitudeRad),
    longitudeDeg: wrapLongitude(toDegrees(earthFixedLongitude)),
    positionEciKm: { x, y, z },
  };
}

export function angularDistanceDegrees(a, b) {
  const lat1 = toRadians(a.latitudeDeg);
  const lat2 = toRadians(b.latitudeDeg);
  const deltaLat = lat2 - lat1;
  const deltaLon = toRadians(wrapLongitude(b.longitudeDeg - a.longitudeDeg));
  const haversine = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return toDegrees(2 * Math.asin(Math.min(1, Math.sqrt(haversine))));
}

export function isWithinGroundFootprint(state, target, radiusDeg = 7) {
  return angularDistanceDegrees(state, target) <= radiusDeg;
}
