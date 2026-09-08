/**
 * Filtro simples de velocidade GPS (suavização + rejeição de spikes).
 * Mantém estado por viagem / sessão.
 */
export class SpeedFilter {
  private lastFiltered: number | null = null
  private readonly alpha: number
  private readonly maxJumpKmh: number

  constructor(opts?: { alpha?: number; maxJumpKmh?: number }) {
    this.alpha = opts?.alpha ?? 0.35
    this.maxJumpKmh = opts?.maxJumpKmh ?? 40
  }

  reset(): void {
    this.lastFiltered = null
  }

  /**
   * @param rawKmh velocidade bruta (km/h)
   * @returns velocidade filtrada (km/h)
   */
  update(rawKmh: number): number {
    const raw = Math.max(0, Number.isFinite(rawKmh) ? rawKmh : 0)

    if (this.lastFiltered == null) {
      this.lastFiltered = raw
      return raw
    }

    // Rejeita saltos absurdos (mantém valor anterior com leve blend)
    if (Math.abs(raw - this.lastFiltered) > this.maxJumpKmh) {
      this.lastFiltered =
        this.lastFiltered * (1 - this.alpha * 0.5) + raw * (this.alpha * 0.5)
      return this.lastFiltered
    }

    this.lastFiltered =
      this.lastFiltered * (1 - this.alpha) + raw * this.alpha
    return this.lastFiltered
  }

  get current(): number | null {
    return this.lastFiltered
  }
}
