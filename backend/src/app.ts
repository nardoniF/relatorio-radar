import Fastify from 'fastify'
import cors from '@fastify/cors'
import { config } from './config.js'
import { LocalOsmProvider } from './providers/LocalOsmProvider.js'
import { HereProvider } from './providers/HereProvider.js'
import { registerRoutes } from './routes/index.js'
import { getDemoStore } from './store/DemoStore.js'
import type { MapDataProvider } from './providers/types.js'

export async function buildApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV === 'production',
  })
  await app.register(cors, { origin: true })

  const store = getDemoStore()

  let provider: MapDataProvider
  if (config.provider === 'here') {
    provider = new HereProvider(config.hereApiKey)
  } else {
    provider = new LocalOsmProvider(store.listRadars(), store.listSegments())
  }

  if (config.store === 'postgres') {
    app.log.warn(
      'STORE=postgres: migrations SQL em /migrations; runtime MVP usa store em memória + matching local. Rode npm run migrate com Docker/Neon.',
    )
  }

  await registerRoutes(app, { store, provider })
  return app
}
