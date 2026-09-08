import { haversineM, headingMatches } from '../engines/Geo.js';
/**
 * Provedor offline com dados seed (piloto SP).
 * Padrão do MVP sem API keys.
 */
export class DemoProvider {
    radars;
    name = 'demo';
    constructor(radars) {
        this.radars = radars;
    }
    setRadars(radars) {
        this.radars = radars.filter((r) => r.active);
    }
    async getNearbyRadars(query) {
        const origin = { lat: query.lat, lng: query.lng };
        return this.radars
            .filter((r) => {
            if (!r.active)
                return false;
            const d = haversineM(origin, r);
            if (d > query.radiusM)
                return false;
            if (query.headingDeg != null) {
                return headingMatches(query.headingDeg, r.directionDeg, r.directionToleranceDeg);
            }
            return true;
        })
            .sort((a, b) => haversineM(origin, a) - haversineM(origin, b));
    }
    async getSpeedLimit(query) {
        const nearby = await this.getNearbyRadars({
            lat: query.lat,
            lng: query.lng,
            radiusM: 120,
            headingDeg: query.headingDeg,
        });
        const closest = nearby[0];
        if (closest?.speedLimitKmh != null) {
            return {
                lat: query.lat,
                lng: query.lng,
                headingDeg: query.headingDeg ?? null,
                speedLimitKmh: closest.speedLimitKmh,
                roadName: closest.roadName ?? closest.name,
                source: 'demo',
                confidence: 'demo',
            };
        }
        // Fallback urbano genérico para demo
        return {
            lat: query.lat,
            lng: query.lng,
            headingDeg: query.headingDeg ?? null,
            speedLimitKmh: 50,
            roadName: null,
            source: 'demo-default',
            confidence: 'demo',
        };
    }
    async matchTrace(points) {
        // Demo: devolve os pontos como "matched" sem snapping real
        return {
            matched: points.map((p) => ({
                lat: p.lat,
                lng: p.lng,
                speedLimitKmh: null,
            })),
            source: 'demo',
        };
    }
}
//# sourceMappingURL=DemoProvider.js.map