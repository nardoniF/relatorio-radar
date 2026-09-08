/**
 * Filtro simples de velocidade GPS (suavização + rejeição de spikes).
 * Mantém estado por viagem / sessão.
 */
export declare class SpeedFilter {
    private lastFiltered;
    private readonly alpha;
    private readonly maxJumpKmh;
    constructor(opts?: {
        alpha?: number;
        maxJumpKmh?: number;
    });
    reset(): void;
    /**
     * @param rawKmh velocidade bruta (km/h)
     * @returns velocidade filtrada (km/h)
     */
    update(rawKmh: number): number;
    get current(): number | null;
}
