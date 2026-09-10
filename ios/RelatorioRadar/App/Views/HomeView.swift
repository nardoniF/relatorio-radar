import SwiftUI
import RelatorioRadarCore

struct HomeView: View {
    @EnvironmentObject private var appModel: AppModel
    @State private var activeTrip: ActiveTripViewModel?
    @State private var statusMessage = "Pronto para iniciar"
    @State private var isStarting = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 28) {
                Spacer(minLength: 24)

                Text("Relatório Radar")
                    .font(.largeTitle.bold())
                    .accessibilityAddTraits(.isHeader)

                Text("Motor de conformidade viária em tempo real. Sem destino — inicie, dirija e finalize.")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                VStack(alignment: .leading, spacing: 8) {
                    Toggle(isOn: .constant(false)) {
                        Text("Modo automático")
                    }
                    .disabled(true)
                    Text("Modo automático opcional no MVP — use início manual.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal)

                Button {
                    startTrip()
                } label: {
                    Text("INICIAR VIAGEM")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                }
                .buttonStyle(.borderedProminent)
                .padding(.horizontal)
                .disabled(isStarting || activeTrip != nil)

                Text(statusMessage)
                    .font(.footnote)
                    .foregroundStyle(.secondary)

                if let report = appModel.lastReport {
                    NavigationLink("Ver último relatório") {
                        TripReportView(report: report)
                    }
                }

                Spacer()
            }
            .navigationTitle("Viagem")
            .navigationDestination(isPresented: Binding(
                get: { activeTrip != nil },
                set: { if !$0 { activeTrip = nil } }
            )) {
                if let trip = activeTrip {
                    ActiveTripView(vm: trip)
                }
            }
        }
    }

    private func startTrip() {
        isStarting = true
        statusMessage = "Iniciando monitoramento…"
        let homeVM = HomeViewModel(appModel: appModel)
        homeVM.startTrip()
        activeTrip = homeVM.activeTrip
        activeTrip?.onFinished = { report in
            appModel.lastReport = report
            activeTrip = nil
            statusMessage = "Viagem finalizada"
        }
        statusMessage = "Viagem ativa"
        isStarting = false
    }
}
