import Foundation

/// Avalia excesso vs limite usando faixas CTB 218.
/// Valores monetários **somente** via `FineRule` injetadas — nunca hardcoded.
public final class ViolationEngine: @unchecked Sendable {
    public var fineRules: [FineRule]
    public var minConfidenceForRed: Double

    public init(fineRules: [FineRule] = [], minConfidenceForRed: Double = 0.65) {
        self.fineRules = fineRules
        self.minConfidenceForRed = minConfidenceForRed
    }

    /// Classifica excesso percentual (CTB art. 218).
    public static func severity(forExcessPercent percent: Double) -> ViolationSeverity {
        if percent <= 0 { return .none }
        if percent <= 20 { return .medium }
        if percent <= 50 { return .serious }
        return .verySerious
    }

    public func evaluate(passage: RadarPassage) -> ViolationEstimate {
        let limit = max(1, passage.radar.limitKmh)
        let speed = max(0, passage.speedKmh)
        let excess = max(0, speed - limit)
        let percent = (excess / limit) * 100
        let severity = Self.severity(forExcessPercent: percent)
        let confidence = passage.confidence

        let marker = markerColor(
            severity: severity,
            confidence: confidence,
            excessPercent: percent
        )

        let rule = fineRules.first { $0.severity == severity && severity != .none }

        let note: String
        switch marker {
        case .gray:
            note = "Estimativa indisponível: baixa confiança do GPS/matching."
        case .yellow:
            note = "Possível excesso (estimativa). Confirme com dados oficiais."
        case .red:
            note = "Excesso estimado com alta confiança. Não é multa oficial."
        case .green:
            note = "Dentro do limite estimado."
        }

        return ViolationEstimate(
            passageId: passage.id,
            radarId: passage.radar.id,
            radarName: passage.radar.name,
            limitKmh: limit,
            measuredSpeedKmh: speed,
            excessKmh: excess,
            excessPercent: percent,
            severity: severity,
            markerColor: marker,
            confidence: confidence,
            estimatedFineBRL: rule?.amountBRL,
            estimatedPoints: rule?.points,
            fineRuleId: rule?.id,
            isEstimate: true,
            notePT: note,
            occurredAt: passage.passedAt
        )
    }

    public func evaluate(passages: [RadarPassage]) -> [ViolationEstimate] {
        passages.map { evaluate(passage: $0) }
    }

    public func markerColor(
        severity: ViolationSeverity,
        confidence: Double,
        excessPercent: Double
    ) -> ViolationMarkerColor {
        if severity == .none {
            return confidence < 0.35 ? .gray : .green
        }
        // Gates de confiança: baixa → gray; média → yellow; alta → red.
        if confidence < 0.4 {
            return .gray
        }
        if confidence < minConfidenceForRed || excessPercent < 3 {
            return .yellow
        }
        return .red
    }
}
