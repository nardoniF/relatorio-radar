const EARTH_RADIUS_M = 6_371_000;
export function toRad(deg) {
    return (deg * Math.PI) / 180;
}
export function toDeg(rad) {
    return (rad * 180) / Math.PI;
}
/** Distância haversine em metros. */
export function haversineM(a, b) {
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}
/** Azimute inicial a→b em graus [0, 360). */
export function bearingDeg(a, b) {
    const φ1 = toRad(a.lat);
    const φ2 = toRad(b.lat);
    const Δλ = toRad(b.lng - a.lng);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
/** Menor diferença angular absoluta entre dois headings (0–180). */
export function headingDeltaDeg(a, b) {
    const d = Math.abs((((a - b) % 360) + 360) % 360);
    return d > 180 ? 360 - d : d;
}
/**
 * Verifica se o heading do veículo combina com a direção do radar.
 * directionDeg null = aceita qualquer sentido.
 */
export function headingMatches(vehicleHeading, radarDirectionDeg, toleranceDeg = 60) {
    if (radarDirectionDeg == null)
        return true;
    if (vehicleHeading == null || !Number.isFinite(vehicleHeading))
        return true;
    return headingDeltaDeg(vehicleHeading, radarDirectionDeg) <= toleranceDeg;
}
/** True se heading aponta para o sentido oposto ao radar (fora da tolerância). */
export function isOppositeDirection(vehicleHeading, radarDirectionDeg, toleranceDeg = 60) {
    if (radarDirectionDeg == null)
        return false;
    if (vehicleHeading == null || !Number.isFinite(vehicleHeading))
        return false;
    return !headingMatches(vehicleHeading, radarDirectionDeg, toleranceDeg);
}
//# sourceMappingURL=Geo.js.map