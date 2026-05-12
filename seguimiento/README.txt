
# Herramienta Nodo O&M

## Archivos incluidos
- `supabase_schema.sql`: crea todas las tablas, vistas, RLS y datos base.
- `index.html`: login / registro con Supabase Auth.
- `dashboard.html`: resumen general.
- `tickets.html`: gestión de fallas y tickets.
- `mantenimientos.html`: preventivos y correctivos.
- `instalaciones.html`: nuevas instalaciones.
- `factibilidades.html`: estudios de factibilidad.
- `traslados.html`: gestión de traslados.
- `materiales.html`: materiales, bodegas e inventario.
- `gastos.html`: flujo de caja.
- `tareas.html`: tareas y alertas.
- `reportes.html`: base para reportes.
- `app.js`: conexión y utilidades.
- `styles.css`: estilo base.

## Cómo usar
1. Crea tu proyecto en Supabase.
2. Abre el SQL Editor y pega `supabase_schema.sql`.
3. Ejecuta todo el script.
4. En `app.js`, reemplaza:
   - `COLOCA_AQUI_TU_SUPABASE_URL`
   - `COLOCA_AQUI_TU_SUPABASE_ANON_KEY`
5. Sube todos los HTML, `app.js` y `styles.css` a tu hosting estático (GitHub Pages, Netlify, Vercel, Hostinger, etc.).

## Importante
- Esta es una base funcional inicial.
- Puedes ampliarla después con:
  - mapa con Leaflet,
  - exportación PDF,
  - filtros avanzados,
  - carga de evidencias,
  - dashboard con gráficos reales,
  - alertas por correo o WhatsApp vía n8n.
