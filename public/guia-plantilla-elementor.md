# Plantilla base universal para Elementor JSON

## Qué aprendí de los 3 ejemplos
- Los tres archivos usan la misma raíz: `content`, `page_settings`, `version`, `title`, `type`.
- El núcleo del layout está hecho con `container` y widgets simples de Elementor.
- Los widgets más repetidos y seguros para reutilizar fueron:
  - `heading`
  - `text-editor`
  - `button`
  - `image`
  - `icon-box`
  - `icon-list`
  - `image-carousel`
  - `testimonial`
- La estructura más estable para una landing/page comercial fue:
  1. Hero
  2. Problema / contexto
  3. Beneficios
  4. Servicios o productos
  5. Prueba social
  6. Galería
  7. CTA final

## Criterio de la plantilla
Esta plantilla está diseñada para que otro agente pueda:
1. leer un HTML o mockup,
2. mapear cada bloque visual a una sección de Elementor,
3. reemplazar placeholders `__...__`,
4. importar el JSON en Elementor,
5. ajustar sólo detalles finos dentro de WordPress.

## Reglas de adaptación HTML -> Elementor JSON
### 1) Mapear por bloques, no por etiquetas sueltas
No conviertas literalmente cada `<div>`.
Primero detecta secciones visuales:
- hero
- beneficios
- cards
- testimonios
- galería
- CTA

### 2) Usar esta traducción base
- `h1/h2/h3` -> `heading`
- `p`, texto descriptivo -> `text-editor`
- `a.btn`, CTA -> `button`
- `img` -> `image`
- lista con checks -> `icon-list`
- feature con icono + título + texto -> `icon-box`
- slider/carrusel -> `image-carousel`
- reseñas -> `testimonial`
- wrapper/fila/columna/grid -> `container`

### 3) Mantener compatibilidad
Evita depender de widgets raros o addons si no son indispensables.
Mientras más estándar sea el JSON, más fácil será importarlo en otros sitios.

### 4) Reemplazar placeholders clave
- Branding:
  - `__COLOR_PRIMARIO__`
  - `__COLOR_SECUNDARIO__`
  - `__COLOR_OSCURO__`
  - `__COLOR_CLARO__`
  - `__FUENTE_TITULOS__`
  - `__FUENTE_CUERPO__`
- Contenido:
  - títulos
  - párrafos
  - CTAs
  - URLs
  - imágenes
  - testimonios
- Assets:
  - `__HERO_BG_URL__`
  - `__HERO_IMAGE_URL__`
  - `__CARD_1_IMG__`, etc.

### 5) Si el HTML tiene más bloques
Duplica el patrón de la sección más cercana:
- más servicios -> duplica cards
- más testimonios -> duplica testimonial
- más beneficios -> duplica icon-box
- más sliders -> duplica carrusel o crea otra sección

### 6) Si el HTML tiene menos bloques
Elimina la sección completa del arreglo `content`.
No dejes secciones vacías con placeholders sin usar.

## Flujo recomendado para cualquier agente
1. Identificar estructura del diseño fuente.
2. Clasificar cada bloque en una categoría.
3. Tomar esta plantilla como base.
4. Reemplazar placeholders.
5. Duplicar o eliminar secciones según el diseño.
6. Validar JSON.
7. Importar a Elementor y revisar responsive.

## Validaciones mínimas antes de importar
- JSON válido
- raíz con:
  - `content`
  - `page_settings`
  - `version`
  - `title`
  - `type`
- cada elemento debe tener:
  - `id`
  - `settings`
  - `elements`
  - `elType`
- cada widget además debe tener:
  - `widgetType`

## Nota importante
Los IDs de Elementor aquí son genéricos y funcionales como base, pero al importar pueden regenerarse o ajustarse según el entorno.
La plantilla busca ser una base universal, no una copia exacta de un sitio final.
