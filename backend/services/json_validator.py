from typing import Dict, Any, List


def validate_elementor_json(data: Dict[str, Any]) -> Dict[str, Any]:
    errors = []

    def check(elements: List[Dict], path: str = ""):
        for i, el in enumerate(elements):
            current_path = f"{path}[{i}]"

            el_type = el.get("elType")
            if el_type in ("section", "column"):
                errors.append(f"Legacy elType '{el_type}' en {current_path}")

            if not el.get("id"):
                errors.append(f"Falta 'id' en {current_path}")

            if el_type == "container":
                settings = el.get("settings", {})
                if el.get("isInner") is None:
                    errors.append(f"Falta 'isInner' en container {current_path}")

            check(el.get("elements", []), current_path)

    if not isinstance(data.get("content"), list):
        errors.append("'content' debe ser un array")
    else:
        check(data["content"])

    required_keys = ["title", "type", "version", "page_settings", "content"]
    for key in required_keys:
        if key not in data:
            errors.append(f"Falta clave raíz '{key}'")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "error_count": len(errors),
    }
