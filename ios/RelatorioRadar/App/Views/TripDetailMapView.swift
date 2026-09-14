import SwiftUI
import MapKit
import RelatorioRadarCore

struct TripDetailMapView: View {
    let coordinates: [CLLocationCoordinate2D]
    let markers: [ReportViewModel.MarkerItem]

    @State private var position: MapCameraPosition = .automatic

    var body: some View {
        Map(position: $position) {
            if coordinates.count >= 2 {
                MapPolyline(coordinates: coordinates)
                    .stroke(.blue, lineWidth: 4)
            }
            ForEach(markers) { marker in
                Annotation(marker.title, coordinate: marker.coordinate) {
                    Circle()
                        .fill(color(for: marker.color))
                        .frame(width: 14, height: 14)
                        .overlay(Circle().stroke(.white, lineWidth: 2))
                }
            }
        }
        .mapStyle(.standard(elevation: .flat))
        .onAppear {
            if let region = regionFitting() {
                position = .region(region)
            }
        }
    }

    private func color(for marker: ViolationMarkerColor) -> Color {
        switch marker {
        case .green: return .green
        case .yellow: return .yellow
        case .red: return .red
        case .gray: return .gray
        }
    }

    private func regionFitting() -> MKCoordinateRegion? {
        let pts = coordinates + markers.map(\.coordinate)
        guard !pts.isEmpty else { return nil }
        var minLat = pts[0].latitude, maxLat = pts[0].latitude
        var minLng = pts[0].longitude, maxLng = pts[0].longitude
        for p in pts {
            minLat = min(minLat, p.latitude)
            maxLat = max(maxLat, p.latitude)
            minLng = min(minLng, p.longitude)
            maxLng = max(maxLng, p.longitude)
        }
        let center = CLLocationCoordinate2D(
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2
        )
        let span = MKCoordinateSpan(
            latitudeDelta: max(0.01, (maxLat - minLat) * 1.4),
            longitudeDelta: max(0.01, (maxLng - minLng) * 1.4)
        )
        return MKCoordinateRegion(center: center, span: span)
    }
}
