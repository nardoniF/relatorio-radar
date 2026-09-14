import SwiftUI
import RelatorioRadarCore

struct HomeView: View {
    @EnvironmentObject private var appModel: AppModel
    @State private var homeVM: HomeViewModel?
    @State private var autoMode = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer(minLength: 16)

                Text("Relatório Radar")
                    .font(.largeTitle.bold())
                    .accessibilityAddTraits(.isHeader)

                Text("App nativo: GPS em segundo plano, radares OSM reais e aviso ao iniciar a navegação.")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                Text("\(OsmRadarStore.shared.count) radares mapeados (OSM SP)")
                    .font(.subheadline.weight(.semibold))

                VStack(alignment: .leading, spacing: 8) {
                    Toggle(isOn: $autoMode) {
                        Text("Iniciar acima de 30 km/h")
                    }
                    .onChange(of: autoMode) { on in
                        homeVM?.setAutoMode(on)
                    }
                    Text("Com permissão Sempre, continua em segundo plano. Waze não é lido — MapKit + OSM planejam radares; Waze só abre para navegar se você pedir.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal)

                Button {
                    homeVM?.startTrip(announce: true)
                } label: {
                    Text("INICIAR VIAGEM")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                }
                .buttonStyle(.borderedProminent)
                .padding(.horizontal)
                .disabled(homeVM?.isStarting == true || homeVM?.activeTrip != nil)

                Text(homeVM?.statusMessage ?? "Carregando…")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                if let report = appModel.lastReport {
                    NavigationLink("Ver último relatório") {
                        TripReportView(report: report)
                    }
                }

                Spacer()
            }
            .navigationTitle("Viagem")
            .navigationDestination(isPresented: Binding(
                get: { homeVM?.activeTrip != nil },
                set: { if !$0 { homeVM?.activeTrip = nil } }
            )) {
                if let trip = homeVM?.activeTrip {
                    ActiveTripView(vm: trip)
                }
            }
            .onAppear {
                if homeVM == nil {
                    homeVM = HomeViewModel(appModel: appModel)
                }
            }
        }
    }
}
