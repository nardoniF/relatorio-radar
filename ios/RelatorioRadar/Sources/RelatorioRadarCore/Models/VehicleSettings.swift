import Foundation

public struct VehicleSettings: Codable, Sendable, Equatable {
    public var displayName: String
    /// Consumo médio km/l.
    public var fuelEconomyKmPerLiter: Double
    /// Preço do combustível em R$/litro (configurado pelo usuário).
    public var fuelPriceBRLPerLiter: Double
    public var voiceAlertsEnabled: Bool
    public var hapticAlertsEnabled: Bool
    public var alertDistanceFactor: Double
    /// Tolerância de confiança mínima para marcar vermelho (0…1).
    public var minConfidenceForRed: Double

    public init(
        displayName: String = "Meu veículo",
        fuelEconomyKmPerLiter: Double = 10.0,
        fuelPriceBRLPerLiter: Double = 6.0,
        voiceAlertsEnabled: Bool = true,
        hapticAlertsEnabled: Bool = true,
        alertDistanceFactor: Double = 1.0,
        minConfidenceForRed: Double = 0.65
    ) {
        self.displayName = displayName
        self.fuelEconomyKmPerLiter = max(1, fuelEconomyKmPerLiter)
        self.fuelPriceBRLPerLiter = max(0, fuelPriceBRLPerLiter)
        self.voiceAlertsEnabled = voiceAlertsEnabled
        self.hapticAlertsEnabled = hapticAlertsEnabled
        self.alertDistanceFactor = max(0.5, min(2.0, alertDistanceFactor))
        self.minConfidenceForRed = min(1, max(0.3, minConfidenceForRed))
    }

    public static let `default` = VehicleSettings()
}
