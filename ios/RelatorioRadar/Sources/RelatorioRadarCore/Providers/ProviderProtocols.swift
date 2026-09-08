import Foundation

// MARK: - Map matching

public struct MapMatchResult: Sendable {
    public var coordinates: [Coordinate]
    public var confidence: Double
    public var linkIds: [String]

    public init(coordinates: [Coordinate], confidence: Double, linkIds: [String] = []) {
        self.coordinates = coordinates
        self.confidence = confidence
        self.linkIds = linkIds
    }
}

public protocol MapMatchingProviding: AnyObject {
    func match(samples: [PositionSample]) -> MapMatchResult
}

// MARK: - Speed limits

public protocol SpeedLimitProviding: AnyObject {
    func speedLimitKmh(at coordinate: Coordinate) -> Double?
}

// MARK: - Radars

public protocol RadarCatalogProviding: AnyObject {
    func radars(near coordinate: Coordinate, radiusM: Double) -> [RadarPoint]
}

// MARK: - Backend config

public protocol FineRulesProviding: AnyObject {
    func fetchFineRules() async throws -> [FineRule]
}

/// Contrato unificado para providers de mapa (Demo / proxy HERE).
/// Chaves comerciais **nunca** no app — apenas via backend.
public protocol MapDataProviding: MapMatchingProviding, SpeedLimitProviding, RadarCatalogProviding {}
