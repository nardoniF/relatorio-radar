import 'dotenv/config'

export type StoreMode = 'memory' | 'postgres'
/** local = default zero-cost; here = complementar opcional */
export type ProviderMode = 'local' | 'demo' | 'here'

function intEnv(name: string, fallback: number): number {
  const v = process.env[name]
  if (v == null || v === '') return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function providerFromEnv(): ProviderMode {
  const raw = (process.env.PROVIDER ?? 'local').toLowerCase()
  if (raw === 'here') return 'here'
  if (raw === 'demo') return 'demo' // alias histórico → local
  return 'local'
}

export const config = {
  port: intEnv('PORT', 3001),
  store: (process.env.STORE === 'postgres' ? 'postgres' : 'memory') as StoreMode,
  databaseUrl: process.env.DATABASE_URL ?? '',
  hereApiKey: process.env.HERE_API_KEY ?? '',
  provider: providerFromEnv(),
  jwtSecret: process.env.JWT_SECRET ?? '',
}

export function assertPostgresConfig(): void {
  if (config.store === 'postgres' && !config.databaseUrl) {
    throw new Error('DATABASE_URL é obrigatório quando STORE=postgres')
  }
}
