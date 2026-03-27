export type LayoutType = 'single' | 'two-col' | 'three-col' | 'grid-2' | 'grid-3'
export type ColSplit = '50/50' | '40/60' | '60/40' | '33/67'
export type FlexDirection = 'column' | 'row'
export type AlignItems = 'flex-start' | 'center' | 'flex-end'
export type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between'

export interface Section {
  id: string
  name: string
  description: string
  layout_type: LayoutType
  col_split: ColSplit | null
  background_color: string
  has_background_image: boolean
  content_summary: string
  images: string[]
  icons: string[]
  suggested_padding_v: number
  suggested_padding_h: number
  // overrides del paso 3
  flex_direction: FlexDirection
  align_items: AlignItems
  justify_content: JustifyContent
  padding_v: number
  padding_h: number
}

export interface AnalyzeResponse {
  sections: Section[]
  total_images: string[]
  domain: string
}

export type WizardStep = 1 | 2 | 3 | 4

export interface SSEEvent {
  type: 'section_start' | 'chunk' | 'section_done' | 'complete' | 'error'
  section_id?: string
  section_name?: string
  content?: string
  download_url?: string
  validation?: { valid: boolean; errors: string[]; error_count: number }
  message?: string
}
