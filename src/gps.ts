import type { PositionSample } from './types'

export type GpsCallbacks = {
  onSample: (sample: PositionSample) => void
  onError: (message: string) => void
  onStatus: (message: string) => void
}

function speedFromCoords(coords: GeolocationCoordinates): number {
  // speed em m/s; pode ser null no Safari até estabilizar
  if (coords.speed != null && Number.isFinite(coords.speed) && coords.speed >= 0) {
    return coords.speed * 3.6
  }
  return 0
}

export class GpsEngine {
  private watchId: number | null = null
  private last: PositionSample | null = null

  constructor(private cb: GpsCallbacks) {}

  get lastSample(): PositionSample | null {
    return this.last
  }

  start(): void {
    if (!('geolocation' in navigator)) {
      this.cb.onError('Geolocalização não disponível neste navegador.')
      return
    }

    if (!window.isSecureContext) {
      this.cb.onError('Safari exige HTTPS para GPS. Abra o app via https://')
      return
    }

    this.cb.onStatus('Pedindo permissão de localização…')

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const sample: PositionSample = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speedKmh: speedFromCoords(pos.coords),
          accuracyM: pos.coords.accuracy ?? null,
          heading:
            pos.coords.heading != null && Number.isFinite(pos.coords.heading)
              ? pos.coords.heading
              : null,
          at: pos.timestamp || Date.now(),
        }
        this.last = sample
        this.cb.onStatus('GPS ativo')
        this.cb.onSample(sample)
      },
      (err) => {
        const map: Record<number, string> = {
          1: 'Permissão de localização negada.',
          2: 'Posição indisponível. Vá a um local aberto ou use Simular.',
          3: 'Tempo esgotado ao obter GPS.',
        }
        this.cb.onError(map[err.code] ?? err.message)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 15000,
      },
    )
  }

  stop(): void {
    if (this.watchId != null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }
}
