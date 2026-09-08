/** Tipos compartilhados do backend Relatório Radar */
export type LatLng = {
    lat: number;
    lng: number;
};
export type CameraType = 'fixed' | 'mobile' | 'average' | 'red_light' | 'other';
export type Radar = {
    id: string;
    externalId?: string;
    name: string;
    cameraType: CameraType;
    lat: number;
    lng: number;
    speedLimitKmh: number | null;
    /** Direção de fiscalização (graus). null = ambos os sentidos */
    directionDeg: number | null;
    directionToleranceDeg: number;
    alertRadiusM: number;
    passRadiusM: number;
    roadName?: string | null;
    city?: string | null;
    state?: string | null;
    source: string;
    active: boolean;
};
export type FineSeverity = 'media' | 'grave' | 'gravissima';
export type FineRule = {
    id: string;
    code: string;
    severity: FineSeverity;
    article: string;
    excessMinPct: number;
    excessMaxPct: number | null;
    fineBrl: number;
    points: number;
    suspendRight: boolean;
    description: string;
    active: boolean;
};
export type TripMode = 'gps' | 'sim';
export type TripStatus = 'active' | 'finished';
export type Trip = {
    id: string;
    mode: TripMode;
    status: TripStatus;
    startedAt: string;
    endedAt: string | null;
    maxSpeedKmh: number;
    sampleCount: number;
    distanceM: number;
    notes: string | null;
};
export type TripLocation = {
    id: string;
    tripId: string;
    recordedAt: string;
    lat: number;
    lng: number;
    speedKmh: number;
    filteredSpeedKmh: number | null;
    headingDeg: number | null;
    accuracyM: number | null;
    seq: number;
};
export type TripEventType = 'radar_alert' | 'radar_passage' | 'possible_violation' | 'note' | 'system';
export type TripEvent = {
    id: string;
    tripId: string;
    eventType: TripEventType;
    occurredAt: string;
    radarId: string | null;
    lat: number | null;
    lng: number | null;
    speedKmh: number | null;
    speedLimitKmh: number | null;
    excessKmh: number | null;
    excessPct: number | null;
    /** Sempre true — linguagem de estimativa */
    isEstimate: true;
    fineRuleCode: string | null;
    estimatedFineBrl: number | null;
    severity: FineSeverity | null;
    payload: Record<string, unknown>;
};
export type VehicleSettings = {
    id: string;
    label: string;
    fuelPriceBrl: number;
    fuelEconomyKmPerL: number;
    vehicleType: 'car' | 'motorcycle' | 'truck';
    includeTolls: boolean;
};
export type Toll = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    priceCarBrl: number;
    priceMotorcycleBrl: number | null;
    priceTruckBrl: number | null;
    directionDeg: number | null;
    active: boolean;
};
export type SpeedLimitResult = {
    lat: number;
    lng: number;
    headingDeg: number | null;
    speedLimitKmh: number | null;
    roadName: string | null;
    source: string;
    confidence: 'demo' | 'provider' | 'unknown';
};
export type ViolationEstimate = {
    excessKmh: number;
    excessPct: number;
    severity: FineSeverity | null;
    fineRuleCode: string | null;
    estimatedFineBrl: number | null;
    points: number | null;
    suspendRight: boolean;
    /** Texto obrigatório de estimativa */
    disclaimer: string;
    label: string;
};
