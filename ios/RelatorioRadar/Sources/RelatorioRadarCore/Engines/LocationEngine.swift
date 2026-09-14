import Foundation

#if canImport(CoreLocation)
import CoreLocation
#endif

public protocol LocationEngineDelegate: AnyObject {
    func locationEngine(_ engine: LocationEngineing, didUpdate sample: PositionSample)
    func locationEngine(_ engine: LocationEngineing, didFail message: String)
    func locationEngine(_ engine: LocationEngineing, statusChanged message: String)
}

/// Protocolo sem UI — permite mock / simulação / CarPlay futuro.
public protocol LocationEngineing: AnyObject {
    var delegate: LocationEngineDelegate? { get set }
    var lastSample: PositionSample? { get }
    var isRunning: Bool { get }
    func start()
    func stop()
    func requestAlwaysAuthorizationIfNeeded()
}

/// Wrapper de CLLocationManager quando CoreLocation está disponível.
public final class LocationEngine: NSObject, LocationEngineing {
    public weak var delegate: LocationEngineDelegate?
    public private(set) var lastSample: PositionSample?
    public private(set) var isRunning = false

    private let speedFilter = SpeedFilter()

    #if canImport(CoreLocation)
    private let manager = CLLocationManager()
    #endif

    public override init() {
        super.init()
        #if canImport(CoreLocation)
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBestForNavigation
        manager.distanceFilter = 5
        manager.activityType = .automotiveNavigation
        // Background Modes → Location updates deve estar habilitado no target.
        // allowsBackgroundLocationUpdates só é seguro após autorização "Sempre".
        manager.pausesLocationUpdatesAutomatically = false
        manager.showsBackgroundLocationIndicator = true
        #endif
    }

    public func requestAlwaysAuthorizationIfNeeded() {
        #if canImport(CoreLocation)
        switch manager.authorizationStatus {
        case .notDetermined:
            manager.requestAlwaysAuthorization()
        case .authorizedWhenInUse:
            // Upgrade para Always — necessário para monitoramento contínuo em viagem.
            manager.requestAlwaysAuthorization()
        default:
            break
        }
        #endif
    }

    public func start() {
        speedFilter.reset()
        isRunning = true
        #if canImport(CoreLocation)
        requestAlwaysAuthorizationIfNeeded()
        if manager.authorizationStatus == .authorizedAlways {
            manager.allowsBackgroundLocationUpdates = true
        }
        manager.startUpdatingLocation()
        manager.startUpdatingHeading()
        delegate?.locationEngine(self, statusChanged: "GPS ativo")
        #else
        delegate?.locationEngine(self, statusChanged: "CoreLocation indisponível nesta plataforma")
        #endif
    }

    public func stop() {
        isRunning = false
        #if canImport(CoreLocation)
        manager.stopUpdatingLocation()
        manager.stopUpdatingHeading()
        manager.allowsBackgroundLocationUpdates = false
        #endif
        delegate?.locationEngine(self, statusChanged: "GPS parado")
    }

    /// Injeta sample (simulação / testes) passando pelo mesmo filtro.
    public func ingestSimulated(_ raw: PositionSample) {
        let filtered = speedFilter.process(raw)
        let sample = PositionSample(
            coordinate: raw.coordinate,
            speedKmh: filtered.filteredSpeedKmh,
            accuracyM: raw.accuracyM,
            headingDeg: raw.headingDeg,
            altitudeM: raw.altitudeM,
            timestamp: raw.timestamp,
            confidence: filtered.confidence
        )
        lastSample = sample
        delegate?.locationEngine(self, didUpdate: sample)
    }
}

#if canImport(CoreLocation)
extension LocationEngine: CLLocationManagerDelegate {
    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard isRunning, let loc = locations.last else { return }
        let speedMs = loc.speed >= 0 ? loc.speed : 0
        let heading: Double? = {
            if loc.course >= 0 { return loc.course }
            return nil
        }()
        let raw = PositionSample(
            coordinate: Coordinate(latitude: loc.coordinate.latitude, longitude: loc.coordinate.longitude),
            speedKmh: speedMs * 3.6,
            accuracyM: loc.horizontalAccuracy >= 0 ? loc.horizontalAccuracy : nil,
            headingDeg: heading,
            altitudeM: loc.verticalAccuracy >= 0 ? loc.altitude : nil,
            timestamp: loc.timestamp,
            confidence: 1
        )
        let filtered = speedFilter.process(raw)
        let sample = PositionSample(
            coordinate: raw.coordinate,
            speedKmh: filtered.filteredSpeedKmh,
            accuracyM: raw.accuracyM,
            headingDeg: raw.headingDeg,
            altitudeM: raw.altitudeM,
            timestamp: raw.timestamp,
            confidence: filtered.confidence
        )
        lastSample = sample
        delegate?.locationEngine(self, didUpdate: sample)
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        delegate?.locationEngine(self, didFail: error.localizedDescription)
    }

    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        switch manager.authorizationStatus {
        case .authorizedAlways:
            if isRunning {
                manager.allowsBackgroundLocationUpdates = true
            }
            delegate?.locationEngine(self, statusChanged: "Autorização: Sempre")
        case .authorizedWhenInUse:
            delegate?.locationEngine(self, statusChanged: "Autorização: Durante o uso (recomenda-se Sempre)")
        case .denied, .restricted:
            delegate?.locationEngine(self, didFail: "Permissão de localização negada.")
        default:
            break
        }
    }
}
#endif
