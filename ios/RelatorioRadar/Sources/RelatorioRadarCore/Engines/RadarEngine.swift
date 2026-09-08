import Foundation

/// Motor de radares: direção, zonas 1000/500/300/150/50/pass, raios adaptativos por velocidade.
public final class RadarEngine: @unchecked Sendable {
    public private(set) var radars: [RadarPoint]
    public var directionToleranceDeg: Double
    /// Fator do usuário (settings).
    public var alertDistanceFactor: Double

    private struct Approach {
        var radar: RadarPoint
        var enteredPass: Bool
        var closestM: Double
        var speedAtClosest: Double
        var confidenceAtClosest: Double
        var headingAtClosest: Double?
        var atClosest: Date
    }

    private var approaches: [String: Approach] = [:]
    private(set) public var passages: [RadarPassage] = []
    private(set) public var lastAlert: RadarAlertState?

    public init(
        radars: [RadarPoint] = [],
        directionToleranceDeg: Double = 75,
        alertDistanceFactor: Double = 1.0
    ) {
        self.radars = radars
        self.directionToleranceDeg = directionToleranceDeg
        self.alertDistanceFactor = alertDistanceFactor
    }

    public func setRadars(_ radars: [RadarPoint]) {
        self.radars = radars
    }

    public func reset() {
        approaches.removeAll()
        passages.removeAll()
        lastAlert = nil
    }

    /// Fator adaptativo: mais rápido → zonas maiores (mais tempo de alerta).
    public static func adaptiveRadiusFactor(speedKmh: Double) -> Double {
        // 40 km/h → 1.0; 80 → ~1.35; 120 → ~1.7
        let base = 40.0
        let capped = min(140, max(0, speedKmh))
        return 1.0 + max(0, (capped - base) / 80.0) * 0.7
    }

    public static func zone(
        distanceM: Double,
        speedKmh: Double,
        alertDistanceFactor: Double = 1.0
    ) -> RadarZone? {
        let f = adaptiveRadiusFactor(speedKmh: speedKmh) * alertDistanceFactor
        let ordered: [RadarZone] = [.pass, .imminent50, .close150, .near300, .approach500, .far1000]
        for z in ordered {
            if distanceM <= z.baseRadiusM * f {
                return z
            }
        }
        return nil
    }

    /// Determina se o veículo está no sentido fiscalizado. Opostos são ignorados.
    public func isRelevantDirection(vehicleHeading: Double?, radar: RadarPoint) -> Bool {
        switch radar.directionKind {
        case .both:
            return true
        case .unknown:
            // Sem heading do radar: aceita; se temos heading do veículo+radar, filtra.
            guard let vh = vehicleHeading, let rh = radar.enforcementHeadingDeg else {
                return true
            }
            return GeoMath.isSameDirection(
                vehicleHeading: vh,
                radarHeading: rh,
                toleranceDeg: directionToleranceDeg
            )
        case .forward, .reverse:
            guard let vh = vehicleHeading else { return true }
            guard let rh = radar.enforcementHeadingDeg else { return true }
            let expected = radar.directionKind == .reverse
                ? (rh + 180).truncatingRemainder(dividingBy: 360)
                : rh
            return GeoMath.isSameDirection(
                vehicleHeading: vh,
                radarHeading: expected,
                toleranceDeg: directionToleranceDeg
            )
        }
    }

    public struct UpdateResult: Sendable {
        public var alert: RadarAlertState?
        public var newPassage: RadarPassage?
    }

    public func update(sample: PositionSample) -> UpdateResult {
        var bestAlert: RadarAlertState?
        var newPassage: RadarPassage?

        for radar in radars {
            let sameDir = isRelevantDirection(vehicleHeading: sample.headingDeg, radar: radar)
            if !sameDir {
                // Sentido oposto: ignora alerta e passagem.
                continue
            }

            let d = GeoMath.haversineMeters(sample.coordinate, radar.coordinate)
            guard let zone = Self.zone(
                distanceM: d,
                speedKmh: sample.speedKmh,
                alertDistanceFactor: alertDistanceFactor
            ) else {
                // Saiu de todas as zonas — se estava em passagem, fecha.
                if let approach = approaches[radar.id], approach.enteredPass {
                    newPassage = finalizePassage(approach)
                    approaches.removeValue(forKey: radar.id)
                }
                continue
            }

            if bestAlert == nil || d < (bestAlert?.distanceM ?? .infinity) {
                bestAlert = RadarAlertState(
                    radar: radar,
                    distanceM: d,
                    zone: zone,
                    sameDirection: true
                )
            }

            let passRadius = RadarZone.pass.baseRadiusM
                * Self.adaptiveRadiusFactor(speedKmh: sample.speedKmh)
                * alertDistanceFactor

            if d <= passRadius {
                if var approach = approaches[radar.id] {
                    approach.enteredPass = true
                    if d < approach.closestM {
                        approach.closestM = d
                        approach.speedAtClosest = sample.speedKmh
                        approach.confidenceAtClosest = sample.confidence
                        approach.headingAtClosest = sample.headingDeg
                        approach.atClosest = sample.timestamp
                    }
                    approaches[radar.id] = approach
                } else {
                    approaches[radar.id] = Approach(
                        radar: radar,
                        enteredPass: true,
                        closestM: d,
                        speedAtClosest: sample.speedKmh,
                        confidenceAtClosest: sample.confidence,
                        headingAtClosest: sample.headingDeg,
                        atClosest: sample.timestamp
                    )
                }
            } else if let approach = approaches[radar.id], approach.enteredPass {
                newPassage = finalizePassage(approach)
                approaches.removeValue(forKey: radar.id)
            }
        }

        lastAlert = bestAlert
        return UpdateResult(alert: bestAlert, newPassage: newPassage)
    }

    private func finalizePassage(_ approach: Approach) -> RadarPassage {
        let passage = RadarPassage(
            radar: approach.radar,
            passedAt: approach.atClosest,
            speedKmh: approach.speedAtClosest,
            closestDistanceM: approach.closestM,
            confidence: approach.confidenceAtClosest,
            headingDeg: approach.headingAtClosest
        )
        passages.append(passage)
        return passage
    }
}
