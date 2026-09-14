CREATE TABLE IF NOT EXISTS trip_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  -- radar_alert | radar_passage | possible_violation | note | system
  event_type      TEXT NOT NULL,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  radar_id        UUID REFERENCES radars(id) ON DELETE SET NULL,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  speed_kmh       DOUBLE PRECISION,
  speed_limit_kmh INTEGER,
  excess_kmh      DOUBLE PRECISION,
  excess_pct      DOUBLE PRECISION,
  -- estimativa apenas — nunca afirmar multa aplicada
  is_estimate     BOOLEAN NOT NULL DEFAULT TRUE,
  fine_rule_code  TEXT,
  estimated_fine_brl NUMERIC(12, 2),
  severity        TEXT,
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trip_events_trip_idx ON trip_events (trip_id, occurred_at);
-- Impede passagem duplicada do mesmo radar na mesma viagem
CREATE UNIQUE INDEX IF NOT EXISTS trip_events_unique_passage
  ON trip_events (trip_id, radar_id)
  WHERE event_type = 'radar_passage' AND radar_id IS NOT NULL;
