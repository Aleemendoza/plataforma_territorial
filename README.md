# Jujuy Alerta Territorial

Plataforma provincial de monitoreo y alerta temprana con arquitectura open source first, foco geoespacial y despliegue inicial en infraestructura gratuita.

## MVP

- Frontend operativo con Next.js 15, React 19, Tailwind y MapLibre.
- API Gateway y servicios base en FastAPI.
- Procesamiento geoespacial desacoplado para NDVI, NDWI y NBR.
- Riesgo heuristico, alertas operativas y streaming por WebSocket.
- PostgreSQL + PostGIS, MinIO y TiTiler bajo Docker Compose.

## Monorepo

- `apps/web`: interfaz GIS operacional.
- `services/api-gateway`: API principal y WebSocket.
- `services/ingestion-service`: captura de fuentes publicas.
- `services/geo-service`: procesamiento raster y generacion de artefactos.
- `services/risk-engine`: scoring territorial.
- `services/alert-engine`: generacion y priorizacion de alertas.
- `services/scheduler`: orquestacion de jobs.
- `packages/common-py`: modelos y utilidades Python compartidas.
- `infra`: compose, CI y activos de despliegue.
- `.codex/agents`: subagentes especializados del proyecto.

## Inicio rapido

1. Copiar `.env.example` a `.env`.
2. Levantar infraestructura:
   `docker compose up --build`
3. Abrir frontend en `http://localhost:3000`.
4. Abrir docs de API en `http://localhost:8000/docs`.

## Principios

- Modular y event-driven.
- Procesamiento asincronico fuera del request path.
- Open source first y cero vendor lock-in critico.
- Mapa como centro operativo del producto.

