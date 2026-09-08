import type { LatLng, Radar } from '../types.js';
export type AlertLevel = 'far' | 'near' | 'imminent';
export type RadarAlert = {
    radar: Radar;
    distanceM: number;
    level: AlertLevel;
};
export type RadarPassage = {
    radar: Radar;
    passedAt: string;
    speedKmh: number;
    closestDistanceM: number;
    headingDeg: number | null;
};
export type DetectionSample = LatLng & {
    speedKmh: number;
    headingDeg: number | null;
    at: string;
};
/**
 * Detecção de aproximação / passagem por radar.
 * - ignora sentido oposto
 * - zonas far / near / imminent
 * - evita passagem duplicada (já passou)
 */
export declare class RadarDetection {
    private radars;
    private approaches;
    private passedIds;
    private passages;
    private lastAlert;
    constructor(radars: Radar[]);
    setRadars(radars: Radar[]): void;
    reset(): void;
    getPassages(): RadarPassage[];
    getPassedIds(): Set<string>;
    getAlert(): RadarAlert | null;
    /** Marca radar como já passado (ex.: evento persistido). */
    markPassed(radarId: string): void;
    update(sample: DetectionSample): {
        alert: RadarAlert | null;
        newPassage: RadarPassage | null;
        ignoredOpposite: string[];
    };
}
