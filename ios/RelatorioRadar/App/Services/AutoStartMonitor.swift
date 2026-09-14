import Foundation
import CoreLocation
import RelatorioRadarCore

/// Monitora velocidade e dispara início automático acima do limiar (default 30 km/h).
/// Requer autorização "Sempre" + Background Modes → Location para funcionar com tela bloqueada.
@MainActor
final class AutoStartMonitor: NSObject, CLLocationManagerDelegate {
    var thresholdKmh: Double = 30
    var holdSeconds: TimeInterval = 3
    var onShouldStart: (() -> Void)?

    private let manager = CLLocationManager()
    private var aboveSince: Date?
    private var enabled = false
    private var triggered = false

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBestForNavigation
        manager.activityType = .automotiveNavigation
        manager.distanceFilter = 10
        manager.pausesLocationUpdatesAutomatically = false
        manager.showsBackgroundLocationIndicator = true
    }

    func start() {
        enabled = true
        triggered = false
        aboveSince = nil
        switch manager.authorizationStatus {
        case .notDetermined:
            manager.requestAlwaysAuthorization()
        case .authorizedWhenInUse:
            manager.requestAlwaysAuthorization()
        default:
            break
        }
        if manager.authorizationStatus == .authorizedAlways {
            manager.allowsBackgroundLocationUpdates = true
        }
        manager.startUpdatingLocation()
    }

    func stop() {
        enabled = false
        aboveSince = nil
        manager.stopUpdatingLocation()
        manager.allowsBackgroundLocationUpdates = false
    }

    func resetTrigger() {
        triggered = false
        aboveSince = nil
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let loc = locations.last else { return }
        let speedKmh = max(0, loc.speed) * 3.6
        Task { @MainActor in
            guard self.enabled, !self.triggered else { return }
            if speedKmh >= self.thresholdKmh {
                if self.aboveSince == nil { self.aboveSince = Date() }
                if let since = self.aboveSince,
                   Date().timeIntervalSince(since) >= self.holdSeconds {
                    self.triggered = true
                    self.onShouldStart?()
                }
            } else {
                self.aboveSince = nil
            }
        }
    }
}
