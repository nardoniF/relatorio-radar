import Foundation

// MARK: - Map matching

public struct MapMatchResult: Sendable {
    public var coordinates: [Coordinate]
    public var confidence: Double
    public var linkIds: [String]
    public var speedLimitsKmh: [Double?]
    public var roadNames: [String?]

    public init(
        coordinates: [Coordinate],
        confidence: Double,
        linkIds: [String] = [],
        speedLimitsKmh: [Double?] = [],
        roadNames: [String?] = []
    ) {
        self.coordinates = coordinates
        self.confidence = confidence
        self.linkIds = linkIds
        self.speedLimitsKmh = speedLimitsKmh
        self.roadNames = roadNames
    }
}

public struct RoadSegmentLocal: Codable, Sendable, Identifiable, Hashable {
    public var id: String
    public var name: String
    public var path: [Coordinate]
    public var maxspeedKmh: Double?
    public var maxspeedSource: String
    public var forwardHeadingDeg: Double?
    public var confidence: Double

    public init(
        id: String,
        name: String,
        path: [Coordinate],
        maxspeedKmh: Double?,
        maxspeedSource: String = "osm",
        forwardHeadingDeg: Double? = nil,
        confidence: Double = 0.7
    ) {
        self.id = id
        self.name = name
        self.path = path
        self.maxspeedKmh = maxspeedKmh
        self.maxspeedSource = maxspeedSource
        self.forwardHeadingDeg = forwardHeadingDeg
        self.confidence = confidence
    }
}

/// Pack regional baixado do backend — cache offline no iPhone.
public struct RegionPack: Codable, Sendable {
    public var radars: [RadarPoint]
    public var segments: [RoadSegmentLocal]
    public var generatedAt: Date
    public var disclaimer: String

    public init(
        radars: [RadarPoint],
        segments: [RoadSegmentLocal],
        generatedAt: Date = Date(),
        disclaimer: String = "Pack offline. Limites OSM podem estar incompletos."
    ) {
        self.radars = radars
        self.segments = segments
        self.generatedAt = generatedAt
        self.disclaimer = disclaimer
    }
}

public protocol MapMatchingProviding: AnyObject {
    func match(samples: [PositionSample]) -> MapMatchResult
}

public protocol SpeedLimitProviding: AnyObject {
    func speedLimitKmh(at coordinate: Coordinate, heading: Double?) -> Double?
}

public protocol RadarCatalogProviding: AnyObject {
    func radars(near coordinate: Coordinate, radiusM: Double) -> [RadarPoint]
}

public protocol FineRulesProviding: AnyObject {
    func fetchFineRules() async throws -> [FineRule]
}

public protocol RegionPackStoring: AnyObject {
    func save(_ pack: RegionPack) throws
    func load() -> RegionPack?
}

/// Contrato unificado — **local/OSM first**. Sem chaves comerciais no app.
public protocol MapDataProviding: MapMatchingProviding, SpeedLimitProviding, RadarCatalogProviding {}
