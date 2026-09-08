/**
 * Filtro simples de velocidade GPS (suavização + rejeição de spikes).
 * Mantém estado por viagem / sessão.
 */
export class SpeedFilter {
    lastFiltered = null;
    alpha;
    maxJumpKmh;
    constructor(opts) {
        this.alpha = opts?.alpha ?? 0.35;
        this.maxJumpKmh = opts?.maxJumpKmh ?? 40;
    }
    reset() {
        this.lastFiltered = null;
    }
    /**
     * @param rawKmh velocidade bruta (km/h)
     * @returns velocidade filtrada (km/h)
     */
    update(rawKmh) {
        const raw = Math.max(0, Number.isFinite(rawKmh) ? rawKmh : 0);
        if (this.lastFiltered == null) {
            this.lastFiltered = raw;
            return raw;
        }
        // Rejeita saltos absurdos (mantém valor anterior com leve blend)
        if (Math.abs(raw - this.lastFiltered) > this.maxJumpKmh) {
            this.lastFiltered =
                this.lastFiltered * (1 - this.alpha * 0.5) + raw * (this.alpha * 0.5);
            return this.lastFiltered;
        }
        this.lastFiltered =
            this.lastFiltered * (1 - this.alpha) + raw * this.alpha;
        return this.lastFiltered;
    }
    get current() {
        return this.lastFiltered;
    }
}
//# sourceMappingURL=SpeedFilter.js.map