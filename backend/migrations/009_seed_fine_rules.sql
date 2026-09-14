-- Seed CTB art. 218 — valores configuráveis (estimativa)
-- média R$130.16 | grave R$195.23 | gravíssima R$880.41
INSERT INTO fine_rules (code, severity, article, excess_min_pct, excess_max_pct, fine_brl, points, suspend_right, description)
VALUES
  (
    'ctb_218_i',
    'media',
    'CTB art. 218, I',
    0,
    20,
    130.16,
    4,
    FALSE,
    'Transitar em velocidade superior à máxima permitida em até 20% — estimativa de possível infração'
  ),
  (
    'ctb_218_ii',
    'grave',
    'CTB art. 218, II',
    20,
    50,
    195.23,
    5,
    FALSE,
    'Transitar em velocidade superior à máxima permitida em mais de 20% até 50% — estimativa de possível infração'
  ),
  (
    'ctb_218_iii',
    'gravissima',
    'CTB art. 218, III',
    50,
    NULL,
    880.41,
    7,
    TRUE,
    'Transitar em velocidade superior à máxima permitida em mais de 50% — estimativa de possível infração'
  )
ON CONFLICT (code) DO UPDATE SET
  fine_brl = EXCLUDED.fine_brl,
  severity = EXCLUDED.severity,
  excess_min_pct = EXCLUDED.excess_min_pct,
  excess_max_pct = EXCLUDED.excess_max_pct,
  points = EXCLUDED.points,
  suspend_right = EXCLUDED.suspend_right,
  description = EXCLUDED.description,
  active = TRUE;
