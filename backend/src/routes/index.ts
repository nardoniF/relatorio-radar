import type { FastifyInstance } from 'fastify'
import type { DemoStore } from '../store/DemoStore.js'
import type { MapDataProvider } from '../providers/types.js'
import type { TripMode } from '../types.js'

type AppDeps = {
  store: DemoStore
  provider: MapDataProvider
}

export async function registerRoutes(
  app: FastifyInstance,
  deps: AppDeps,
): Promise<void> {
  const { store, provider } = deps

  app.get('/health', async () => ({
    ok: true,
    provider: provider.name,
    store: 'memory',
  }))

  app.post<{
    Body: { mode?: TripMode; notes?: string }
  }>('/trips', async (req) => {
    const mode = req.body?.mode === 'sim' ? 'sim' : 'gps'
    const trip = store.createTrip(mode, req.body?.notes)
    return { trip }
  })

  app.get('/trips', async () => ({
    trips: store.listTrips(),
  }))

  app.post<{
    Params: { id: string }
    Body: {
      lat: number
      lng: number
      speedKmh?: number
      headingDeg?: number | null
      accuracyM?: number | null
      recordedAt?: string
    }
  }>('/trips/:id/locations', async (req, reply) => {
    try {
      const { lat, lng } = req.body ?? {}
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return reply.code(400).send({ error: 'lat e lng são obrigatórios' })
      }
      const result = store.addLocation(req.params.id, req.body)
      return {
        location: result.location,
        alert: result.alert
          ? {
              radarId: result.alert.radar.id,
              radarName: result.alert.radar.name,
              distanceM: result.alert.distanceM,
              level: result.alert.level,
            }
          : null,
        events: result.newEvents,
      }
    } catch (e) {
      return sendErr(reply, e)
    }
  })

  app.post<{
    Params: { id: string }
    Body: {
      eventType: 'radar_alert' | 'radar_passage' | 'possible_violation' | 'note' | 'system'
      occurredAt?: string
      radarId?: string | null
      lat?: number | null
      lng?: number | null
      speedKmh?: number | null
      speedLimitKmh?: number | null
      payload?: Record<string, unknown>
    }
  }>('/trips/:id/events', async (req, reply) => {
    try {
      if (!req.body?.eventType) {
        return reply.code(400).send({ error: 'eventType é obrigatório' })
      }
      const event = store.addEvent(req.params.id, req.body)
      return { event }
    } catch (e) {
      return sendErr(reply, e)
    }
  })

  app.post<{ Params: { id: string } }>(
    '/trips/:id/finish',
    async (req, reply) => {
      try {
        const { trip, report } = store.finishTrip(req.params.id)
        return { trip, report }
      } catch (e) {
        return sendErr(reply, e)
      }
    },
  )

  app.get<{ Params: { id: string } }>(
    '/trips/:id/report',
    async (req, reply) => {
      try {
        return { report: store.buildReport(req.params.id) }
      } catch (e) {
        return sendErr(reply, e)
      }
    },
  )

  app.get<{
    Querystring: { lat?: string; lng?: string; radiusM?: string; heading?: string }
  }>('/radars/nearby', async (req, reply) => {
    const lat = Number(req.query.lat)
    const lng = Number(req.query.lng)
    const radiusM = Number(req.query.radiusM ?? 500)
    const heading =
      req.query.heading != null && req.query.heading !== ''
        ? Number(req.query.heading)
        : null
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return reply.code(400).send({ error: 'lat e lng são obrigatórios' })
    }
    try {
      const radars = await provider.getNearbyRadars({
        lat,
        lng,
        radiusM: Number.isFinite(radiusM) ? radiusM : 500,
        headingDeg: heading,
      })
      return { radars, source: provider.name }
    } catch (e) {
      return sendErr(reply, e)
    }
  })

  app.get<{
    Querystring: { lat?: string; lng?: string; heading?: string }
  }>('/speed-limits', async (req, reply) => {
    const lat = Number(req.query.lat)
    const lng = Number(req.query.lng)
    const heading =
      req.query.heading != null && req.query.heading !== ''
        ? Number(req.query.heading)
        : null
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return reply.code(400).send({ error: 'lat e lng são obrigatórios' })
    }
    try {
      const result = await provider.getSpeedLimit({
        lat,
        lng,
        headingDeg: heading,
      })
      return { speedLimit: result }
    } catch (e) {
      return sendErr(reply, e)
    }
  })

  app.get('/fine-rules', async () => ({
    fineRules: store.listFineRules(),
    disclaimer:
      'Valores de multa são configuração (fine_rules) para estimativa de possível infração.',
  }))

  app.get('/vehicle-settings', async () => ({
    settings: store.getVehicleSettings(),
  }))

  app.put<{
    Body: Partial<{
      label: string
      fuelPriceBrl: number
      fuelEconomyKmPerL: number
      vehicleType: 'car' | 'motorcycle' | 'truck'
      includeTolls: boolean
    }>
  }>('/vehicle-settings', async (req) => {
    const settings = store.updateVehicleSettings(req.body ?? {})
    return { settings }
  })

  /** Pack regional para cache offline no iPhone (ruas + limites + radares). */
  app.get<{
    Querystring: { lat?: string; lng?: string; radiusKm?: string }
  }>('/regions/pack', async (req, reply) => {
    const lat = Number(req.query.lat)
    const lng = Number(req.query.lng)
    const radiusKm = Number(req.query.radiusKm ?? 15)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return reply.code(400).send({ error: 'lat e lng são obrigatórios' })
    }
    if (!provider.getRegionPack) {
      return reply
        .code(501)
        .send({ error: 'Region pack disponível apenas no provider local' })
    }
    try {
      const pack = await provider.getRegionPack(
        lat,
        lng,
        Number.isFinite(radiusKm) ? radiusKm : 15,
      )
      return { pack }
    } catch (e) {
      return sendErr(reply, e)
    }
  })

  /** Map matching local (sem API paga). */
  app.post<{
    Body: {
      points?: Array<{
        lat: number
        lng: number
        headingDeg?: number | null
        speedKmh?: number
      }>
    }
  }>('/match', async (req, reply) => {
    const points = req.body?.points
    if (!Array.isArray(points) || points.length === 0) {
      return reply.code(400).send({ error: 'points[] é obrigatório' })
    }
    if (!provider.matchTrace) {
      return reply.code(501).send({ error: 'Matching não disponível' })
    }
    try {
      const result = await provider.matchTrace(points)
      return { match: result }
    } catch (e) {
      return sendErr(reply, e)
    }
  })
}

function sendErr(
  reply: { code: (n: number) => { send: (b: unknown) => unknown } },
  e: unknown,
) {
  const err = e as { statusCode?: number; message?: string }
  const code = err.statusCode ?? 500
  return reply.code(code).send({ error: err.message ?? 'Erro interno' })
}
