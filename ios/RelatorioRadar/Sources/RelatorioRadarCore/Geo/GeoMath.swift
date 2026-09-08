import Foundation

/// Matemática geoespacial pura (sem UI / MapKit).
public enum GeoMath {
    public static let earthRadiusM: Double = 6_371_000

    public static func toRadians(_ deg: Double) -> Double {
        deg * .pi / 180
    }

    public static func toDegrees(_ rad: Double) -> Double {
        rad * 180 / .pi
    }

    public static func haversineMeters(_ a: Coordinate, _ b: Coordinate) -> Double {
        let dLat = toRadians(b.latitude - a.latitude)
        let dLng = toRadians(b.longitude - a.longitude)
        let lat1 = toRadians(a.latitude)
        let lat2 = toRadians(b.latitude)
        let h =
            sin(dLat / 2) * sin(dLat / 2)
            + cos(lat1) * cos(lat2) * sin(dLng / 2) * sin(dLng / 2)
        return 2 * earthRadiusM * asin(min(1, sqrt(h)))
    }

    /// Rumo inicial a→b em graus [0, 360).
    public static func bearingDegrees(_ a: Coordinate, _ b: Coordinate) -> Double {
        let φ1 = toRadians(a.latitude)
        let φ2 = toRadians(b.latitude)
        let Δλ = toRadians(b.longitude - a.longitude)
        let y = sin(Δλ) * cos(φ2)
        let x = cos(φ1) * sin(φ2) - sin(φ1) * cos(φ2) * cos(Δλ)
        let deg = toDegrees(atan2(y, x))
        return (deg + 360).truncatingRemainder(dividingBy: 360)
    }

    /// Menor diferença angular absoluta em graus [0, 180].
    public static func smallestAngleDeltaDegrees(_ a: Double, _ b: Double) -> Double {
        let raw = abs(a - b).truncatingRemainder(dividingBy: 360)
        return raw > 180 ? 360 - raw : raw
    }

    /// true se headings estão no mesmo sentido (dentro de `toleranceDeg`).
    public static func isSameDirection(
        vehicleHeading: Double,
        radarHeading: Double,
        toleranceDeg: Double = 75
    ) -> Bool {
        smallestAngleDeltaDegrees(vehicleHeading, radarHeading) <= toleranceDeg
    }

    public static func pathLengthMeters(_ path: [Coordinate]) -> Double {
        guard path.count >= 2 else { return 0 }
        var total = 0.0
        for i in 0..<(path.count - 1) {
            total += haversineMeters(path[i], path[i + 1])
        }
        return total
    }

    public struct PathPoint: Sendable {
        public var point: Coordinate
        public var headingDeg: Double
        public var totalLengthM: Double
    }

    /// Interpola ao longo de um polyline por distância percorrida (metros).
    public static func pointAlongPath(_ path: [Coordinate], distanceM: Double) -> PathPoint {
        guard !path.isEmpty else {
            return PathPoint(point: Coordinate(latitude: 0, longitude: 0), headingDeg: 0, totalLengthM: 0)
        }
        guard path.count > 1 else {
            return PathPoint(point: path[0], headingDeg: 0, totalLengthM: 0)
        }

        var segs: [(a: Coordinate, b: Coordinate, len: Double)] = []
        var total = 0.0
        for i in 0..<(path.count - 1) {
            let len = haversineMeters(path[i], path[i + 1])
            segs.append((path[i], path[i + 1], len))
            total += len
        }

        var remaining = max(0, distanceM)
        if remaining >= total, let last = segs.last {
            return PathPoint(point: last.b, headingDeg: bearingDegrees(last.a, last.b), totalLengthM: total)
        }

        for seg in segs {
            if remaining <= seg.len {
                let t = seg.len == 0 ? 0 : remaining / seg.len
                let point = Coordinate(
                    latitude: seg.a.latitude + (seg.b.latitude - seg.a.latitude) * t,
                    longitude: seg.a.longitude + (seg.b.longitude - seg.a.longitude) * t
                )
                return PathPoint(point: point, headingDeg: bearingDegrees(seg.a, seg.b), totalLengthM: total)
            }
            remaining -= seg.len
        }

        return PathPoint(point: path[path.count - 1], headingDeg: 0, totalLengthM: total)
    }

    /// Velocidade estimada entre dois samples (km/h).
    public static func speedKmh(from: PositionSample, to: PositionSample) -> Double {
        let dt = to.timestamp.timeIntervalSince(from.timestamp)
        guard dt > 0.05 else { return to.speedKmh }
        let dist = haversineMeters(from.coordinate, to.coordinate)
        return (dist / dt) * 3.6
    }
}
