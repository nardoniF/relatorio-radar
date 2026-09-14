import XCTest
@testable import RelatorioRadarCore

final class RadarEngineTests: XCTestCase {
    func testOppositeDirectionIgnored() {
        let radar = RadarPoint(
            id: "opp",
            name: "Oposto",
            coordinate: Coordinate(latitude: -23.55, longitude: -46.64),
            limitKmh: 50,
            enforcementHeadingDeg: 250,
            directionKind: .forward
        )
        let engine = RadarEngine(radars: [radar], directionToleranceDeg: 75)
        let sample = PositionSample(
            coordinate: Coordinate(latitude: -23.55, longitude: -46.64),
            speedKmh: 60,
            accuracyM: 5,
            headingDeg: 70,
            confidence: 0.9
        )
        let result = engine.update(sample: sample)
        XCTAssertNil(result.alert)
        XCTAssertNil(result.newPassage)
    }

    func testSameDirectionAlerts() {
        let radar = RadarPoint(
            id: "same",
            name: "Mesmo",
            coordinate: Coordinate(latitude: -23.55, longitude: -46.64),
            limitKmh: 50,
            enforcementHeadingDeg: 70,
            directionKind: .forward
        )
        let engine = RadarEngine(radars: [radar])
        let sample = PositionSample(
            coordinate: Coordinate(latitude: -23.55, longitude: -46.641),
            speedKmh: 60,
            accuracyM: 5,
            headingDeg: 70,
            confidence: 0.9
        )
        let result = engine.update(sample: sample)
        XCTAssertNotNil(result.alert)
        XCTAssertEqual(result.alert?.radar.id, "same")
        XCTAssertTrue(result.alert!.sameDirection)
    }

    func testAdaptiveZonesGrowWithSpeed() {
        let slow = RadarEngine.adaptiveRadiusFactor(speedKmh: 40)
        let fast = RadarEngine.adaptiveRadiusFactor(speedKmh: 120)
        XCTAssertEqual(slow, 1.0, accuracy: 0.01)
        XCTAssertGreaterThan(fast, slow)
    }

    func testPassRecordsPassage() {
        let radar = RadarPoint(
            id: "p1",
            name: "Pass",
            coordinate: Coordinate(latitude: 0, longitude: 0),
            limitKmh: 40,
            enforcementHeadingDeg: 90,
            directionKind: .both
        )
        let engine = RadarEngine(radars: [radar])

        _ = engine.update(sample: PositionSample(
            coordinate: Coordinate(latitude: 0, longitude: 0.0001),
            speedKmh: 55,
            accuracyM: 5,
            headingDeg: 90,
            confidence: 0.9
        ))
        let result = engine.update(sample: PositionSample(
            coordinate: Coordinate(latitude: 0, longitude: 0.002),
            speedKmh: 55,
            accuracyM: 5,
            headingDeg: 90,
            confidence: 0.9
        ))
        XCTAssertNotNil(result.newPassage)
        XCTAssertEqual(result.newPassage?.radar.id, "p1")
        XCTAssertEqual(engine.passages.count, 1)
    }

    func testZoneOrdering() {
        XCTAssertEqual(
            RadarEngine.zone(distanceM: 40, speedKmh: 50),
            .imminent50
        )
        XCTAssertEqual(
            RadarEngine.zone(distanceM: 120, speedKmh: 50),
            .close150
        )
        XCTAssertNil(RadarEngine.zone(distanceM: 2000, speedKmh: 50))
    }
}
