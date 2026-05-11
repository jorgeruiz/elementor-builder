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

// Devuelve el cheerio instance y el array de <section> de contenido (excluye header/footer/fixed)
function getSectionElements(html: string) {
  const $ = cheerioLoad(html)
  const els = $('body > section, main > section')
    .not('header section, footer section')
    .toArray()
    .filter((el) => {
      const cls = ($(el as Parameters<typeof $>[0]).attr('class') ?? '').split(' ')
      return !cls.includes('fixed') && !cls.includes('sticky')
    })
  return { $, els }
}

// Inyecta html_snippet server-side usando section_index que Claude devuelve
function injectHtmlSnippets(
  sections: Record<string, unknown>[],
  $: ReturnType<typeof cheerioLoad>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  els: any[],
) {
  for (const section of sections) {
    const idx = section.section_index
    if (typeof idx === 'number' && els[idx]) {
      section.html_snippet = $.html(els[idx])
    } else {
      console.warn('[analyze] section_index inválido:', idx, 'de', els.length)
    }
  }
}

async function callClaude(
  client: Anthropic,
  userContent: Anthropic.MessageParam['content'],
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 16000,
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

    const { $, els: sectionEls } = getSectionElements(html)
    const realSectionCount = sectionEls.length
    const parsed = parseHtmlSections(html)
    const client = getClient()

    // Construir primer mensaje
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

    const raw = cleanJson(await callClaude(client, firstContent))

    let sections: Record<string, unknown>[]
    try {
      sections = JSON.parse(raw)
    } catch (parseErr) {
      console.error(
        '[analyze] JSON.parse falló — length:', raw.length,
        '— tail:', raw.slice(-200),
        '— err:', parseErr,
      )
      return NextResponse.json(
        { error: `Respuesta de Claude truncada o inválida (${raw.length} chars). Intenta con un HTML más corto o sin imagen.` },
        { status: 500 },
      )
    }

    // Inyectar html_snippet server-side
    injectHtmlSnippets(sections, $, sectionEls)

    // Retry si Claude devolvió menos secciones de las esperadas
    if (
      realSectionCount > 0 &&
      Array.isArray(sections) &&
      sections.length < realSectionCount
    ) {
      const retryInstruction = `ATENCIÓN: El HTML tiene EXACTAMENTE ${realSectionCount} etiquetas <section> de contenido. Tu respuesta anterior devolvió ${sections.length} secciones — faltan ${realSectionCount - sections.length}. Busca las secciones faltantes (especialmente grids, listas de cards, o secciones con fondo similar a otra). Devuelve EXACTAMENTE ${realSectionCount} elementos en el array.`

      const retryContent: Anthropic.MessageParam['content'] = []
      const retryParts = [ANALYZE_PROMPT, `\n\n${retryInstruction}`]
      if (realSectionCount > 0) {
        retryParts.push(`\n\nCONTEO VERIFICADO: El HTML tiene ${realSectionCount} etiquetas <section>.`)
      }
      retryParts.push(`\nDominio: ${domain}`)
      if (instructions) retryParts.push(`\nInstrucciones adicionales: ${instructions}`)
      retryParts.push(`\n\nHTML completo:\n${html}`)
      retryContent.push({ type: 'text', text: retryParts.join('') })

      const retryRaw = cleanJson(await callClaude(client, retryContent))
      try {
        const retrySections = JSON.parse(retryRaw) as Record<string, unknown>[]
        if (Array.isArray(retrySections) && retrySections.length > sections.length) {
          injectHtmlSnippets(retrySections, $, sectionEls)
          sections = retrySections
        }
      } catch (retryErr) {
        console.warn('[analyze] retry JSON.parse falló — length:', retryRaw.length, '— err:', retryErr)
        // usar resultado original con html_snippet ya inyectado
      }
    }

    const allImages: string[] = []
    for (const s of sections) allImages.push(...((s.images as string[]) ?? []))
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
