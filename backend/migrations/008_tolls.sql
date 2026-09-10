-- Pedágios — tabela futura (pronta para integração)
CREATE TABLE IF NOT EXISTS tolls (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  operator        TEXT,
  geom            GEOGRAPHY(POINT, 4326) NOT NULL,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  -- preço por categoria (car = categoria 1)
  price_car_brl   NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price_motorcycle_brl NUMERIC(10, 2),
  price_truck_brl NUMERIC(10, 2),
  direction_deg   DOUBLE PRECISION,
  road_name       TEXT,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  source          TEXT NOT NULL DEFAULT 'manual',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tolls_geom_gix ON tolls USING GIST (geom);
