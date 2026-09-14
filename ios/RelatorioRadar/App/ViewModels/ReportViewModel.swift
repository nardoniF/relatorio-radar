import Foundation
import MapKit
import RelatorioRadarCore

@MainActor
final class ReportViewModel: ObservableObject {
    @Published var report: TripReport
    @Published var textSummary: String = ""

    private let reportEngine = TripReportEngine()

    init(report: TripReport) {
        self.report = report
        self.textSummary = reportEngine.textSummary(report)
    }

    var polylineCoordinates: [CLLocationCoordinate2D] {
        report.path.map { CLLocationCoordinate2D(latitude: $0.latitude, longitude: $0.longitude) }
    }

    struct MarkerItem: Identifiable {
        var id: String
        var coordinate: CLLocationCoordinate2D
        var color: ViolationMarkerColor
        var title: String
    }

    var radarMarkers: [MarkerItem] {
        report.violations.map { v in
            let passage = report.passages.first { $0.id == v.passageId }
            let coord = passage?.radar.coordinate
                ?? Coordinate(latitude: 0, longitude: 0)
            return MarkerItem(
                id: v.id.uuidString,
                coordinate: CLLocationCoordinate2D(latitude: coord.latitude, longitude: coord.longitude),
                color: v.markerColor,
                title: v.radarName
            )
        }
    }

    var chronological: [ViolationEstimate] {
        report.violations.sorted { $0.occurredAt < $1.occurredAt }
    }
}
