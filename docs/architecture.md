# Arquitectura Tecnica MVP

## Objetivo

Construir un sistema operativo territorial provincial que integre ingesta de datos publicos, procesamiento geoespacial, analitica de riesgo y visualizacion operacional sobre mapa.

## Capas

1. `apps/web`
   Interfaz operacional mobile-first. El mapa concentra contexto, capas, alertas y timeline.
2. `services/api-gateway`
   FastAPI expone REST, WebSocket, autenticacion futura y contratos de integracion.
3. `services/ingestion-service`
   Descarga, valida y publica eventos de nuevas escenas o datasets.
4. `services/geo-service`
   Procesa raster, genera indices, previews, tiles y zonas vectoriales.
5. `services/risk-engine`
   Calcula riesgo heuristico combinando lluvia, pendiente, humedad y perdida de vegetacion.
6. `services/alert-engine`
   Materializa alertas a partir de cambios territoriales y niveles de riesgo.
7. `services/scheduler`
   Orquesta polling y reprocesamientos.
8. `postgres + postgis`
   Estado transaccional, features espaciales y capas de riesgo.
9. `minio + titiler`
   Storage de artefactos y entrega de tiles.

## Flujo de eventos

1. Scheduler dispara `dataset.poll.requested`.
2. Ingestion descarga y persiste raw files, luego emite `dataset.ingested`.
3. Geo service consume el evento, calcula indices y publica `layer.generated`.
4. Risk engine consume capas y clima, publica `risk.updated`.
5. Alert engine evalua reglas y publica `alert.created`.
6. API Gateway expone lecturas y retransmite alertas por WebSocket.

## Despliegue gratuito inicial

- Frontend: Vercel free o Cloudflare Pages.
- APIs Python: Render free / Railway starter / Fly.io shared VM.
- DB + storage local para demo: Docker Compose.
- DB + storage remotos futuros: Neon + Cloudflare R2 si se acepta costo marginal controlado.

