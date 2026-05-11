export const ANALYZE_PROMPT = `Eres un experto en diseño web y Elementor Pro que analiza HTML para extraer secciones.

PASO 1 — CUENTA LAS ETIQUETAS <section> DEL HTML.
Ese número ES la cantidad exacta de elementos que debe tener el array resultado.
Si hay 3 etiquetas <section>, el array tiene 3 elementos. Si hay 7, tiene 7.
Haz este conteo antes de escribir cualquier output.

PASO 2 — EXCLUYE SOLO estos elementos (no son secciones de contenido):
- <header> raíz
- <nav> raíz
- <footer>
- Cualquier elemento con clase "fixed" o "sticky" (ej. botones flotantes de WhatsApp)

PASO 3 — PROHIBICIONES ABSOLUTAS (excusas que nunca son válidas):
- NO fusionar dos <section> porque tienen color de fondo parecido
- NO ignorar una <section> que solo contiene una grid o lista de cards
- NO agrupar una <section> corta con la anterior o siguiente
- NO omitir <section> que parezcan "simples" o "repetitivas"
- NO inventar secciones que no existen como <section> en el HTML

PASO 4 — MAPEO DE CLASES TAILWIND A layout_type:
- grid-cols-2 con 2 items directos → "two-col"
- grid-cols-3 con 3 items directos → "three-col"
- grid-cols-2 con 4+ items directos → "grid-2"
- grid-cols-3 con 4-9 items directos → "grid-3"
- grid-cols-4 con 4+ items directos → "grid-4"
- Las clases responsive md:grid-cols-X y lg:grid-cols-X cuentan como layout principal
- Sin grid visible → "single"

PASO 5 — Para cada <section> retorna un objeto con TODOS estos campos:

id: string snake_case corto y descriptivo (ej: "hero", "servicios_grid", "contacto")
name: nombre descriptivo en español
description: qué contiene la sección en 1 línea
layout_type: uno de "single" | "two-col" | "three-col" | "grid-2" | "grid-3" | "grid-4"
col_split: "50/50" | "40/60" | "60/40" | "33/67" — SOLO si layout_type es "two-col", si no: null
background_color: color hex del fondo (ej: "#ffffff") o "transparent"
has_background_image: true si hay una imagen de fondo CSS o <img> de fondo, false si no
content_summary: resumen en 1-2 líneas del contenido visible de esta sección
images: array de strings con URLs o nombres de archivo de imágenes encontradas (vacío [] si ninguna)
icons: array de strings con nombres de iconos Material Symbols detectados (vacío [] si ninguno)
suggested_padding_v: número entero, uno de 0 / 32 / 48 / 64 / 96
suggested_padding_h: número entero, uno de 0 / 16 / 32 / 64
section_index: número entero 0-based de la posición de esta <section> en el HTML, contando solo las que NO están dentro de <header> ni <footer>. La primera <section> visible es 0, la siguiente es 1, etc.
item_count: número entero de cards/items hijos directos del contenedor grid si layout_type empieza con "grid-" o es "two-col" / "three-col", null si es "single"

IMPORTANTE: description, content_summary y name deben tener máximo 200 caracteres cada uno.
No copies HTML en ningún campo de texto. Las respuestas largas se truncan — mantén el array compacto.

PASO 6 — VERIFICACIÓN FINAL antes de responder:
Cuenta los objetos en tu array. Debe coincidir exactamente con el número de <section> que contaste en el Paso 1.
Si no coincide, corrige antes de responder.

Responde SOLO con el array JSON válido.
Sin texto antes ni después. Sin bloques markdown. Sin \`\`\`json. Sin explicaciones.
El output debe empezar con [ y terminar con ].`

interface SectionForPrompt {
  id: string
  name: string
  layout_type?: string
  col_split?: string | null
  background_color?: string
  has_background_image?: boolean
  content_summary?: string
  images?: string[]
  icons?: string[]
  padding_v?: number
  padding_h?: number
  suggested_padding_v?: number
  suggested_padding_h?: number
  html_snippet?: string
  item_count?: number | null
  flex_direction?: string
  align_items?: string
  justify_content?: string
}

function gridColumnsFromLayout(layoutType: string): string {
  if (layoutType === 'grid-4') return '4'
  if (layoutType === 'grid-3' || layoutType === 'three-col') return '3'
  return '2'
}

