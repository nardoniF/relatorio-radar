import { SIM_ROUTE } from './data/radars'
import { pointAlongPath, pathLengthM } from './geo'
import type { PositionSample } from './types'

export type SimCallbacks = {
  onSample: (sample: PositionSample) => void
  onStatus: (message: string) => void
  onFinished: () => void
}

/**
 * Simula um percurso no sofá: velocidade configurável, passa pelos radares de demo.
 * `timeScale` acelera o tempo (ex.: 4×) para testar sem esperar minutos.
 */
export class SimEngine {
  private raf = 0
  private startedAt = 0
  private distanceM = 0
  private speedKmh = 90
  private timeScale = 4
  private running = false
  private readonly totalM = pathLengthM(SIM_ROUTE)

  constructor(private cb: SimCallbacks) {}

  setSpeedKmh(v: number): void {
    this.speedKmh = Math.max(10, Math.min(140, v))
  }

  getSpeedKmh(): number {
    return this.speedKmh
  }

  setTimeScale(v: number): void {
    this.timeScale = Math.max(1, Math.min(12, v))
  }

  getTimeScale(): number {
    return this.timeScale
  }

  start(): void {
    this.stop()
    this.running = true
    this.startedAt = performance.now()
    this.distanceM = 0
    this.cb.onStatus(
      `Simulação · ${Math.round(this.speedKmh)} km/h · ${this.timeScale}×`,
    )
    let last = performance.now()

    const tick = (now: number) => {
      if (!this.running) return
      const dt = Math.min(0.25, ((now - last) / 1000) * this.timeScale)
      last = now

      const speedMs = this.speedKmh / 3.6
      this.distanceM += speedMs * dt

      if (this.distanceM >= this.totalM) {
        const { point, heading } = pointAlongPath(SIM_ROUTE, this.totalM)
        this.cb.onSample({
          lat: point.lat,
          lng: point.lng,
          speedKmh: this.speedKmh,
          accuracyM: 5,
          heading,
          at: Date.now(),
        })
        this.running = false
        this.cb.onStatus('Simulação concluída')
        this.cb.onFinished()
        return
      }

      const { point, heading } = pointAlongPath(SIM_ROUTE, this.distanceM)
      const wobble = Math.sin((now - this.startedAt) / 700) * 0.8
      this.cb.onSample({
        lat: point.lat,
        lng: point.lng,
        speedKmh: Math.max(0, this.speedKmh + wobble),
        accuracyM: 5,
        heading,
        at: Date.now(),
      })

      this.raf = requestAnimationFrame(tick)
    }

    this.raf = requestAnimationFrame(tick)
  }

  stop(): void {
    this.running = false
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
  }
}
