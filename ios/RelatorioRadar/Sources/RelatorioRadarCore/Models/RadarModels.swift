import Foundation

/// Zona de proximidade em relação ao radar (adaptativa pela velocidade).
public enum RadarZone: String, Codable, Sendable, Comparable {
    case far1000
    case approach500
    case near300
    case close150
    case imminent50
    case pass

    public static func < (lhs: RadarZone, rhs: RadarZone) -> Bool {
        lhs.rank < rhs.rank
    }

    public var rank: Int {
        switch self {
        case .far1000: return 0
        case .approach500: return 1
        case .near300: return 2
        case .close150: return 3
        case .imminent50: return 4
        case .pass: return 5
        }
    }

    /// Raios base (metros) antes do fator adaptativo por velocidade.
    public var baseRadiusM: Double {
        switch self {
        case .far1000: return 1000
        case .approach500: return 500
        case .near300: return 300
        case .close150: return 150
        case .imminent50: return 50
        case .pass: return 35
        }
    }
}

public enum RadarDirectionKind: String, Codable, Sendable {
    case both
    case forward
    case reverse
    case unknown
}

public struct RadarPoint: Codable, Sendable, Identifiable, Hashable {
    public var id: String
    public var name: String
    public var coordinate: Coordinate
    public var limitKmh: Double
    /// Direção de fiscalização em graus (0–360), se conhecida.
    public var enforcementHeadingDeg: Double?
    public var directionKind: RadarDirectionKind
    public var cameraType: String?

    public init(
        id: String,
        name: String,
        coordinate: Coordinate,
        limitKmh: Double,
        enforcementHeadingDeg: Double? = nil,
        directionKind: RadarDirectionKind = .unknown,
        cameraType: String? = nil
    ) {
        self.id = id
        self.name = name
        self.coordinate = coordinate
        self.limitKmh = limitKmh
        self.enforcementHeadingDeg = enforcementHeadingDeg
        self.directionKind = directionKind
        self.cameraType = cameraType
    }
}

public struct RadarAlertState: Codable, Sendable, Equatable {
    public var radar: RadarPoint
    public var distanceM: Double
    public var zone: RadarZone
    public var sameDirection: Bool

    public init(radar: RadarPoint, distanceM: Double, zone: RadarZone, sameDirection: Bool) {
        self.radar = radar
        self.distanceM = distanceM
        self.zone = zone
        self.sameDirection = sameDirection
    }
}

public struct RadarPassage: Codable, Sendable, Identifiable, Hashable {
    public var id: UUID
    public var radar: RadarPoint
    public var passedAt: Date
    public var speedKmh: Double
    public var closestDistanceM: Double
    public var confidence: Double
    public var headingDeg: Double?

    public init(
        id: UUID = UUID(),
        radar: RadarPoint,
        passedAt: Date,
        speedKmh: Double,
        closestDistanceM: Double,
        confidence: Double,
        headingDeg: Double? = nil
    ) {
        self.id = id
        self.radar = radar
        self.passedAt = passedAt
        self.speedKmh = speedKmh
        self.closestDistanceM = closestDistanceM
        self.confidence = confidence
        self.headingDeg = headingDeg
    }
}
