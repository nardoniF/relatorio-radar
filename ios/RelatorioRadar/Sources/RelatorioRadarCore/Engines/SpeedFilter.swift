import Foundation

/// Filtro de velocidade GPS: reduz spikes e deriva confiança a partir da acurácia.
public final class SpeedFilter: @unchecked Sendable {
    public struct Output: Sendable, Equatable {
        public var filteredSpeedKmh: Double
        public var confidence: Double
    }

    private var emaSpeed: Double?
    private let alpha: Double
    private let maxJumpKmh: Double

    public init(alpha: Double = 0.35, maxJumpKmh: Double = 25) {
        self.alpha = min(1, max(0.05, alpha))
        self.maxJumpKmh = max(5, maxJumpKmh)
    }

    public func reset() {
        emaSpeed = nil
    }

    public func process(_ sample: PositionSample) -> Output {
        var raw = max(0, sample.speedKmh)
        if let prev = emaSpeed, abs(raw - prev) > maxJumpKmh {
            // Clamp spike: aproxima gradualmente do valor bruto.
            raw = prev + (raw > prev ? maxJumpKmh : -maxJumpKmh)
        }

        let filtered: Double
        if let prev = emaSpeed {
            filtered = prev + alpha * (raw - prev)
        } else {
            filtered = raw
        }
        emaSpeed = filtered

        let confidence = confidenceFrom(accuracyM: sample.accuracyM, speedKmh: filtered)
        return Output(filteredSpeedKmh: filtered, confidence: confidence)
    }

    /// Acurácia ruim → confiança baixa (gates de violação usam isso).
    public static func confidenceFrom(accuracyM: Double?, speedKmh: Double) -> Double {
        guard let acc = accuracyM, acc > 0 else {
            return speedKmh > 3 ? 0.55 : 0.4
        }
        // ~5 m → alta; >40 m → baixa
        let accScore: Double
        if acc <= 5 {
            accScore = 1.0
        } else if acc >= 50 {
            accScore = 0.15
        } else {
            accScore = 1.0 - (acc - 5) / 45.0 * 0.85
        }
        // Velocidade muito baixa com GPS ruidoso é menos confiável para excesso.
        let speedScore = speedKmh < 5 ? 0.7 : 1.0
        return min(1, max(0, accScore * speedScore))
    }

    // Instance convenience matching static API used in process.
    private func confidenceFrom(accuracyM: Double?, speedKmh: Double) -> Double {
        Self.confidenceFrom(accuracyM: accuracyM, speedKmh: speedKmh)
    }
}
