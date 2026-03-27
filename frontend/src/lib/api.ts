import type { AnalyzeResponse, Section, SSEEvent } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function analyzeDesign(
  htmlFile: File,
  imageFile: File | null,
  instructionsFile: File | null,
  domain: string,
): Promise<AnalyzeResponse> {
  const form = new FormData()
  form.append('html_file', htmlFile)
  form.append('domain', domain)
  if (imageFile) form.append('image_file', imageFile)
  if (instructionsFile) {
    const text = await instructionsFile.text()
    form.append('instructions', text)
  }

  const res = await fetch(`${API_URL}/analyze`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error desconocido' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function streamGenerate(
  sections: Section[],
  html: string,
  domain: string,
  title: string,
  onEvent: (event: SSEEvent) => void,
): Promise<void> {
  const res = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sections, html, domain, title }),
  })

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ detail: 'Error desconocido' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event: SSEEvent = JSON.parse(line.slice(6))
          onEvent(event)
        } catch {
          // ignorar líneas malformadas
        }
      }
    }
  }
}

export function getDownloadUrl(path: string): string {
  return `${API_URL}${path}`
}
