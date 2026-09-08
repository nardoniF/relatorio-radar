import Foundation

/// Provider local para desenvolvimento sem contrato HERE.
/// Não substitui fonte licenciada em produção.
public final class DemoMapProvider: MapDataProviding, @unchecked Sendable {
    public var radars: [RadarPoint]
    public var defaultLimitKmh: Double

    public init(radars: [RadarPoint] = DemoMapProvider.sampleRadars, defaultLimitKmh: Double = 50) {
        self.radars = radars
        self.defaultLimitKmh = defaultLimitKmh
    }

    public func match(samples: [PositionSample]) -> MapMatchResult {
        // Demo: retorna o próprio trace com leve suavização de confiança por acurácia.
        let coords = samples.map(\.coordinate)
        let avgAcc = samples.compactMap(\.accuracyM).reduce(0, +)
            / Double(max(1, samples.compactMap(\.accuracyM).count))
        let confidence = SpeedFilter.confidenceFrom(accuracyM: avgAcc > 0 ? avgAcc : 8, speedKmh: 40)
        return MapMatchResult(coordinates: coords, confidence: confidence)
    }

    public func speedLimitKmh(at coordinate: Coordinate) -> Double? {
        // Usa limite do radar mais próximo se < 400 m; senão default.
        var best: (Double, Double)? // dist, limit
        for r in radars {
            let d = GeoMath.haversineMeters(coordinate, r.coordinate)
            if d < 400, best == nil || d < best!.0 {
                best = (d, r.limitKmh)
            }
        }
        return best?.1 ?? defaultLimitKmh
    }

    public func radars(near coordinate: Coordinate, radiusM: Double) -> [RadarPoint] {
        radars.filter { GeoMath.haversineMeters(coordinate, $0.coordinate) <= radiusM }
    }

    public static let sampleRadars: [RadarPoint] = [
        RadarPoint(
            id: "r1",
            name: "Radar Consolação",
            coordinate: Coordinate(latitude: -23.5595, longitude: -46.6508),
            limitKmh: 50,
            enforcementHeadingDeg: 70,
            directionKind: .forward
        ),
        RadarPoint(
            id: "r2",
            name: "Radar Augusta",
            coordinate: Coordinate(latitude: -23.5558, longitude: -46.6435),
            limitKmh: 50,
            enforcementHeadingDeg: 70,
            directionKind: .forward
        ),
        RadarPoint(
            id: "r3",
            name: "Radar Higienópolis",
            coordinate: Coordinate(latitude: -23.5518, longitude: -46.6345),
            limitKmh: 40,
            enforcementHeadingDeg: 75,
            directionKind: .forward
        ),
        RadarPoint(
            id: "r4",
            name: "Radar Pacaembu",
            coordinate: Coordinate(latitude: -23.5497, longitude: -46.6235),
            limitKmh: 60,
            enforcementHeadingDeg: 90,
            directionKind: .forward
        ),
        RadarPoint(
            id: "r5",
            name: "Radar Sumaré",
            coordinate: Coordinate(latitude: -23.5508, longitude: -46.6125),
            limitKmh: 50,
            enforcementHeadingDeg: 100,
            directionKind: .forward
        ),
        // Sentido oposto — deve ser ignorado quando heading ~70°.
        RadarPoint(
            id: "r_opposite",
            name: "Radar sentido oposto",
            coordinate: Coordinate(latitude: -23.5571, longitude: -46.6458),
            limitKmh: 50,
            enforcementHeadingDeg: 250,
            directionKind: .forward
        ),
    ]
}
