import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { buildApp } from '../src/app.js'
import { resetDemoStore } from '../src/store/DemoStore.js'
import type { FastifyInstance } from 'fastify'

describe('HTTP API smoke', () => {
  let app: FastifyInstance

  before(async () => {
    resetDemoStore()
    app = await buildApp()
    await app.ready()
  })

  after(async () => {
    await app.close()
  })

  it('GET /health', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().ok, true)
  })

  it('GET /fine-rules returns seeded CTB values', async () => {
    const res = await app.inject({ method: 'GET', url: '/fine-rules' })
    assert.equal(res.statusCode, 200)
    const rules = res.json().fineRules
    assert.equal(rules.length, 3)
    assert.ok(rules.some((r: { fineBrl: number }) => r.fineBrl === 130.16))
    assert.ok(rules.some((r: { fineBrl: number }) => r.fineBrl === 195.23))
    assert.ok(rules.some((r: { fineBrl: number }) => r.fineBrl === 880.41))
  })

  it('POST /trips → locations → finish', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/trips',
      payload: { mode: 'sim' },
    })
    assert.equal(created.statusCode, 200)
    const tripId = created.json().trip.id

    const loc = await app.inject({
      method: 'POST',
      url: `/trips/${tripId}/locations`,
      payload: {
        lat: -23.5595,
        lng: -46.6508,
        speedKmh: 55,
        headingDeg: 70,
      },
    })
    assert.equal(loc.statusCode, 200)

    const finished = await app.inject({
      method: 'POST',
      url: `/trips/${tripId}/finish`,
    })
    assert.equal(finished.statusCode, 200)
    assert.equal(finished.json().trip.status, 'finished')
    assert.match(
      finished.json().report.disclaimer,
      /estimativa/i,
    )
  })

  it('GET /radars/nearby', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/radars/nearby?lat=-23.5595&lng=-46.6508&radiusM=300',
    })
    assert.equal(res.statusCode, 200)
    assert.ok(res.json().radars.length >= 1)
  })

  it('GET /speed-limits', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/speed-limits?lat=-23.5595&lng=-46.6508&heading=70',
    })
    assert.equal(res.statusCode, 200)
    assert.ok(res.json().speedLimit.speedLimitKmh != null)
  })

  it('GET/PUT /vehicle-settings', async () => {
    const get = await app.inject({ method: 'GET', url: '/vehicle-settings' })
    assert.equal(get.statusCode, 200)
    const put = await app.inject({
      method: 'PUT',
      url: '/vehicle-settings',
      payload: { fuelPriceBrl: 7.2 },
    })
    assert.equal(put.statusCode, 200)
    assert.equal(put.json().settings.fuelPriceBrl, 7.2)
  })

  it('GET /regions/pack returns offline cache payload', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/regions/pack?lat=-23.555&lng=-46.63&radiusKm=20',
    })
    assert.equal(res.statusCode, 200)
    const pack = res.json().pack
    assert.ok(pack.radars.length >= 1)
    assert.ok(pack.segments.length >= 1)
  })

  it('POST /match snaps points without paid API', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/match',
      payload: {
        points: [
          { lat: -23.5595, lng: -46.6508, headingDeg: 70 },
          { lat: -23.5497, lng: -46.6235, headingDeg: 90 },
        ],
      },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().match.source, 'local-postgis-style')
    assert.equal(res.json().match.matched.length, 2)
  })
})
