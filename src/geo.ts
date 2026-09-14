import type { LatLng } from './types'

const R = 6371000

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function haversineM(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function bearingDeg(a: LatLng, b: LatLng): number {
  const φ1 = toRad(a.lat)
  const φ2 = toRad(b.lat)
  const Δλ = toRad(b.lng - a.lng)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

/** Interpola ao longo de um polyline por distância percorrida (metros). */
export function pointAlongPath(
  path: LatLng[],
  distanceM: number,
): { point: LatLng; heading: number; totalLengthM: number } {
  if (path.length === 0) {
    return { point: { lat: 0, lng: 0 }, heading: 0, totalLengthM: 0 }
  }
  if (path.length === 1) {
    return { point: path[0], heading: 0, totalLengthM: 0 }
  }

  let remaining = Math.max(0, distanceM)
  let total = 0
  const segs: { a: LatLng; b: LatLng; len: number }[] = []

  for (let i = 0; i < path.length - 1; i++) {
    const len = haversineM(path[i], path[i + 1])
    segs.push({ a: path[i], b: path[i + 1], len })
    total += len
  }

  if (remaining >= total) {
    const last = segs[segs.length - 1]
    return {
      point: last.b,
      heading: bearingDeg(last.a, last.b),
      totalLengthM: total,
    }
  }

  for (const seg of segs) {
    if (remaining <= seg.len) {
      const t = seg.len === 0 ? 0 : remaining / seg.len
      return {
        point: {
          lat: seg.a.lat + (seg.b.lat - seg.a.lat) * t,
          lng: seg.a.lng + (seg.b.lng - seg.a.lng) * t,
        },
        heading: bearingDeg(seg.a, seg.b),
        totalLengthM: total,
      }
    }
    remaining -= seg.len
  }

  const last = path[path.length - 1]
  return { point: last, heading: 0, totalLengthM: total }
}

export function pathLengthM(path: LatLng[]): number {
  let total = 0
  for (let i = 0; i < path.length - 1; i++) {
    total += haversineM(path[i], path[i + 1])
  }
  return total
}

export function formatKmh(v: number): string {
  return `${Math.round(v)}`
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const mm = m % 60
  const ss = s % 60
  if (h > 0) return `${h}h ${String(mm).padStart(2, '0')}m`
  return `${mm}m ${String(ss).padStart(2, '0')}s`
}

export function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/** Distância mínima de um ponto a um segmento em metros (aproximação plana local). */
export function distancePointToSegmentM(
  p: LatLng,
  a: LatLng,
  b: LatLng,
): number {
  const ax = a.lng
  const ay = a.lat
  const bx = b.lng
  const by = b.lat
  const px = p.lng
  const py = p.lat
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const proj = { lat: ay + t * dy, lng: ax + t * dx }
  return haversineM(p, proj)
}

export function distanceToPathM(point: LatLng, path: LatLng[]): number {
  if (path.length === 0) return Infinity
  if (path.length === 1) return haversineM(point, path[0])
  let best = Infinity
  for (let i = 0; i < path.length - 1; i++) {
    const d = distancePointToSegmentM(point, path[i], path[i + 1])
    if (d < best) best = d
  }
  return best
}

/** Distância ao longo do path até o ponto mais próximo do radar. */
export function distanceAlongPathToPointM(
  path: LatLng[],
  point: LatLng,
): number {
  if (path.length < 2) return 0
  let bestDist = Infinity
  let bestAlong = 0
  let along = 0
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const b = path[i + 1]
    const segLen = haversineM(a, b)
    const ax = a.lng
    const ay = a.lat
    const bx = b.lng
    const by = b.lat
    const px = point.lng
    const py = point.lat
    const dx = bx - ax
    const dy = by - ay
    const len2 = dx * dx + dy * dy
    let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2
    t = Math.max(0, Math.min(1, t))
    const proj = { lat: ay + t * dy, lng: ax + t * dx }
    const d = haversineM(point, proj)
    if (d < bestDist) {
      bestDist = d
      bestAlong = along + segLen * t
    }
    along += segLen
  }
  return bestAlong
}
