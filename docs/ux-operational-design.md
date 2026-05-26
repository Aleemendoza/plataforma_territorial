# UX Operacional

## North Star

La interfaz no se comporta como un dashboard administrativo. Debe sentirse como una consola de vigilancia territorial: lectura inmediata de riesgo, foco visual en mapa y respuestas accionables en menos de cinco segundos.

## Sitemap MVP

1. `/`
   Centro de operaciones con mapa, alertas, timeline y capas.
2. `/incidents/[id]`
   Modo incidente con detalle, propagacion y factores.
3. `/layers`
   Catalogo operativo de capas y disponibilidad.
4. `/alerts`
   Cola de eventos y filtros.

## User Flows

### Operador territorial

1. Abre la plataforma.
2. Ve semaforo general por provincia.
3. Detecta alertas criticas en la columna lateral.
4. Selecciona una alerta.
5. El mapa centra la zona, resalta perimetro y muestra factores.
6. Usa timeline para contrastar escena previa.

### Analista de riesgo

1. Activa capas de pendiente, lluvia y NDWI.
2. Scrubea timeline.
3. Valida evolucion de zonas inundables.
4. Exporta criterio para incidente futuro.

## Sistema visual

- Base oscura: negro grafito y overlays translcidos.
- Riesgo: verde `LOW`, amarillo `MEDIUM`, naranja `HIGH`, rojo `CRITICAL`.
- Agua: azules frios y cian tecnico.
- Tipografia: Inter + Space Grotesk para jerarquia operacional.
- Microinteracciones: hover con glow bajo, transiciones cortas, paneles deslizables.

## Responsive

- Mobile: bottom sheet para alertas y capas.
- Tablet: sidebar colapsable.
- Desktop: layout de tres columnas con mapa central dominante.

