# Relatório Radar

Motor de **compliance viário em tempo real** para iPhone — **sem destino** e **sem API paga obrigatória**.

**ABRIR → INICIAR VIAGEM → DIRIGIR → FINALIZAR → RELATÓRIO**

## Arquitetura de custo

| Camada | Tecnologia | Custo |
| --- | --- | --- |
| GPS | Core Location | R$ 0 |
| Mapa UI | MapKit | R$ 0* |
| Matching | PostGIS / segmentos locais | R$ 0 |
| Limites | local → OSM `maxspeed` | R$ 0** |
| Radares | base própria + cache | R$ 0*** |
| Backend | Neon/Supabase free + Node | ~R$ 0 inicial |

HERE/Mapbox **só como complemento** após custo/licença/alternativa — ver `docs/PROVIDER_COMPARISON.md`.

## Repositório

| Pasta | Conteúdo |
| --- | --- |
| `ios/` | SwiftUI + engines locais (offline pack) |
| `backend/` | API + PostGIS + matching local + `fine_rules` |
| `docs/` | Arquitetura zero-custo, API, privacidade |
| raiz | Piloto web HTTPS (Safari) |

## Cascata de limite

1. Segmento matched (banco local)  
2. OSM `maxspeed`  
3. Complementar comercial (opcional)

## Quick start

```bash
cd backend && npm install && npm test && npm run dev   # PROVIDER=local
npm install && npm run dev                            # piloto web
# iOS: ios/README.md — Xcode no Mac
```

Pack offline: `GET /regions/pack?lat=&lng=&radiusKm=`

Sempre **estimativa / possível infração** — nunca autuação oficial.
