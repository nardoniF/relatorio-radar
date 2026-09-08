import Foundation
import Combine
import RelatorioRadarCore

@MainActor
final class HomeViewModel: ObservableObject {
    @Published var mode: TripMode = .manual
    @Published var autoModeAvailable = false // MVP: toggle desabilitado
    @Published var statusMessage = "Pronto para iniciar"
    @Published var isStarting = false
    @Published var activeTrip: ActiveTripViewModel?

    private let appModel: AppModel

    init(appModel: AppModel) {
        self.appModel = appModel
    }

    func startTrip() {
        isStarting = true
        statusMessage = "Iniciando monitoramento…"

        let trip = TripEngine(
            mode: .manual,
            radars: DemoMapProvider.sampleRadars,
            fineRules: appModel.fineRules,
            vehicleSettings: appModel.settings
        )
        trip.start(mode: .manual)

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
        }
        activeTrip = vm
        appModel.backgroundCoordinator.beginTripMonitoring()
        vm.bindLocation()
        isStarting = false
        statusMessage = "Viagem ativa"
    }
}
