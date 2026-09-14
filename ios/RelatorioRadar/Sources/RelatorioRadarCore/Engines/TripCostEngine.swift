import Foundation

/// Custo estimado da viagem a partir de distância + VehicleSettings.
public final class TripCostEngine: @unchecked Sendable {
    public init() {}

    public func summarize(
        distanceM: Double,
        durationSeconds: TimeInterval,
        settings: VehicleSettings
    ) -> TripCostSummary {
        let distanceKm = max(0, distanceM) / 1000
        let economy = max(0.1, settings.fuelEconomyKmPerLiter)
        let liters = distanceKm / economy
        let cost = liters * max(0, settings.fuelPriceBRLPerLiter)
        let hours = max(durationSeconds, 1) / 3600
        let avgSpeed = distanceKm / hours

        return TripCostSummary(
            distanceKm: distanceKm,
            fuelLiters: liters,
            fuelCostBRL: cost,
            averageSpeedKmh: avgSpeed,
            durationSeconds: durationSeconds
        )
    }
}
