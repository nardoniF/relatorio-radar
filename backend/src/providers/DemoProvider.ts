import { haversineM, headingMatches } from '../engines/Geo.js'
import type { Radar, SpeedLimitResult } from '../types.js'
import type {
  MapDataProvider,
  MapMatchPoint,
  MapMatchResult,
  NearbyRadarsQuery,
  SpeedLimitQuery,
} from './types.js'

/**
 * Provedor offline com dados seed (piloto SP).
 * Padrão do MVP sem API keys.
 */
export class DemoProvider implements MapDataProvider {
  readonly name = 'demo'

  constructor(private radars: Radar[]) {}

  setRadars(radars: Radar[]): void {
    this.radars = radars.filter((r) => r.active)
  }

  async getNearbyRadars(query: NearbyRadarsQuery): Promise<Radar[]> {
    const origin = { lat: query.lat, lng: query.lng }
    return this.radars
      .filter((r) => {
        if (!r.active) return false
        const d = haversineM(origin, r)
        if (d > query.radiusM) return false
        if (query.headingDeg != null) {
          return headingMatches(
            query.headingDeg,
            r.directionDeg,
            r.directionToleranceDeg,
          )
        }
        return true
      })
      .sort(
        (a, b) => haversineM(origin, a) - haversineM(origin, b),
      )
  }

  async getSpeedLimit(query: SpeedLimitQuery): Promise<SpeedLimitResult> {
    const nearby = await this.getNearbyRadars({
      lat: query.lat,
      lng: query.lng,
      radiusM: 120,
      headingDeg: query.headingDeg,
    })
    const closest = nearby[0]
    if (closest?.speedLimitKmh != null) {
      return {
        lat: query.lat,
        lng: query.lng,
        headingDeg: query.headingDeg ?? null,
        speedLimitKmh: closest.speedLimitKmh,
        roadName: closest.roadName ?? closest.name,
        source: 'demo',
        confidence: 'demo',
      }
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
    }
  }

  async matchTrace(points: MapMatchPoint[]): Promise<MapMatchResult> {
    // Demo: devolve os pontos como "matched" sem snapping real
    return {
      matched: points.map((p) => ({
        lat: p.lat,
        lng: p.lng,
        speedLimitKmh: null,
      })),
      source: 'demo',
    }
  }
}
