import Foundation
import RelatorioRadarCore

/// Pack OSM de radares reais (São Paulo) empacotado no app.
@MainActor
final class OsmRadarStore {
    static let shared = OsmRadarStore()

    private(set) var radars: [RadarPoint] = DemoMapProvider.sampleRadars
    private(set) var count = 0
    private(set) var disclaimer =
        "Dados OSM comunitários; podem estar incompletos. Não é feed oficial CET/DER."
    private(set) var loaded = false

    private init() {
        loadFromBundle()
    }

    func loadFromBundle() {
        let names = ["sp_osm_speed_cameras", "sp_osm_speed_cameras.json"]
        var url: URL?
        for name in names {
            if let u = Bundle.main.url(forResource: name.replacingOccurrences(of: ".json", with: ""), withExtension: "json") {
                url = u
                break
            }
        }
        guard let url,
              let data = try? Data(contentsOf: url),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let arr = json["radars"] as? [[String: Any]]
        else {
            radars = DemoMapProvider.sampleRadars
            count = radars.count
            loaded = false
            return
        }

        if let d = json["disclaimer"] as? String { disclaimer = d }

        radars = arr.compactMap { item in
            guard let id = item["id"] as? String,
                  let name = item["name"] as? String,
                  let lat = item["lat"] as? Double,
                  let lng = item["lng"] as? Double
            else { return nil }
            let limit = (item["limitKmh"] as? Double) ?? Double(item["limitKmh"] as? Int ?? 50)
            return RadarPoint(
                id: id,
                name: name,
                coordinate: Coordinate(latitude: lat, longitude: lng),
                limitKmh: limit,
                directionKind: .unknown,
                cameraType: "fixed"
            )
        }
        count = radars.count
        loaded = !radars.isEmpty
        if radars.isEmpty {
            radars = DemoMapProvider.sampleRadars
            count = radars.count
        }
    }

    func nearby(to coordinate: Coordinate, radiusM: Double) -> [RadarPoint] {
        radars.filter { GeoMath.haversineMeters(coordinate, $0.coordinate) <= radiusM }
    }
}
