import { haversineM } from './geo'
import type { PositionSample, Radar, RadarAlert, RadarPassage } from './types'

type Approach = {
  radar: Radar
  entered: boolean
  closestM: number
  speedAtClosest: number
  atClosest: number
}

export class RadarTracker {
  private approaches = new Map<string, Approach>()
  private passages: RadarPassage[] = []
  private lastAlert: RadarAlert | null = null

  constructor(private radars: Radar[]) {}

  reset(): void {
    this.approaches.clear()
    this.passages = []
    this.lastAlert = null
  }

  getPassages(): RadarPassage[] {
    return [...this.passages]
  }

  /** Próximos radares ainda não passados, ordenados por distância. */
  upcoming(
    sample: PositionSample,
    limit = 3,
  ): Array<{ radar: Radar; distanceM: number }> {
    const passed = new Set(this.passages.map((p) => p.radar.id))
    // Também trata “ainda dentro do pass radius após registered” via approaches que já saíram
    return this.radars
      .filter((r) => !passed.has(r.id))
      .map((radar) => ({
        radar,
        distanceM: haversineM(sample, radar),
      }))
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, limit)
  }

  getAlert(): RadarAlert | null {
    return this.lastAlert
  }

  update(sample: PositionSample): {
    alert: RadarAlert | null
    newPassage: RadarPassage | null
  } {
    let bestAlert: RadarAlert | null = null
    let newPassage: RadarPassage | null = null

    for (const radar of this.radars) {
      const d = haversineM(sample, radar)
      let approach = this.approaches.get(radar.id)

      if (d <= radar.alertRadiusM) {
        const level: RadarAlert['level'] =
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
          }
          this.approaches.set(radar.id, approach)
        } else {
          approach.entered = true
          if (d < approach.closestM) {
            approach.closestM = d
            approach.speedAtClosest = sample.speedKmh
            approach.atClosest = sample.at
          }
        }
      } else if (approach?.entered) {
        // Saiu do raio de passagem → registra uma vez
        const excess = Math.max(0, approach.speedAtClosest - radar.limitKmh)
        const passage: RadarPassage = {
          radar,
          passedAt: approach.atClosest,
          speedKmh: approach.speedAtClosest,
          overLimit: excess > 0,
          excessKmh: excess,
          closestDistanceM: approach.closestM,
        }
        this.passages.push(passage)
        this.approaches.delete(radar.id)
        newPassage = passage
      }
    }

    this.lastAlert = bestAlert
    return { alert: bestAlert, newPassage }
  }
}
