export function buildPageWrapper(title: string, content: unknown[]): Record<string, unknown> {
  return {
    title,
    type: 'page',
    version: '0.4',
    page_settings: [],
    content,
  }
}
