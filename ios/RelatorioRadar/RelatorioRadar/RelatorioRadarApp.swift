import SwiftUI
import RelatorioRadarCore

@main
struct RelatorioRadarApp: App {
    @StateObject private var appModel = AppModel()

    var body: some Scene {
        WindowGroup {
            RootTabView()
                .environmentObject(appModel)
        }
    }
}

/// Container compartilhado — engines no Core, UI só observa.
@MainActor
final class AppModel: ObservableObject {
    let store: LocalTripStore
    let api: APIClient
    let location: LocationEngine
    let backgroundCoordinator: BackgroundLocationCoordinator

    @Published var settings: VehicleSettings
    @Published var fineRules: [FineRule] = []
    @Published var lastReport: TripReport?

    init() {
        let store = LocalTripStore()
        self.store = store
        self.settings = (try? store.loadSettings()) ?? .default
        self.api = APIClient(baseURL: APIClient.defaultBaseURL)
        self.location = LocationEngine()
        self.backgroundCoordinator = BackgroundLocationCoordinator(locationEngine: location)
        Task { await refreshFineRules() }
    }

    func refreshFineRules() async {
        do {
            fineRules = try await api.fetchFineRules()
        } catch {
            // Fallback vazio: ViolationEngine opera sem R$ até o backend responder.
            fineRules = []
        }
    }

    func saveSettings() {
        try? store.saveSettings(settings)
    }
}

struct RootTabView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem { Label("Viagem", systemImage: "car.fill") }
            TripHistoryView()
                .tabItem { Label("Histórico", systemImage: "clock") }
            SettingsView()
                .tabItem { Label("Ajustes", systemImage: "gearshape") }
        }
    }
}
