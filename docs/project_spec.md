# Especificación del Proyecto — Elementor Builder

## Objetivo

Convertir diseños HTML estáticos en archivos JSON válidos e importables en Elementor Pro v3 (con Flexbox Container activo), usando Claude AI para analizar la estructura visual y generar el JSON correcto.

## Usuario objetivo

Diseñador/desarrollador web que:
- Tiene diseños HTML exportados (de Figma, HTML manual, etc.)
- Quiere recrearlos en WordPress/Elementor sin hacerlo a mano
- Conoce Elementor y sabe importar plantillas

## Flujo de la aplicación (4 pasos)

### Paso 1 — Subir archivos
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| HTML | `.html` / `.htm` | Sí | Código fuente del diseño |
| Imagen | `image/*` | No | Referencia visual para Claude |
| Instrucciones | `.txt` | No | Notas adicionales sobre el diseño |
| Guía Elementor | `.json` | No | Export real de Elementor como referencia de formato |
| Dominio | texto | Sí | Para construir URLs de imágenes WordPress |

### Paso 2 — Análisis
Claude analiza el HTML y la imagen, detecta todas las secciones y retorna:
```json
[{
  "id": "hero",
  "name": "Hero Principal",
  "description": "Banner con H1, subtítulo y 2 CTAs",
  "layout_type": "single",
  "col_split": null,
  "background_color": "#0f172a",
  "has_background_image": true,
  "content_summary": "...",
  "images": ["banner.jpg"],
  "icons": ["arrow_forward"],
  "suggested_padding_v": 96,
  "suggested_padding_h": 32
}]
```

### Paso 3 — Revisión interactiva
Por cada sección el usuario puede ajustar:
- **Layout**: columna única / 2 columnas / 3 columnas / grid-2 / grid-3
- **Distribución** (si 2 cols): 50/50 / 40/60 / 60/40 / 33/67
- **Alineación H**: flex-start / center / flex-end
- **Alineación V**: flex-start / center / flex-end / space-between
- **Padding vertical**: 0 / 32 / 48 / 64 / 96 px
- **Padding horizontal**: 0 / 16 / 32 / 64 px
- **Color de fondo**: color picker + input hex
- **Habilitado/Deshabilitado**: toggle para excluir secciones del JSON final

### Paso 4 — Generación con streaming
- Claude genera JSON Elementor sección por sección via SSE
- UI muestra progreso en tiempo real por sección
- Al terminar: validación automática + botón de descarga
- Lista de imágenes necesarias con URLs de WordPress

---

## Reglas absolutas del JSON Elementor v3

### Estructura del archivo final
```json
{
  "title": "Nombre de la página",
  "type": "page",
  "version": "0.4",
  "page_settings": {},
  "content": []
}
```
**CRÍTICO**: `page_settings` debe ser `{}` (objeto), jamás `[]`.

### Tipos de elementos
- Solo `"container"` y `"widget"` como `elType`
- **Nunca** `"section"` o `"column"` (legacy, rompe la importación)

### Containers
```json
{
  "id": "abc12345",
  "elType": "container",
  "isInner": false,
  "settings": {
    "content_width": "full",
    "flex_direction": "column",
    "align_items": "center",
    "justify_content": "flex-start",
    "padding": {"unit":"px","top":"96","right":"32","bottom":"96","left":"32","isLinked":false}
  },
  "elements": []
}
```
- Raíz: `isInner: false` | Hijos: `isInner: true`

### Dos columnas
Cada hijo container DEBE tener:
```json
"width": {"unit": "%", "size": 50, "sizes": []},
"width_tablet": {"unit": "%", "size": 100, "sizes": []}
```

### Padding
Siempre estructura completa — nunca solo un número:
```json
{"unit": "px", "top": "64", "right": "32", "bottom": "64", "left": "32", "isLinked": false}
```
- Containers: key `"padding"`
- Widgets (margen externo): key `"_padding"` (con guion bajo)
- Botones (interno): key `"text_padding"`

### IDs
8 caracteres alfanuméricos únicos por elemento. Ejemplo: `"a3f8b2c1"`

### Grid
```json
{
  "container_type": "grid",
  "grid_columns_grid": "repeat(3, 1fr)",
  "grid_columns_grid_tablet": "repeat(2, 1fr)",
  "grid_columns_grid_mobile": "repeat(1, 1fr)"
}
```

### Fondo con imagen
```json
{
  "background_background": "classic",
  "background_image": {
    "url": "https://dominio.com/wp-content/uploads/imagen.jpg",
    "id": "", "size": "", "alt": "descripción", "source": "library"
  },
  "background_size": "cover",
  "background_position": "center center"
}
```

### Overlay sobre imagen
```json
{
  "background_overlay_background": "classic",
  "background_overlay_color": "rgba(15,23,42,0.65)"
}
```

### Tipografía (heading widget)
```json
{
  "title_color": "#ffffff",
  "typography_typography": "custom",
  "typography_font_size": {"unit": "px", "size": 56, "sizes": []},
  "typography_font_weight": "900"
}
```

### Iconos Material Symbols
Solo como HTML inline — nunca como widget nativo de Elementor:
```html
<span class="material-symbols-outlined" style="font-size:20px;color:#034d73;">icon_name</span>
```

### URLs de imágenes
Siempre formato WordPress:
```
https://dominio.com/wp-content/uploads/nombre-imagen.jpg
```

---

## Paleta de colores de la UI

| Variable | Hex | Uso |
|---|---|---|
| `--primary` | `#034d73` | Header, elementos activos |
| `--cta` | `#0085ca` | Botones principales, completado |
| `--secondary` | `#cfefff` | Fondos suaves, badges |
| `--bg-light` | `#f8fafc` | Fondo de la app |
| `--text-main` | `#0f172a` | Texto principal |
| `--text-muted` | `#64748b` | Texto secundario |

## Sistema de Guías de formato

Para mejorar la precisión del JSON generado, el usuario puede subir un export `.json` de Elementor como referencia:

1. Exportar página desde Elementor → editor → ☰ → Exportar plantilla
2. Subir en Step 1 → zona "Guía de formato Elementor"
3. Se extrae un skeleton de 1-2 containers (máx 6KB)
4. Claude copia la estructura exacta de ese sitio
5. La guía persiste en `localStorage` entre sesiones

---

## API Endpoints

### `POST /api/analyze`
- Content-Type: `multipart/form-data`
- Campos: `html_file`, `image_file?`, `instructions?`, `domain`
- Response: `{ sections: Section[], total_images: string[], domain: string }`

### `POST /api/generate`
- Content-Type: `application/json`
- Body: `{ sections: Section[], html: string, domain: string, title?: string, guide_snippet?: string }`
- Response: `text/event-stream` SSE
  - `{"type":"section_start", "section_id":"...", "section_name":"..."}`
  - `{"type":"chunk", "content":"...fragmento json..."}`
  - `{"type":"section_done", "section_id":"..."}`
  - `{"type":"error", "section_id":"...", "message":"..."}`
  - `{"type":"complete", "download_url":"/api/download/page-xxx.json", "validation":{...}}`

### `GET /api/download/:filename`
- Response: `application/json` con `Content-Disposition: attachment`
- Archivos almacenados en `/tmp/elementor_output/` (ephemeral)
