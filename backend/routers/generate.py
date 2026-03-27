import json
import os
import re
import uuid
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from services.ai_client import generate_section_json
from services.elementor_builder import build_page_wrapper
from services.json_validator import validate_elementor_json

router = APIRouter()
download_router = APIRouter()

OUTPUT_DIR = "/tmp/elementor_output"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def _clean_json(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


class SectionConfig(BaseModel):
    id: str
    name: str
    description: str = ""
    layout_type: str = "single"
    col_split: str = "50/50"
    background_color: str = "#ffffff"
    has_background_image: bool = False
    content_summary: str = ""
    images: List[str] = []
    icons: List[str] = []
    suggested_padding_v: int = 64
    suggested_padding_h: int = 32
    # overrides del paso 3
    flex_direction: str = "column"
    align_items: str = "center"
    justify_content: str = "flex-start"
    padding_v: Optional[int] = None
    padding_h: Optional[int] = None

    def effective_padding_v(self) -> int:
        return self.padding_v if self.padding_v is not None else self.suggested_padding_v

    def effective_padding_h(self) -> int:
        return self.padding_h if self.padding_h is not None else self.suggested_padding_h


class GenerateRequest(BaseModel):
    sections: List[SectionConfig]
    html: str
    domain: str
    title: str = "Página generada"


@router.post("")
async def generate(request: GenerateRequest):
    session_id = uuid.uuid4().hex[:8]
    filename = f"page-{session_id}.json"
    filepath = os.path.join(OUTPUT_DIR, filename)

    async def event_stream():
        all_elements = []

        for section in request.sections:
            # Construir config enriquecida con paddings efectivos
            section_dict = section.model_dump()
            section_dict["padding_v"] = section.effective_padding_v()
            section_dict["padding_h"] = section.effective_padding_h()

            yield f'data: {json.dumps({"type": "section_start", "section_id": section.id, "section_name": section.name})}\n\n'

            chunks: List[str] = []
            try:
                async for chunk in generate_section_json(
                    section_config=section_dict,
                    html=request.html,
                    domain=request.domain,
                ):
                    chunks.append(chunk)
                    yield f'data: {json.dumps({"type": "chunk", "content": chunk})}\n\n'
            except Exception as e:
                yield f'data: {json.dumps({"type": "error", "section_id": section.id, "message": str(e)})}\n\n'
                continue

            raw_json = _clean_json("".join(chunks))
            try:
                section_elements = json.loads(raw_json)
                if isinstance(section_elements, list):
                    all_elements.extend(section_elements)
                elif isinstance(section_elements, dict):
                    all_elements.append(section_elements)
            except json.JSONDecodeError as e:
                yield f'data: {json.dumps({"type": "error", "section_id": section.id, "message": f"JSON inválido: {str(e)}", "raw": raw_json[:200]})}\n\n'

            yield f'data: {json.dumps({"type": "section_done", "section_id": section.id})}\n\n'

        page_json = build_page_wrapper(title=request.title, content=all_elements)
        validation = validate_elementor_json(page_json)

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(page_json, f, ensure_ascii=False, indent=2)

        yield f'data: {json.dumps({"type": "complete", "download_url": f"/download/{filename}", "validation": validation})}\n\n'

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@download_router.get("/download/{filename}")
async def download(filename: str):
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/json",
    )
