import { haversineM, headingMatches, isOppositeDirection } from './Geo.js'
import type { LatLng, Radar } from '../types.js'

export type AlertLevel = 'far' | 'near' | 'imminent'

export type RadarAlert = {
  radar: Radar
  distanceM: number
  level: AlertLevel
}

export type RadarPassage = {
  radar: Radar
  passedAt: string
  speedKmh: number
  closestDistanceM: number
  headingDeg: number | null
}

type Approach = {
  radar: Radar
  entered: boolean
  closestM: number
  speedAtClosest: number
  atClosest: string
  headingAtClosest: number | null
}

export type DetectionSample = LatLng & {
  speedKmh: number
  headingDeg: number | null
  at: string
}

/**
 * Detecção de aproximação / passagem por radar.
 * - ignora sentido oposto
 * - zonas far / near / imminent
 * - evita passagem duplicada (já passou)
 */
export class RadarDetection {
  private approaches = new Map<string, Approach>()
  private passedIds = new Set<string>()
  private passages: RadarPassage[] = []
  private lastAlert: RadarAlert | null = null

  constructor(private radars: Radar[]) {}

  setRadars(radars: Radar[]): void {
    this.radars = radars
  }

  reset(): void {
    this.approaches.clear()
    this.passedIds.clear()
    this.passages = []
    this.lastAlert = null
  }

  getPassages(): RadarPassage[] {
    return [...this.passages]
  }

  getPassedIds(): Set<string> {
    return new Set(this.passedIds)
  }

  getAlert(): RadarAlert | null {
    return this.lastAlert
  }

  /** Marca radar como já passado (ex.: evento persistido). */
  markPassed(radarId: string): void {
    this.passedIds.add(radarId)
    this.approaches.delete(radarId)
  }

  update(sample: DetectionSample): {
    alert: RadarAlert | null
    newPassage: RadarPassage | null
    ignoredOpposite: string[]
  } {
    let bestAlert: RadarAlert | null = null
    let newPassage: RadarPassage | null = null
    const ignoredOpposite: string[] = []

    for (const radar of this.radars) {
      if (!radar.active) continue
      if (this.passedIds.has(radar.id)) continue

      const opposite = isOppositeDirection(
        sample.headingDeg,
        radar.directionDeg,
        radar.directionToleranceDeg,
      )
      if (opposite) {
        ignoredOpposite.push(radar.id)
        continue
      }

      const sameDir = headingMatches(
        sample.headingDeg,
        radar.directionDeg,
        radar.directionToleranceDeg,
      )
      if (!sameDir) {
        ignoredOpposite.push(radar.id)
        continue
      }

      const d = haversineM(sample, radar)
      let approach = this.approaches.get(radar.id)

      if (d <= radar.alertRadiusM) {
        const level: AlertLevel =
          d <= radar.passRadiusM * 1.4
            ? 'imminent'
            : d <= radar.alertRadiusM * 0.55
              ? 'near'
              : 'far'

        if (!bestAlert || d < bestAlert.distanceM) {
          bestAlert = { radar, distanceM: d, level }
        }
      }

      if (d <= radar.passRadiusM) {
        if (!approach) {
          approach = {
            radar,
            entered: true,
            closestM: d,
            speedAtClosest: sample.speedKmh,
            atClosest: sample.at,
            headingAtClosest: sample.headingDeg,
          }
          this.approaches.set(radar.id, approach)
        } else {
          approach.entered = true
          if (d < approach.closestM) {
            approach.closestM = d
            approach.speedAtClosest = sample.speedKmh
            approach.atClosest = sample.at
            approach.headingAtClosest = sample.headingDeg
          }
        }
      } else if (approach?.entered) {
        // Saiu do raio de passagem → registra uma vez
        const passage: RadarPassage = {
          radar,
          passedAt: approach.atClosest,
          speedKmh: approach.speedAtClosest,
          closestDistanceM: approach.closestM,
          headingDeg: approach.headingAtClosest,
        }
        this.passages.push(passage)
        this.passedIds.add(radar.id)
        this.approaches.delete(radar.id)
        newPassage = passage
      }
    }

    this.lastAlert = bestAlert
    return { alert: bestAlert, newPassage, ignoredOpposite }
  }
}
