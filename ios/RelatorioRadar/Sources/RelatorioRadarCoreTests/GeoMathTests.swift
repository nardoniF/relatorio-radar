import XCTest
@testable import RelatorioRadarCore

final class GeoMathTests: XCTestCase {
    func testHaversineKnownDistance() {
        // ~111.2 km por grau de latitude
        let a = Coordinate(latitude: -23.0, longitude: -46.0)
        let b = Coordinate(latitude: -24.0, longitude: -46.0)
        let d = GeoMath.haversineMeters(a, b)
        XCTAssertEqual(d, 111_200, accuracy: 2_000)
    }

    func testBearingEast() {
        let a = Coordinate(latitude: 0, longitude: 0)
        let b = Coordinate(latitude: 0, longitude: 1)
        let bearing = GeoMath.bearingDegrees(a, b)
        XCTAssertEqual(bearing, 90, accuracy: 1)
    }

    func testSameDirection() {
        XCTAssertTrue(GeoMath.isSameDirection(vehicleHeading: 10, radarHeading: 20, toleranceDeg: 75))
        XCTAssertFalse(GeoMath.isSameDirection(vehicleHeading: 10, radarHeading: 200, toleranceDeg: 75))
    }

    func testSmallestAngle() {
        XCTAssertEqual(GeoMath.smallestAngleDeltaDegrees(10, 350), 20, accuracy: 0.01)
        XCTAssertEqual(GeoMath.smallestAngleDeltaDegrees(0, 180), 180, accuracy: 0.01)
    }

    func testPointAlongPath() {
        let path = [
            Coordinate(latitude: 0, longitude: 0),
            Coordinate(latitude: 0, longitude: 0.01),
        ]
        let total = GeoMath.pathLengthMeters(path)
        let mid = GeoMath.pointAlongPath(path, distanceM: total / 2)
        XCTAssertEqual(mid.point.longitude, 0.005, accuracy: 0.001)
        XCTAssertEqual(mid.headingDeg, 90, accuracy: 2)
    }
}
