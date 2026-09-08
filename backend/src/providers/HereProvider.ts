import type { Radar, SpeedLimitResult } from '../types.js'
import type {
  MapDataProvider,
  MapMatchPoint,
  MapMatchResult,
  NearbyRadarsQuery,
  RegionPack,
  SpeedLimitQuery,
} from './types.js'

/**
 * Stub complementar HERE — NÃO é o caminho padrão do MVP.
 *
 * Use apenas se a cobertura OSM/base própria for insuficiente e após
 * documentar custo, limites, licença e alternativa gratuita.
 *
 * Chave: HERE_API_KEY somente no backend (.env).
 */
export class HereProvider implements MapDataProvider {
  readonly name = 'here'
  private readonly apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    if (!this.apiKey) {
      console.warn(
        '[HereProvider] complementar sem HERE_API_KEY. Prefira PROVIDER=local.',
      )
    }
  }

  async getNearbyRadars(_query: NearbyRadarsQuery): Promise<Radar[]> {
    this.requireKey()
    throw new Error(
      'HereProvider complementar não implementado. Use PROVIDER=local (PostGIS/OSM).',
    )
  }

  async getSpeedLimit(_query: SpeedLimitQuery): Promise<SpeedLimitResult> {
    this.requireKey()
    throw new Error(
      'HereProvider complementar não implementado. Use PROVIDER=local (cascata OSM).',
    )
  }

  async matchTrace(_points: MapMatchPoint[]): Promise<MapMatchResult> {
    this.requireKey()
    throw new Error(
      'HereProvider complementar não implementado. Use matching local PostGIS-style.',
    )
  }

  async getRegionPack(
    _lat: number,
    _lng: number,
    _radiusKm: number,
  ): Promise<RegionPack> {
    throw new Error('Region pack só está disponível no provider local.')
  }

  private requireKey(): void {
    if (!this.apiKey) {
      throw new Error('HERE_API_KEY não configurada (fonte complementar)')
    }
  }
}
