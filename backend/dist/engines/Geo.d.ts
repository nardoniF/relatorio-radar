import type { LatLng } from '../types.js';
export declare function toRad(deg: number): number;
export declare function toDeg(rad: number): number;
/** Distância haversine em metros. */
export declare function haversineM(a: LatLng, b: LatLng): number;
/** Azimute inicial a→b em graus [0, 360). */
export declare function bearingDeg(a: LatLng, b: LatLng): number;
/** Menor diferença angular absoluta entre dois headings (0–180). */
export declare function headingDeltaDeg(a: number, b: number): number;
/**
 * Verifica se o heading do veículo combina com a direção do radar.
 * directionDeg null = aceita qualquer sentido.
 */
export declare function headingMatches(vehicleHeading: number | null | undefined, radarDirectionDeg: number | null | undefined, toleranceDeg?: number): boolean;
/** True se heading aponta para o sentido oposto ao radar (fora da tolerância). */
export declare function isOppositeDirection(vehicleHeading: number | null | undefined, radarDirectionDeg: number | null | undefined, toleranceDeg?: number): boolean;
