import SwiftUI
import RelatorioRadarCore

struct TripHistoryView: View {
    @EnvironmentObject private var appModel: AppModel
    @State private var reports: [TripReport] = []

    var body: some View {
        NavigationStack {
            List {
                ForEach(reports) { report in
                    NavigationLink {
                        TripReportView(report: report)
                    } label: {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(report.startedAt.formatted(date: .abbreviated, time: .shortened))
                            Text(String(
                                format: "%.1f km · %d radares · %d excessos est.",
                                report.distanceM / 1000,
                                report.passages.count,
                                report.overs.count
                            ))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        }
                    }
                }
                .onDelete { indexSet in
                    for i in indexSet {
                        try? appModel.store.deleteReport(id: reports[i].id)
                    }
                    reload()
                }
            }
            .navigationTitle("Histórico")
            .overlay {
                if reports.isEmpty {
                    Text("Nenhuma viagem salva")
                        .foregroundStyle(.secondary)
                }
            }
            .onAppear(perform: reload)
        }
    }

    private func reload() {
        reports = (try? appModel.store.loadAllReports()) ?? []
    }
}
