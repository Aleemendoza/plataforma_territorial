# Jujuy Alerta Territorial

Demo operativa de monitoreo territorial construida para iterar rapido, mostrar valor y desplegar sin complejidad innecesaria.

## Stack actual

- `apps/web`: Next.js 15, React 19, Tailwind y MapLibre.
- Docker para correr local y desplegar igual en Railway.
- Supabase como destino natural para DB, auth y storage.
- Dataset demo embebido para no depender de backend en la primera presentacion.

## Estructura

- `apps/web`: frontend listo para demo publica.
- `services/*`: backend futuro para ingestion, scoring, alertas y procesamiento.
- `docker-compose.yml`: stack minima para levantar solo el frontend.
- `.env.example`: variables necesarias para local y Railway.

## Correr local

1. Copiar `.env.example` a `.env`.
2. Ejecutar:
   `docker compose up --build`
3. Abrir `http://localhost:3000`.

Si `NEXT_PUBLIC_API_URL` esta vacia, el frontend usa datos demo locales. Eso permite mostrar la plataforma aunque todavia no exista backend desplegado.

## Railway

1. Conectar el repo de GitHub en Railway.
2. Railway detecta el `Dockerfile` en la raiz del repo y construye `apps/web` sin configuracion extra de monorepo.
3. Si el servicio ya existia fallando con Railpack, hacer un redeploy despues de este cambio.
4. Cargar variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` solo cuando exista backend real
   - `NEXT_PUBLIC_PROTOMAPS_PM_TILES_URL` si quieren mantener el basemap actual
5. Generar dominio publico desde `Settings > Networking`.

## Objetivo de esta etapa

- Tener demo online.
- Mostrar flujo y narrativa territorial.
- Cargar datos reales despues, sin frenar despliegue ni validacion.
