import type { LatLng } from '../types.js'
import { bearingDeg, haversineM, headingMatches } from './Geo.js'

export type RoadSegment = {
  id: string
  osmWayId?: number | null
  name: string
  /** Polyline aproximada do segmento (WGS84). */
  path: LatLng[]
  oneway: 'both' | 'forward' | 'reverse'
  forwardHeadingDeg: number | null
  maxspeedKmh: number | null
  maxspeedSource: 'local' | 'osm' | 'complementary' | 'unknown'
  highwayClass?: string | null
  confidence: number
  active: boolean
}

export type MatchCandidate = {
  segment: RoadSegment
  distanceM: number
  headingOk: boolean
  projected: LatLng
}

/**
 * Map matching local (espelha a ideia de ST_DWithin + segmento mais próximo).
 * Sem API paga — usa geometria em memória / PostGIS no futuro.
 */
export class LocalMapMatcher {
  constructor(
    private segments: RoadSegment[],
    private radiusM = 60,
  ) {}

  setSegments(segments: RoadSegment[]): void {
    this.segments = segments.filter((s) => s.active)
  }

  /**
   * Distância ponto→polyline (mínimo sobre arestas) + projeção aproximada.
   */
  static distanceToSegment(
    point: LatLng,
    path: LatLng[],
  ): { distanceM: number; projected: LatLng } {
    if (path.length === 0) {
      return { distanceM: Number.POSITIVE_INFINITY, projected: point }
    }
    if (path.length === 1) {
      return { distanceM: haversineM(point, path[0]), projected: path[0] }
    }

    let best = Number.POSITIVE_INFINITY
    let projected = path[0]

    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i]
      const b = path[i + 1]
      const p = projectOnSegment(point, a, b)
      const d = haversineM(point, p)
      if (d < best) {
        best = d
        projected = p
      }
    }
    return { distanceM: best, projected }
  }

  matchPoint(
    point: LatLng,
    headingDeg?: number | null,
  ): MatchCandidate | null {
    const candidates: MatchCandidate[] = []

    for (const segment of this.segments) {
      if (!segment.active) continue
      const { distanceM, projected } = LocalMapMatcher.distanceToSegment(
        point,
        segment.path,
      )
      if (distanceM > this.radiusM) continue

      let headingOk = true
      if (headingDeg != null && segment.forwardHeadingDeg != null) {
        if (segment.oneway === 'forward') {
          headingOk = headingMatches(
            headingDeg,
            segment.forwardHeadingDeg,
            70,
          )
        } else if (segment.oneway === 'reverse') {
          headingOk = headingMatches(
            headingDeg,
            (segment.forwardHeadingDeg + 180) % 360,
            70,
          )
        } else {
          headingOk =
            headingMatches(headingDeg, segment.forwardHeadingDeg, 70) ||
            headingMatches(
              headingDeg,
              (segment.forwardHeadingDeg + 180) % 360,
              70,
            )
        }
      }

      candidates.push({ segment, distanceM, headingOk, projected })
    }

    if (candidates.length === 0) return null

    candidates.sort((a, b) => {
      if (a.headingOk !== b.headingOk) return a.headingOk ? -1 : 1
      return a.distanceM - b.distanceM
    })
    return candidates[0]
  }

  matchTrace(
    points: Array<LatLng & { headingDeg?: number | null }>,
  ): Array<MatchCandidate | null> {
    return points.map((p) => this.matchPoint(p, p.headingDeg))
  }
}

/** Projeção linear aproximada em graus (ok para trechos curtos urbanos). */
function projectOnSegment(p: LatLng, a: LatLng, b: LatLng): LatLng {
  const ax = a.lng
  const ay = a.lat
  const bx = b.lng
  const by = b.lat
  const px = p.lng
  const py = p.lat
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return a
  let t = ((px - ax) * dx + (py - ay) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return { lat: ay + t * dy, lng: ax + t * dx }
}

export function segmentBearing(path: LatLng[]): number | null {
  if (path.length < 2) return null
  return bearingDeg(path[0], path[path.length - 1])
}
