CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  geometry GEOMETRY(Point, 4326) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_geometry ON alerts USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts (created_at DESC);

CREATE TABLE IF NOT EXISTS raster_layers (
  id UUID PRIMARY KEY,
  layer_type TEXT NOT NULL,
  asset_path TEXT NOT NULL,
  preview_path TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raster_layers_type_time ON raster_layers (layer_type, generated_at DESC);

CREATE TABLE IF NOT EXISTS risk_zones (
  id UUID PRIMARY KEY,
  risk_level TEXT NOT NULL,
  score NUMERIC(4, 3) NOT NULL,
  geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_zones_geometry ON risk_zones USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_risk_zones_level ON risk_zones (risk_level);

