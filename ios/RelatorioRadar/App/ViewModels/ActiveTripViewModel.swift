import Foundation
import Combine
import RelatorioRadarCore

@MainActor
final class ActiveTripViewModel: NSObject, ObservableObject {
    @Published var speedKmh: Double = 0
    @Published var limitKmh: Double?
    @Published var radarDistanceM: Double?
    @Published var radarName: String?
    @Published var zone: RadarZone?
    @Published var distanceKm: Double = 0
    @Published var status: String = "Monitorando"
    @Published var finishedReport: TripReport?

    let tripEngine: TripEngine
    private let location: LocationEngine
    private let coordinator: BackgroundLocationCoordinator
    private let store: LocalTripStoring
    var onFinished: ((TripReport) -> Void)?

    init(
        tripEngine: TripEngine,
        location: LocationEngine,
        coordinator: BackgroundLocationCoordinator,
        store: LocalTripStoring,
        settings: VehicleSettings
    ) {
        self.tripEngine = tripEngine
        self.location = location
        self.coordinator = coordinator
        self.store = store
        super.init()
    }

    func bindLocation() {
        location.delegate = self
    }

    func finish() {
        status = "Finalizando…"
        coordinator.endTripMonitoring()
        let report = tripEngine.finish(store: store)
        finishedReport = report
        onFinished?(report)
    }

    func cancel() {
        coordinator.endTripMonitoring()
        tripEngine.cancel()
    }
}

extension ActiveTripViewModel: LocationEngineDelegate {
    nonisolated func locationEngine(_ engine: LocationEngineing, didUpdate sample: PositionSample) {
        Task { @MainActor in
            _ = tripEngine.ingest(sample)
            speedKmh = sample.speedKmh
            limitKmh = tripEngine.currentLimitKmh
            distanceKm = tripEngine.session.distanceM / 1000
            if let alert = tripEngine.lastAlert {
                radarDistanceM = alert.distanceM
                radarName = alert.radar.name
                zone = alert.zone
            } else {
                radarDistanceM = nil
                radarName = nil
                zone = nil
            }
        }
    }

    nonisolated func locationEngine(_ engine: LocationEngineing, didFail message: String) {
        Task { @MainActor in status = message }
    }

    nonisolated func locationEngine(_ engine: LocationEngineing, statusChanged message: String) {
        Task { @MainActor in status = message }
    }
}
