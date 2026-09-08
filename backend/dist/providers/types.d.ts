import type { LatLng, Radar, SpeedLimitResult } from '../types.js';
export type NearbyRadarsQuery = {
    lat: number;
    lng: number;
    radiusM: number;
    headingDeg?: number | null;
};
export type SpeedLimitQuery = {
    lat: number;
    lng: number;
    headingDeg?: number | null;
};
export type MapMatchPoint = LatLng & {
    recordedAt?: string;
    headingDeg?: number | null;
    speedKmh?: number;
};
export type MapMatchResult = {
    matched: Array<LatLng & {
        linkId?: string;
        speedLimitKmh?: number | null;
    }>;
    source: string;
};
/**
 * Abstração de provedor comercial / demo.
 * Chaves de API ficam apenas no backend (env).
 */
export interface MapDataProvider {
    readonly name: string;
    getNearbyRadars(query: NearbyRadarsQuery): Promise<Radar[]>;
    getSpeedLimit(query: SpeedLimitQuery): Promise<SpeedLimitResult>;
    matchTrace?(points: MapMatchPoint[]): Promise<MapMatchResult>;
}
