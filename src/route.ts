import {
  distanceAlongPathToPointM,
  distanceToPathM,
  haversineM,
} from './geo'
import { getAllPackRadars } from './radarPack'
import type { LatLng, Radar } from './types'

export type GeocodedPlace = {
  label: string
  lat: number
  lng: number
}

export type RoutePlan = {
  destinationLabel: string
  destination: LatLng
  path: LatLng[]
  distanceM: number
  durationSec: number
  radars: Radar[]
  /** Radares ordenados pela distância ao longo da rota */
  radarsOrdered: Array<Radar & { alongM: number }>
}

const DEST_KEY = 'radar_destination_text'
const CORRIDOR_M = 120

export function getSavedDestinationText(): string {
  return localStorage.getItem(DEST_KEY)?.trim() ?? ''
}

export function saveDestinationText(text: string): void {
  localStorage.setItem(DEST_KEY, text.trim())
}

/** Aceita "lat, lng" ou geocodifica endereço (Nominatim, foco BR). */
export async function resolveDestination(query: string): Promise<GeocodedPlace> {
  const q = query.trim()
  if (!q) throw new Error('Informe o destino')

  const coord = q.match(
    /^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/,
  )
  if (coord) {
    const lat = Number(coord[1])
    const lng = Number(coord[2])
    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180
    ) {
      return { label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng }
    }
  }

  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({
      q,
      format: 'json',
      limit: '1',
      countrycodes: 'br',
      addressdetails: '0',
    }).toString()

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })
  if (!res.ok) throw new Error('Falha ao buscar endereço')
  const data = (await res.json()) as Array<{
    lat: string
    lon: string
    display_name: string
  }>
  if (!data.length) throw new Error('Destino não encontrado')
  return {
    label: data[0].display_name,
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
  }
}

export async function fetchDrivingRoute(
  from: LatLng,
  to: LatLng,
): Promise<{ path: LatLng[]; distanceM: number; durationSec: number }> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?overview=full&geometries=geojson`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Falha ao calcular rota')
  const json = (await res.json()) as {
    code?: string
    routes?: Array<{
      distance: number
      duration: number
      geometry: { coordinates: [number, number][] }
    }>
  }
  if (json.code !== 'Ok' || !json.routes?.[0]) {
    throw new Error('Não achou rota de carro até o destino')
  }
  const route = json.routes[0]
  const path = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
  return {
    path,
    distanceM: route.distance,
    durationSec: route.duration,
  }
}

export function radarsAlongRoute(
  path: LatLng[],
  corridorM = CORRIDOR_M,
): Array<Radar & { alongM: number }> {
  const pack = getAllPackRadars()
  const hits: Array<Radar & { alongM: number }> = []
  for (const r of pack) {
    if (distanceToPathM(r, path) <= corridorM) {
      hits.push({ ...r, alongM: distanceAlongPathToPointM(path, r) })
    }
  }
  hits.sort((a, b) => a.alongM - b.alongM)
  return hits
}

export async function planRouteToDestination(input: {
  from: LatLng
  destinationQuery: string
}): Promise<RoutePlan> {
  const place = await resolveDestination(input.destinationQuery)
  const { path, distanceM, durationSec } = await fetchDrivingRoute(
    input.from,
    place,
  )
  const ordered = radarsAlongRoute(path)
  return {
    destinationLabel: place.label,
    destination: { lat: place.lat, lng: place.lng },
    path,
    distanceM,
    durationSec,
    radars: ordered.map(({ alongM: _a, ...r }) => r),
    radarsOrdered: ordered,
  }
}

export function openWazeTo(dest: LatLng): void {
  const url = `https://waze.com/ul?ll=${dest.lat},${dest.lng}&navigate=yes`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function formatRouteSummary(plan: RoutePlan): string {
  const km = (plan.distanceM / 1000).toFixed(1)
  const min = Math.round(plan.durationSec / 60)
  return `${plan.radars.length} radares na rota · ${km} km · ~${min} min`
}

/** Próximos radares da rota ainda à frente da posição atual. */
export function upcomingOnRoute(
  plan: RoutePlan,
  here: LatLng,
  limit = 3,
): Array<{ radar: Radar; distanceM: number }> {
  const alongHere = distanceAlongPathToPointM(plan.path, here)
  // Se estamos longe da rota, cai para distância euclidiana aos da rota
  const offRoute = distanceToPathM(here, plan.path) > 400
  const ahead = plan.radarsOrdered.filter((r) =>
    offRoute ? true : r.alongM >= alongHere - 40,
  )
  return ahead.slice(0, limit).map((r) => ({
    radar: r,
    distanceM: offRoute
      ? haversineM(here, r)
      : Math.max(0, r.alongM - alongHere),
  }))
}
