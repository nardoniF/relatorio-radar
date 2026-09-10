import type { LatLng, Radar, SpeedLimitResult } from '../types.js'
import type { RoadSegment } from '../engines/MapMatching.js'

export type NearbyRadarsQuery = {
  lat: number
  lng: number
  radiusM: number
  headingDeg?: number | null
}

export type SpeedLimitQuery = {
  lat: number
  lng: number
  headingDeg?: number | null
}

export type MapMatchPoint = LatLng & {
  recordedAt?: string
  headingDeg?: number | null
  speedKmh?: number
}

export type MapMatchResult = {
  matched: Array<
    LatLng & {
      linkId?: string
      speedLimitKmh?: number | null
      roadName?: string
    }
  >
  source: string
}

/** Pack regional para cache offline no iPhone. */
export type RegionPack = {
  center: LatLng
  radiusKm: number
  radars: Radar[]
  segments: RoadSegment[]
  generatedAt: string
  source: string
  disclaimer: string
}

/**
 * Abstração de provedor de mapa/radares/limites.
 * Default = local (OSM/PostGIS-style). Comercial = complementar opcional.
 */
export interface MapDataProvider {
  readonly name: string
  getNearbyRadars(query: NearbyRadarsQuery): Promise<Radar[]>
  getSpeedLimit(query: SpeedLimitQuery): Promise<SpeedLimitResult>
  matchTrace?(points: MapMatchPoint[]): Promise<MapMatchResult>
  getRegionPack?(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<RegionPack>
}
