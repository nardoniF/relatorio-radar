import Foundation
import RelatorioRadarCore

/// Cliente HTTP para o backend proxy.
/// Chaves HERE/Mapbox **nunca** ficam no app — só no servidor.
public final class APIClient: @unchecked Sendable {
    /// Em device real, use HTTPS na LAN (ex.: https://192.168.x.x:3001).
    public static let defaultBaseURL = URL(string: "http://127.0.0.1:3001")!

    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder

    public init(baseURL: URL = APIClient.defaultBaseURL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
        self.decoder.keyDecodingStrategy = .convertFromSnakeCase
    }

    /// Payload do backend (`GET /fine-rules`) — mapeado para `FineRule` do Core.
    struct BackendFineRule: Codable, Sendable {
        var id: String
        var code: String
        var severity: String
        var article: String
        var excessMinPct: Double
        var excessMaxPct: Double?
        var fineBrl: Double
        var points: Int
        var suspendRight: Bool
        var description: String
        var active: Bool
    }

    struct FineRulesResponse: Codable, Sendable {
        var fineRules: [BackendFineRule]
        var disclaimer: String?
    }

    struct RadarDTO: Codable, Sendable {
        var id: String
        var name: String
        var lat: Double
        var lng: Double
        var speedLimitKmh: Double?
        var limitKmh: Double?
        var directionDeg: Double?
        var headingDeg: Double?
        var cameraType: String?

        var resolvedLimit: Double { speedLimitKmh ?? limitKmh ?? 50 }
        var resolvedHeading: Double? { directionDeg ?? headingDeg }
    }

    struct NearbyResponse: Codable, Sendable {
        var radars: [RadarDTO]
    }

    public func fetchFineRules() async throws -> [FineRule] {
        let url = baseURL.appendingPathComponent("fine-rules")
        do {
            let (data, response) = try await session.data(from: url)
            guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
                return Self.fallbackFineRules
            }
            let payload = try decoder.decode(FineRulesResponse.self, from: data)
            let mapped = payload.fineRules.compactMap { Self.mapRule($0) }
            return mapped.isEmpty ? Self.fallbackFineRules : mapped
        } catch {
            return Self.fallbackFineRules
        }
    }

    public func fetchRadars(near coordinate: Coordinate, radiusM: Double) async throws -> [RadarPoint] {
        var comps = URLComponents(
            url: baseURL.appendingPathComponent("radars/nearby"),
            resolvingAgainstBaseURL: false
        )!
        comps.queryItems = [
            URLQueryItem(name: "lat", value: String(coordinate.latitude)),
            URLQueryItem(name: "lng", value: String(coordinate.longitude)),
            URLQueryItem(name: "radiusM", value: String(Int(radiusM))),
        ]
        guard let url = comps.url else { return DemoMapProvider.sampleRadars }
        do {
            let (data, response) = try await session.data(from: url)
            guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
                return DemoMapProvider.sampleRadars
            }
            let payload = try decoder.decode(NearbyResponse.self, from: data)
            return payload.radars.map {
                RadarPoint(
                    id: $0.id,
                    name: $0.name,
                    coordinate: Coordinate(latitude: $0.lat, longitude: $0.lng),
                    limitKmh: $0.resolvedLimit,
                    enforcementHeadingDeg: $0.resolvedHeading,
                    directionKind: .forward,
                    cameraType: $0.cameraType
                )
            }
        } catch {
            return DemoMapProvider.sampleRadars
        }
    }

    /// Baixa pack regional (ruas + limites + radares) para cache offline.
    public func fetchRegionPack(
        near coordinate: Coordinate,
        radiusKm: Double = 15
    ) async throws -> RegionPack {
        var comps = URLComponents(
            url: baseURL.appendingPathComponent("regions/pack"),
            resolvingAgainstBaseURL: false
        )!
        comps.queryItems = [
            URLQueryItem(name: "lat", value: String(coordinate.latitude)),
            URLQueryItem(name: "lng", value: String(coordinate.longitude)),
            URLQueryItem(name: "radiusKm", value: String(radiusKm)),
        ]
        guard let url = comps.url else {
            return RegionPack(radars: DemoMapProvider.sampleRadars, segments: DemoMapProvider.sampleSegments)
        }
        let (data, response) = try await session.data(from: url)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            return RegionPack(radars: DemoMapProvider.sampleRadars, segments: DemoMapProvider.sampleSegments)
        }
        struct PackEnvelope: Codable {
            var pack: PackBody
        }
        struct PackBody: Codable {
            var radars: [RadarDTO]
            var segments: [SegmentDTO]
            var disclaimer: String?
        }
        struct SegmentDTO: Codable {
            var id: String
            var name: String
            var path: [PathDTO]
            var maxspeedKmh: Double?
            var maxspeedSource: String?
            var forwardHeadingDeg: Double?
            var confidence: Double?
        }
        struct PathDTO: Codable {
            var lat: Double
            var lng: Double
        }
        let env = try decoder.decode(PackEnvelope.self, from: data)
        let radars = env.pack.radars.map {
            RadarPoint(
                id: $0.id,
                name: $0.name,
                coordinate: Coordinate(latitude: $0.lat, longitude: $0.lng),
                limitKmh: $0.resolvedLimit,
                enforcementHeadingDeg: $0.resolvedHeading,
                directionKind: .forward,
                cameraType: $0.cameraType
            )
        }
        let segments = env.pack.segments.map { s in
            RoadSegmentLocal(
                id: s.id,
                name: s.name,
                path: s.path.map { Coordinate(latitude: $0.lat, longitude: $0.lng) },
                maxspeedKmh: s.maxspeedKmh,
                maxspeedSource: s.maxspeedSource ?? "osm",
                forwardHeadingDeg: s.forwardHeadingDeg,
                confidence: s.confidence ?? 0.7
            )
        }
        return RegionPack(
            radars: radars,
            segments: segments,
            disclaimer: env.pack.disclaimer ?? "Pack offline."
        )
    }

    /// Deep-link opcional para Waze — **nunca** scraping.
    public static func wazeDeepLink(coordinate: Coordinate) -> URL? {
        URL(string: "waze://?ll=\(coordinate.latitude),\(coordinate.longitude)&navigate=yes")
    }

    private static func mapRule(_ r: BackendFineRule) -> FineRule? {
        guard r.active else { return nil }
        let severity: ViolationSeverity
        switch r.severity.lowercased() {
        case "media", "medium": severity = .medium
        case "grave", "serious": severity = .serious
        case "gravissima", "very_serious", "veryserious": severity = .verySerious
        default: return nil
        }
        return FineRule(
            id: r.code.isEmpty ? r.id : r.code,
            severity: severity,
            amountBRL: r.fineBrl,
            points: r.points,
            labelPT: r.description
        )
    }

    /// Fallback offline alinhado ao seed CTB — só se o backend estiver indisponível.
    /// Em produção preferir sempre `GET /fine-rules`.
    public static let fallbackFineRules: [FineRule] = [
        FineRule(id: "ctb_218_i", severity: .medium, amountBRL: 130.16, points: 4, labelPT: "CTB 218 I — estimativa"),
        FineRule(id: "ctb_218_ii", severity: .serious, amountBRL: 195.23, points: 5, labelPT: "CTB 218 II — estimativa"),
        FineRule(id: "ctb_218_iii", severity: .verySerious, amountBRL: 880.41, points: 7, labelPT: "CTB 218 III — estimativa"),
    ]
}
