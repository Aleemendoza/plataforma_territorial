# Jujuy Alerta Territorial

Visor operativo para Jujuy con mapa navegable, focos de incendio reales de NASA FIRMS, meteorologia de Open-Meteo y capa satelital opcional sobre MapLibre.

## Arquitectura activa

- `apps/web`: Next.js 15, React 19, Tailwind, MapLibre y deck.gl.
- `services/api-gateway`: FastAPI que unifica FIRMS, Open-Meteo y contexto narrativo para el frontend.
- `packages/common-py`: schemas compartidos del backend.
- `docker-compose.yml`: levanta `web` y `api` juntos para desarrollo local.

## Datos reales conectados

- `NASA FIRMS`
  - focos termicos reales para Jujuy via `FIRMS_MAP_KEY`
  - fuentes VIIRS NRT
- `Open-Meteo`
  - viento actual y series horarias
  - precipitacion, humedad y flood context
- `Sentinel Hub / WMS compatible`
  - capa satelital opcional via URL de tiles/WMS
  - activable desde el frontend como capa `Satelite visible`

Referencias oficiales:
- [FIRMS API](https://firms.modaps.eosdis.nasa.gov/content/academy/data_api/firms_api_use.html)
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs)
- [Sentinel Hub WMS](https://docs.sentinel-hub.com/api/latest/api/ogc/wms/)

## Variables

Copiar `.env.example` a `.env`.

### Frontend (`web`)

- `NEXT_PUBLIC_API_URL`
  - URL publica del backend, por ejemplo `https://plataformaterritorial-api.up.railway.app/api/v1`
- `NEXT_PUBLIC_WS_URL`
  - websocket del backend, por ejemplo `wss://plataformaterritorial-api.up.railway.app/api/v1/ws/alerts`
- `NEXT_PUBLIC_ENABLE_DEMO_FALLBACK`
  - dejar en `false` para produccion real
- `NEXT_PUBLIC_PROTOMAPS_PM_TILES_URL`
  - basemap PMTiles opcional
- `NEXT_PUBLIC_SATELLITE_TILE_URL`
  - URL raster lista para MapLibre. Puede ser un template XYZ o una plantilla WMS con `BBOX={bbox-epsg-3857}`, `WIDTH=256` y `HEIGHT=256`.
- `NEXT_PUBLIC_SATELLITE_ATTRIBUTION`
  - attribution HTML del proveedor satelital

### Backend (`api-gateway`)

- `API_CORS_ORIGINS`
  - dominios permitidos del frontend separados por coma
- `FIRMS_MAP_KEY`
  - clave de NASA FIRMS
- `OPEN_METEO_BASE_URL`
  - default `https://api.open-meteo.com`
- `OPEN_METEO_FLOOD_BASE_URL`
  - default `https://flood-api.open-meteo.com`
- `SATELLITE_WMS_BASE_URL`
  - base WMS/OGC si queres exponer tambien capas satelitales por API
- `SATELLITE_TRUE_COLOR_LAYER`
  - default `TRUE_COLOR`
- `SATELLITE_NDVI_LAYER`
  - default `NDVI`

## Desarrollo local

```bash
docker compose up --build
```

Servicios:
- `http://localhost:3000` -> frontend
- `http://localhost:8000/health` -> backend

## Despliegue en Railway

Hay que crear **dos servicios** en el mismo proyecto Railway.

### 1. Servicio `web`

- Source repo: este repo
- Builder: `Dockerfile`
- Dockerfile: raiz del repo (`/Dockerfile`)
- Dominio publico: el de la app web

Variables del servicio `web`:

- `NEXT_PUBLIC_API_URL=https://TU-SERVICIO-API.up.railway.app/api/v1`
- `NEXT_PUBLIC_WS_URL=wss://TU-SERVICIO-API.up.railway.app/api/v1/ws/alerts`
- `NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=false`
- `NEXT_PUBLIC_PROTOMAPS_PM_TILES_URL=...` opcional
- `NEXT_PUBLIC_SATELLITE_TILE_URL=...` opcional
- `NEXT_PUBLIC_SATELLITE_ATTRIBUTION=...` opcional

### 2. Servicio `api-gateway`

- Source repo: este repo
- Root directory: repo root
- Builder: `Dockerfile`
- Dockerfile path: `services/api-gateway/Dockerfile`
- Dominio publico: el de la API

Variables del servicio `api-gateway`:

- `API_CORS_ORIGINS=https://TU-SERVICIO-WEB.up.railway.app`
- `FIRMS_MAP_KEY=...`
- `OPEN_METEO_BASE_URL=https://api.open-meteo.com`
- `OPEN_METEO_FLOOD_BASE_URL=https://flood-api.open-meteo.com`
- `SATELLITE_WMS_BASE_URL=...` opcional
- `SATELLITE_TRUE_COLOR_LAYER=TRUE_COLOR`
- `SATELLITE_NDVI_LAYER=NDVI`

## Donde guardar las API keys

No van en el repo.

- En Railway:
  - `Proyecto > servicio > Variables`
- `FIRMS_MAP_KEY` va en el servicio `api-gateway`
- si usas Sentinel Hub con credenciales o URL privada, tambien va en `api-gateway`
- las variables `NEXT_PUBLIC_*` van solo en `web`

## Estado funcional

- mapa navegable de Jujuy
- iconos clickeables para alertas
- incendios reales via FIRMS
- viento y lluvia reales via Open-Meteo
- detalle contextual al click
- capa satelital opcional por env
