import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { parseHtmlSections } from '@/lib/server/htmlParser'
import { ANALYZE_PROMPT } from '@/lib/server/prompts'

export const dynamic = 'force-dynamic'

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurada en el servidor')
  return new Anthropic({ apiKey })
}

function cleanJson(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim()
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData()
    const htmlFile = formData.get('html_file') as File | null
    const imageFile = formData.get('image_file') as File | null
    const instructions = formData.get('instructions') as string | null
    const domain = formData.get('domain') as string | null

    if (!htmlFile) {
      return NextResponse.json({ error: 'html_file es requerido' }, { status: 400 })
    }
    if (!domain) {
      return NextResponse.json({ error: 'domain es requerido' }, { status: 400 })
    }

    const html = await htmlFile.text()
    if (!html.trim()) {
      return NextResponse.json({ error: 'El archivo HTML está vacío' }, { status: 400 })
    }

    // Parsear HTML con cheerio para dar contexto al prompt
    const parsed = parseHtmlSections(html)

    // Construir mensaje para Claude
    const userContent: Anthropic.MessageParam['content'] = []

    // Imagen opcional
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const base64 = buffer.toString('base64')
      const mediaType = (imageFile.type || 'image/png') as
        | 'image/jpeg'
        | 'image/png'
        | 'image/gif'
        | 'image/webp'
      userContent.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: base64 },
      })
    }

    const textParts: string[] = [ANALYZE_PROMPT]
    textParts.push(`\nDominio: ${domain}`)
    if (instructions) textParts.push(`\nInstrucciones adicionales: ${instructions}`)
    textParts.push(
      `\nSecciones pre-detectadas por parser (${parsed.length}):\n${JSON.stringify(
        parsed.map((s) => ({ idHint: s.idHint, tag: s.tag, layout: s.layoutHint })),
        null,
        2,
      )}`,
    )
    textParts.push(`\n\nHTML completo:\n${html}`)
    userContent.push({ type: 'text', text: textParts.join('') })

    const client = getClient()
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 8192,
      messages: [{ role: 'user', content: userContent }],
    })

    const raw = cleanJson(response.content[0].type === 'text' ? response.content[0].text : '')
    const sections = JSON.parse(raw)

    const allImages: string[] = []
    for (const s of sections) allImages.push(...(s.images ?? []))
    const uniqueImages = Array.from(new Set(allImages))

    return NextResponse.json({ sections, total_images: uniqueImages, domain })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[analyze]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
