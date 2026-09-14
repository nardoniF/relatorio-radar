import SwiftUI
import RelatorioRadarCore

/// Alerta mínimo, seguro para dirigir — tipografia grande, pouco texto.
struct RadarAlertView: View {
    let radarName: String
    let distanceM: Double
    let zone: RadarZone?
    let limitKmh: Double?

    var body: some View {
        VStack(spacing: 8) {
            Text("RADAR")
                .font(.caption.weight(.semibold))
                .tracking(2)
            Text(String(format: "%.0f m", distanceM))
                .font(.system(size: 44, weight: .bold, design: .rounded))
            Text(radarName)
                .font(.subheadline)
                .lineLimit(1)
            if let limit = limitKmh {
                Text("Limite \(Int(limit)) km/h")
                    .font(.headline)
            }
            if let zone {
                Text(zoneLabel(zone))
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(backgroundForZone(zone))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .padding(.horizontal)
        .accessibilityElement(children: .combine)
    }

    private func zoneLabel(_ z: RadarZone) -> String {
        switch z {
        case .far1000: return "Aproximação"
        case .approach500: return "500 m"
        case .near300: return "300 m"
        case .close150: return "150 m"
        case .imminent50: return "Iminente"
        case .pass: return "Passagem"
        }
    }

    private func backgroundForZone(_ z: RadarZone?) -> Color {
        switch z {
        case .imminent50, .pass: return Color.orange.opacity(0.25)
        case .close150, .near300: return Color.yellow.opacity(0.2)
        default: return Color.secondary.opacity(0.12)
        }
    }
}
