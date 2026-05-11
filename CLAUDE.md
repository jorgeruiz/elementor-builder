# Elementor Builder — Instrucciones para Claude

## Qué es este proyecto
App web que convierte diseños HTML en JSON válido para Elementor Pro v3.
Stack: Next.js 14 App Router + @anthropic-ai/sdk + cheerio. Un solo servicio.

## Arquitectura resumida
- **Frontend + API en uno**: Next.js maneja tanto la UI como el backend (API Routes)
- **Sin backend separado**: el `backend/` Python existe como referencia pero NO está deployado
- **Modelo IA**: `claude-opus-4-6` para análisis y generación

## Deploy
- Plataforma: Easypanel en VPS `76.13.121.6:3000`
- Proyecto Easypanel: `apps`
- Servicio activo: `elementor-builder` (fuente: `/frontend` del repo)
- URL pública: `https://apps-elementor-builder.6lk5jx.easypanel.host`
- Variables de entorno en Easypanel: `ANTHROPIC_API_KEY`, `NEXT_TELEMETRY_DISABLED=1`

## Cómo hacer deploy
```bash
# 1. Push al repo
GH_TOKEN=$(security find-internet-password -s github.com -w)
git push "https://jorgeruiz:${GH_TOKEN}@github.com/jorgeruiz/elementor-builder.git" main

# 2. Trigger deploy via Easypanel API
TOKEN=$(curl -s -X POST "http://76.13.121.6:3000/api/trpc/auth.login" \
  -H "Content-Type: application/json" \
  -d '{"json":{"email":"jorge.arm@gmail.com","password":"ClickSociety12#"}}' | \
  python3 -c "import json,sys; print(json.load(sys.stdin)['result']['data']['json']['token'])")
curl -s -X POST "http://76.13.121.6:3000/api/trpc/services.app.deployService" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"json":{"projectName":"apps","serviceName":"elementor-builder"}}'
```

## Archivos críticos
| Archivo | Propósito |
|---|---|
| `frontend/src/lib/server/prompts.ts` | Prompts de Claude — aquí está la lógica del JSON Elementor |
| `frontend/src/lib/server/elementorBuilder.ts` | Wrapper del JSON final |
| `frontend/src/lib/server/jsonValidator.ts` | Validación de elementos legacy |
| `frontend/src/lib/guideExtractor.ts` | Extrae skeleton de exports reales de Elementor |
| `frontend/src/app/api/generate/route.ts` | SSE streaming de generación |
| `frontend/src/app/api/analyze/route.ts` | Análisis de HTML con Claude |
| `frontend/src/lib/types.ts` | Tipos TypeScript compartidos |

## Reglas críticas del JSON Elementor v3
1. NUNCA `elType: "section"` o `elType: "column"` — solo `"container"` y `"widget"`
2. `page_settings` debe ser `{}` (objeto), nunca `[]` (array)
3. Containers raíz: `isInner: false` | Containers hijos: `isInner: true`
4. 2 columnas: cada hijo necesita `width: {unit: "%", size: 50, sizes: []}`
5. Paddings siempre con estructura completa: `{unit, top, right, bottom, left, isLinked}`
6. IDs únicos de exactamente 8 caracteres alfanuméricos

## Sistema de Guías
El usuario puede subir un `.json` exportado de Elementor como referencia.
- Se extrae un skeleton de 1-2 containers (~6KB máx)
- Se guarda en `localStorage['elementor_guide']`
- Se inyecta automáticamente en cada llamada a `/api/generate`
- Persiste entre recargas, NO se borra al resetear el wizard

## Patrones a evitar
- No usar `NEXT_PUBLIC_API_URL` — las API calls son internas (`/api/...`)
- No escribir en `/tmp/elementor_guides/` — las guías van en localStorage
- No tocar el `backend/` Python para features nuevas — todo va en `frontend/src/`
- No guardar `ANTHROPIC_API_KEY` en código — viene de env var del servidor
