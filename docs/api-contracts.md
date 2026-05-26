# API Contracts

## REST

### `GET /api/v1/alerts`

Lista alertas operativas ordenadas por prioridad.

### `GET /api/v1/alerts/{id}`

Detalle de alerta para panel contextual o modo incidente.

### `GET /api/v1/risk-map`

Retorna descriptor TileJSON del ultimo raster de riesgo.

### `GET /api/v1/risk-zones`

Retorna zonas vectoriales resumidas para overlays y listados.

### `GET /api/v1/satellite/latest`

Capas generadas mas recientes por tipo.

### `GET /api/v1/satellite/history`

Historico resumido de escenas procesadas.

## WebSocket

### `/api/v1/ws/alerts`

Eventos:

- `system`
- `alert.created`
- `alert.acknowledged`
- `risk.updated`

## Event Envelope

```json
{
  "event_name": "layer.generated",
  "event_version": "1.0",
  "emitted_at": "2026-05-22T12:00:00Z",
  "payload": {}
}
```

