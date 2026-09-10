export type LatLng = {
  lat: number
  lng: number
}

export type Radar = {
  id: string
  name: string
  lat: number
  lng: number
  /** Limite em km/h */
  limitKmh: number
  /** Raio de alerta em metros */
  alertRadiusM: number
  /** Raio de passagem (registro) em metros */
  passRadiusM: number
}

export type TripMode = 'idle' | 'gps' | 'sim'

export type PositionSample = LatLng & {
  speedKmh: number
  accuracyM: number | null
  heading: number | null
  at: number
}

export type RadarAlert = {
  radar: Radar
  distanceM: number
  level: 'far' | 'near' | 'imminent'
}

export type RadarPassage = {
  radar: Radar
  passedAt: number
  speedKmh: number
  overLimit: boolean
  excessKmh: number
  closestDistanceM: number
}

export type TripReport = {
  mode: Exclude<TripMode, 'idle'>
  startedAt: number
  endedAt: number
  durationMs: number
  maxSpeedKmh: number
  samples: number
  passages: RadarPassage[]
  overs: RadarPassage[]
}
