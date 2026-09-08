import { LocalMapMatcher, type RoadSegment } from '../engines/MapMatching.js'
import { haversineM } from '../engines/Geo.js'
import type { Radar, SpeedLimitResult } from '../types.js'
import type {
  MapDataProvider,
  MapMatchPoint,
  MapMatchResult,
  NearbyRadarsQuery,
  RegionPack,
  SpeedLimitQuery,
} from './types.js'

/**
 * Provider padrão: base própria + segmentos (OSM-like) + matching local.
 * Sem custo por requisição. HERE/Mapbox não entram neste caminho.
 */
export class LocalOsmProvider implements MapDataProvider {
  readonly name = 'local'

  private matcher: LocalMapMatcher

  constructor(
    private radars: Radar[],
    private segments: RoadSegment[],
  ) {
    this.matcher = new LocalMapMatcher(segments, 80)
  }

  setRadars(radars: Radar[]): void {
    this.radars = radars.filter((r) => r.active)
  }

  setSegments(segments: RoadSegment[]): void {
    this.segments = segments.filter((s) => s.active)
    this.matcher.setSegments(this.segments)
  }

  async getNearbyRadars(query: NearbyRadarsQuery): Promise<Radar[]> {
    const origin = { lat: query.lat, lng: query.lng }
    return this.radars
      .filter((r) => {
        if (!r.active) return false
        return haversineM(origin, r) <= query.radiusM
      })
      .sort((a, b) => haversineM(origin, a) - haversineM(origin, b))
  }

  /**
   * Cascata: 1) maxspeed do segmento matched (local/OSM)
   *          2) radar próximo com limite
   *          3) fallback urbano demo (baixa confiança)
   */
  async getSpeedLimit(query: SpeedLimitQuery): Promise<SpeedLimitResult> {
    const match = this.matcher.matchPoint(
      { lat: query.lat, lng: query.lng },
      query.headingDeg,
    )

    if (match?.segment.maxspeedKmh != null) {
      return {
        lat: query.lat,
        lng: query.lng,
        headingDeg: query.headingDeg ?? null,
        speedLimitKmh: match.segment.maxspeedKmh,
        roadName: match.segment.name,
        source: match.segment.maxspeedSource,
        confidence: match.headingOk ? 'matched' : 'matched-weak-heading',
        segmentId: match.segment.id,
      }
    }

    const nearby = await this.getNearbyRadars({
      lat: query.lat,
      lng: query.lng,
      radiusM: 120,
      headingDeg: query.headingDeg,
    })
    const withLimit = nearby.find((r) => r.speedLimitKmh != null)
    if (withLimit?.speedLimitKmh != null) {
      return {
        lat: query.lat,
        lng: query.lng,
        headingDeg: query.headingDeg ?? null,
        speedLimitKmh: withLimit.speedLimitKmh,
        roadName: withLimit.roadName ?? withLimit.name,
        source: 'radar-sign',
        confidence: 'secondary',
      }
    }

    return {
      lat: query.lat,
      lng: query.lng,
      headingDeg: query.headingDeg ?? null,
      speedLimitKmh: null,
      roadName: match?.segment.name ?? null,
      source: 'unknown',
      confidence: 'insufficient',
    }
  }

  async matchTrace(points: MapMatchPoint[]): Promise<MapMatchResult> {
    const matched = points.map((p) => {
      const m = this.matcher.matchPoint(p, p.headingDeg)
      return {
        lat: m?.projected.lat ?? p.lat,
        lng: m?.projected.lng ?? p.lng,
        linkId: m?.segment.id,
        speedLimitKmh: m?.segment.maxspeedKmh ?? null,
        roadName: m?.segment.name,
      }
    })
    return { matched, source: 'local-postgis-style' }
  }

  /** Pack regional para cache offline no iPhone. */
  async getRegionPack(lat: number, lng: number, radiusKm: number): Promise<RegionPack> {
    const radiusM = radiusKm * 1000
    const origin = { lat, lng }
    const radars = this.radars.filter(
      (r) => r.active && haversineM(origin, r) <= radiusM,
    )
    const segments = this.segments.filter((s) => {
      if (!s.active || s.path.length === 0) return false
      return s.path.some((p) => haversineM(origin, p) <= radiusM)
    })
    return {
      center: { lat, lng },
      radiusKm,
      radars,
      segments,
      generatedAt: new Date().toISOString(),
      source: 'local',
      disclaimer:
        'Pack offline. Limites OSM podem estar incompletos. Infrações são estimativas.',
    }
  }
}
