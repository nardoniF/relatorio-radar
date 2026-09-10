import type { LatLng, Radar } from '../types'

/**
 * Trecho fictício (região SP) para o modo “Simular no sofá”.
 * Radares posicionados ao longo do percurso para testar alerta + passagem.
 */
export const SIM_ROUTE: LatLng[] = [
  { lat: -23.5614, lng: -46.6558 },
  { lat: -23.5602, lng: -46.6525 },
  { lat: -23.5588, lng: -46.6491 },
  { lat: -23.5571, lng: -46.6458 },
  { lat: -23.5554, lng: -46.6426 },
  { lat: -23.5539, lng: -46.6395 },
  { lat: -23.5526, lng: -46.6362 },
  { lat: -23.5514, lng: -46.6328 },
  { lat: -23.5505, lng: -46.6291 },
  { lat: -23.5499, lng: -46.6254 },
  { lat: -23.5496, lng: -46.6216 },
  { lat: -23.5498, lng: -46.6179 },
  { lat: -23.5504, lng: -46.6143 },
  { lat: -23.5515, lng: -46.6109 },
  { lat: -23.553, lng: -46.6078 },
]

export const RADARS: Radar[] = [
  {
    id: 'r1',
    name: 'Radar Consolação',
    lat: -23.5595,
    lng: -46.6508,
    limitKmh: 50,
    alertRadiusM: 220,
    passRadiusM: 55,
  },
  {
    id: 'r2',
    name: 'Radar Augusta',
    lat: -23.5558,
    lng: -46.6435,
    limitKmh: 50,
    alertRadiusM: 220,
    passRadiusM: 55,
  },
  {
    id: 'r3',
    name: 'Radar Higienópolis',
    lat: -23.5518,
    lng: -46.6345,
    limitKmh: 40,
    alertRadiusM: 200,
    passRadiusM: 50,
  },
  {
    id: 'r4',
    name: 'Radar Pacaembu',
    lat: -23.5497,
    lng: -46.6235,
    limitKmh: 60,
    alertRadiusM: 250,
    passRadiusM: 60,
  },
  {
    id: 'r5',
    name: 'Radar Sumaré',
    lat: -23.5508,
    lng: -46.6125,
    limitKmh: 50,
    alertRadiusM: 220,
    passRadiusM: 55,
  },
]
