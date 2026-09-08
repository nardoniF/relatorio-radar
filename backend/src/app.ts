import Fastify from 'fastify'
import cors from '@fastify/cors'
import { config } from './config.js'
import { DemoProvider } from './providers/DemoProvider.js'
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

  const provider: MapDataProvider =
    config.provider === 'here'
      ? new HereProvider(config.hereApiKey)
      : new DemoProvider(store.listRadars())

  if (config.store === 'postgres') {
    app.log.warn(
      'STORE=postgres: migrations SQL em /migrations; runtime MVP usa DemoStore. Rode npm run migrate com Docker.',
    )
  }

  await registerRoutes(app, { store, provider })
  return app
}
