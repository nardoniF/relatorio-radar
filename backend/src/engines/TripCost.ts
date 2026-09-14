import type { Toll, VehicleSettings, ViolationEstimate } from '../types.js'

export type TripCostInput = {
  distanceM: number
  settings: VehicleSettings
  /** Estimativas de possível infração (já classificadas) */
  violationEstimates: ViolationEstimate[]
  /** Pedágios opcionalmente atravessados */
  tolls?: Toll[]
}

export type TripCostBreakdown = {
  distanceKm: number
  fuelLiters: number
  fuelCostBrl: number
  tollCostBrl: number
  /** Soma apenas das estimativas de multa (não oficial) */
  estimatedFinesBrl: number
  estimatedFinesCount: number
  totalEstimatedBrl: number
  disclaimer: string
}

/**
 * Custo estimado da viagem: combustível + pedágios opcionais + estimativa de multas.
 */
export function computeTripCost(input: TripCostInput): TripCostBreakdown {
  const distanceKm = Math.max(0, input.distanceM) / 1000
  const economy = Math.max(0.1, input.settings.fuelEconomyKmPerL)
  const fuelLiters = distanceKm / economy
  const fuelCostBrl = fuelLiters * input.settings.fuelPriceBrl

  let tollCostBrl = 0
  if (input.settings.includeTolls && input.tolls?.length) {
    for (const toll of input.tolls) {
      if (!toll.active) continue
      if (input.settings.vehicleType === 'motorcycle') {
        tollCostBrl += toll.priceMotorcycleBrl ?? toll.priceCarBrl * 0.5
      } else if (input.settings.vehicleType === 'truck') {
        tollCostBrl += toll.priceTruckBrl ?? toll.priceCarBrl * 2
      } else {
        tollCostBrl += toll.priceCarBrl
      }
    }
  }

  const withFine = input.violationEstimates.filter(
    (v) => v.estimatedFineBrl != null && v.estimatedFineBrl > 0,
  )
  const estimatedFinesBrl = withFine.reduce(
    (s, v) => s + (v.estimatedFineBrl ?? 0),
    0,
  )

  return {
    distanceKm,
    fuelLiters,
    fuelCostBrl: round2(fuelCostBrl),
    tollCostBrl: round2(tollCostBrl),
    estimatedFinesBrl: round2(estimatedFinesBrl),
    estimatedFinesCount: withFine.length,
    totalEstimatedBrl: round2(fuelCostBrl + tollCostBrl + estimatedFinesBrl),
    disclaimer:
      'Totais incluem estimativa de possíveis infrações — não constituem autuação oficial.',
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
