export const ESTIMATE_DISCLAIMER = 'Estimativa apenas — possível infração. Não constitui autuação oficial.';
/**
 * Motor de classificação CTB art. 218.
 * Lê regras de fine_rules; NUNCA hardcoda valores de multa.
 */
export class ViolationEngine {
    rules;
    constructor(rules) {
        this.rules = rules;
    }
    setRules(rules) {
        this.rules = rules.filter((r) => r.active);
    }
    /** Excesso percentual sobre o limite. */
    excessPct(speedKmh, limitKmh) {
        if (limitKmh <= 0)
            return 0;
        const excess = Math.max(0, speedKmh - limitKmh);
        return (excess / limitKmh) * 100;
    }
    excessKmh(speedKmh, limitKmh) {
        return Math.max(0, speedKmh - limitKmh);
    }
    /**
     * Localiza a regra ativa cujo intervalo cobre o excesso %.
     * Faixas: (0, 20], (20, 50], (50, ∞) alinhadas ao CTB art. 218 seed.
     */
    lookupRule(excessPct) {
        if (excessPct <= 0)
            return null;
        const active = this.rules
            .filter((r) => r.active)
            .sort((a, b) => a.excessMinPct - b.excessMinPct);
        for (const rule of active) {
            const lower = rule.excessMinPct === 0
                ? excessPct > 0
                : excessPct > rule.excessMinPct;
            const upper = rule.excessMaxPct == null ? true : excessPct <= rule.excessMaxPct;
            if (lower && upper)
                return rule;
        }
        return null;
    }
    classify(speedKmh, limitKmh) {
        const excessKmh = this.excessKmh(speedKmh, limitKmh);
        const excessPct = this.excessPct(speedKmh, limitKmh);
        if (excessKmh <= 0 || limitKmh <= 0) {
            return {
                excessKmh: 0,
                excessPct: 0,
                severity: null,
                fineRuleCode: null,
                estimatedFineBrl: null,
                points: null,
                suspendRight: false,
                disclaimer: ESTIMATE_DISCLAIMER,
                label: 'Dentro do limite (estimativa)',
            };
        }
        const rule = this.lookupRule(excessPct);
        if (!rule) {
            return {
                excessKmh,
                excessPct,
                severity: null,
                fineRuleCode: null,
                estimatedFineBrl: null,
                points: null,
                suspendRight: false,
                disclaimer: ESTIMATE_DISCLAIMER,
                label: 'Possível infração sem regra configurada',
            };
        }
        return {
            excessKmh,
            excessPct,
            severity: rule.severity,
            fineRuleCode: rule.code,
            estimatedFineBrl: rule.fineBrl,
            points: rule.points,
            suspendRight: rule.suspendRight,
            disclaimer: ESTIMATE_DISCLAIMER,
            label: `Estimativa de possível infração (${rule.severity})`,
        };
    }
}
//# sourceMappingURL=ViolationEngine.js.map