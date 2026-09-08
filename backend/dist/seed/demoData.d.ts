import type { FineRule, Radar, VehicleSettings } from '../types.js';
/** Seeds alinhados às migrations 009 / 010 — usados pelo DemoStore. */
export declare const SEED_FINE_RULES: Omit<FineRule, 'id'>[];
export declare const SEED_DEMO_RADARS: Omit<Radar, 'id'>[];
export declare const SEED_VEHICLE_SETTINGS: Omit<VehicleSettings, 'id'>;
