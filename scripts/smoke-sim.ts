/**
 * Smoke test headless: percorre a rota simulada e verifica passagens/acima do limite.
 * Rode: npx tsx scripts/smoke-sim.ts
 */
import { RADARS, SIM_ROUTE } from '../src/data/radars'
import { pointAlongPath, pathLengthM } from '../src/geo'
import { RadarTracker } from '../src/radarTracker'

const total = pathLengthM(SIM_ROUTE)
const tracker = new RadarTracker(RADARS)
const speedKmh = 80
const stepM = 8

console.log(`Rota: ${Math.round(total)} m · ${RADARS.length} radares · ${speedKmh} km/h`)

for (let d = 0; d <= total + 100; d += stepM) {
  const { point, heading } = pointAlongPath(SIM_ROUTE, Math.min(d, total))
  tracker.update({
    lat: point.lat,
    lng: point.lng,
    speedKmh,
    accuracyM: 5,
    heading,
    at: Date.now() + d * 10,
  })
}

const passages = tracker.getPassages()
const overs = passages.filter((p) => p.overLimit)

console.log(`Passagens: ${passages.length}`)
for (const p of passages) {
  console.log(
    `  - ${p.radar.name}: ${Math.round(p.speedKmh)} km/h / limite ${p.radar.limitKmh}` +
      (p.overLimit ? ` (+${Math.round(p.excessKmh)})` : ' OK'),
  )
}

if (passages.length < 3) {
  console.error('FAIL: esperava pelo menos 3 passagens')
  process.exit(1)
}
if (overs.length < 1) {
  console.error('FAIL: esperava ao menos 1 acima do limite a 80 km/h')
  process.exit(1)
}
console.log('OK')
