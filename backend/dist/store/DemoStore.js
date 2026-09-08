import { randomUUID } from 'node:crypto';
import { haversineM } from '../engines/Geo.js';
import { RadarDetection } from '../engines/RadarDetection.js';
import { SpeedFilter } from '../engines/SpeedFilter.js';
import { ViolationEngine } from '../engines/ViolationEngine.js';
import { computeTripCost } from '../engines/TripCost.js';
import { SEED_DEMO_RADARS, SEED_FINE_RULES, SEED_VEHICLE_SETTINGS, } from '../seed/demoData.js';
/**
 * Store em memória para local/dev/test sem Postgres.
 * Carrega fine_rules e radares demo no boot.
 */
export class DemoStore {
    radars = new Map();
    fineRules = new Map();
    trips = new Map();
    locations = new Map();
    events = new Map();
    vehicleSettings;
    runtime = new Map();
    constructor() {
        for (const r of SEED_DEMO_RADARS) {
            const id = randomUUID();
            this.radars.set(id, { ...r, id });
        }
        for (const f of SEED_FINE_RULES) {
            const id = randomUUID();
            this.fineRules.set(id, { ...f, id });
        }
        this.vehicleSettings = { ...SEED_VEHICLE_SETTINGS, id: randomUUID() };
    }
    listFineRules() {
        return [...this.fineRules.values()].filter((r) => r.active);
    }
    listRadars() {
        return [...this.radars.values()].filter((r) => r.active);
    }
    findRadarByExternalId(externalId) {
        return this.listRadars().find((r) => r.externalId === externalId);
    }
    getVehicleSettings() {
        return { ...this.vehicleSettings };
    }
    updateVehicleSettings(patch) {
        this.vehicleSettings = { ...this.vehicleSettings, ...patch };
        return this.getVehicleSettings();
    }
    createTrip(mode = 'gps', notes) {
        const trip = {
            id: randomUUID(),
            mode,
            status: 'active',
            startedAt: new Date().toISOString(),
            endedAt: null,
            maxSpeedKmh: 0,
            sampleCount: 0,
            distanceM: 0,
            notes: notes ?? null,
        };
        this.trips.set(trip.id, trip);
        this.locations.set(trip.id, []);
        this.events.set(trip.id, []);
        this.runtime.set(trip.id, {
            filter: new SpeedFilter(),
            detection: new RadarDetection(this.listRadars()),
        });
        return trip;
    }
    listTrips() {
        return [...this.trips.values()].sort((a, b) => a.startedAt < b.startedAt ? 1 : -1);
    }
    getTrip(id) {
        return this.trips.get(id);
    }
    requireActiveTrip(id) {
        const trip = this.trips.get(id);
        if (!trip)
            throw Object.assign(new Error('Viagem não encontrada'), { statusCode: 404 });
        if (trip.status !== 'active') {
            throw Object.assign(new Error('Viagem já finalizada'), { statusCode: 409 });
        }
        const rt = this.runtime.get(id);
        if (!rt)
            throw Object.assign(new Error('Runtime ausente'), { statusCode: 500 });
        return { trip, rt };
    }
    addLocation(tripId, input) {
        const { trip, rt } = this.requireActiveTrip(tripId);
        const locs = this.locations.get(tripId);
        const events = this.events.get(tripId);
        const recordedAt = input.recordedAt ?? new Date().toISOString();
        const rawSpeed = input.speedKmh ?? 0;
        const filtered = rt.filter.update(rawSpeed);
        const location = {
            id: randomUUID(),
            tripId,
            recordedAt,
            lat: input.lat,
            lng: input.lng,
            speedKmh: rawSpeed,
            filteredSpeedKmh: filtered,
            headingDeg: input.headingDeg ?? null,
            accuracyM: input.accuracyM ?? null,
            seq: locs.length,
        };
        const prev = locs[locs.length - 1];
        if (prev) {
            trip.distanceM += haversineM(prev, location);
        }
        locs.push(location);
        trip.sampleCount = locs.length;
        trip.maxSpeedKmh = Math.max(trip.maxSpeedKmh, filtered);
        const { alert, newPassage } = rt.detection.update({
            lat: location.lat,
            lng: location.lng,
            speedKmh: filtered,
            headingDeg: location.headingDeg,
            at: recordedAt,
        });
        const newEvents = [];
        if (alert) {
            newEvents.push(this.pushEvent(events, {
                tripId,
                eventType: 'radar_alert',
                occurredAt: recordedAt,
                radarId: alert.radar.id,
                lat: location.lat,
                lng: location.lng,
                speedKmh: filtered,
                speedLimitKmh: alert.radar.speedLimitKmh,
                excessKmh: null,
                excessPct: null,
                fineRuleCode: null,
                estimatedFineBrl: null,
                severity: null,
                payload: {
                    level: alert.level,
                    distanceM: alert.distanceM,
                    label: 'Alerta de radar (estimativa de proximidade)',
                },
            }));
        }
        if (newPassage) {
            // Prevenção de duplicata
            const already = events.some((e) => e.eventType === 'radar_passage' && e.radarId === newPassage.radar.id);
            if (!already) {
                const passageEvent = this.pushEvent(events, {
                    tripId,
                    eventType: 'radar_passage',
                    occurredAt: newPassage.passedAt,
                    radarId: newPassage.radar.id,
                    lat: newPassage.radar.lat,
                    lng: newPassage.radar.lng,
                    speedKmh: newPassage.speedKmh,
                    speedLimitKmh: newPassage.radar.speedLimitKmh,
                    excessKmh: null,
                    excessPct: null,
                    fineRuleCode: null,
                    estimatedFineBrl: null,
                    severity: null,
                    payload: {
                        closestDistanceM: newPassage.closestDistanceM,
                        headingDeg: newPassage.headingDeg,
                        label: 'Passagem por radar registrada',
                    },
                });
                newEvents.push(passageEvent);
                const limit = newPassage.radar.speedLimitKmh;
                if (limit != null && newPassage.speedKmh > limit) {
                    const engine = new ViolationEngine(this.listFineRules());
                    const estimate = engine.classify(newPassage.speedKmh, limit);
                    newEvents.push(this.pushEvent(events, {
                        tripId,
                        eventType: 'possible_violation',
                        occurredAt: newPassage.passedAt,
                        radarId: newPassage.radar.id,
                        lat: newPassage.radar.lat,
                        lng: newPassage.radar.lng,
                        speedKmh: newPassage.speedKmh,
                        speedLimitKmh: limit,
                        excessKmh: estimate.excessKmh,
                        excessPct: estimate.excessPct,
                        fineRuleCode: estimate.fineRuleCode,
                        estimatedFineBrl: estimate.estimatedFineBrl,
                        severity: estimate.severity,
                        payload: {
                            label: estimate.label,
                            disclaimer: estimate.disclaimer,
                            points: estimate.points,
                            suspendRight: estimate.suspendRight,
                        },
                    }));
                }
            }
        }
        return { location, alert, newEvents };
    }
    addEvent(tripId, input) {
        this.requireActiveTrip(tripId);
        const events = this.events.get(tripId);
        if (input.eventType === 'radar_passage' && input.radarId) {
            const dup = events.some((e) => e.eventType === 'radar_passage' && e.radarId === input.radarId);
            if (dup) {
                throw Object.assign(new Error('Passagem duplicada para este radar'), {
                    statusCode: 409,
                });
            }
            this.runtime.get(tripId)?.detection.markPassed(input.radarId);
        }
        let excessKmh = null;
        let excessPct = null;
        let fineRuleCode = null;
        let estimatedFineBrl = null;
        let severity = null;
        const payload = { ...(input.payload ?? {}) };
        if (input.eventType === 'possible_violation' &&
            input.speedKmh != null &&
            input.speedLimitKmh != null) {
            const engine = new ViolationEngine(this.listFineRules());
            const estimate = engine.classify(input.speedKmh, input.speedLimitKmh);
            excessKmh = estimate.excessKmh;
            excessPct = estimate.excessPct;
            fineRuleCode = estimate.fineRuleCode;
            estimatedFineBrl = estimate.estimatedFineBrl;
            severity = estimate.severity;
            payload.label = estimate.label;
            payload.disclaimer = estimate.disclaimer;
        }
        return this.pushEvent(events, {
            tripId,
            eventType: input.eventType,
            occurredAt: input.occurredAt ?? new Date().toISOString(),
            radarId: input.radarId ?? null,
            lat: input.lat ?? null,
            lng: input.lng ?? null,
            speedKmh: input.speedKmh ?? null,
            speedLimitKmh: input.speedLimitKmh ?? null,
            excessKmh,
            excessPct,
            fineRuleCode,
            estimatedFineBrl,
            severity,
            payload,
        });
    }
    finishTrip(tripId) {
        const { trip } = this.requireActiveTrip(tripId);
        trip.status = 'finished';
        trip.endedAt = new Date().toISOString();
        this.runtime.delete(tripId);
        return { trip, report: this.buildReport(tripId) };
    }
    buildReport(tripId) {
        const trip = this.trips.get(tripId);
        if (!trip) {
            throw Object.assign(new Error('Viagem não encontrada'), { statusCode: 404 });
        }
        const locations = this.locations.get(tripId) ?? [];
        const events = this.events.get(tripId) ?? [];
        const passages = events.filter((e) => e.eventType === 'radar_passage');
        const possibleViolations = events.filter((e) => e.eventType === 'possible_violation');
        const engine = new ViolationEngine(this.listFineRules());
        const estimates = possibleViolations.map((e) => {
            if (e.speedKmh != null && e.speedLimitKmh != null) {
                return engine.classify(e.speedKmh, e.speedLimitKmh);
            }
            return engine.classify(0, 1);
        });
        const cost = computeTripCost({
            distanceM: trip.distanceM,
            settings: this.getVehicleSettings(),
            violationEstimates: estimates,
            tolls: [],
        });
        return {
            trip,
            sampleCount: locations.length,
            passages,
            possibleViolations,
            cost,
            disclaimer: 'Relatório com estimativas de possíveis infrações — não constitui autuação oficial.',
        };
    }
    pushEvent(events, data) {
        const event = {
            ...data,
            id: randomUUID(),
            isEstimate: true,
        };
        events.push(event);
        return event;
    }
}
let singleton = null;
export function getDemoStore() {
    if (!singleton)
        singleton = new DemoStore();
    return singleton;
}
export function resetDemoStore() {
    singleton = new DemoStore();
    return singleton;
}
//# sourceMappingURL=DemoStore.js.map