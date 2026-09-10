import XCTest
@testable import RelatorioRadarCore

final class ViolationEngineTests: XCTestCase {
    func testCTB218Bands() {
        XCTAssertEqual(ViolationEngine.severity(forExcessPercent: 0), .none)
        XCTAssertEqual(ViolationEngine.severity(forExcessPercent: 15), .medium)
        XCTAssertEqual(ViolationEngine.severity(forExcessPercent: 20), .medium)
        XCTAssertEqual(ViolationEngine.severity(forExcessPercent: 21), .serious)
        XCTAssertEqual(ViolationEngine.severity(forExcessPercent: 50), .serious)
        XCTAssertEqual(ViolationEngine.severity(forExcessPercent: 51), .verySerious)
    }

    func testNeverHardcodesFineWithoutRules() {
        let engine = ViolationEngine(fineRules: [])
        let radar = RadarPoint(
            id: "r",
            name: "Teste",
            coordinate: Coordinate(latitude: 0, longitude: 0),
            limitKmh: 60
        )
        let passage = RadarPassage(
            radar: radar,
            passedAt: Date(),
            speedKmh: 90,
            closestDistanceM: 10,
            confidence: 0.9
        )
        let estimate = engine.evaluate(passage: passage)
        XCTAssertEqual(estimate.severity, .serious)
        XCTAssertNil(estimate.estimatedFineBRL)
        XCTAssertTrue(estimate.isEstimate)
        XCTAssertEqual(estimate.markerColor, .red)
    }

    func testInjectedFineRules() {
        let rules = [
            FineRule(id: "m", severity: .medium, amountBRL: 130.16, points: 4, labelPT: "Média"),
            FineRule(id: "g", severity: .serious, amountBRL: 195.23, points: 5, labelPT: "Grave"),
            FineRule(id: "gg", severity: .verySerious, amountBRL: 880.41, points: 7, labelPT: "Gravíssima"),
        ]
        let engine = ViolationEngine(fineRules: rules)
        let radar = RadarPoint(
            id: "r",
            name: "Teste",
            coordinate: Coordinate(latitude: 0, longitude: 0),
            limitKmh: 100
        )
        let passage = RadarPassage(
            radar: radar,
            passedAt: Date(),
            speedKmh: 110,
            closestDistanceM: 8,
            confidence: 0.85
        )
        let estimate = engine.evaluate(passage: passage)
        XCTAssertEqual(estimate.severity, .medium)
        XCTAssertEqual(estimate.estimatedFineBRL, 130.16)
        XCTAssertEqual(estimate.fineRuleId, "m")
    }

    func testLowConfidenceNotRed() {
        let engine = ViolationEngine(fineRules: [], minConfidenceForRed: 0.65)
        let radar = RadarPoint(
            id: "r",
            name: "Teste",
            coordinate: Coordinate(latitude: 0, longitude: 0),
            limitKmh: 50
        )
        let low = RadarPassage(
            radar: radar,
            passedAt: Date(),
            speedKmh: 80,
            closestDistanceM: 12,
            confidence: 0.3
        )
        XCTAssertEqual(engine.evaluate(passage: low).markerColor, .gray)

        let mid = RadarPassage(
            radar: radar,
            passedAt: Date(),
            speedKmh: 80,
            closestDistanceM: 12,
            confidence: 0.5
        )
        XCTAssertEqual(engine.evaluate(passage: mid).markerColor, .yellow)
    }
}
