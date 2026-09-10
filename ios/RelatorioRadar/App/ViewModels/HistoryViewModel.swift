import Foundation
import RelatorioRadarCore

@MainActor
final class HistoryViewModel: ObservableObject {
    @Published var reports: [TripReport] = []
    @Published var selected: TripReport?

    private let store: LocalTripStoring

    init(store: LocalTripStoring) {
        self.store = store
    }

    func reload() {
        reports = (try? store.loadAllReports()) ?? []
    }

    func delete(_ report: TripReport) {
        try? store.deleteReport(id: report.id)
        reload()
    }
}
