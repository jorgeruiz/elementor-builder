// Client-only utility — only import from client components or api.ts (browser context)

const STORAGE_KEY = 'elementor_guide'
const MAX_BYTES = 6000

interface StoredGuide {
  filename: string
  snippet: string
  savedAt: string
}

type ElementorNode = Record<string, unknown>

function removeGlobals(obj: ElementorNode): ElementorNode {
  const result: ElementorNode = {}
  for (const key of Object.keys(obj)) {
    if (key === '__globals__') continue
    const val = obj[key]
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      result[key] = removeGlobals(val as ElementorNode)
    } else if (Array.isArray(val)) {
      result[key] = val.map((item) =>
        item && typeof item === 'object' ? removeGlobals(item as ElementorNode) : item,
      )
    } else {
      result[key] = val
    }
  }
  return result
}

function pruneWidget(node: ElementorNode): ElementorNode {
  const settings = (node.settings ?? {}) as ElementorNode
  const topSettings: ElementorNode = {}
  let count = 0
  for (const k of Object.keys(settings)) {
    if (k === '__globals__') continue
    topSettings[k] = settings[k]
    if (++count >= 10) break
  }
  return {
    id: node.id,
    elType: node.elType,
    widgetType: node.widgetType,
    settings: topSettings,
    elements: [],
  }
}

function pruneContainer(node: ElementorNode, depth: number): ElementorNode {
  const children = (node.elements ?? []) as ElementorNode[]
  const prunedChildren = children.slice(0, depth === 0 ? 999 : 6).map((child) => {
    if (child.elType === 'widget') return pruneWidget(child)
    if (child.elType === 'container') return pruneContainer(child, depth + 1)
    return pruneWidget(child)
  })

  return {
    id: node.id,
    elType: node.elType,
    isInner: node.isInner,
    settings: removeGlobals((node.settings ?? {}) as ElementorNode),
    elements: prunedChildren,
  }
}

export function extractGuideExamples(raw: unknown): string {
  const obj = raw as ElementorNode
  const content = (obj?.content ?? (obj?.data as ElementorNode)?.content ?? []) as ElementorNode[]

  const rootContainers = content.filter(
    (el) => el.elType === 'container' && el.isInner === false,
  )

  let selected = rootContainers.slice(0, 2)
  let pruned = selected.map((c) => pruneContainer(c, 0))
  let serialized = JSON.stringify(pruned)

  if (serialized.length > MAX_BYTES && pruned.length > 1) {
    pruned = [pruned[0]]
    serialized = JSON.stringify(pruned)
  }

  if (serialized.length > MAX_BYTES) {
    // Limit widgets to first 4
    const trimmed = { ...pruned[0] }
    trimmed.elements = ((pruned[0].elements ?? []) as ElementorNode[]).slice(0, 4)
    serialized = JSON.stringify([trimmed])
  }

  return serialized
}

export function saveGuide(filename: string, snippet: string): void {
  if (typeof window === 'undefined') return
  const data: StoredGuide = { filename, snippet, savedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadGuide(): StoredGuide | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredGuide
  } catch {
    return null
  }
}

export function clearGuide(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
