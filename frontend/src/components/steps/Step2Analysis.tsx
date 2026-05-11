'use client'

import type { AnalyzeResponse } from '@/lib/types'

interface Props {
  result: AnalyzeResponse
  onBack: () => void
  onContinue: () => void
}

export default function Step2Analysis({ result, onBack, onContinue }: Props) {
  const isGrid = (lt: string) => lt.startsWith('grid-')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-main mb-2">Resultado del análisis</h1>
        <p className="text-text-muted">
          Claude detectó {result.sections.length} sección{result.sections.length !== 1 ? 'es' : ''} en tu diseño.
        </p>
      </div>

      {/* Banner de detección incompleta */}
      {result.incomplete && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4 mb-5">
          <span
            className="material-symbols-outlined text-amber-500 flex-shrink-0 mt-0.5"
            style={{ fontSize: 20 }}
          >
            warning
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Detección incompleta
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              El HTML tiene <strong>{result.expected}</strong> etiquetas{' '}
              <code className="bg-amber-100 px-1 rounded text-xs">&lt;section&gt;</code> pero
              solo se identificaron <strong>{result.found}</strong>. Revisa las secciones
              antes de continuar — es posible que falte alguna grid o sección intermedia.
            </p>
          </div>
        </div>
      )}

      <div className="card p-6 space-y-3 mb-6">
        {result.sections.map((s, i) => (
          <div
            key={s.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-bg-light border border-[#e2e8f0]"
          >
            <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-main">{s.name}</p>
              <p className="text-xs text-text-muted">{s.description}</p>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                <span className="text-xs bg-secondary text-primary px-2 py-0.5 rounded-full font-medium">
                  {s.layout_type}
                </span>
                {isGrid(s.layout_type) && s.item_count != null && (
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                    Grid · {s.item_count} items
                  </span>
                )}
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
