import { haversineM } from './geo'
import type { LatLng, Radar } from './types'

export type RadarPackMeta = {
  count: number
  generatedAt: string
  disclaimer: string
}

let pack: Radar[] = []
let meta: RadarPackMeta = {
  count: 0,
  generatedAt: '',
  disclaimer: '',
}
let loaded = false

function baseUrl(): string {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

export function getPackMeta(): RadarPackMeta {
  return meta
}

export function isPackLoaded(): boolean {
  return loaded
}

export function getAllPackRadars(): Radar[] {
  return pack
}

/** Carrega pack OSM de São Paulo (radares reais comunitários). */
export async function loadSaoPauloRadarPack(): Promise<RadarPackMeta> {
  if (loaded && pack.length > 0) return meta
  const url = `${baseUrl()}data/sp_osm_speed_cameras.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Falha ao carregar radares (${res.status})`)
  const json = (await res.json()) as {
    count: number
    generatedAt: string
    disclaimer: string
    radars: Array<{
      id: string
      name: string
      lat: number
      lng: number
      limitKmh: number
      alertRadiusM: number
      passRadiusM: number
    }>
  }
  pack = json.radars.map((r) => ({
    id: r.id,
    name: r.name,
    lat: r.lat,
    lng: r.lng,
    limitKmh: r.limitKmh,
    alertRadiusM: r.alertRadiusM ?? 280,
    passRadiusM: r.passRadiusM ?? 70,
  }))
  meta = {
    count: pack.length,
    generatedAt: json.generatedAt,
    disclaimer: json.disclaimer,
  }
  loaded = true
  return meta
}

/** Radares num raio (GPS real). */
export function radarsNear(point: LatLng, radiusM: number): Radar[] {
  return pack.filter((r) => haversineM(point, r) <= radiusM)
}

/** Atualiza o conjunto ativo: mantém os próximos + já rastreados. */
export function activeRadarWindow(
  point: LatLng,
  radiusM: number,
  keepIds: Iterable<string> = [],
): Radar[] {
  const keep = new Set(keepIds)
  const near = radarsNear(point, radiusM)
  if (keep.size === 0) return near
  const byId = new Map(pack.map((r) => [r.id, r]))
  const extra: Radar[] = []
  for (const id of keep) {
    if (!near.some((r) => r.id === id)) {
      const r = byId.get(id)
      if (r) extra.push(r)
    }
  }
  return near.concat(extra)
}
