import Foundation

/// Severidade estimada segundo faixas CTB art. 218 (excesso percentual).
/// Sempre tratada como **estimativa** — nunca como multa oficial.
public enum ViolationSeverity: String, Codable, Sendable, CaseIterable {
    case none
    case medium          // até 20% acima
    case serious         // >20% até 50%
    case verySerious     // >50%
}

/// Marcação visual no mapa/relatório (confiança baixa → gray/yellow, não red).
public enum ViolationMarkerColor: String, Codable, Sendable {
    case green   // dentro do limite
    case yellow  // possível excesso com confiança média / margem
    case red     // excesso com alta confiança (ainda estimativa)
    case gray    // dados insuficientes / baixa confiança / sentido oposto
}

/// Regra de valor injetada pelo backend — **nunca** hardcoded no app.
public struct FineRule: Codable, Sendable, Hashable, Identifiable {
    public var id: String
    public var severity: ViolationSeverity
    /// Valor em BRL vindo da config do servidor.
    public var amountBRL: Double
    public var points: Int
    public var labelPT: String

    public init(
        id: String,
        severity: ViolationSeverity,
        amountBRL: Double,
        points: Int,
        labelPT: String
    ) {
        self.id = id
        self.severity = severity
        self.amountBRL = amountBRL
        self.points = points
        self.labelPT = labelPT
    }
}

/// Resultado de avaliação — sempre rotulado como estimativa.
public struct ViolationEstimate: Codable, Sendable, Identifiable, Hashable {
    public var id: UUID
    public var passageId: UUID
    public var radarId: String
    public var radarName: String
    public var limitKmh: Double
    public var measuredSpeedKmh: Double
    public var excessKmh: Double
    public var excessPercent: Double
    public var severity: ViolationSeverity
    public var markerColor: ViolationMarkerColor
    public var confidence: Double
    /// true se valores monetários vieram de FineRule injetada.
    public var estimatedFineBRL: Double?
    public var estimatedPoints: Int?
    public var fineRuleId: String?
    /// Sempre true no domínio do app.
    public var isEstimate: Bool
    public var notePT: String
    public var occurredAt: Date

    public init(
        id: UUID = UUID(),
        passageId: UUID,
        radarId: String,
        radarName: String,
        limitKmh: Double,
        measuredSpeedKmh: Double,
        excessKmh: Double,
        excessPercent: Double,
        severity: ViolationSeverity,
        markerColor: ViolationMarkerColor,
        confidence: Double,
        estimatedFineBRL: Double? = nil,
        estimatedPoints: Int? = nil,
        fineRuleId: String? = nil,
        isEstimate: Bool = true,
        notePT: String,
        occurredAt: Date
    ) {
        self.id = id
        self.passageId = passageId
        self.radarId = radarId
        self.radarName = radarName
        self.limitKmh = limitKmh
        self.measuredSpeedKmh = measuredSpeedKmh
        self.excessKmh = excessKmh
        self.excessPercent = excessPercent
        self.severity = severity
        self.markerColor = markerColor
        self.confidence = confidence
        self.estimatedFineBRL = estimatedFineBRL
        self.estimatedPoints = estimatedPoints
        self.fineRuleId = fineRuleId
        self.isEstimate = true
        self.notePT = notePT
        self.occurredAt = occurredAt
    }
}
