import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  bearingDeg,
  haversineM,
  headingDeltaDeg,
  headingMatches,
  isOppositeDirection,
} from '../src/engines/Geo.js'
import { SpeedFilter } from '../src/engines/SpeedFilter.js'
import { RadarDetection } from '../src/engines/RadarDetection.js'
import { ViolationEngine } from '../src/engines/ViolationEngine.js'
import { computeTripCost } from '../src/engines/TripCost.js'
import { SEED_FINE_RULES } from '../src/seed/demoData.js'
import { DemoStore, resetDemoStore } from '../src/store/DemoStore.js'
import type { FineRule, Radar } from '../src/types.js'

const rules: FineRule[] = SEED_FINE_RULES.map((r, i) => ({
  ...r,
  id: `rule-${i}`,
}))

describe('Geo', () => {
  it('haversine distance roughly matches known short segment', () => {
    const a = { lat: -23.5614, lng: -46.6558 }
    const b = { lat: -23.5602, lng: -46.6525 }
    const d = haversineM(a, b)
    assert.ok(d > 300 && d < 450)
  })

  it('headingMatches accepts same direction and rejects opposite', () => {
    assert.equal(headingMatches(70, 70, 60), true)
    assert.equal(headingMatches(80, 70, 60), true)
    assert.equal(isOppositeDirection(250, 70, 60), true)
    assert.equal(headingMatches(250, 70, 60), false)
    assert.equal(headingDeltaDeg(10, 350), 20)
  })

  it('bearing is finite degrees', () => {
    const b = bearingDeg(
      { lat: -23.56, lng: -46.65 },
      { lat: -23.55, lng: -46.64 },
    )
    assert.ok(b >= 0 && b < 360)
  })
})

describe('SpeedFilter', () => {
  it('smooths and rejects wild spikes', () => {
    const f = new SpeedFilter({ alpha: 0.5, maxJumpKmh: 30 })
    assert.equal(f.update(50), 50)
    const spiked = f.update(120)
    assert.ok(spiked < 100)
  })
})

describe('ViolationEngine — excess %, classification, fine lookup', () => {
  const engine = new ViolationEngine(rules)

  it('computes excess percentage', () => {
    assert.equal(engine.excessPct(60, 50), 20)
    assert.equal(engine.excessKmh(60, 50), 10)
  })

  it('classifies média ≤20%', () => {
    const v = engine.classify(55, 50) // 10%
    assert.equal(v.severity, 'media')
    assert.equal(v.fineRuleCode, 'ctb_218_i')
    assert.equal(v.estimatedFineBrl, 130.16)
    assert.match(v.label, /[Ee]stimativa/)
    assert.match(v.disclaimer, /[Ee]stimativa/)
  })

  it('classifies grave 20–50%', () => {
    const v = engine.classify(70, 50) // 40%
    assert.equal(v.severity, 'grave')
    assert.equal(v.estimatedFineBrl, 195.23)
  })

  it('classifies gravíssima >50%', () => {
    const v = engine.classify(80, 50) // 60%
    assert.equal(v.severity, 'gravissima')
    assert.equal(v.estimatedFineBrl, 880.41)
    assert.equal(v.suspendRight, true)
  })

  it('never hardcodes — fine comes from fine_rules seed', () => {
    const lookup = engine.lookupRule(25)
    assert.equal(lookup?.fineBrl, 195.23)
    assert.equal(lookup?.code, 'ctb_218_ii')
  })

  it('no violation when within limit', () => {
    const v = engine.classify(49, 50)
    assert.equal(v.estimatedFineBrl, null)
    assert.equal(v.severity, null)
  })
})

