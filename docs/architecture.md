# Arquitectura — Elementor Builder

## Visión general

Aplicación de un solo servicio Next.js 14 que convierte diseños HTML en JSON válido para Elementor Pro v3, usando Claude AI como motor de análisis y generación.

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 14 App                        │
│                                                          │
│  ┌─────────────────┐    ┌───────────────────────────┐   │
│  │   UI (cliente)   │    │    API Routes (servidor)   │   │
│  │                  │    │                           │   │
│  │  page.tsx        │    │  /api/analyze  → Claude   │   │
│  │  Step1Upload     │◄──►│  /api/generate → Claude   │   │
│  │  Step2Analysis   │    │  /api/download → /tmp/    │   │
│  │  Step3Review     │    │                           │   │
│  │  Step4Generate   │    └───────────────────────────┘   │
│  └─────────────────┘                                     │
└─────────────────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
  localStorage               Anthropic API
  (guía formato)             (claude-opus-4-6)
```

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js App Router | 14.2.5 |
| UI | React + TailwindCSS | 18.3 / 3.4 |
| IA | @anthropic-ai/sdk | ^0.36.0 |
| Parser HTML | cheerio | ^1.0.0 |
| Iconos | Material Symbols Outlined | Google CDN |
| Deploy | Easypanel (Docker standalone) | node:20-alpine |

## Estructura de carpetas

```
elementor-builder/
├── CLAUDE.md                   ← instrucciones para Claude Code
├── docs/                       ← documentación del proyecto
├── backend/                    ← referencia Python (no deployado)
│   ├── main.py
│   ├── routers/
│   └── services/
└── frontend/                   ← servicio deployado
    ├── Dockerfile
    ├── next.config.js
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx          ← wizard principal (estado global)
    │   │   ├── layout.tsx        ← Material Symbols + favicon
    │   │   ├── globals.css       ← estilos base + paleta
    │   │   └── api/
    │   │       ├── analyze/      ← POST multipart → secciones JSON
    │   │       ├── generate/     ← POST → SSE streaming Elementor JSON
    │   │       └── download/     ← GET → descarga archivo .json
    │   ├── components/
    │   │   └── steps/
    │   │       ├── Step1Upload.tsx    ← archivos + dominio + guía
    │   │       ├── Step2Analysis.tsx  ← resumen de secciones detectadas
    │   │       ├── Step3Review.tsx    ← ajuste por sección + toggles
    │   │       └── Step4Generate.tsx  ← streaming SSE + descarga
    │   └── lib/
    │       ├── types.ts              ← interfaces TypeScript
    │       ├── api.ts                ← cliente HTTP (browser)
    │       ├── guideExtractor.ts     ← extracción + localStorage
    │       └── server/               ← solo server-side
    │           ├── prompts.ts        ← buildGeneratePrompt + ANALYZE_PROMPT
    │           ├── htmlParser.ts     ← cheerio parser
    │           ├── elementorBuilder.ts ← buildPageWrapper
    │           └── jsonValidator.ts  ← validateElementorJson
    └── public/
        └── icon.svg
```

## Flujo de datos

### Fase 1 — Análisis (`/api/analyze`)
```
Usuario sube HTML + imagen + dominio
    → multipart/form-data POST /api/analyze
    → cheerio: parseHtmlSections() extrae metadata
    → Claude claude-opus-4-6: ANALYZE_PROMPT + HTML + imagen
    → Retorna: sections[], total_images[], domain
```

### Fase 2 — Revisión (cliente)
```
Secciones mostradas en Step3Review
    → Usuario ajusta: layout, padding, colores, enable/disable
    → Estado en React (sin llamadas a API)
    → Secciones deshabilitadas se excluyen del siguiente paso
```

### Fase 3 — Generación (`/api/generate`)
```
POST /api/generate { sections, html, domain, title, guide_snippet? }
    → ReadableStream SSE por sección:
       data: {"type":"section_start", ...}
       data: {"type":"chunk", "content":"...fragmento json..."}
       data: {"type":"section_done", ...}
       data: {"type":"complete", "download_url":"/api/download/page-xxx.json"}
    → Claude genera JSON Elementor para cada sección
    → buildPageWrapper() envuelve todo
    → validateElementorJson() valida ausencia de legacy elements
    → Guardado en /tmp/elementor_output/page-{timestamp}.json
```

### Sistema de Guías
```
localStorage['elementor_guide'] = { filename, snippet, savedAt }
    → snippet = 1-2 containers skeleton extraídos del export real
    → Se inyecta en buildGeneratePrompt() como REFERENCIA REAL
    → Persiste entre sesiones, sobrevive recargas
    → No se borra al resetear el wizard
```

## Formato JSON Elementor v3

El archivo final tiene esta estructura:
```json
{
  "title": "Nombre de la página",
  "type": "page",
  "version": "0.4",
  "page_settings": {},
  "content": [
    {
      "id": "abc12345",
      "elType": "container",
      "isInner": false,
      "settings": { "padding": {...}, "background_color": "...", ... },
      "elements": [
        {
          "id": "def67890",
          "elType": "widget",
          "widgetType": "heading",
          "settings": { "title": "...", ... },
          "elements": []
        }
      ]
    }
  ]
}
```

## Deploy en producción

```
GitHub repo: jorgeruiz/elementor-builder
    → Easypanel pull desde /frontend
    → docker buildx build (Dockerfile multistage)
    → next build → .next/standalone
    → Container corriendo en puerto 3000
    → Traefik → HTTPS apps-elementor-builder.6lk5jx.easypanel.host
```

## Variables de entorno

| Variable | Dónde | Descripción |
|---|---|---|
| `ANTHROPIC_API_KEY` | Easypanel runtime | Clave API de Anthropic |
| `NEXT_TELEMETRY_DISABLED` | Easypanel + Dockerfile | Desactiva telemetría Next.js |

`ANTHROPIC_API_KEY` es server-side only — nunca se expone al cliente.
