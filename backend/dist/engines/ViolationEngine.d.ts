import type { FineRule, ViolationEstimate } from '../types.js';
export declare const ESTIMATE_DISCLAIMER = "Estimativa apenas \u2014 poss\u00EDvel infra\u00E7\u00E3o. N\u00E3o constitui autua\u00E7\u00E3o oficial.";
/**
 * Motor de classificação CTB art. 218.
 * Lê regras de fine_rules; NUNCA hardcoda valores de multa.
 */
export declare class ViolationEngine {
    private rules;
    constructor(rules: FineRule[]);
    setRules(rules: FineRule[]): void;
    /** Excesso percentual sobre o limite. */
    excessPct(speedKmh: number, limitKmh: number): number;
    excessKmh(speedKmh: number, limitKmh: number): number;
    /**
     * Localiza a regra ativa cujo intervalo cobre o excesso %.
     * Faixas: (0, 20], (20, 50], (50, ∞) alinhadas ao CTB art. 218 seed.
     */
    lookupRule(excessPct: number): FineRule | null;
    classify(speedKmh: number, limitKmh: number): ViolationEstimate;
}
