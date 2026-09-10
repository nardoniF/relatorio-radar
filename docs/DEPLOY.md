# Deploy

## Backend

```bash
cd backend
cp .env.example .env
npm install
# Opcional free-tier: Neon / Supabase Postgres+PostGIS
docker compose up -d   # ou DATABASE_URL=… no Neon
npm run migrate
npm run dev            # :3001  PROVIDER=local
```

Sem Docker: **DemoStore + matching local** em memória (seeds).

Variáveis:

- `DATABASE_URL` — Postgres PostGIS (Neon/Supabase free ok)
- `PROVIDER` — `local` (padrão) \| `here` (complementar)
- `HERE_API_KEY` — só se complementar
- `PORT` — default 3001

## iOS

1. Abrir `ios/` no Mac com Xcode 15+.
2. Capabilities: Background Modes → Location updates.
3. Baixar pack: `GET /regions/pack` → cache local → viagem offline.
4. **Nunca** embutir chaves comerciais no app.

## Princípio

Internet atualiza packs regionais. A viagem analisa GPS + cache local.

## Web piloto

```bash
npm install && npm run dev
```

HTTPS local via mkcert para Safari.

## Produção (checklist)

- [ ] HTTPS + auth + rate limit
- [ ] Contrato HERE assinado; cache TTL conforme licença
- [ ] Backup Postgres
- [ ] Política de privacidade publicada
- [ ] App Store privacy nutrition labels
- [ ] Monitoramento de erros e quotas de API
