import Foundation

public struct TripCostSummary: Codable, Sendable, Hashable {
    public var distanceKm: Double
    public var fuelLiters: Double
    public var fuelCostBRL: Double
    public var averageSpeedKmh: Double
    public var durationSeconds: TimeInterval

    public init(
        distanceKm: Double,
        fuelLiters: Double,
        fuelCostBRL: Double,
        averageSpeedKmh: Double,
        durationSeconds: TimeInterval
    ) {
        self.distanceKm = distanceKm
        self.fuelLiters = fuelLiters
        self.fuelCostBRL = fuelCostBRL
        self.averageSpeedKmh = averageSpeedKmh
        self.durationSeconds = durationSeconds
    }
}

public struct TripReport: Codable, Sendable, Identifiable, Hashable {
    public var id: UUID
    public var tripId: UUID
    public var mode: TripMode
    public var startedAt: Date
    public var endedAt: Date
    public var durationSeconds: TimeInterval
    public var distanceM: Double
    public var maxSpeedKmh: Double
    public var sampleCount: Int
    public var path: [Coordinate]
    public var passages: [RadarPassage]
    public var violations: [ViolationEstimate]
    public var cost: TripCostSummary?
    /// Disclaimer sempre presente.
    public var disclaimerPT: String

    public init(
        id: UUID = UUID(),
        tripId: UUID,
        mode: TripMode,
        startedAt: Date,
        endedAt: Date,
        durationSeconds: TimeInterval,
        distanceM: Double,
        maxSpeedKmh: Double,
        sampleCount: Int,
        path: [Coordinate],
        passages: [RadarPassage],
        violations: [ViolationEstimate],
        cost: TripCostSummary? = nil,
        disclaimerPT: String = "Valores e infrações são ESTIMATIVAS. Não constituem multa oficial."
    ) {
        self.id = id
        self.tripId = tripId
        self.mode = mode
        self.startedAt = startedAt
        self.endedAt = endedAt
        self.durationSeconds = durationSeconds
        self.distanceM = distanceM
        self.maxSpeedKmh = maxSpeedKmh
        self.sampleCount = sampleCount
        self.path = path
        self.passages = passages
        self.violations = violations
        self.cost = cost
        self.disclaimerPT = disclaimerPT
    }

    public var overs: [ViolationEstimate] {
        violations.filter { $0.severity != .none }
    }
}
