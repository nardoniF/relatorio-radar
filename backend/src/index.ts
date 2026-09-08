import { config } from './config.js'
import { buildApp } from './app.js'

async function main() {
  const app = await buildApp()
  await app.listen({ port: config.port, host: '0.0.0.0' })
  console.log(
    `Relatório Radar API http://0.0.0.0:${config.port} (provider=${config.provider}, store=${config.store})`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
