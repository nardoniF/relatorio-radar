# Deploy

## Backend

```bash
cd backend
cp .env.example .env
npm install
docker compose up -d   # Postgres + PostGIS
npm run migrate
npm run dev            # :8787
```

Sem Docker: o backend sobe com **DemoStore** em memória (seeds de radares + fine_rules) para desenvolvimento e testes.

Variáveis:

- `DATABASE_URL` — Postgres PostGIS
- `HERE_API_KEY` — só servidor
- `PORT` — default 3001
- `PROVIDER` — `demo` | `here`

## iOS

1. Abrir `ios/` no Mac com Xcode 15+.
2. Capabilities: Background Modes → Location updates.
3. Apontar `APIClient` base URL para o backend (HTTPS em device).
4. Nunca embutir `HERE_API_KEY` no target do app.

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
