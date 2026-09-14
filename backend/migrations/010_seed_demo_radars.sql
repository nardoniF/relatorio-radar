-- Radares demo SP (mesmo trecho do piloto web)
INSERT INTO radars (
  external_id, name, camera_type, geom, lat, lng,
  speed_limit_kmh, direction_deg, alert_radius_m, pass_radius_m,
  road_name, city, state, source
) VALUES
  (
    'r1', 'Radar Consolação', 'fixed',
    ST_SetSRID(ST_MakePoint(-46.6508, -23.5595), 4326)::geography,
    -23.5595, -46.6508, 50, 70, 220, 55,
    'Consolação', 'São Paulo', 'SP', 'demo'
  ),
  (
    'r2', 'Radar Augusta', 'fixed',
    ST_SetSRID(ST_MakePoint(-46.6435, -23.5558), 4326)::geography,
    -23.5558, -46.6435, 50, 70, 220, 55,
    'Augusta', 'São Paulo', 'SP', 'demo'
  ),
  (
    'r3', 'Radar Higienópolis', 'fixed',
    ST_SetSRID(ST_MakePoint(-46.6345, -23.5518), 4326)::geography,
    -23.5518, -46.6345, 40, 70, 200, 50,
    'Higienópolis', 'São Paulo', 'SP', 'demo'
  ),
  (
    'r4', 'Radar Pacaembu', 'fixed',
    ST_SetSRID(ST_MakePoint(-46.6235, -23.5497), 4326)::geography,
    -23.5497, -46.6235, 60, 90, 250, 60,
    'Pacaembu', 'São Paulo', 'SP', 'demo'
  ),
  (
    'r5', 'Radar Sumaré', 'fixed',
    ST_SetSRID(ST_MakePoint(-46.6125, -23.5508), 4326)::geography,
    -23.5508, -46.6125, 50, 100, 220, 55,
    'Sumaré', 'São Paulo', 'SP', 'demo'
  )
ON CONFLICT (external_id) DO UPDATE SET
  name = EXCLUDED.name,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  geom = EXCLUDED.geom,
  speed_limit_kmh = EXCLUDED.speed_limit_kmh,
  direction_deg = EXCLUDED.direction_deg,
  alert_radius_m = EXCLUDED.alert_radius_m,
  pass_radius_m = EXCLUDED.pass_radius_m,
  active = TRUE,
  updated_at = NOW();
