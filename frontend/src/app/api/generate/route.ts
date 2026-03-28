import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { mkdirSync, writeFileSync } from 'fs'
import { buildGeneratePrompt } from '@/lib/server/prompts'
import { buildPageWrapper } from '@/lib/server/elementorBuilder'
import { validateElementorJson } from '@/lib/server/jsonValidator'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const OUTPUT_DIR = '/tmp/elementor_output'

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

interface SectionConfig {
  id: string
  name: string
  description?: string
  layout_type?: string
  col_split?: string
  background_color?: string
  has_background_image?: boolean
  content_summary?: string
  images?: string[]
  icons?: string[]
  suggested_padding_v?: number
  suggested_padding_h?: number
  flex_direction?: string
  align_items?: string
  justify_content?: string
  padding_v?: number
  padding_h?: number
}

interface GenerateRequest {
  sections: SectionConfig[]
  html: string
  domain: string
  title?: string
}

export async function POST(req: NextRequest): Promise<Response> {
  const encoder = new TextEncoder()
  let body: GenerateRequest

  try {
    body = (await req.json()) as GenerateRequest
  } catch {
    return new Response('{"error":"JSON inválido"}', { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const allElements: unknown[] = []
      const client = getClient()

      for (const section of body.sections) {
        // Padding efectivo
        const paddingV = section.padding_v ?? section.suggested_padding_v ?? 64
        const paddingH = section.padding_h ?? section.suggested_padding_h ?? 32
        const sectionConfig = { ...section, padding_v: paddingV, padding_h: paddingH }

        send({ type: 'section_start', section_id: section.id, section_name: section.name })

        const chunks: string[] = []

        try {
          const prompt = buildGeneratePrompt(sectionConfig, body.domain, body.html)
          const anthropicStream = client.messages.stream({
            model: 'claude-opus-4-6',
            max_tokens: 8192,
            messages: [{ role: 'user', content: prompt }],
          })

          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const text = event.delta.text
              chunks.push(text)
              send({ type: 'chunk', content: text })
            }
          }
        } catch (e: unknown) {
          send({ type: 'error', section_id: section.id, message: String(e) })
          continue
        }

        const rawJson = cleanJson(chunks.join(''))
        try {
          const elements = JSON.parse(rawJson)
          if (Array.isArray(elements)) allElements.push(...elements)
          else allElements.push(elements)
        } catch (e: unknown) {
          send({
            type: 'error',
            section_id: section.id,
            message: `JSON inválido: ${String(e)}`,
            raw: rawJson.slice(0, 200),
          })
        }

        send({ type: 'section_done', section_id: section.id })
      }

      // Construir y guardar el JSON final
      const pageJson = buildPageWrapper(body.title ?? `Página – ${body.domain}`, allElements)
      const validation = validateElementorJson(pageJson as Record<string, unknown>)

      const filename = `page-${Date.now()}.json`
      try {
        mkdirSync(OUTPUT_DIR, { recursive: true })
        writeFileSync(`${OUTPUT_DIR}/${filename}`, JSON.stringify(pageJson, null, 2))
      } catch (e) {
        console.error('[generate] Error guardando archivo:', e)
      }

      send({
        type: 'complete',
        download_url: `/api/download/${filename}`,
        validation,
      })

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
