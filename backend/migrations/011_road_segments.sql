-- Segmentos de via para map matching local (OSM / import próprio)
-- Sem dependência de API paga de matching.
CREATE TABLE IF NOT EXISTS road_segments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  osm_way_id      BIGINT,
  name            TEXT,
  -- geometria da via (linha)
  geom            GEOGRAPHY(LINESTRING, 4326) NOT NULL,
  -- direção: both | forward | reverse
  oneway          TEXT NOT NULL DEFAULT 'both',
  -- rumo aproximado do sentido "forward" (graus), se conhecido
  forward_heading_deg DOUBLE PRECISION,
  -- limite em km/h (pode vir de OSM maxspeed)
  maxspeed_kmh    INTEGER,
  maxspeed_source TEXT NOT NULL DEFAULT 'unknown', -- local | osm | complementary
  highway_class   TEXT,
  city            TEXT,
  state           CHAR(2),
  country         CHAR(2) NOT NULL DEFAULT 'BR',
  confidence      DOUBLE PRECISION NOT NULL DEFAULT 0.7,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS road_segments_geom_gix ON road_segments USING GIST (geom);
CREATE INDEX IF NOT EXISTS road_segments_active_idx ON road_segments (active) WHERE active;
CREATE INDEX IF NOT EXISTS road_segments_osm_way_idx ON road_segments (osm_way_id);

-- Exemplo de matching (produção):
-- SELECT id, name, maxspeed_kmh,
--        ST_Distance(geom, ST_SetSRID(ST_MakePoint($lng,$lat),4326)::geography) AS dist_m
-- FROM road_segments
-- WHERE active AND ST_DWithin(geom, ST_SetSRID(ST_MakePoint($lng,$lat),4326)::geography, $radius_m)
-- ORDER BY dist_m ASC
-- LIMIT 5;
