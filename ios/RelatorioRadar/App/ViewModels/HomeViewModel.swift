import Foundation
import Combine
import RelatorioRadarCore

@MainActor
final class HomeViewModel: ObservableObject {
    @Published var mode: TripMode = .manual
    @Published var autoModeEnabled = false
    @Published var statusMessage = "Pronto para iniciar"
    @Published var isStarting = false
    @Published var activeTrip: ActiveTripViewModel?
    @Published var radarCount = 0

    private let appModel: AppModel
    private let autoStart = AutoStartMonitor()

    init(appModel: AppModel) {
        self.appModel = appModel
        self.radarCount = OsmRadarStore.shared.count
        autoStart.onShouldStart = { [weak self] in
            guard let self, self.activeTrip == nil else { return }
            self.statusMessage = "Movimento >30 km/h — iniciando…"
            self.startTrip(announce: true)
        }
    }

    func setAutoMode(_ on: Bool) {
        autoModeEnabled = on
        if on {
            appModel.location.requestAlwaysAuthorizationIfNeeded()
            autoStart.start()
            statusMessage = "Auto: esperando >30 km/h (permissão Sempre recomendada)"
        } else {
            autoStart.stop()
            statusMessage = "Modo automático desligado"
        }
    }

    func startTrip(announce: Bool = true) {
        isStarting = true
        let pack = OsmRadarStore.shared
        let radars = pack.loaded ? pack.radars : DemoMapProvider.sampleRadars
        radarCount = radars.count
        statusMessage = announce
            ? "Navegação iniciada · \(radars.count) radares mapeados"
            : "Iniciando monitoramento…"

        let trip = TripEngine(
            mode: autoModeEnabled ? .automatic : .manual,
            radars: radars,
            fineRules: appModel.fineRules,
            vehicleSettings: appModel.settings
        )
        trip.start(mode: autoModeEnabled ? .automatic : .manual)

        let vm = ActiveTripViewModel(
            tripEngine: trip,
            location: appModel.location,
            coordinator: appModel.backgroundCoordinator,
            store: appModel.store,
            settings: appModel.settings
        )
        vm.onFinished = { [weak self] report in
            self?.appModel.lastReport = report
            self?.activeTrip = nil
            self?.statusMessage = "Viagem finalizada"
            self?.autoStart.resetTrigger()
            if self?.autoModeEnabled == true {
                self?.autoStart.start()
            }
        }
        activeTrip = vm
        appModel.backgroundCoordinator.beginTripMonitoring()
        vm.bindLocation()
        // Durante a viagem o auto-monitor para (evita reentrada)
        autoStart.stop()
        isStarting = false
        statusMessage = "Viagem ativa · \(radars.count) radares OSM"
    }
}
