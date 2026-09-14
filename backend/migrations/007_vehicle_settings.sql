CREATE TABLE IF NOT EXISTS vehicle_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label           TEXT NOT NULL DEFAULT 'default',
  fuel_price_brl  NUMERIC(10, 3) NOT NULL DEFAULT 6.500,
  -- km por litro (média)
  fuel_economy_km_per_l DOUBLE PRECISION NOT NULL DEFAULT 10.0,
  vehicle_type    TEXT NOT NULL DEFAULT 'car', -- car | motorcycle | truck
  include_tolls   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT vehicle_settings_label_uq UNIQUE (label)
);

-- Uma linha padrão
INSERT INTO vehicle_settings (label)
VALUES ('default')
ON CONFLICT (label) DO NOTHING;
