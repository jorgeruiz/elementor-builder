import uuid
from typing import List, Dict, Any


def new_id() -> str:
    return uuid.uuid4().hex[:8]


def make_padding(top: int = 0, right: int = 0, bottom: int = 0, left: int = 0) -> Dict:
    return {
        "unit": "px",
        "top": str(top),
        "right": str(right),
        "bottom": str(bottom),
        "left": str(left),
        "isLinked": False,
    }


def make_size(unit: str = "px", size: float = 0) -> Dict:
    return {"unit": unit, "size": size, "sizes": []}


def make_container(
    is_inner: bool = False,
    flex_direction: str = "column",
    align_items: str = "center",
    justify_content: str = "flex-start",
    padding_v: int = 64,
    padding_h: int = 32,
    background_color: str = "",
    width_pct: float = 100,
    container_type: str = "flexbox",
    extra_settings: Dict = None,
) -> Dict:
    element_id = new_id()
    settings = {
        "content_width": "full",
        "flex_direction": flex_direction,
        "flex_wrap": "nowrap",
        "align_items": align_items,
        "justify_content": justify_content,
        "padding": make_padding(padding_v, padding_h, padding_v, padding_h),
    }

    if background_color and background_color not in ("transparent", ""):
        settings["background_background"] = "classic"
        settings["background_color"] = background_color

    if is_inner and width_pct != 100:
        settings["width"] = make_size("%", width_pct)
        settings["width_tablet"] = make_size("%", 100)

    if container_type == "grid":
        settings["container_type"] = "grid"
    else:
        settings["container_type"] = "flexbox"

    if extra_settings:
        settings.update(extra_settings)

    return {
        "id": element_id,
        "elType": "container",
        "isInner": is_inner,
        "settings": settings,
        "elements": [],
    }


def make_heading_widget(
    text: str,
    tag: str = "h2",
    color: str = "#0f172a",
    font_size: int = 36,
    font_weight: str = "700",
) -> Dict:
    return {
        "id": new_id(),
        "elType": "widget",
        "widgetType": "heading",
        "isInner": False,
        "settings": {
            "title": text,
            "header_size": tag,
            "title_color": color,
            "typography_typography": "custom",
            "typography_font_size": make_size("px", font_size),
            "typography_font_weight": font_weight,
            "_padding": make_padding(0, 0, 16, 0),
        },
        "elements": [],
    }


def make_text_widget(text: str, color: str = "#64748b") -> Dict:
    return {
        "id": new_id(),
        "elType": "widget",
        "widgetType": "text-editor",
        "isInner": False,
        "settings": {
            "editor": f"<p>{text}</p>",
            "text_color": color,
            "_padding": make_padding(0, 0, 16, 0),
        },
        "elements": [],
    }


def make_button_widget(
    text: str,
    url: str = "#",
    bg_color: str = "#0085ca",
    text_color: str = "#ffffff",
) -> Dict:
    return {
        "id": new_id(),
        "elType": "widget",
        "widgetType": "button",
        "isInner": False,
        "settings": {
            "text": text,
            "link": {"url": url, "is_external": False, "nofollow": False},
            "background_color": bg_color,
            "button_text_color": text_color,
            "text_padding": make_padding(14, 28, 14, 28),
            "_padding": make_padding(8, 0, 8, 0),
        },
        "elements": [],
    }


def make_image_widget(url: str, alt: str = "", domain: str = "") -> Dict:
    if not url.startswith("http") and domain:
        url = f"https://{domain}/wp-content/uploads/{url}"
    return {
        "id": new_id(),
        "elType": "widget",
        "widgetType": "image",
        "isInner": False,
        "settings": {
            "image": {
                "url": url,
                "id": "",
                "size": "",
                "alt": alt,
                "source": "library",
            },
            "_padding": make_padding(0, 0, 16, 0),
        },
        "elements": [],
    }


def build_page_wrapper(title: str, content: List[Dict]) -> Dict:
    return {
        "title": title,
        "type": "page",
        "version": "0.4",
        "page_settings": [],
        "content": content,
    }
