from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import json
from services.ai_client import analyze_design

router = APIRouter()


@router.post("")
async def analyze(
    html_file: UploadFile = File(...),
    image_file: Optional[UploadFile] = File(None),
    instructions: Optional[str] = Form(None),
    domain: str = Form(...),
):
    html_content = (await html_file.read()).decode("utf-8", errors="replace")
    if not html_content.strip():
        raise HTTPException(status_code=400, detail="El archivo HTML está vacío")

    image_bytes = None
    image_media_type = None
    if image_file and image_file.filename:
        image_bytes = await image_file.read()
        image_media_type = image_file.content_type or "image/png"

    try:
        sections = await analyze_design(
            html=html_content,
            image_bytes=image_bytes,
            image_media_type=image_media_type,
            instructions=instructions,
            domain=domain,
        )
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=502,
            detail=f"La IA retornó una respuesta que no es JSON válido: {str(e)}",
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Error al comunicarse con la IA: {str(e)}",
        )

    all_images: list[str] = []
    for section in sections:
        all_images.extend(section.get("images", []))
    unique_images = list(dict.fromkeys(all_images))

    return {
        "sections": sections,
        "total_images": unique_images,
        "domain": domain,
    }