export function buildGeneratePrompt(
  section: SectionForPrompt,
  domain: string,
  guideSnippet?: string | null,
): string {
  const isGrid = (section.layout_type ?? '').startsWith('grid-')
  const isTwoCol = section.layout_type === 'two-col'
  const gridCols = isGrid ? gridColumnsFromLayout(section.layout_type ?? '') : null

  const gridRules = isGrid && gridCols ? `
REGLA DE GRID OBLIGATORIA para esta sección (layout_type: "${section.layout_type}"):
El container raíz DEBE tener:
  "container_type": "grid",
  "grid_columns_grid": "repeat(${gridCols}, 1fr)",
  "grid_columns_grid_tablet": "repeat(2, 1fr)",
  "grid_columns_grid_mobile": "repeat(1, 1fr)"
El container raíz DEBE tener EXACTAMENTE ${section.item_count ?? 'N'} elementos hijos (uno por card/item).
Cada hijo es un container con isInner: true que contiene los widgets de esa card.
NO uses flex para esta sección — SOLO grid.
` : ''

  const twoColRules = isTwoCol ? `
REGLA DE 2 COLUMNAS OBLIGATORIA:
Cada hijo container DEBE tener:
  "width": {"unit": "%", "size": ${section.col_split === '40/60' ? 40 : section.col_split === '60/40' ? 60 : section.col_split === '33/67' ? 33 : 50}, "sizes": []},
  "width_tablet": {"unit": "%", "size": 100, "sizes": []}
La segunda columna usa el tamaño complementario (suma 100%).
` : ''

  return `Eres un generador experto de JSON para Elementor Pro v3 con Flexbox Container activo.

REGLAS ABSOLUTAS — NUNCA VIOLAR:
1. NUNCA uses elType "section" o "column" — SOLO "container" y "widget"
2. Containers raíz: isInner: false | Containers hijos: isInner: true
3. IDs únicos de exactamente 8 caracteres alfanuméricos en CADA elemento (ej: "a1b2c3d4")
4. Paddings SIEMPRE con estructura completa:
   {"unit": "px", "top": "64", "right": "32", "bottom": "64", "left": "32", "isLinked": false}
   Los valores son STRINGS dentro del objeto (no números)
5. Widgets: "_padding" para margen externo, "text_padding" para botones
6. Iconos SOLO como HTML inline: <span class="material-symbols-outlined" style="font-size:24px;color:#034d73;">nombre_icono</span>
7. URLs de imágenes: https://${domain}/wp-content/uploads/NOMBRE_ARCHIVO
8. Fondo de imagen: background_background:"classic" + background_image:{url,id:"",size:"",alt,source:"library"} + background_size:"cover" + background_position:"center center"
9. page_settings siempre como {} (objeto), nunca como array
10. NO inventes contenido — usa SOLO el texto, imágenes y links que aparecen en html_snippet

${gridRules}${twoColRules}
${guideSnippet ? `
REFERENCIA REAL — ESTRUCTURA OBLIGATORIA:
El siguiente JSON es una exportación real de Elementor de este mismo sitio.
Copia EXACTAMENTE los mismos nombres de campos, tipos de valores y estructura de anidamiento.
No inventes campos que no aparezcan aquí. Si un campo aparece en esta referencia, úsalo.

${guideSnippet}

FIN DE REFERENCIA REAL
` : ''}
ESTRUCTURA DE UN CONTAINER RAÍZ (sección):
{
  "id": "a1b2c3d4",
  "elType": "container",
  "isInner": false,
  "settings": {
    "content_width": "full",
    "flex_direction": "column",
    "align_items": "center",
    "justify_content": "flex-start",
    "padding": {"unit": "px", "top": "96", "right": "32", "bottom": "96", "left": "32", "isLinked": false},
    "background_background": "classic",
    "background_color": "#0f172a"
  },
  "elements": []
}

ESTRUCTURA DE UN WIDGET HEADING:
{
  "id": "b2c3d4e5",
  "elType": "widget",
  "widgetType": "heading",
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
  "id": "c3d4e5f6",
  "elType": "widget",
  "widgetType": "button",
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
SIN texto adicional, SIN bloques markdown (no uses \`\`\`), SIN explicaciones.
SOLO el array JSON válido que empieza con [ y termina con ].

Sección a generar:
${JSON.stringify(section, null, 2)}

HTML fuente de esta sección (usa ESTE contenido, no inventes):
${section.html_snippet ?? '(sin html_snippet disponible)'}`
}
