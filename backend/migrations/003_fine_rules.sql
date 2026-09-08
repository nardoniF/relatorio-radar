-- Regras de multa (CTB art. 218) — CONFIGURAÇÃO, nunca hardcode na aplicação
CREATE TABLE IF NOT EXISTS fine_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  -- classificação: media | grave | gravissima
  severity        TEXT NOT NULL,
  article         TEXT NOT NULL DEFAULT 'CTB art. 218',
  -- faixa de excesso percentual (sobre o limite)
  excess_min_pct  DOUBLE PRECISION NOT NULL,
  -- exclusivo; NULL = sem teto
  excess_max_pct  DOUBLE PRECISION,
  -- valor em BRL (estimativa configurável)
  fine_brl        NUMERIC(12, 2) NOT NULL,
  points          INTEGER NOT NULL DEFAULT 0,
  suspend_right   BOOLEAN NOT NULL DEFAULT FALSE,
  description     TEXT NOT NULL,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from      DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS fine_rules_active_idx ON fine_rules (active, excess_min_pct);
