import type { Radar, SpeedLimitResult } from '../types.js';
import type { MapDataProvider, MapMatchPoint, MapMatchResult, NearbyRadarsQuery, SpeedLimitQuery } from './types.js';
/**
 * Stub HERE Platform.
 *
 * TODO: Map Attributes API v8 — SPEED_LIMITS_FCn / APPLICABLE_SPEED_LIMIT
 * TODO: Safety Cameras Feed — cameraType, speedLimit, drivingDirection
 * TODO: Route Matching API v8 — trace → links + atributos
 *
 * A chave HERE_API_KEY deve vir apenas de process.env (nunca do cliente).
 */
export declare class HereProvider implements MapDataProvider {
    readonly name = "here";
    private readonly apiKey;
    constructor(apiKey: string);
    getNearbyRadars(_query: NearbyRadarsQuery): Promise<Radar[]>;
    getSpeedLimit(_query: SpeedLimitQuery): Promise<SpeedLimitResult>;
    matchTrace(_points: MapMatchPoint[]): Promise<MapMatchResult>;
    private requireKey;
}
