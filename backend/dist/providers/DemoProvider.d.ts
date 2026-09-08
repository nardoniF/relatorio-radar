import type { Radar, SpeedLimitResult } from '../types.js';
import type { MapDataProvider, MapMatchPoint, MapMatchResult, NearbyRadarsQuery, SpeedLimitQuery } from './types.js';
/**
 * Provedor offline com dados seed (piloto SP).
 * Padrão do MVP sem API keys.
 */
export declare class DemoProvider implements MapDataProvider {
    private radars;
    readonly name = "demo";
    constructor(radars: Radar[]);
    setRadars(radars: Radar[]): void;
    getNearbyRadars(query: NearbyRadarsQuery): Promise<Radar[]>;
    getSpeedLimit(query: SpeedLimitQuery): Promise<SpeedLimitResult>;
    matchTrace(points: MapMatchPoint[]): Promise<MapMatchResult>;
}
