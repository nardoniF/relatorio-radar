# Arquitetura — Real-Time Road Compliance Engine

```
SwiftUI / ViewModels
        ↓
   Trip Engine
        ↓
┌───────────────────────────────────────────┐
│ Location │ Map Matching │ Radar │ Speed   │
│ Engine   │ Engine       │ Engine│ Limit   │
└───────────────────────────────────────────┘
        ↓
 SpeedFilter → ViolationEngine → TripReportEngine
        ↓
   Backend API (proxy HERE) → PostgreSQL/PostGIS
```

## Princípio

O app **não** é “GPS + lista de radares”.

Cada decisão usa:

`posição + estrada + sentido + segmento + limite + radar + velocidade + tempo + confiança`

Fluxo: **ALERTA → EVENTO → ANÁLISE → RELATÓRIO**

## Módulos

| Módulo | Responsabilidade |
| --- | --- |
| LocationEngine | Core Location, background updates, samples ricos |
| TripEngine | Estados IDLE→…→COMPLETED, UUID, start/finish |
| MapMatchingEngine | Janelas de pontos → road segment + direction (HERE) |
| SpeedLimitEngine | Limite do segmento atual (nunca limite único de rodovia) |
| RadarEngine | Corredor local, mesmo sentido, zonas adaptativas, anti-duplicata |
| SpeedFilter | speedRaw / speedFiltered / confidence |
| ViolationEngine | Excesso %, classificação CTB, multa **estimada** via `fine_rules` |
| TripReportEngine | Resumo, mapa, lista cronológica, custos |
| TripCostEngine | Combustível + pedágios (futuro) + multas estimadas |
| AlertEngine | Voz / haptic / banner (sem forçar olhar a tela) |

## Modo sem destino (principal)

`ABRIR → INICIAR VIAGEM → DIRIGIR → FINALIZAR → RELATÓRIO`

Sem origem/destino/rota prévia.

## Modo automático

Fase posterior ao MVP. Opcional, desligável, baixo consumo fora da viagem.

## Offline

Cache geográfico de radares/limites já baixados; sync quando houver rede. Matching/attributes só ao mudar região/segmento.

## CarPlay / Watch / Android

Engines em target sem UI (`RelatorioRadarCore`). Interfaces SwiftUI/CarPlay são adaptadores.

## Waze

Deep link opcional para navegação. Zero dependência de dados do Waze.
