# Estado del Proyecto — Elementor Builder

**Última actualización:** 2026-05-07
**Commit más reciente:** `2f9908d` — feat: sistema de guías de formato Elementor

---

## Estado actual: Producción activa

| Servicio | URL | Estado |
|---|---|---|
| App (frontend + API) | [apps-elementor-builder.6lk5jx.easypanel.host](https://apps-elementor-builder.6lk5jx.easypanel.host) | ✅ Online |
| Backend Python (legado) | `apps-elementor-builder-api.6lk5jx.easypanel.host` | ⚠️ Sin uso — eliminar |

---

## Historial de commits

| Hash | Descripción | Estado |
|---|---|---|
| `2f9908d` | Sistema de guías de formato Elementor | Deployado |
| `ef29c3c` | Fix crítico: page_settings como `{}` no `[]` | Deployado |
| `08ebf09` | Toggle habilitar/deshabilitar secciones en Step3Review | Deployado |
| `c4736db` | Consolidación a Next.js — API routes internas + Material Symbols + favicon | Deployado |
| `3269647` | Fix Dockerfile: ARG para NEXT_PUBLIC vars + crear public/ | Deployado |
| `bd12a1a` | Versión inicial: FastAPI backend + Next.js frontend (dos servicios) | Reemplazado |

---

## Funcionalidades implementadas

### ✅ Completadas
- [x] Wizard de 4 pasos con barra de progreso
- [x] Upload de HTML, imagen, instrucciones y guía Elementor
- [x] Análisis de secciones con Claude (paso 2)
- [x] Revisión interactiva por sección (paso 3)
  - [x] Layout selector (single / 2-col / 3-col / grid-2 / grid-3)
  - [x] Distribución de columnas (50/50, 40/60, etc.)
  - [x] Alineación H y V
  - [x] Padding vertical y horizontal
  - [x] Color picker de fondo
  - [x] Toggle habilitar/deshabilitar sección
  - [x] Botones "habilitar todas / deshabilitar todas"
- [x] Generación JSON con streaming SSE (paso 4)
- [x] Validación de JSON (sin elementos legacy)
- [x] Descarga del archivo JSON
- [x] Material Symbols Outlined cargando correctamente
- [x] Favicon SVG
- [x] Sistema de Guías de formato (localStorage)
  - [x] FileZone .json en Step 1
  - [x] Extracción de skeleton (guideExtractor.ts)
  - [x] Badge "Guía activa" persistente
  - [x] Inyección en buildGeneratePrompt

### ⚠️ Bugs conocidos / Pendientes
- [ ] Verificar importación JSON en Elementor con la nueva guía (pendiente de prueba del usuario)
- [ ] Servicio `elementor-builder-api` (Python) en Easypanel — eliminar, ya no se usa
- [ ] Los archivos en `/tmp/elementor_output/` se pierden en cada redeploy — el botón de descarga puede dar 404 si se redeploya tras generar
- [ ] El análisis puede tardar >30s en HTMLs muy largos (límite por defecto de algunos proxies)

### 🔲 Por implementar (futuro)
- [ ] Previsualización del JSON generado en la UI (tree view o highlight)
- [ ] Historial de conversiones (últimas N generaciones)
- [ ] Soporte para múltiples guías de formato (actualmente solo 1)
- [ ] Validación más detallada con sugerencias de corrección
- [ ] Modo "retry sección" — regenerar solo una sección sin rehacer todo

---

## Decisiones técnicas importantes

### Por qué un solo servicio (no FastAPI + Next.js)
El backend Python fue la arquitectura inicial, pero se consolidó en Next.js porque:
- Las API Routes de Next.js soportan SSE streaming nativo
- Se evita la latencia de red entre servicios
- El timeout de 30s en API routes NO aplica en Easypanel self-hosted
- Un solo Dockerfile simplifica el deploy y el mantenimiento

### Por qué localStorage para las guías (no base de datos)
- `/tmp/` se borra en cada redeploy de Easypanel
- Las env vars tienen límite de tamaño
- App de un solo usuario → localStorage es más que suficiente
- Cero infraestructura adicional

### Por qué `page_settings: {}` es crítico
Elementor Pro valida el archivo al importar. Si `page_settings` es un array (`[]`) en lugar de un objeto (`{}`), el import falla silenciosamente con "formato no válido". Este bug estuvo presente desde la v1 hasta el commit `ef29c3c`.

---

## Infraestructura

### Easypanel
- Host: `76.13.121.6:3000`
- Credenciales: `jorge.arm@gmail.com` / `ClickSociety12#`
- Proyecto: `apps`
- Servicio: `elementor-builder`

### GitHub
- Repo: `https://github.com/jorgeruiz/elementor-builder`
- Branch: `main`
- Token: en macOS Keychain (`security find-internet-password -s github.com -w`)

### Variables de entorno en producción
```
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_TELEMETRY_DISABLED=1
```

---

## Cómo probar localmente

```bash
cd frontend
npm install
# Crear .env.local con:
# ANTHROPIC_API_KEY=sk-ant-...
npm run dev
# → http://localhost:3000
```
