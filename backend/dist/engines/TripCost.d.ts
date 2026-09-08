import type { Toll, VehicleSettings, ViolationEstimate } from '../types.js';
export type TripCostInput = {
    distanceM: number;
    settings: VehicleSettings;
    /** Estimativas de possível infração (já classificadas) */
    violationEstimates: ViolationEstimate[];
    /** Pedágios opcionalmente atravessados */
    tolls?: Toll[];
};
export type TripCostBreakdown = {
    distanceKm: number;
    fuelLiters: number;
    fuelCostBrl: number;
    tollCostBrl: number;
    /** Soma apenas das estimativas de multa (não oficial) */
    estimatedFinesBrl: number;
    estimatedFinesCount: number;
    totalEstimatedBrl: number;
    disclaimer: string;
};
/**
 * Custo estimado da viagem: combustível + pedágios opcionais + estimativa de multas.
 */
export declare function computeTripCost(input: TripCostInput): TripCostBreakdown;
