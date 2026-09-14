# API Backend — Relatório Radar

Base URL local: `http://localhost:3001`

Autenticação MVP: opcional (`Authorization: Bearer` reservado). Produção: HTTPS + auth + rate limit.

## Viagens

### `POST /trips`
Cria viagem sem destino.

```json
{ "mode": "manual", "startedAt": "2026-09-08T14:00:00.000Z" }
```

Resposta: `{ "id": "uuid", "status": "active" }`

### `POST /trips/:id/locations`
Batch de pontos GPS.

```json
{
  "locations": [{
    "lat": -23.56, "lng": -46.65, "altitude": 760,
    "speedMps": 16.6, "heading": 90, "horizontalAccuracy": 5,
    "verticalAccuracy": 8, "timestamp": "2026-09-08T14:01:00.000Z"
  }]
}
```

### `POST /trips/:id/events`
Eventos (alerta, passagem, matching…).

### `POST /trips/:id/finish`
Finaliza, processa pendências, gera relatório.

### `GET /trips/:id/report`
Relatório completo (resumo, passagens, custos, polyline).

### `GET /trips`
Histórico.

## Radares e limites

### `GET /radars/nearby?lat=&lng=&radiusM=`
Corredor local (não dump global).

### `GET /speed-limits?lat=&lng=&heading=`
Limite via cascata local/OSM (sem API paga).

### `POST /match`
Map matching local (PostGIS-style) sobre segmentos cacheados.

### `GET /regions/pack?lat=&lng=&radiusKm=`
Pack regional (ruas + limites + radares) para cache offline no iPhone.

## Regras e veículo

### `GET /fine-rules`
Tabela CTB (valores **não** hardcoded no app).

### `GET /vehicle-settings` / `PUT /vehicle-settings`
Consumo, preço combustível, pedágio estimado, nome.

## Linguagem obrigatória

Campos de infração usam `violationStatus`: `ok` | `near_limit` | `possible_violation` | `insufficient_data`.

UI/API nunca afirmam “você recebeu uma multa”.
