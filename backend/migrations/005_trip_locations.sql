CREATE TABLE IF NOT EXISTS trip_locations (
  id              BIGSERIAL PRIMARY KEY,
  trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  recorded_at     TIMESTAMPTZ NOT NULL,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  geom            GEOGRAPHY(POINT, 4326),
  speed_kmh       DOUBLE PRECISION NOT NULL DEFAULT 0,
  filtered_speed_kmh DOUBLE PRECISION,
  heading_deg     DOUBLE PRECISION,
  accuracy_m      DOUBLE PRECISION,
  seq             INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS trip_locations_trip_idx ON trip_locations (trip_id, recorded_at);
CREATE INDEX IF NOT EXISTS trip_locations_geom_gix ON trip_locations USING GIST (geom);
