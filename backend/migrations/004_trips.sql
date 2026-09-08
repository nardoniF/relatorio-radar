CREATE TABLE IF NOT EXISTS trips (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode            TEXT NOT NULL DEFAULT 'gps', -- gps | sim
  status          TEXT NOT NULL DEFAULT 'active', -- active | finished
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at        TIMESTAMPTZ,
  max_speed_kmh   DOUBLE PRECISION NOT NULL DEFAULT 0,
  sample_count    INTEGER NOT NULL DEFAULT 0,
  distance_m      DOUBLE PRECISION NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trips_status_idx ON trips (status, started_at DESC);
