import SwiftUI
import MapKit
import RelatorioRadarCore

struct TripReportView: View {
    @StateObject private var vm: ReportViewModel

    init(report: TripReport) {
        _vm = StateObject(wrappedValue: ReportViewModel(report: report))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(vm.report.disclaimerPT)
                    .font(.caption)
                    .foregroundStyle(.secondary)

                summaryBlock

                TripDetailMapView(
                    coordinates: vm.polylineCoordinates,
                    markers: vm.radarMarkers
                )
                .frame(height: 260)
                .clipShape(RoundedRectangle(cornerRadius: 8))

                Text("Passagens (cronológico)")
                    .font(.headline)

                ForEach(vm.chronological) { item in
                    HStack(alignment: .top) {
                        Circle()
                            .fill(color(for: item.markerColor))
                            .frame(width: 12, height: 12)
                            .padding(.top, 4)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.radarName)
                                .font(.subheadline.weight(.semibold))
                            Text("\(Int(item.measuredSpeedKmh)) km/h · limite \(Int(item.limitKmh))")
                                .font(.caption)
                            Text(item.notePT)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                            if let fine = item.estimatedFineBRL {
                                Text(String(format: "Estimativa: R$ %.2f", fine))
                                    .font(.caption2)
                            }
                        }
                        Spacer()
                    }
                    .padding(.vertical, 4)
                }
            }
            .padding()
        }
        .navigationTitle("Relatório")
    }

    private var summaryBlock: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(String(format: "Distância %.1f km", vm.report.distanceM / 1000))
            Text(String(format: "Vel. máx %.0f km/h", vm.report.maxSpeedKmh))
            Text("Radares: \(vm.report.passages.count) · Excesso est.: \(vm.report.overs.count)")
            if let cost = vm.report.cost {
                Text(String(format: "Combustível est.: %.2f L / R$ %.2f", cost.fuelLiters, cost.fuelCostBRL))
            }
        }
        .font(.subheadline)
    }

    private func color(for marker: ViolationMarkerColor) -> Color {
        switch marker {
        case .green: return .green
        case .yellow: return .yellow
        case .red: return .red
        case .gray: return .gray
        }
    }
}
