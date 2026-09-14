import Foundation

// MARK: - Trip lifecycle

/// Estados da viagem. Sem destino obrigatório: idle → starting → active → finishing → completed.
public enum TripState: String, Codable, Sendable, CaseIterable {
    case idle
    case starting
    case active
    case paused
    case finishing
    case completed
    case cancelled
}

/// Modo de monitoramento (MVP: manual. Auto é stub opcional).
public enum TripMode: String, Codable, Sendable, CaseIterable {
    /// Usuário toca em INICIAR VIAGEM.
    case manual
    /// Futuro: detecção automática de movimento (stub no MVP).
    case automatic
}

public struct Coordinate: Codable, Sendable, Hashable {
    public var latitude: Double
    public var longitude: Double

    public init(latitude: Double, longitude: Double) {
        self.latitude = latitude
        self.longitude = longitude
    }
}

public struct PositionSample: Codable, Sendable, Hashable {
    public var coordinate: Coordinate
    public var speedKmh: Double
    public var accuracyM: Double?
    public var headingDeg: Double?
    public var altitudeM: Double?
    public var timestamp: Date
    /// Confiança 0…1 após SpeedFilter / map matching (baixa → não marcar infração vermelha).
    public var confidence: Double

    public init(
        coordinate: Coordinate,
        speedKmh: Double,
        accuracyM: Double? = nil,
        headingDeg: Double? = nil,
        altitudeM: Double? = nil,
        timestamp: Date = Date(),
        confidence: Double = 1.0
    ) {
        self.coordinate = coordinate
        self.speedKmh = speedKmh
        self.accuracyM = accuracyM
        self.headingDeg = headingDeg
        self.altitudeM = altitudeM
        self.timestamp = timestamp
        self.confidence = min(1, max(0, confidence))
    }
}

public struct TripSession: Codable, Sendable, Identifiable {
    public var id: UUID
    public var state: TripState
    public var mode: TripMode
    public var startedAt: Date?
    public var endedAt: Date?
    public var samples: [PositionSample]
    public var matchedPath: [Coordinate]
    public var distanceM: Double
    public var maxSpeedKmh: Double

    public init(
        id: UUID = UUID(),
        state: TripState = .idle,
        mode: TripMode = .manual,
        startedAt: Date? = nil,
        endedAt: Date? = nil,
        samples: [PositionSample] = [],
        matchedPath: [Coordinate] = [],
        distanceM: Double = 0,
        maxSpeedKmh: Double = 0
    ) {
        self.id = id
        self.state = state
        self.mode = mode
        self.startedAt = startedAt
        self.endedAt = endedAt
        self.samples = samples
        self.matchedPath = matchedPath
        self.distanceM = distanceM
        self.maxSpeedKmh = maxSpeedKmh
    }

    public var durationSeconds: TimeInterval {
        guard let start = startedAt else { return 0 }
        let end = endedAt ?? Date()
        return max(0, end.timeIntervalSince(start))
    }
}
