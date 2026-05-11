import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { load as cheerioLoad } from 'cheerio'
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

function countRealSections(html: string): number {
  const $ = cheerioLoad(html)
  return $('body > section, main > section')
    .not('header section, footer section')
    .filter((_: number, el: ReturnType<typeof $>[number]) => {
      const classes = ($(el).attr('class') ?? '').split(' ')
      return !classes.includes('fixed') && !classes.includes('sticky')
    })
    .length
}

async function callClaude(
  client: Anthropic,
  userContent: Anthropic.MessageParam['content'],
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 8192,
    messages: [{ role: 'user', content: userContent }],
  })
  return response.content[0].type === 'text' ? response.content[0].text : ''
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

    // Contar secciones reales con cheerio antes de llamar a Claude
    const realSectionCount = countRealSections(html)
    const parsed = parseHtmlSections(html)

    // Construir mensaje base
    const buildContent = (extraInstruction?: string): Anthropic.MessageParam['content'] => {
      const content: Anthropic.MessageParam['content'] = []

      if (imageFile && imageFile.size > 0) {
        // Imagen añadida de forma síncrona — se procesa antes de llamar
      }

      const textParts: string[] = [ANALYZE_PROMPT]
      if (extraInstruction) textParts.push(`\n\n${extraInstruction}`)
      textParts.push(`\nDominio: ${domain}`)
      if (instructions) textParts.push(`\nInstrucciones adicionales: ${instructions}`)
      if (realSectionCount > 0) {
        textParts.push(`\nCONTEO VERIFICADO: El HTML tiene ${realSectionCount} etiquetas <section> de contenido. El array resultado DEBE tener exactamente ${realSectionCount} elementos.`)
      }
      textParts.push(
        `\nSecciones pre-detectadas por parser (${parsed.length}):\n${JSON.stringify(
          parsed.map((s) => ({ idHint: s.idHint, tag: s.tag, layout: s.layoutHint })),
          null,
          2,
        )}`,
      )
      textParts.push(`\n\nHTML completo:\n${html}`)
      content.push({ type: 'text', text: textParts.join('') })
      return content
    }

    const client = getClient()

    // Primera llamada — construir content con imagen si existe
    const firstContent: Anthropic.MessageParam['content'] = []
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const base64 = buffer.toString('base64')
      const mediaType = (imageFile.type || 'image/png') as
        | 'image/jpeg'
        | 'image/png'
        | 'image/gif'
        | 'image/webp'
      firstContent.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: base64 },
      })
    }

    const textParts: string[] = [ANALYZE_PROMPT]
    if (realSectionCount > 0) {
      textParts.push(`\n\nCONTEO VERIFICADO: El HTML tiene ${realSectionCount} etiquetas <section> de contenido. El array resultado DEBE tener exactamente ${realSectionCount} elementos.`)
    }
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
    firstContent.push({ type: 'text', text: textParts.join('') })

    let raw = cleanJson(await callClaude(client, firstContent))
    let sections = JSON.parse(raw)

    // Retry si Claude devolvió menos secciones de las esperadas
    if (
      realSectionCount > 0 &&
      Array.isArray(sections) &&
      sections.length < realSectionCount
    ) {
      const retryInstruction = `ATENCIÓN: El HTML tiene EXACTAMENTE ${realSectionCount} etiquetas <section> de contenido. Tu respuesta anterior devolvió ${sections.length} secciones — faltan ${realSectionCount - sections.length}. Busca las secciones faltantes (especialmente grids, listas de cards, o secciones con fondo similar a otra). Devuelve EXACTAMENTE ${realSectionCount} elementos en el array.`

      const retryContent = buildContent(retryInstruction)
      const retryRaw = cleanJson(await callClaude(client, retryContent))
      try {
        const retrySections = JSON.parse(retryRaw)
        if (Array.isArray(retrySections) && retrySections.length > sections.length) {
          sections = retrySections
        }
      } catch {
        // retry falló — usar resultado original
      }
    }

    const allImages: string[] = []
    for (const s of sections) allImages.push(...(s.images ?? []))
    const uniqueImages = Array.from(new Set(allImages))

    const incomplete =
      realSectionCount > 0 &&
      Array.isArray(sections) &&
      sections.length < realSectionCount

    return NextResponse.json({
      sections,
      total_images: uniqueImages,
      domain,
      ...(incomplete && {
        incomplete: true,
        expected: realSectionCount,
        found: sections.length,
      }),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[analyze]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
