import 'dotenv/config'

export type StoreMode = 'memory' | 'postgres'
export type ProviderMode = 'demo' | 'here'

function intEnv(name: string, fallback: number): number {
  const v = process.env[name]
  if (v == null || v === '') return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export const config = {
  port: intEnv('PORT', 3001),
  store: (process.env.STORE === 'postgres' ? 'postgres' : 'memory') as StoreMode,
  databaseUrl: process.env.DATABASE_URL ?? '',
  hereApiKey: process.env.HERE_API_KEY ?? '',
  provider: (process.env.PROVIDER === 'here' ? 'here' : 'demo') as ProviderMode,
  jwtSecret: process.env.JWT_SECRET ?? '',
}

export function assertPostgresConfig(): void {
  if (config.store === 'postgres' && !config.databaseUrl) {
    throw new Error('DATABASE_URL é obrigatório quando STORE=postgres')
  }
}
