import XCTest
@testable import RelatorioRadarCore

final class SpeedFilterTests: XCTestCase {
    func testSmoothsSpike() {
        let filter = SpeedFilter(alpha: 0.35, maxJumpKmh: 20)
        let a = PositionSample(
            coordinate: Coordinate(latitude: 0, longitude: 0),
            speedKmh: 60,
            accuracyM: 5,
            confidence: 1
        )
        let b = PositionSample(
            coordinate: Coordinate(latitude: 0, longitude: 0),
            speedKmh: 140, // spike
            accuracyM: 5,
            confidence: 1
        )
        _ = filter.process(a)
        let out = filter.process(b)
        XCTAssertLessThan(out.filteredSpeedKmh, 100)
        XCTAssertGreaterThan(out.filteredSpeedKmh, 60)
    }

    func testLowAccuracyLowConfidence() {
        let conf = SpeedFilter.confidenceFrom(accuracyM: 55, speedKmh: 80)
        XCTAssertLessThan(conf, 0.3)
    }

    func testHighAccuracyHighConfidence() {
        let conf = SpeedFilter.confidenceFrom(accuracyM: 4, speedKmh: 80)
        XCTAssertGreaterThan(conf, 0.9)
    }
}
