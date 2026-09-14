import Foundation
import CoreLocation
import MapKit
import UIKit
import RelatorioRadarCore

/// Planeja radares ao longo de uma rota (MapKit).
/// O Waze **não** expõe API pública de rota/radares — não scrapamos.
/// Fluxo: MapKit Directions → corredor de radares OSM → opcional abrir Waze para navegar.
enum RouteRadarPlanner {
    struct Plan: Sendable {
        var routeCoordinates: [CLLocationCoordinate2D]
        var radarsOnRoute: [RadarPoint]
        var distanceM: Double
        var expectedTravelTime: TimeInterval
    }

    static func plan(
        from: CLLocationCoordinate2D,
        to: CLLocationCoordinate2D,
        radars: [RadarPoint],
        corridorM: Double = 120,
        completion: @escaping (Result<Plan, Error>) -> Void
    ) {
        let request = MKDirections.Request()
        request.source = MKMapItem(placemark: MKPlacemark(coordinate: from))
        request.destination = MKMapItem(placemark: MKPlacemark(coordinate: to))
        request.transportType = .automobile
        request.requestsAlternateRoutes = false

        MKDirections(request: request).calculate { response, error in
            if let error {
                completion(.failure(error))
                return
            }
            guard let route = response?.routes.first else {
                completion(.failure(NSError(domain: "RouteRadarPlanner", code: 1, userInfo: [
                    NSLocalizedDescriptionKey: "Nenhuma rota encontrada",
                ])))
                return
            }

            var coords = [CLLocationCoordinate2D]()
            let poly = route.polyline
            let pointCount = poly.pointCount
            let ptr = poly.points()
            coords.reserveCapacity(pointCount)
            for i in 0..<pointCount {
                coords.append(ptr[i].coordinate)
            }

            let onRoute = radarsAlong(route: coords, radars: radars, corridorM: corridorM)
            completion(.success(Plan(
                routeCoordinates: coords,
                radarsOnRoute: onRoute,
                distanceM: route.distance,
                expectedTravelTime: route.expectedTravelTime
            )))
        }
    }

    static func radarsAlong(
        route: [CLLocationCoordinate2D],
        radars: [RadarPoint],
        corridorM: Double
    ) -> [RadarPoint] {
        guard !route.isEmpty else { return [] }
        var hits: [RadarPoint] = []
        for radar in radars {
            let p = CLLocationCoordinate2D(
                latitude: radar.coordinate.latitude,
                longitude: radar.coordinate.longitude
            )
            if distanceToRouteMeters(point: p, route: route) <= corridorM {
                hits.append(radar)
            }
        }
        return hits
    }

    private static func distanceToRouteMeters(
        point: CLLocationCoordinate2D,
        route: [CLLocationCoordinate2D]
    ) -> Double {
        guard route.count >= 2 else {
            let a = route.first ?? point
            return CLLocation(latitude: point.latitude, longitude: point.longitude)
                .distance(from: CLLocation(latitude: a.latitude, longitude: a.longitude))
        }
        var best = Double.greatestFiniteMagnitude
        for i in 0..<(route.count - 1) {
            let d = distancePointToSegment(point, route[i], route[i + 1])
            if d < best { best = d }
        }
        return best
    }

    private static func distancePointToSegment(
        _ p: CLLocationCoordinate2D,
        _ a: CLLocationCoordinate2D,
        _ b: CLLocationCoordinate2D
    ) -> Double {
        let ax = a.longitude, ay = a.latitude
        let bx = b.longitude, by = b.latitude
        let px = p.longitude, py = p.latitude
        let dx = bx - ax, dy = by - ay
        let len2 = dx * dx + dy * dy
        var t = len2 == 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2
        t = max(0, min(1, t))
        let proj = CLLocationCoordinate2D(latitude: ay + t * dy, longitude: ax + t * dx)
        return CLLocation(latitude: p.latitude, longitude: p.longitude)
            .distance(from: CLLocation(latitude: proj.latitude, longitude: proj.longitude))
    }

    /// Abre o Waze só para navegar (deep link). Não lê rota/radares do Waze.
    static func openWazeNavigation(to coordinate: CLLocationCoordinate2D) {
        let urlString =
            "https://waze.com/ul?ll=\(coordinate.latitude),\(coordinate.longitude)&navigate=yes"
        guard let url = URL(string: urlString) else { return }
        DispatchQueue.main.async {
            UIApplication.shared.open(url)
        }
    }
}
