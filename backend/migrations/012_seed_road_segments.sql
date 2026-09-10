-- Seed de segmentos demo (mesma geometria do piloto SP)
-- Em produção: import OSM (maxspeed) + curadoria local.
-- Nota: sem PostGIS rodando, o DemoStore carrega SEED_ROAD_SEGMENTS em memória.

INSERT INTO road_segments (
  osm_way_id, name, geom, oneway, forward_heading_deg,
  maxspeed_kmh, maxspeed_source, highway_class, city, state, confidence
) VALUES
(
  1001,
  'Rua da Consolação',
  ST_GeogFromText('LINESTRING(-46.6558 -23.5614, -46.6525 -23.5602, -46.6491 -23.5588, -46.6458 -23.5571)'),
  'both', 72, 50, 'osm', 'primary', 'São Paulo', 'SP', 0.85
),
(
  1002,
  'Rua Augusta',
  ST_GeogFromText('LINESTRING(-46.6458 -23.5571, -46.6426 -23.5554, -46.6395 -23.5539)'),
  'both', 75, 50, 'osm', 'secondary', 'São Paulo', 'SP', 0.8
),
(
  1003,
  'Av. Higienópolis',
  ST_GeogFromText('LINESTRING(-46.6395 -23.5539, -46.6362 -23.5526, -46.6328 -23.5514, -46.6291 -23.5505)'),
  'both', 80, 40, 'osm', 'secondary', 'São Paulo', 'SP', 0.8
),
(
  1004,
  'Av. Pacaembu',
  ST_GeogFromText('LINESTRING(-46.6291 -23.5505, -46.6254 -23.5499, -46.6216 -23.5496, -46.6179 -23.5498)'),
  'both', 90, 60, 'local', 'primary', 'São Paulo', 'SP', 0.9
),
(
  1005,
  'Av. Sumaré',
  ST_GeogFromText('LINESTRING(-46.6179 -23.5498, -46.6143 -23.5504, -46.6109 -23.5515, -46.6078 -23.553)'),
  'both', 110, 50, 'osm', 'primary', 'São Paulo', 'SP', 0.8
)
ON CONFLICT DO NOTHING;
