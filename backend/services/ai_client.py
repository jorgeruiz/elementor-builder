import os
import json
import base64
import re
from typing import List, Dict, Any, Optional, AsyncGenerator
import anthropic
from dotenv import load_dotenv

load_dotenv()

_async_client: Optional[anthropic.AsyncAnthropic] = None


def get_async_client() -> anthropic.AsyncAnthropic:
    global _async_client
    if _async_client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY no está configurada")
        _async_client = anthropic.AsyncAnthropic(api_key=api_key)
    return _async_client


def _load_prompt(filename: str) -> str:
    prompt_path = os.path.join(os.path.dirname(__file__), "..", "prompts", filename)
    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read()


def _clean_json_response(raw: str) -> str:
    """Elimina bloques markdown y texto extra alrededor del JSON."""
    raw = raw.strip()
    # Remover bloques ```json ... ``` o ``` ... ```
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


async def analyze_design(
    html: str,
    image_bytes: Optional[bytes] = None,
    image_media_type: Optional[str] = "image/png",
    instructions: Optional[str] = None,
    domain: str = "",
) -> List[Dict[str, Any]]:
    client = get_async_client()
    prompt_template = _load_prompt("analyze_prompt.txt")

    user_content: List[Dict] = []

    if image_bytes:
        b64 = base64.standard_b64encode(image_bytes).decode("utf-8")
        user_content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": image_media_type,
                "data": b64,
            },
        })

    text_parts = [prompt_template]
    text_parts.append(f"\nDominio: {domain}")
    if instructions:
        text_parts.append(f"\nInstrucciones adicionales: {instructions}")
    text_parts.append(f"\n\nHTML completo:\n{html}")

    user_content.append({"type": "text", "text": "\n".join(text_parts)})

    response = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=8192,
        messages=[{"role": "user", "content": user_content}],
    )

    raw = _clean_json_response(response.content[0].text)
    sections = json.loads(raw)
    return sections


async def generate_section_json(
    section_config: Dict[str, Any],
    html: str,
    domain: str,
) -> AsyncGenerator[str, None]:
    client = get_async_client()
    prompt_template = _load_prompt("generate_prompt.txt")

    prompt = prompt_template.format(
        section_config=json.dumps(section_config, ensure_ascii=False, indent=2),
        domain=domain,
        section_html=html[:8000],
    )

    async with client.messages.stream(
        model="claude-opus-4-6",
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        async for text in stream.text_stream:
            yield text
