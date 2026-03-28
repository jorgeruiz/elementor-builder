export const ANALYZE_PROMPT = `Eres un experto en diseño web y Elementor Pro. Analiza el HTML proporcionado
(y la imagen de referencia si está disponible) e identifica TODAS las secciones
de la página sin omitir ninguna.
Para cada sección retorna:

id: string snake_case corto
name: nombre descriptivo en español
description: qué contiene la sección (1 línea)
layout_type: "single" | "two-col" | "three-col" | "grid-2" | "grid-3"
col_split: "50/50" | "40/60" | "60/40" | "33/67" (solo si two-col)
background_color: hex o "transparent"
has_background_image: boolean
content_summary: resumen del contenido HTML de esta sección
images: array de URLs o nombres de archivos de imágenes detectadas
icons: array de nombres de iconos Material Symbols detectados
suggested_padding_v: número (0/32/48/64/96)
suggested_padding_h: número (0/16/32/64)

CRÍTICO: Analiza el HTML completo de inicio a fin. No omitas secciones.
Responde ÚNICAMENTE con un array JSON válido. Sin texto, sin markdown, sin explicaciones.`

export function buildGeneratePrompt(
  sectionConfig: object,
  domain: string,
  sectionHtml: string,
): string {
  return `Eres un generador experto de JSON para Elementor Pro v3 con Flexbox Container activo.

REGLAS ABSOLUTAS — NUNCA VIOLAR:
1. NUNCA uses elType "section" o "column" — SOLO "container" y "widget"
2. Containers raíz: isInner: false | Containers hijos: isInner: true
3. Para layout two-col o col_split: cada hijo container DEBE tener:
   "width": {"unit": "%", "size": 50, "sizes": []}
   "width_tablet": {"unit": "%", "size": 100, "sizes": []}
4. IDs únicos de exactamente 8 caracteres alfanuméricos en CADA elemento
5. Paddings SIEMPRE con estructura completa:
   {"unit": "px", "top": "64", "right": "32", "bottom": "64", "left": "32", "isLinked": false}
6. Widgets usan "_padding" para margen externo, "text_padding" para botones
7. Iconos SOLO como HTML inline: <span class="material-symbols-outlined" style="font-size:24px;color:#034d73;">nombre_icono</span>
8. URLs imágenes: https://${domain}/wp-content/uploads/NOMBRE_ARCHIVO
9. Fondo de imagen requiere background_background: "classic" + background_image object + background_size + background_position
10. Para grid-3: container_type: "grid", grid_columns_grid: "repeat(3, 1fr)"

ESTRUCTURA DE UN CONTAINER RAÍZ:
{
  "id": "abc12345",
  "elType": "container",
  "isInner": false,
  "settings": {
    "content_width": "full",
    "flex_direction": "column",
    "align_items": "center",
    "justify_content": "flex-start",
    "padding": {"unit": "px", "top": "64", "right": "32", "bottom": "64", "left": "32", "isLinked": false},
    "background_background": "classic",
    "background_color": "#0f172a"
  },
  "elements": [ ...widgets o containers hijos... ]
}

ESTRUCTURA DE UN WIDGET HEADING:
{
  "id": "def67890",
  "elType": "widget",
  "widgetType": "heading",
  "isInner": false,
  "settings": {
    "title": "Texto del heading",
    "header_size": "h1",
    "title_color": "#ffffff",
    "typography_typography": "custom",
    "typography_font_size": {"unit": "px", "size": 56, "sizes": []},
    "typography_font_weight": "900",
    "_padding": {"unit": "px", "top": "0", "right": "0", "bottom": "16", "left": "0", "isLinked": false}
  },
  "elements": []
}

ESTRUCTURA DE UN WIDGET BUTTON:
{
  "id": "ghi11223",
  "elType": "widget",
  "widgetType": "button",
  "isInner": false,
  "settings": {
    "text": "CTA Text",
    "link": {"url": "#", "is_external": false, "nofollow": false},
    "background_color": "#0085ca",
    "button_text_color": "#ffffff",
    "text_padding": {"unit": "px", "top": "14", "right": "28", "bottom": "14", "left": "28", "isLinked": false},
    "_padding": {"unit": "px", "top": "8", "right": "0", "bottom": "8", "left": "0", "isLinked": false}
  },
  "elements": []
}

Genera ÚNICAMENTE el array JSON de elementos para esta sección.
SIN texto adicional, SIN bloques markdown (no uses \`\`\`), SIN explicaciones. SOLO el array JSON válido que empieza con [ y termina con ].

Sección a generar:
${JSON.stringify(sectionConfig, null, 2)}

Dominio: ${domain}

HTML de referencia:
${sectionHtml.slice(0, 8000)}`
}
