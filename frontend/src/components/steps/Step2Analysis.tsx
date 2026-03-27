'use client'

import type { AnalyzeResponse } from '@/lib/types'

interface Props {
  result: AnalyzeResponse
  onBack: () => void
  onContinue: () => void
}

export default function Step2Analysis({ result, onBack, onContinue }: Props) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-main mb-2">Resultado del análisis</h1>
        <p className="text-text-muted">
          Claude detectó {result.sections.length} secciones en tu diseño.
        </p>
      </div>

      <div className="card p-6 space-y-3 mb-6">
        {result.sections.map((s, i) => (
          <div
            key={s.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-bg-light border border-[#e2e8f0]"
          >
            <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-main">{s.name}</p>
              <p className="text-xs text-text-muted">{s.description}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <span className="text-xs bg-secondary text-primary px-2 py-0.5 rounded-full font-medium">
                  {s.layout_type}
                </span>
                {s.has_background_image && (
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                    bg-image
                  </span>
                )}
                {s.images.length > 0 && (
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                    {s.images.length} img
                  </span>
                )}
                {s.icons.length > 0 && (
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    {s.icons.length} iconos
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary">
          ← Atrás
        </button>
        <button onClick={onContinue} className="btn-primary flex-1">
          Revisar secciones →
        </button>
      </div>
    </div>
  )
}
