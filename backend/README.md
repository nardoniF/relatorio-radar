# Backend — Relatório Radar

MVP Node.js + TypeScript + Fastify para o motor de viagem / conformidade viária (Brasil).

## O que inclui

- API REST de viagens, localizações, eventos e relatório
- Engines puros: geo, filtro de velocidade, detecção de radar, classificação CTB art. 218, custo estimado
- `DemoProvider` offline (seed SP do piloto web) — padrão sem API keys
- `HereProvider` stub (Map Attributes + Safety Cameras) — chave só via env
- Migrations PostgreSQL/PostGIS em `migrations/`
- **DemoStore em memória** para `npm run dev` / `npm test` sem Docker

> Toda linguagem de infração usa **estimativa** / **possível infração**. Valores de multa vêm **somente** de `fine_rules` (seed), nunca hardcoded no app.

## Requisitos

- Node.js ≥ 20
- (Opcional) Docker para Postgres+PostGIS

## Setup rápido (sem Docker)

```bash
cd backend
cp .env.example .env
npm install
npm test
npm run dev
```

API em `http://localhost:3001` (ou `PORT` do `.env`).

## Com Postgres + PostGIS

```bash
cd backend
docker compose up -d
# aguarde o healthcheck
export STORE=postgres
export DATABASE_URL=postgresql://radar:radar@localhost:5432/relatorio_radar
npm run migrate
npm run dev
```

> O runtime MVP ainda usa **DemoStore** em memória mesmo com `STORE=postgres`; as migrations preparam o schema de produção. Adapter PG pode ser ligado depois sem mudar contratos da API.

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Fastify + tsx watch |
| `npm run build` | Compila para `dist/` |
| `npm start` | Roda `dist/index.js` |
| `npm test` | Testes (`node:test` via tsx) |
| `npm run migrate` | Aplica SQL em `migrations/` (precisa `DATABASE_URL`) |

## Endpoints

| Método | Path | Descrição |
| --- | --- | --- |
| `POST` | `/trips` | Cria viagem `{ mode?: "gps"\|"sim" }` |
| `GET` | `/trips` | Lista viagens |
| `POST` | `/trips/:id/locations` | Envia ponto GPS |
| `POST` | `/trips/:id/events` | Evento manual / passagem |
| `POST` | `/trips/:id/finish` | Finaliza e devolve relatório |
| `GET` | `/trips/:id/report` | Relatório (estimativas) |
| `GET` | `/radars/nearby?lat=&lng=&radiusM=` | Radares próximos |
| `GET` | `/speed-limits?lat=&lng=&heading=` | Limite estimado |
| `GET` | `/fine-rules` | Regras CTB (config) |
| `GET` | `/vehicle-settings` | Consumo / combustível |
| `PUT` | `/vehicle-settings` | Atualiza settings |
| `GET` | `/health` | Healthcheck |

### Exemplo

```bash
curl -s -X POST http://localhost:3001/trips -H 'content-type: application/json' -d '{"mode":"sim"}'
curl -s 'http://localhost:3001/radars/nearby?lat=-23.5595&lng=-46.6508&radiusM=300'
curl -s http://localhost:3001/fine-rules
```

## Env

Ver `.env.example`:

- `PORT` — padrão `3001`
- `STORE` — `memory` (padrão) \| `postgres`
- `DATABASE_URL` — Postgres
- `PROVIDER` — `demo` (padrão) \| `here`
- `HERE_API_KEY` — **somente backend**, nunca no cliente iOS/web
- `JWT_SECRET` — reservado (fase futura)

## Estrutura

```
backend/
  migrations/          # 001–010 SQL PostGIS + seeds
  src/
    engines/           # Geo, SpeedFilter, RadarDetection, ViolationEngine, TripCost
    providers/         # DemoProvider, HereProvider
    store/DemoStore.ts # memória + seeds
    routes/            # Fastify REST
  test/                # unit tests
```

## Princípios

- Sem scraping de radares
- Multas apenas de `fine_rules`
- HERE/Mapbox só via backend proxy quando contratados
- Comentários em PT OK; identificadores em inglês
