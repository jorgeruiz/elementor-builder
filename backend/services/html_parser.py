from bs4 import BeautifulSoup
from typing import List, Dict, Any


def parse_html_sections(html: str) -> List[Dict[str, Any]]:
    """
    Extrae secciones estructurales del HTML usando BeautifulSoup.
    Retorna una lista con metadata básica de cada sección detectada.
    """
    soup = BeautifulSoup(html, "html.parser")
    sections = []

    # Busca elementos candidatos a sección
    candidates = soup.find_all(
        ["section", "div", "header", "footer", "main", "article", "nav"],
        recursive=False,
    )

    # Si el body tiene hijos directos, usarlos
    body = soup.find("body")
    if body:
        candidates = list(body.children)
        candidates = [c for c in candidates if hasattr(c, "name") and c.name]

    # Filtrar solo elementos con suficiente contenido
    meaningful = []
    for el in candidates:
        text = el.get_text(strip=True)
        if len(text) > 20 or el.find(["img", "video", "picture"]):
            meaningful.append(el)

    for i, el in enumerate(meaningful):
        # Detectar imágenes
        imgs = [
            img.get("src", "") or img.get("data-src", "")
            for img in el.find_all("img")
            if img.get("src") or img.get("data-src")
        ]

        # Detectar clases de fondo
        classes = " ".join(el.get("class", []))
        style = el.get("style", "")
        has_bg_image = "background" in style.lower() and "url(" in style.lower()

        # Extraer color de fondo del style inline
        bg_color = "#ffffff"
        if "background-color" in style:
            import re
            match = re.search(r"background-color:\s*([^;]+)", style)
            if match:
                bg_color = match.group(1).strip()

        # Estimar padding
        padding_v = 64
        padding_h = 32
        if "py-" in classes or "pt-" in classes or "pb-" in classes:
            padding_v = 96
        if "px-" in classes or "pl-" in classes or "pr-" in classes:
            padding_h = 32

        # Determinar layout probable
        layout = "single"
        grid_classes = [c for c in el.get("class", []) if "grid" in c.lower()]
        flex_classes = [c for c in el.get("class", []) if "flex" in c.lower()]
        col_divs = el.find_all(attrs={"class": lambda x: x and any(
            "col" in c or "column" in c for c in x
        )}) if el.get("class") else []

        if grid_classes:
            layout = "grid-2"
        elif len(col_divs) >= 2:
            layout = "two-col"
        elif flex_classes:
            layout = "single"

        tag_name = el.name or "div"
        section_id = f"{tag_name}_{i}"
        if el.get("id"):
            section_id = el.get("id")
        elif el.get("class"):
            section_id = el.get("class")[0].replace("-", "_").lower()

        sections.append({
            "index": i,
            "tag": tag_name,
            "id_hint": section_id,
            "text_preview": el.get_text(strip=True)[:200],
            "images": [img for img in imgs if img],
            "has_background_image": has_bg_image,
            "background_color": bg_color,
            "layout_hint": layout,
            "suggested_padding_v": padding_v,
            "suggested_padding_h": padding_h,
            "html_snippet": str(el)[:500],
        })

    return sections
