import Foundation

/// Interfaces de alerta — implementação UI/AVFoundation fica no App (CarPlay-ready).
public protocol VoiceAlerting: AnyObject {
    func speak(_ phrasePT: String)
}

public protocol HapticAlerting: AnyObject {
    func pulse(intensity: Double)
}

public final class AlertEngine: @unchecked Sendable {
    public weak var voice: VoiceAlerting?
    public weak var haptic: HapticAlerting?
    public var voiceEnabled: Bool = true
    public var hapticEnabled: Bool = true

    private var lastSpokenRadarId: String?
    private var lastZone: RadarZone?

    public init(voice: VoiceAlerting? = nil, haptic: HapticAlerting? = nil) {
        self.voice = voice
        self.haptic = haptic
    }

    public func announceTripStarted() {
        speak("Viagem iniciada. Monitoramento ativo.")
    }

    public func announceTripFinished() {
        speak("Viagem finalizada. Relatório pronto.")
    }

    public func announceTripCancelled() {
        speak("Viagem cancelada.")
    }

    public func handleRadarAlert(_ alert: RadarAlertState) {
        let shouldSpeak =
            lastSpokenRadarId != alert.radar.id
            || (lastZone.map { $0 < alert.zone } ?? true)
        lastSpokenRadarId = alert.radar.id
        lastZone = alert.zone

        if hapticEnabled {
            let intensity: Double
            switch alert.zone {
            case .far1000, .approach500: intensity = 0.3
            case .near300, .close150: intensity = 0.6
            case .imminent50, .pass: intensity = 1.0
            }
            haptic?.pulse(intensity: intensity)
        }

        guard shouldSpeak, voiceEnabled else { return }
        let dist = Int(alert.distanceM)
        speak("Radar à frente, \(dist) metros. Limite \(Int(alert.radar.limitKmh)) quilômetros por hora.")
    }

    public func handlePassage(_ passage: RadarPassage, estimate: ViolationEstimate) {
        guard voiceEnabled else { return }
        switch estimate.markerColor {
        case .green:
            speak("Passagem registrada. Dentro do limite estimado.")
        case .yellow:
            speak("Atenção. Possível excesso estimado.")
        case .red:
            speak("Excesso estimado. Consulte o relatório.")
        case .gray:
            speak("Passagem registrada. Dados insuficientes.")
        }
    }

    private func speak(_ phrase: String) {
        guard voiceEnabled else { return }
        voice?.speak(phrase)
    }
}
