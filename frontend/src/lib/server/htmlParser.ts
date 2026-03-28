import { load } from 'cheerio'

export interface ParsedSection {
  index: number
  tag: string
  idHint: string
  textPreview: string
  images: string[]
  hasBackgroundImage: boolean
  backgroundColor: string
  layoutHint: string
  suggestedPaddingV: number
  suggestedPaddingH: number
  htmlSnippet: string
}

export function parseHtmlSections(html: string): ParsedSection[] {
  const $ = load(html)
  const sections: ParsedSection[] = []

  const candidates: ReturnType<typeof $>[] = []
  $('body').children().each((_, el) => { candidates.push($(el)) })

  // Fallback: si body está vacío, usar los hijos del root
  if (candidates.length === 0) {
    $('html').children().each((_, el) => { candidates.push($(el)) })
  }

  const meaningful = candidates.filter(($el) => {
    const text = $el.text().trim()
    return text.length > 20 || $el.find('img, video, picture').length > 0
  })

  meaningful.forEach(($el, i) => {
    const tag = ($el.prop('tagName') as string | undefined)?.toLowerCase() ?? 'div'

    // Imágenes
    const images: string[] = []
    $el.find('img').each((_, img) => {
      const src = $(img).attr('src') || $(img).attr('data-src')
      if (src) images.push(src)
    })

    // Fondo desde style inline
    const style = $el.attr('style') || ''
    const hasBgImage = /background/i.test(style) && /url\(/i.test(style)

    let bgColor = '#ffffff'
    const bgMatch = style.match(/background-color:\s*([^;]+)/i)
    if (bgMatch) bgColor = bgMatch[1].trim()

    // Padding sugerido desde clases
    const classes = $el.attr('class') || ''
    const padV = /py-|pt-|pb-/.test(classes) ? 96 : 64
    const padH = 32

    // Layout hint
    let layout = 'single'
    if (/grid/.test(classes)) layout = 'grid-2'
    else if ($el.find('[class*="col"]').length >= 2) layout = 'two-col'

    // ID hint
    const elId = $el.attr('id') || ''
    const firstClass = classes.split(' ').find((c) => c.trim()) || ''
    const idHint =
      elId ||
      firstClass.replace(/[^a-z0-9]/gi, '_').toLowerCase() ||
      `${tag}_${i}`

    sections.push({
      index: i,
      tag,
      idHint,
      textPreview: $el.text().trim().slice(0, 200),
      images,
      hasBackgroundImage: hasBgImage,
      backgroundColor: bgColor,
      layoutHint: layout,
      suggestedPaddingV: padV,
      suggestedPaddingH: padH,
      htmlSnippet: $.html($el[0] as Parameters<typeof $.html>[0])?.slice(0, 600) ?? '',
    })
  })

  return sections
}
