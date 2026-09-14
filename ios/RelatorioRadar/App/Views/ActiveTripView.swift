import SwiftUI
import RelatorioRadarCore

struct ActiveTripView: View {
    @ObservedObject var vm: ActiveTripViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 20) {
            Text(String(format: "%.0f", vm.speedKmh))
                .font(.system(size: 72, weight: .bold, design: .rounded))
                + Text(" km/h")
                .font(.title2)

            HStack {
                Label(
                    vm.limitKmh.map { String(format: "Limite %.0f", $0) } ?? "Limite —",
                    systemImage: "gauge.with.dots.needle.33percent"
                )
                Spacer()
                Text(String(format: "%.1f km", vm.distanceKm))
            }
            .font(.headline)
            .padding(.horizontal)

            if let name = vm.radarName, let dist = vm.radarDistanceM {
                RadarAlertView(
                    radarName: name,
                    distanceM: dist,
                    zone: vm.zone,
                    limitKmh: vm.limitKmh
                )
            } else {
                Text("Nenhum radar próximo no mesmo sentido")
                    .foregroundStyle(.secondary)
            }

            Text(vm.status)
                .font(.caption)
                .foregroundStyle(.secondary)

            Spacer()

            Button(role: .destructive) {
                vm.finish()
                dismiss()
            } label: {
                Text("FINALIZAR")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
            }
            .buttonStyle(.borderedProminent)
            .tint(.red)
            .padding()
        }
        .navigationTitle("Viagem ativa")
        .navigationBarBackButtonHidden(true)
    }
}
