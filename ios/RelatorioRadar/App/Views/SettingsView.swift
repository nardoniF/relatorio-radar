import SwiftUI
import RelatorioRadarCore

struct SettingsView: View {
    @EnvironmentObject private var appModel: AppModel
    @State private var settings: VehicleSettings = .default
    @State private var savedMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Alertas") {
                    Toggle("Alertas de voz", isOn: $settings.voiceAlertsEnabled)
                    Toggle("Alertas táteis", isOn: $settings.hapticAlertsEnabled)
                    Stepper(
                        value: $settings.alertDistanceFactor,
                        in: 0.5...2.0,
                        step: 0.1
                    ) {
                        Text(String(format: "Alcance dos alertas ×%.1f", settings.alertDistanceFactor))
                    }
                }

                Section("Veículo") {
                    TextField("Nome", text: $settings.displayName)
                    HStack {
                        Text("Consumo (km/l)")
                        TextField(
                            "km/l",
                            value: $settings.fuelEconomyKmPerLiter,
                            format: .number
                        )
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                    }
                }

                Section("Combustível") {
                    HStack {
                        Text("Preço (R$/L)")
                        TextField(
                            "R$",
                            value: $settings.fuelPriceBRLPerLiter,
                            format: .number
                        )
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                    }
                }

                Section("Confiança") {
                    Stepper(
                        value: $settings.minConfidenceForRed,
                        in: 0.3...1.0,
                        step: 0.05
                    ) {
                        Text(String(
                            format: "Mín. para vermelho: %.0f%%",
                            settings.minConfidenceForRed * 100
                        ))
                    }
                    Text("Baixa confiança marca cinza/amarelo — nunca infração vermelha automática.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Section {
                    Button("Salvar") {
                        appModel.settings = settings
                        appModel.saveSettings()
                        savedMessage = "Preferências salvas"
                    }
                    if let savedMessage {
                        Text(savedMessage)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Section("Waze") {
                    Text("Deep-link opcional apenas. O app não faz scraping do Waze.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Section("CarPlay") {
                    Text("Arquitetura pronta (engines separados da UI). Interface CarPlay fora do MVP.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Ajustes")
            .onAppear { settings = appModel.settings }
        }
    }
}
