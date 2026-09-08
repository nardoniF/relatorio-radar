import { RadarDetection } from '../engines/RadarDetection.js';
import type { FineRule, Radar, Trip, TripEvent, TripLocation, TripMode, VehicleSettings } from '../types.js';
/**
 * Store em memória para local/dev/test sem Postgres.
 * Carrega fine_rules e radares demo no boot.
 */
export declare class DemoStore {
    radars: Map<string, Radar>;
    fineRules: Map<string, FineRule>;
    trips: Map<string, Trip>;
    locations: Map<string, TripLocation[]>;
    events: Map<string, TripEvent[]>;
    vehicleSettings: VehicleSettings;
    private runtime;
    constructor();
    listFineRules(): FineRule[];
    listRadars(): Radar[];
    findRadarByExternalId(externalId: string): Radar | undefined;
    getVehicleSettings(): VehicleSettings;
    updateVehicleSettings(patch: Partial<Omit<VehicleSettings, 'id'>>): VehicleSettings;
    createTrip(mode?: TripMode, notes?: string): Trip;
    listTrips(): Trip[];
    getTrip(id: string): Trip | undefined;
    private requireActiveTrip;
    addLocation(tripId: string, input: {
        lat: number;
        lng: number;
        speedKmh?: number;
        headingDeg?: number | null;
        accuracyM?: number | null;
        recordedAt?: string;
    }): {
        location: TripLocation;
        alert: ReturnType<RadarDetection['update']>['alert'];
        newEvents: TripEvent[];
    };
    addEvent(tripId: string, input: {
        eventType: TripEvent['eventType'];
        occurredAt?: string;
        radarId?: string | null;
        lat?: number | null;
        lng?: number | null;
        speedKmh?: number | null;
        speedLimitKmh?: number | null;
        payload?: Record<string, unknown>;
    }): TripEvent;
    finishTrip(tripId: string): {
        trip: Trip;
        report: ReturnType<DemoStore['buildReport']>;
    };
    buildReport(tripId: string): {
        trip: Trip;
        sampleCount: number;
        passages: TripEvent[];
        possibleViolations: TripEvent[];
        cost: import("../engines/TripCost.js").TripCostBreakdown;
        disclaimer: string;
    };
    private pushEvent;
}
export declare function getDemoStore(): DemoStore;
export declare function resetDemoStore(): DemoStore;
