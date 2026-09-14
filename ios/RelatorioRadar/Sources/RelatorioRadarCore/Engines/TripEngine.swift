import Foundation

/// Orquestra o ciclo de vida da viagem (sem destino). Engines separados da UI.
public final class TripEngine: @unchecked Sendable {
    public private(set) var session: TripSession
    public let radarEngine: RadarEngine
    public let speedLimitEngine: SpeedLimitEngine
    public let mapMatchingEngine: MapMatchingEngine
    public let violationEngine: ViolationEngine
    public let costEngine: TripCostEngine
    public let alertEngine: AlertEngine

    public private(set) var currentLimitKmh: Double?
    public private(set) var lastAlert: RadarAlertState?
    public private(set) var pendingViolations: [ViolationEstimate] = []

    public var vehicleSettings: VehicleSettings {
        didSet {
            radarEngine.alertDistanceFactor = vehicleSettings.alertDistanceFactor
            violationEngine.minConfidenceForRed = vehicleSettings.minConfidenceForRed
            alertEngine.voiceEnabled = vehicleSettings.voiceAlertsEnabled
            alertEngine.hapticEnabled = vehicleSettings.hapticAlertsEnabled
        }
    }

    public init(
        mode: TripMode = .manual,
        radars: [RadarPoint] = [],
        fineRules: [FineRule] = [],
        vehicleSettings: VehicleSettings = .default,
        mapMatcher: MapMatchingProviding = DemoMapProvider(),
        speedLimitProvider: SpeedLimitProviding? = nil,
        voice: VoiceAlerting? = nil,
        haptic: HapticAlerting? = nil
    ) {
        self.session = TripSession(mode: mode)
        self.radarEngine = RadarEngine(
            radars: radars,
            alertDistanceFactor: vehicleSettings.alertDistanceFactor
        )
        self.speedLimitEngine = SpeedLimitEngine(provider: speedLimitProvider ?? DemoMapProvider())
        self.mapMatchingEngine = MapMatchingEngine(provider: mapMatcher)
        self.violationEngine = ViolationEngine(
            fineRules: fineRules,
            minConfidenceForRed: vehicleSettings.minConfidenceForRed
        )
        self.costEngine = TripCostEngine()
        self.alertEngine = AlertEngine(voice: voice, haptic: haptic)
        self.vehicleSettings = vehicleSettings
        self.alertEngine.voiceEnabled = vehicleSettings.voiceAlertsEnabled
        self.alertEngine.hapticEnabled = vehicleSettings.hapticAlertsEnabled
    }

    public func start(mode: TripMode = .manual) {
        radarEngine.reset()
        pendingViolations = []
        lastAlert = nil
        currentLimitKmh = nil
        session = TripSession(state: .starting, mode: mode, startedAt: Date())
        session.state = .active
        alertEngine.announceTripStarted()
    }

    public func pause() {
        guard session.state == .active else { return }
        session.state = .paused
    }

    public func resume() {
        guard session.state == .paused else { return }
        session.state = .active
    }

    public func cancel() {
        session.state = .cancelled
        session.endedAt = Date()
        alertEngine.announceTripCancelled()
    }

    @discardableResult
    public func ingest(_ sample: PositionSample) -> RadarPassage? {
        guard session.state == .active || session.state == .starting else { return nil }
        if session.state == .starting { session.state = .active }

        if let last = session.samples.last {
            session.distanceM += GeoMath.haversineMeters(last.coordinate, sample.coordinate)
        }
        session.samples.append(sample)
        session.maxSpeedKmh = max(session.maxSpeedKmh, sample.speedKmh)
        session.matchedPath.append(sample.coordinate)

        // Map matching em lotes a cada ~20 pontos.
        if session.samples.count % 20 == 0 {
            let batch = Array(session.samples.suffix(40))
            if let matched = mapMatchingEngine.matchBatch(batch) {
                session.matchedPath = mergePath(session.matchedPath, with: matched.coordinates)
            }
        }

        currentLimitKmh = speedLimitEngine.limitKmh(near: sample.coordinate) ?? currentLimitKmh

        let result = radarEngine.update(sample: sample)
        lastAlert = result.alert
        if let alert = result.alert {
            alertEngine.handleRadarAlert(alert)
        }
        if let passage = result.newPassage {
            let estimate = violationEngine.evaluate(passage: passage)
            pendingViolations.append(estimate)
            alertEngine.handlePassage(passage, estimate: estimate)
            return passage
        }
        return nil
    }

    public func finish(store: LocalTripStoring? = nil) -> TripReport {
        session.state = .finishing
        session.endedAt = Date()

        // Flush matching final.
        if let matched = mapMatchingEngine.matchBatch(session.samples) {
            session.matchedPath = matched.coordinates.isEmpty ? session.matchedPath : matched.coordinates
        }

        let reportEngine = TripReportEngine()
        let report = reportEngine.build(
            session: session,
            passages: radarEngine.passages,
            violations: pendingViolations.isEmpty
                ? violationEngine.evaluate(passages: radarEngine.passages)
                : pendingViolations,
            settings: vehicleSettings,
            costEngine: costEngine
        )
        session.state = .completed
        try? store?.save(report: report, session: session)
        alertEngine.announceTripFinished()
        return report
    }

    private func mergePath(_ existing: [Coordinate], with matched: [Coordinate]) -> [Coordinate] {
        if matched.isEmpty { return existing }
        if existing.count < 10 { return matched }
        // Mantém início e substitui cauda pelo match recente.
        let head = Array(existing.prefix(max(0, existing.count - matched.count)))
        return head + matched
    }
}
