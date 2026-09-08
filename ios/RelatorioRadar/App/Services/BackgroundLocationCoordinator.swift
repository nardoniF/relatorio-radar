import Foundation
import RelatorioRadarCore

#if canImport(UIKit)
import UIKit
#endif

/// Coordena ciclo de vida de location em background durante viagem ativa.
///
/// Capability necessária no Xcode:
/// Target → Signing & Capabilities → **Background Modes** → ☑ Location updates
///
/// Sem isso, o iOS suspende o app e `CLLocationManager` para de entregar pontos.
public final class BackgroundLocationCoordinator: @unchecked Sendable {
    private let locationEngine: LocationEngine
    private var observers: [NSObjectProtocol] = []

    public init(locationEngine: LocationEngine) {
        self.locationEngine = locationEngine
        #if canImport(UIKit)
        let center = NotificationCenter.default
        observers.append(center.addObserver(
            forName: UIApplication.didEnterBackgroundNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.handleDidEnterBackground()
        })
        observers.append(center.addObserver(
            forName: UIApplication.willEnterForegroundNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.handleWillEnterForeground()
        })
        #endif
    }

    deinit {
        observers.forEach { NotificationCenter.default.removeObserver($0) }
    }

    public func beginTripMonitoring() {
        locationEngine.requestAlwaysAuthorizationIfNeeded()
        locationEngine.start()
    }

    public func endTripMonitoring() {
        locationEngine.stop()
    }

    private func handleDidEnterBackground() {
        // Com Background Modes → Location updates + autorização Always,
        // o LocationEngine já configurou allowsBackgroundLocationUpdates.
        // Aqui apenas garantimos que o monitoramento continua se a viagem estiver ativa.
        if locationEngine.isRunning {
            locationEngine.requestAlwaysAuthorizationIfNeeded()
        }
    }

    private func handleWillEnterForeground() {
        // no-op: samples continuam fluindo via delegate
    }
}