describe('RadarDetection — opposite direction & duplicate prevention', () => {
  const radar: Radar = {
    id: 'radar-1',
    name: 'Teste',
    cameraType: 'fixed',
    lat: -23.55,
    lng: -46.64,
    speedLimitKmh: 50,
    directionDeg: 90, // leste
    directionToleranceDeg: 60,
    alertRadiusM: 200,
    passRadiusM: 40,
    source: 'demo',
    active: true,
  }

  it('ignores opposite-direction approach', () => {
    const det = new RadarDetection([radar])
    const result = det.update({
      lat: radar.lat,
      lng: radar.lng,
      speedKmh: 60,
      headingDeg: 270, // oeste — oposto
      at: new Date().toISOString(),
    })
    assert.ok(result.ignoredOpposite.includes('radar-1'))
    assert.equal(result.alert, null)
    assert.equal(result.newPassage, null)
  })

  it('prevents duplicate radar passage', () => {
    const det = new RadarDetection([radar])
    // Entra no raio
    det.update({
      lat: radar.lat,
      lng: radar.lng,
      speedKmh: 55,
      headingDeg: 90,
      at: '2026-01-01T12:00:00.000Z',
    })
    // Sai do raio → passagem
    const leave1 = det.update({
      lat: radar.lat + 0.002,
      lng: radar.lng + 0.002,
      speedKmh: 55,
      headingDeg: 90,
      at: '2026-01-01T12:00:05.000Z',
    })
    assert.ok(leave1.newPassage)
    assert.equal(det.getPassages().length, 1)

    // Volta ao radar — não deve registrar de novo
    det.update({
      lat: radar.lat,
      lng: radar.lng,
      speedKmh: 55,
      headingDeg: 90,
      at: '2026-01-01T12:01:00.000Z',
    })
    const leave2 = det.update({
      lat: radar.lat + 0.002,
      lng: radar.lng + 0.002,
      speedKmh: 55,
      headingDeg: 90,
      at: '2026-01-01T12:01:05.000Z',
    })
    assert.equal(leave2.newPassage, null)
    assert.equal(det.getPassages().length, 1)
  })
})

describe('TripCost', () => {
  it('sums fuel + estimated fines', () => {
    const engine = new ViolationEngine(rules)
    const cost = computeTripCost({
      distanceM: 10_000,
      settings: {
        id: '1',
        label: 'default',
        fuelPriceBrl: 6.5,
        fuelEconomyKmPerL: 10,
        vehicleType: 'car',
        includeTolls: false,
      },
      violationEstimates: [engine.classify(60, 50)],
    })
    assert.equal(cost.distanceKm, 10)
    assert.equal(cost.fuelLiters, 1)
    assert.equal(cost.fuelCostBrl, 6.5)
    assert.equal(cost.estimatedFinesBrl, 130.16)
    assert.match(cost.disclaimer, /estimativa/i)
  })
})

describe('DemoStore integration', () => {
  it('creates trip, records location near radar, finishes with report', () => {
    const store: DemoStore = resetDemoStore()
    const trip = store.createTrip('sim')
    const consolacao = store.listRadars().find((r) => r.externalId === 'r1')
    assert.ok(consolacao)

    store.addLocation(trip.id, {
      lat: consolacao.lat,
      lng: consolacao.lng,
      speedKmh: 70,
      headingDeg: consolacao.directionDeg,
    })
    store.addLocation(trip.id, {
      lat: consolacao.lat + 0.001,
      lng: consolacao.lng + 0.001,
      speedKmh: 70,
      headingDeg: consolacao.directionDeg,
    })

    const { report } = store.finishTrip(trip.id)
    assert.equal(report.trip.status, 'finished')
    assert.ok(report.disclaimer.toLowerCase().includes('estimativa'))
  })

  it('rejects duplicate radar_passage event', () => {
    const store = resetDemoStore()
    const trip = store.createTrip('gps')
    const radar = store.listRadars()[0]
    store.addEvent(trip.id, {
      eventType: 'radar_passage',
      radarId: radar.id,
      speedKmh: 40,
      speedLimitKmh: 50,
    })
    assert.throws(
      () =>
        store.addEvent(trip.id, {
          eventType: 'radar_passage',
          radarId: radar.id,
        }),
      /duplicad/i,
    )
  })
})
