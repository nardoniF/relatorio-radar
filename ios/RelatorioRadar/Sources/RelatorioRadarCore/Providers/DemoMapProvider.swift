import Foundation

/// Provider **local-first**: segmentos OSM-like + radares próprios em cache.
/// Sem API paga. Internet só para atualizar `RegionPack`.
public final class DemoMapProvider: MapDataProviding, @unchecked Sendable {
    public var radars: [RadarPoint]
    public var segments: [RoadSegmentLocal]
    public var matchRadiusM: Double

    public init(
        radars: [RadarPoint] = DemoMapProvider.sampleRadars,
        segments: [RoadSegmentLocal] = DemoMapProvider.sampleSegments,
        matchRadiusM: Double = 80
    ) {
        self.radars = radars
        self.segments = segments
        self.matchRadiusM = matchRadiusM
    }

    public convenience init(pack: RegionPack) {
        self.init(radars: pack.radars, segments: pack.segments)
    }

    public func match(samples: [PositionSample]) -> MapMatchResult {
        var coords: [Coordinate] = []
        var linkIds: [String] = []
        var limits: [Double?] = []
        var names: [String?] = []
        var confSum = 0.0

        for sample in samples {
            if let hit = nearestSegment(to: sample.coordinate, heading: sample.headingDeg) {
                coords.append(hit.projected)
                linkIds.append(hit.segment.id)
                limits.append(hit.segment.maxspeedKmh)
                names.append(hit.segment.name)
                confSum += hit.segment.confidence
            } else {
                coords.append(sample.coordinate)
                linkIds.append("")
                limits.append(nil)
                names.append(nil)
                confSum += 0.3
            }
        }

        let confidence = samples.isEmpty ? 0 : confSum / Double(samples.count)
        return MapMatchResult(
            coordinates: coords,
            confidence: confidence,
            linkIds: linkIds,
            speedLimitsKmh: limits,
            roadNames: names
        )
    }

    public func speedLimitKmh(at coordinate: Coordinate, heading: Double?) -> Double? {
        if let hit = nearestSegment(to: coordinate, heading: heading),
           let limit = hit.segment.maxspeedKmh {
            return limit
        }
        var best: (Double, Double)?
        for r in radars {
            let d = GeoMath.haversineMeters(coordinate, r.coordinate)
            if d < 120, best == nil || d < best!.0 {
                best = (d, r.limitKmh)
            }
        }
        return best?.1
    }

    /// Compatibilidade com chamadas sem heading.
    public func speedLimitKmh(at coordinate: Coordinate) -> Double? {
        speedLimitKmh(at: coordinate, heading: nil)
    }

    public func radars(near coordinate: Coordinate, radiusM: Double) -> [RadarPoint] {
        radars.filter { GeoMath.haversineMeters(coordinate, $0.coordinate) <= radiusM }
    }

    private struct Hit {
        var segment: RoadSegmentLocal
        var distanceM: Double
        var projected: Coordinate
    }

    private func nearestSegment(to point: Coordinate, heading: Double?) -> Hit? {
        var best: Hit?
        for seg in segments {
            let (dist, projected) = distanceToPolyline(point, seg.path)
            guard dist <= matchRadiusM else { continue }
            if let heading, let fwd = seg.forwardHeadingDeg {
                let ok =
                    GeoMath.headingMatches(heading, fwd, toleranceDeg: 70) ||
                    GeoMath.headingMatches(
                        heading,
                        GeoMath.normalizeHeading(fwd + 180),
                        toleranceDeg: 70
                    )
                if !ok { continue }
            }
            if best == nil || dist < best!.distanceM {
                best = Hit(segment: seg, distanceM: dist, projected: projected)
            }
        }
        return best
    }

    private func distanceToPolyline(_ point: Coordinate, _ path: [Coordinate]) -> (Double, Coordinate) {
        guard let first = path.first else { return (.infinity, point) }
        guard path.count > 1 else {
            return (GeoMath.haversineMeters(point, first), first)
        }
        var bestD = Double.infinity
        var bestP = first
        for i in 0..<(path.count - 1) {
            let a = path[i]
            let b = path[i + 1]
            let p = project(point, a, b)
            let d = GeoMath.haversineMeters(point, p)
            if d < bestD {
                bestD = d
                bestP = p
            }
        }
        return (bestD, bestP)
    }

    private func project(_ p: Coordinate, _ a: Coordinate, _ b: Coordinate) -> Coordinate {
        let ax = a.longitude, ay = a.latitude
        let bx = b.longitude, by = b.latitude
        let px = p.longitude, py = p.latitude
        let dx = bx - ax, dy = by - ay
        let len2 = dx * dx + dy * dy
        if len2 == 0 { return a }
        var t = ((px - ax) * dx + (py - ay) * dy) / len2
        t = max(0, min(1, t))
        return Coordinate(latitude: ay + t * dy, longitude: ax + t * dx)
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
        RadarPoint(
            id: "r_opposite",
            name: "Radar sentido oposto",
            coordinate: Coordinate(latitude: -23.5571, longitude: -46.6458),
            limitKmh: 50,
            enforcementHeadingDeg: 250,
            directionKind: .forward
        ),
    ]

    public static let sampleSegments: [RoadSegmentLocal] = [
        RoadSegmentLocal(
            id: "seg-1",
            name: "Rua da Consolação",
            path: [
                Coordinate(latitude: -23.5614, longitude: -46.6558),
                Coordinate(latitude: -23.5602, longitude: -46.6525),
                Coordinate(latitude: -23.5588, longitude: -46.6491),
                Coordinate(latitude: -23.5571, longitude: -46.6458),
            ],
            maxspeedKmh: 50,
            maxspeedSource: "osm",
            forwardHeadingDeg: 72,
            confidence: 0.85
        ),
        RoadSegmentLocal(
            id: "seg-2",
            name: "Av. Higienópolis",
            path: [
                Coordinate(latitude: -23.5539, longitude: -46.6395),
                Coordinate(latitude: -23.5526, longitude: -46.6362),
                Coordinate(latitude: -23.5514, longitude: -46.6328),
                Coordinate(latitude: -23.5505, longitude: -46.6291),
            ],
            maxspeedKmh: 40,
            maxspeedSource: "osm",
            forwardHeadingDeg: 80,
            confidence: 0.8
        ),
        RoadSegmentLocal(
            id: "seg-3",
            name: "Av. Pacaembu",
            path: [
                Coordinate(latitude: -23.5505, longitude: -46.6291),
                Coordinate(latitude: -23.5499, longitude: -46.6254),
                Coordinate(latitude: -23.5496, longitude: -46.6216),
                Coordinate(latitude: -23.5498, longitude: -46.6179),
            ],
            maxspeedKmh: 60,
            maxspeedSource: "local",
            forwardHeadingDeg: 90,
            confidence: 0.9
        ),
    ]
}

/// Nome explícito da arquitetura zero-custo.
public typealias LocalOfflineMapProvider = DemoMapProvider
