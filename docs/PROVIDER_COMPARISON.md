# Fontes de dados — prioridade sem API paga

**Decisão de arquitetura:** o MVP funciona com **Core Location + MapKit + PostgreSQL/PostGIS + base própria + OSM**, sem dependência obrigatória de HERE/Mapbox.

> APIs comerciais só como **fonte complementar**, e só depois de documentar custo, limites, licença e alternativa gratuita.

## Stack gratuita / open source

| Necessidade | Fonte primária | Custo |
| --- | --- | --- |
| GPS | Apple Core Location | R$ 0 / req |
| Mapa no app | Apple MapKit | R$ 0* |
| Map matching | PostGIS (`ST_DWithin` / segmento mais próximo) + cache no device | R$ 0 |
| Limite de velocidade | `road_segments.maxspeed` (local → OSM) | R$ 0** |
| Radares | Tabela `radars` própria + pack regional no iPhone | R$ 0*** |
| Backend | Neon / Supabase free / similar + Node | ~R$ 0 inicial |
| Banco | PostgreSQL + PostGIS | open source |

\* Condições normais do MapKit nativo.  
\*\* OSM `maxspeed` incompleto em muitas vias BR.  
\*\*\* Base de radares **licenciada** pode ter custo; não usar scraping.

## Cascata de limites

```
GPS → match segmento
        │
        ├─1─ maxspeed no banco local
        ├─2─ maxspeed OSM (import/cache)
        └─3─ complementar comercial (opcional, futuro)
```

## HERE / Mapbox (opcional)

| Critério | HERE | Mapbox | Nosso stack local |
| --- | --- | --- | --- |
| Matching | Route Matching pago | Map Matching pago | PostGIS / local |
| Limites | Map Attributes | Fraco sozinho | OSM + local |
| Radares | Safety Cameras (licença) | Sem feed core | Base própria |
| Offline trip | Depende de rede/contrato | Idem | Pack regional |
| Custo por viagem | Transações | Transações | ~zero |

**Quando considerar complementar:** cobertura OSM/base própria insuficiente **e** ROI claro após cotação.

## Licenciamento — cuidado

Não prometemos “todos os radares do Brasil de graça”.

- Software, GPS, MapKit, PostGIS: ok  
- Dados comerciais atualizados de radar/limite: podem exigir licença paga  
- Proibido: scraping ou redistribuir dados sem permissão

## Providers no código

| `PROVIDER` | Uso |
| --- | --- |
| `local` (default) | Demo + segmentos OSM-like + radars próprios |
| `here` | Stub complementar (chave só no backend) |

## Princípio

Construir o MVP **independente**. Só então, se faltar cobertura, acrescentar fonte comercial onde realmente fizer falta.
