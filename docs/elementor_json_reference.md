# Referencia JSON Elementor Pro v3

Guía de referencia rápida para generar JSON compatible con Elementor Pro v3 con Flexbox Container activo.

---

## Estructura raíz del archivo

```json
{
  "title": "Nombre de la página",
  "type": "page",
  "version": "0.4",
  "page_settings": {},
  "content": [ ...containers raíz... ]
}
```

> ⚠️ `page_settings` debe ser `{}` (objeto vacío), NUNCA `[]`.

---

## Container raíz (sección)

```json
{
  "id": "a1b2c3d4",
  "elType": "container",
  "isInner": false,
  "settings": {
    "content_width": "full",
    "flex_direction": "column",
    "align_items": "center",
    "justify_content": "flex-start",
    "padding": {
      "unit": "px",
      "top": "96", "right": "32", "bottom": "96", "left": "32",
      "isLinked": false
    },
    "background_background": "classic",
    "background_color": "#ffffff"
  },
  "elements": []
}
```

## Container hijo (columna interna)

```json
{
  "id": "e5f6g7h8",
  "elType": "container",
  "isInner": true,
  "settings": {
    "width": {"unit": "%", "size": 50, "sizes": []},
    "width_tablet": {"unit": "%", "size": 100, "sizes": []},
    "flex_direction": "column",
    "align_items": "flex-start",
    "padding": {
      "unit": "px", "top": "0", "right": "16", "bottom": "0", "left": "16",
      "isLinked": false
    }
  },
  "elements": []
}
```

---

## Widgets comunes

### Heading

```json
{
  "id": "i9j0k1l2",
  "elType": "widget",
  "widgetType": "heading",
  "settings": {
    "title": "Texto del título",
    "header_size": "h1",
    "title_color": "#0f172a",
    "typography_typography": "custom",
    "typography_font_size": {"unit": "px", "size": 48, "sizes": []},
    "typography_font_weight": "700",
    "typography_line_height": {"unit": "em", "size": 1.2, "sizes": []},
    "_padding": {"unit": "px", "top": "0", "right": "0", "bottom": "16", "left": "0", "isLinked": false}
  },
  "elements": []
}
```

### Text Editor

```json
{
  "id": "m3n4o5p6",
  "elType": "widget",
  "widgetType": "text-editor",
  "settings": {
    "editor": "<p>Contenido del párrafo aquí.</p>",
    "text_color": "#64748b",
    "typography_typography": "custom",
    "typography_font_size": {"unit": "px", "size": 16, "sizes": []},
    "_padding": {"unit": "px", "top": "0", "right": "0", "bottom": "24", "left": "0", "isLinked": false}
  },
  "elements": []
}
```

### Button

```json
{
  "id": "q7r8s9t0",
  "elType": "widget",
  "widgetType": "button",
  "settings": {
    "text": "Llamada a la acción",
    "link": {"url": "#", "is_external": false, "nofollow": false},
    "align": "center",
    "background_color": "#0085ca",
    "button_text_color": "#ffffff",
    "border_radius": {"unit": "px", "top": 8, "right": 8, "bottom": 8, "left": 8, "isLinked": true},
    "text_padding": {
      "unit": "px", "top": "14", "right": "28", "bottom": "14", "left": "28",
      "isLinked": false
    },
    "_padding": {"unit": "px", "top": "8", "right": "0", "bottom": "8", "left": "0", "isLinked": false}
  },
  "elements": []
}
```

### Image

```json
{
  "id": "u1v2w3x4",
  "elType": "widget",
  "widgetType": "image",
  "settings": {
    "image": {
      "url": "https://dominio.com/wp-content/uploads/imagen.jpg",
      "id": "", "size": "", "alt": "Descripción de la imagen", "source": "library"
    },
    "image_size": "full",
    "align": "center",
    "_padding": {"unit": "px", "top": "0", "right": "0", "bottom": "16", "left": "0", "isLinked": false}
  },
  "elements": []
}
```

### HTML (para iconos Material Symbols)

```json
{
  "id": "y5z6a7b8",
  "elType": "widget",
  "widgetType": "html",
  "settings": {
    "html": "<span class=\"material-symbols-outlined\" style=\"font-size:48px;color:#034d73;\">star</span>",
    "_padding": {"unit": "px", "top": "0", "right": "0", "bottom": "8", "left": "0", "isLinked": false}
  },
  "elements": []
}
```

---

## Fondos especiales

### Fondo de color sólido
```json
"background_background": "classic",
"background_color": "#034d73"
```

### Fondo con imagen
```json
"background_background": "classic",
"background_image": {
  "url": "https://dominio.com/wp-content/uploads/fondo.jpg",
  "id": "", "size": "", "alt": "", "source": "library"
},
"background_size": "cover",
"background_position": "center center",
"background_repeat": "no-repeat"
```

### Overlay sobre imagen de fondo
```json
"background_overlay_background": "classic",
"background_overlay_color": "rgba(15,23,42,0.65)"
```

### Gradiente
```json
"background_background": "gradient",
"background_color": "#034d73",
"background_color_b": "#0085ca",
"background_gradient_angle": {"unit": "deg", "size": 135, "sizes": []}
```

---

## Layouts

### Grid de 3 columnas

```json
{
  "id": "c9d0e1f2",
  "elType": "container",
  "isInner": false,
  "settings": {
    "container_type": "grid",
    "grid_columns_grid": "repeat(3, 1fr)",
    "grid_columns_grid_tablet": "repeat(2, 1fr)",
    "grid_columns_grid_mobile": "repeat(1, 1fr)",
    "gap": {"unit": "px", "size": 24, "sizes": []},
    "padding": {"unit": "px", "top": "64", "right": "32", "bottom": "64", "left": "32", "isLinked": false}
  },
  "elements": []
}
```

### Grid de 2 columnas

```json
"grid_columns_grid": "repeat(2, 1fr)",
"grid_columns_grid_tablet": "repeat(1, 1fr)",
"grid_columns_grid_mobile": "repeat(1, 1fr)"
```

---

## Reglas de IDs

- Exactamente **8 caracteres** alfanuméricos (a-z, 0-9)
- Únicos en todo el documento
- Ejemplos válidos: `"a1b2c3d4"`, `"f8e7d6c5"`, `"12345678"`

---

## Checklist de validación

Antes de importar en Elementor, verificar:

- [ ] `page_settings` es `{}` (no `[]`)
- [ ] Ningún `elType` es `"section"` o `"column"`
- [ ] Todos los elementos tienen `"id"` de 8 caracteres
- [ ] Containers raíz tienen `"isInner": false`
- [ ] Containers hijos tienen `"isInner": true`
- [ ] En layouts de 2 cols: cada hijo tiene `"width"` con `size: 50`
- [ ] Todos los paddings tienen la estructura completa `{unit, top, right, bottom, left, isLinked}`
- [ ] Todos los widgets tienen `"elements": []`
- [ ] URLs de imágenes en formato `https://dominio.com/wp-content/uploads/...`
