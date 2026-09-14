# Arquitetura — Real-Time Road Compliance Engine (zero-custo first)

```
                 iPHONE
                   │
             Core Location  (R$ 0)
                   │
                   ▼
            GPS / VELOCIDADE
                   │
                   ▼
        MAP MATCHING LOCAL
        (segments PostGIS / cache)
                   │
          ┌────────┴────────┐
          ▼                 ▼
     BANCO DE RUAS      BANCO DE RADARES
     OSM/PostGIS        próprio / cache
          │                 │
          └────────┬────────┘
                   ▼
             LIMITE DA VIA
                   │
                   ▼
          RADAR + VELOCIDADE
                   │
                   ▼
          MOTOR DE INFRAÇÃO
                   │
          ┌────────┴────────┐
          ▼                 ▼
       🟢 OK          🔴 ESTIMATIVA
          │                 │
          └────────┬────────┘
                   ▼
      RELATÓRIO (MapKit + custos)
```

## Princípio de custo

O MVP **não** depende de API paga por requisição.

| Camada | Tecnologia | Custo recorrente |
| --- | --- | --- |
| GPS | Core Location | R$ 0 |
| Mapa UI | MapKit nativo | R$ 0* |
| Matching | PostGIS / segmentos locais | R$ 0 |
| Limites | banco local → OSM (`maxspeed`) | R$ 0** |
| Radares | base própria + cache no iPhone | R$ 0*** |
| Backend | Neon/Supabase free + Node | ~R$ 0 no início |

\* Nas condições normais do MapKit nativo.  
\*\* OSM não garante cobertura completa/atualizada.  
\*\*\* Fonte de radares deve ser **licenciada** para uso comercial — pode custar; scraping não é opção.

Internet = **atualização de pacotes regionais**, não dependência a cada segundo.

## Cascata de limite de velocidade

1. Banco local (segmento matched)  
2. Atributo OSM `maxspeed` no segmento  
3. Fonte complementar licenciada (HERE/Mapbox/etc.) **somente se** custo/licença/alternativa forem documentados

## Offline no iPhone

```
┌────────────────────────────┐
│ BANCO LOCAL DO IPHONE      │
│ ruas · limites · radares   │
│ segmentos                  │
└────────────┬───────────────┘
             ▼
        GPS DO IPHONE
             ▼
     MOTOR DE ANÁLISE
```

Endpoint de sync: `GET /regions/pack?lat=&lng=&radiusKm=`

## APIs comerciais

HERE / Mapbox **não** são obrigatórias. Podem existir como `PROVIDER=complementary_*` após comparação de custo, limites, licença e alternativa gratuita.

## Princípio de domínio

`posição + estrada + sentido + segmento + limite + radar + velocidade + tempo + confiança`  
→ **ALERTA → EVENTO → ANÁLISE → RELATÓRIO**

Sempre **estimativa / possível infração** — nunca autuação oficial.
