import Foundation

/// Replay de `trip.json` / fixture para testes e “simular no sofá”.
public final class TripSimulator: @unchecked Sendable {
    public struct TripFixture: Codable, Sendable {
        public var name: String
        public var speedKmh: Double
        public var path: [Coordinate]
        public var radars: [RadarPoint]?

        public init(name: String, speedKmh: Double, path: [Coordinate], radars: [RadarPoint]? = nil) {
            self.name = name
            self.speedKmh = speedKmh
            self.path = path
            self.radars = radars
        }
    }

    public var timeScale: Double
    public private(set) var isRunning = false

    private var fixture: TripFixture
    private var distanceM: Double = 0
    private var timer: Timer?
    private var onSample: ((PositionSample) -> Void)?
    private var onFinished: (() -> Void)?

    public init(fixture: TripFixture, timeScale: Double = 4) {
        self.fixture = fixture
        self.timeScale = max(0.5, timeScale)
    }

    public static func load(from url: URL) throws -> TripSimulator {
        let data = try Data(contentsOf: url)
        let decoder = JSONDecoder()
        let fixture = try decoder.decode(TripFixture.self, from: data)
        return TripSimulator(fixture: fixture)
    }

    public static func load(json: Data) throws -> TripSimulator {
        let fixture = try JSONDecoder().decode(TripFixture.self, from: json)
        return TripSimulator(fixture: fixture)
    }

    public var path: [Coordinate] { fixture.path }
    public var speedKmh: Double {
        get { fixture.speedKmh }
        set { fixture.speedKmh = min(140, max(10, newValue)) }
    }

    public func start(onSample: @escaping (PositionSample) -> Void, onFinished: @escaping () -> Void) {
        stop()
        self.onSample = onSample
        self.onFinished = onFinished
        distanceM = 0
        isRunning = true

        // Timer 10 Hz — funciona em testes (RunLoop) e no app.
        let interval = 0.1
        let timer = Timer(timeInterval: interval, repeats: true) { [weak self] _ in
            self?.tick(dt: interval)
        }
        self.timer = timer
        RunLoop.main.add(timer, forMode: .common)
    }

    /// Avanço síncrono para unit tests (sem RunLoop).
    public func advance(seconds: Double, onSample: (PositionSample) -> Void) -> Bool {
        let step = 0.1
        var t = 0.0
        var finished = false
        while t < seconds {
            let total = GeoMath.pathLengthMeters(fixture.path)
            let speedMs = (fixture.speedKmh / 3.6) * timeScale
            distanceM += speedMs * step
            if distanceM >= total {
                let p = GeoMath.pointAlongPath(fixture.path, distanceM: total)
                onSample(makeSample(point: p.point, heading: p.headingDeg))
                finished = true
                break
            }
            let p = GeoMath.pointAlongPath(fixture.path, distanceM: distanceM)
            onSample(makeSample(point: p.point, heading: p.headingDeg))
            t += step
        }
        return finished
    }

    public func stop() {
        isRunning = false
        timer?.invalidate()
        timer = nil
    }

    private func tick(dt: Double) {
        guard isRunning else { return }
        let total = GeoMath.pathLengthMeters(fixture.path)
        let speedMs = (fixture.speedKmh / 3.6) * timeScale
        distanceM += speedMs * dt

        if distanceM >= total {
            let p = GeoMath.pointAlongPath(fixture.path, distanceM: total)
            onSample?(makeSample(point: p.point, heading: p.headingDeg))
            stop()
            onFinished?()
            return
        }
        let p = GeoMath.pointAlongPath(fixture.path, distanceM: distanceM)
        onSample?(makeSample(point: p.point, heading: p.headingDeg))
    }

    private func makeSample(point: Coordinate, heading: Double) -> PositionSample {
        PositionSample(
            coordinate: point,
            speedKmh: fixture.speedKmh,
            accuracyM: 5,
            headingDeg: heading,
            timestamp: Date(),
            confidence: 0.9
        )
    }
}
