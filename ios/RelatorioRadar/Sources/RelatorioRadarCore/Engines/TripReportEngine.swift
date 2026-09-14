import Foundation

public final class TripReportEngine: @unchecked Sendable {
    public init() {}

    public func build(
        session: TripSession,
        passages: [RadarPassage],
        violations: [ViolationEstimate],
        settings: VehicleSettings,
        costEngine: TripCostEngine
    ) -> TripReport {
        let started = session.startedAt ?? Date()
        let ended = session.endedAt ?? Date()
        let duration = max(0, ended.timeIntervalSince(started))
        let cost = costEngine.summarize(
            distanceM: session.distanceM,
            durationSeconds: duration,
            settings: settings
        )
        return TripReport(
            tripId: session.id,
            mode: session.mode,
            startedAt: started,
            endedAt: ended,
            durationSeconds: duration,
            distanceM: session.distanceM,
            maxSpeedKmh: session.maxSpeedKmh,
            sampleCount: session.samples.count,
            path: session.matchedPath.isEmpty
                ? session.samples.map(\.coordinate)
                : session.matchedPath,
            passages: passages,
            violations: violations,
            cost: cost
        )
    }

    public func textSummary(_ report: TripReport) -> String {
        var lines: [String] = [
            "Relatório Radar",
            report.disclaimerPT,
            "Início: \(Self.format(report.startedAt))",
            "Fim: \(Self.format(report.endedAt))",
            String(format: "Duração: %.0f min", report.durationSeconds / 60),
            String(format: "Distância: %.1f km", report.distanceM / 1000),
            String(format: "Vel. máx: %.0f km/h", report.maxSpeedKmh),
            "Radares: \(report.passages.count)",
            "Estimativas de excesso: \(report.overs.count)",
            "",
        ]
        for v in report.violations.sorted(by: { $0.occurredAt < $1.occurredAt }) {
            let flag: String
            switch v.markerColor {
            case .red: flag = "VERMELHO (estimativa)"
            case .yellow: flag = "AMARELO (estimativa)"
            case .green: flag = "OK"
            case .gray: flag = "CINZA"
            }
            lines.append(
                "\(flag) · \(v.radarName) · limite \(Int(v.limitKmh)) · \(Int(v.measuredSpeedKmh)) km/h · \(v.notePT)"
            )
        }
        if let cost = report.cost {
            lines.append("")
            lines.append(String(format: "Combustível est.: %.2f L / R$ %.2f", cost.fuelLiters, cost.fuelCostBRL))
        }
        return lines.joined(separator: "\n")
    }

    private static func format(_ date: Date) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "pt_BR")
        f.dateStyle = .short
        f.timeStyle = .medium
        return f.string(from: date)
    }
}
