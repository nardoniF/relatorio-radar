import Foundation
import RelatorioRadarCore

@MainActor
final class SettingsViewModel: ObservableObject {
    @Published var settings: VehicleSettings
    @Published var savedMessage: String?

    private let appModel: AppModel

    init(appModel: AppModel) {
        self.appModel = appModel
        self.settings = appModel.settings
    }

    func save() {
        appModel.settings = settings
        appModel.saveSettings()
        savedMessage = "Preferências salvas"
    }
}
