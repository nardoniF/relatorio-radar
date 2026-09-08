# Relatório Radar

Motor de **compliance viário em tempo real** para iPhone: GPS, segmento/sentido, limite, radares, alertas, possíveis infrações (estimativa CTB) e relatório com mapa — **sem exigir destino**.

Fluxo principal:

**ABRIR → INICIAR VIAGEM → DIRIGIR → FINALIZAR → RELATÓRIO**

Sem relação com Sensor Tattoo Fix.

## Repositório

| Pasta | Conteúdo |
| --- | --- |
| `ios/` | App nativo SwiftUI + `RelatorioRadarCore` (engines) |
| `backend/` | API REST + PostGIS + `fine_rules` + providers |
| `docs/` | Arquitetura, API, deploy, privacidade, **comparação HERE/Mapbox** |
| raiz (`src/`, …) | Piloto web HTTPS (Safari) |

## Decisão de provedor

Ver [`docs/PROVIDER_COMPARISON.md`](docs/PROVIDER_COMPARISON.md).

**Preliminar:** HERE (matching + limites + safety cameras), com `DemoProvider` até haver contrato. Chaves **somente no backend**.

## MVP

- Iniciar / finalizar viagem (manual)
- Core Location + background
- Map matching (janelas) + limite por segmento
- Radares com filtro de sentido
- Alertas (voz/haptic preparados)
- SpeedFilter + ViolationEngine (estimativa)
- Relatório + mapa + histórico
- Custo combustível
- Simulador `trip.json`

Fora do MVP: modo automático completo, CarPlay UI, pedágios reais, Waze como fonte de dados, rede social.

## Linguagem legal

Sempre **estimativa / possível infração**. Nunca “você recebeu uma multa”.

## Quick start

```bash
# Backend
cd backend && npm install && npm test && npm run dev

# Piloto web
npm install && npm run dev

# iOS — abrir ios/ no Xcode (macOS)
```
