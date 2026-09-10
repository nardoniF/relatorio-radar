# Configuração CTB Art. 218 — fonte canônica versionada
# Os valores também vivem em backend/migrations seed e são servidos por GET /fine-rules.
# O app iOS NÃO deve hardcodar multas; deve baixar esta tabela.

country: BR
jurisdiction: federal
violation_type: speeding
source: CTB Art. 218
updated_at: 2026-09-08
disclaimer: Valores de referência para ESTIMATIVA. Não constituem autuação oficial.

rules:
  - id: br-speeding-media
    min_excess_pct: 0.0001
    max_excess_pct: 20
    classification: media
    points: 4
    base_fine: 130.16
    multiplier: 1

  - id: br-speeding-grave
    min_excess_pct: 20.0001
    max_excess_pct: 50
    classification: grave
    points: 5
    base_fine: 195.23
    multiplier: 1

  - id: br-speeding-gravissima
    min_excess_pct: 50.0001
    max_excess_pct: null
    classification: gravissima
    points: 7
    base_fine: 293.47
    multiplier: 3
    # 293.47 * 3 = 880.41
