# Backend — Relatório Radar

API zero-custo-first: matching local + OSM/base própria. **PROVIDER=local** por padrão.

## Run

```bash
cp .env.example .env
npm install
npm test
npm run dev   # :3001
```

## Endpoints úteis

| Método | Path | Notas |
| --- | --- | --- |
| GET | `/regions/pack` | Cache offline iPhone |
| POST | `/match` | Matching local |
| GET | `/speed-limits` | Cascata local→OSM |
| GET | `/fine-rules` | CTB configurável |
| GET | `/radars/nearby` | Base própria |

## Providers

- `local` (default) — `LocalOsmProvider`
- `here` — stub **complementar** (não necessário ao MVP)

## Postgres

`docker compose up -d` + `npm run migrate` (Neon/Supabase free também ok).
Migrations incluem `road_segments` para `ST_DWithin`.
