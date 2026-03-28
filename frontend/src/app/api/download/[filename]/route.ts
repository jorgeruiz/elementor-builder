import { NextRequest } from 'next/server'
import { existsSync, readFileSync } from 'fs'

export const dynamic = 'force-dynamic'

const OUTPUT_DIR = '/tmp/elementor_output'

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } },
): Promise<Response> {
  // Sanitizar nombre para evitar path traversal
  const safeName = params.filename.replace(/[^a-zA-Z0-9\-_.]/g, '')
  const filepath = `${OUTPUT_DIR}/${safeName}`

  if (!existsSync(filepath)) {
    return new Response('Archivo no encontrado', { status: 404 })
  }

  const content = readFileSync(filepath)
  return new Response(content, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${safeName}"`,
    },
  })
}
