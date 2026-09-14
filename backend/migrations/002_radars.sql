-- Radares / câmeras de fiscalização (espelho operacional sob termos do provedor)
CREATE TABLE IF NOT EXISTS radars (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id     TEXT UNIQUE,
  name            TEXT NOT NULL,
  -- tipo: fixed | mobile | average | red_light | other
  camera_type     TEXT NOT NULL DEFAULT 'fixed',
  -- geometria WGS84
  geom            GEOGRAPHY(POINT, 4326) NOT NULL,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  -- limite sinalizado (km/h); pode ser nulo se só vier do map attributes
  speed_limit_kmh INTEGER,
  -- direção de fiscalização em graus (0–360); NULL = ambos os sentidos
  direction_deg   DOUBLE PRECISION,
  -- tolerância angular para "mesmo sentido" (graus)
  direction_tolerance_deg DOUBLE PRECISION NOT NULL DEFAULT 60,
  alert_radius_m  DOUBLE PRECISION NOT NULL DEFAULT 220,
  pass_radius_m   DOUBLE PRECISION NOT NULL DEFAULT 55,
  road_name       TEXT,
  city            TEXT,
  state           CHAR(2),
  source          TEXT NOT NULL DEFAULT 'demo',
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS radars_geom_gix ON radars USING GIST (geom);
CREATE INDEX IF NOT EXISTS radars_active_idx ON radars (active) WHERE active;
