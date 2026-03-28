export interface ValidationResult {
  valid: boolean
  errors: string[]
  error_count: number
}

export function validateElementorJson(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = []

  function check(elements: unknown[], path = '') {
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as Record<string, unknown>
      if (el.elType === 'section' || el.elType === 'column') {
        errors.push(`Legacy element at ${path}[${i}]: elType="${el.elType}"`)
      }
      if (!el.id) {
        errors.push(`Missing id at ${path}[${i}]`)
      }
      if (Array.isArray(el.elements)) {
        check(el.elements as unknown[], `${path}[${i}]`)
      }
    }
  }

  check((data.content as unknown[]) ?? [])

  return {
    valid: errors.length === 0,
    errors,
    error_count: errors.length,
  }
}
