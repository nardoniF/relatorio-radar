# Comparação de provedores — Map Matching, Limites e Radares (Brasil)

**Status:** decisão preliminar para MVP — **HERE como provedor comercial principal**, com **DemoProvider** local até as chaves serem contratadas. Mapbox permanece opção de fallback para matching/visualização.

> Nenhuma chave secreta deve ir no app iOS. Todas as chamadas HERE/Mapbox passam pelo **backend proxy**.

## Critérios

| Critério | HERE | Mapbox |
| --- | --- | --- |
| Cobertura mapa Brasil | **HERE Map** (nível navegação) | OSM + camadas Mapbox; qualidade variável por via |
| Map matching / route matching | Route Matching API v8 (trace → links + atributos) | Map Matching API |
| Limites de velocidade | **Map Attributes API v8** (`SPEED_LIMITS_FCn`, condicionais, variáveis) + `APPLICABLE_SPEED_LIMIT` quando disponível | Menos focado em atributo legal por link; não é o ponto forte |
| Radares / safety cameras | **Safety Cameras Feed** (fixos + mobile, direção, limite) | Sem feed equivalente de câmeras de fiscalização como produto core |
| Licença comercial | Contrato HERE (Platform / OLP) | ToS Mapbox / Enterprise |
| Cache | Restrições fortes em alguns produtos (ex.: OLP: limites de retenção de output); validar no contrato fechado | Cache permitido sob ToS; redistribuição de datasets proibida |
| Redistribuição | Conteúdo HERE em geral **não** pode virar repositório próprio redistribuído | Proíbe criar dataset substituto |
| Preço (ordem de grandeza) | ~250k tx/mês free tier; Pro ~US$449/1M tx (referência pública 2026) | Free menor; pay-as-you-go; enterprise sob consulta |
| Uso no app sem destino | Matching incremental por janela de pontos + attributes por link | Matching por trace; limites precisam de outra fonte |
| Adequação MVP BR | **Melhor encaixe** (limites + câmeras + matching no mesmo vendor) | Bom para mapa/estilo; fraco sozinho para radar+limite legal |

## Radares

- **HERE Safety Cameras:** API dedicada com `cameraType`, `speedLimit`, `drivingDirection` / `directionType` — essencial para filtrar **mesmo sentido**.
- **Mapbox:** não substitui uma base licenciada de radares. Não usar scraping / bases “gratuitas” sem licença para produção.
- **Banco próprio (`radars` + PostGIS):** espelho/cache operacional sob os termos do contrato (TTL, proibição de redistribuir). Seed de demo apenas para desenvolvimento.

## Recomendação

1. **MVP / produção BR:** HERE  
   - Route Matching / Map Attributes para segmento + limite  
   - Safety Cameras para radares com direção  
2. **MapKit** no iPhone para UI de mapa (sem depender de Waze).  
3. **Mapbox** só se: (a) contrato HERE falhar em preço/cobertura de câmeras no BR, ou (b) necessidade forte de estilo de mapa — ainda assim limites/radares continuariam HERE ou outro vendor licenciado.  
4. Até haver contrato: `DemoProvider` + seeds PostGIS (nunca scraping).

## Próximos passos comerciais

- Solicitar trial HERE (Map Attributes + Safety Cameras + Route Matching) com cobertura **BRA**.  
- Confirmar por escrito: TTL de cache permitido, se podemos materializar `radars`/`speed_limits` no PostGIS, e restrições legais de alerta de radar no BR.  
- Cotar Mapbox Matching apenas como plano B.

## Princípio

Não substituir API comercial por scraping ou fonte não licenciada.
