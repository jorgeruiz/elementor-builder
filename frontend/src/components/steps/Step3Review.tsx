'use client'

import { useState } from 'react'
import type { Section } from '@/lib/types'

interface Props {
  sections: Section[]
  domain: string
  onBack: () => void
  onConfirm: (sections: Section[]) => void
}

export default function Step3Review({ sections: initial, domain, onBack, onConfirm }: Props) {
  const [sections, setSections] = useState<Section[]>(initial)

  function update(id: string, patch: Partial<Section>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  const enabledCount = sections.filter((s) => s.enabled).length

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-main mb-2">Revisión interactiva</h1>
        <p className="text-text-muted">
          Ajusta el layout y estilos de cada sección antes de generar el JSON.
        </p>
      </div>

      {/* Resumen habilitadas */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-sm text-text-muted">
          <span className="font-semibold text-text-main">{enabledCount}</span> de{' '}
          {sections.length} secciones incluidas
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setSections((prev) => prev.map((s) => ({ ...s, enabled: true })))}
            className="text-xs text-cta font-medium hover:underline"
          >
            Habilitar todas
          </button>
          <span className="text-text-muted">·</span>
          <button
            onClick={() => setSections((prev) => prev.map((s) => ({ ...s, enabled: false })))}
            className="text-xs text-text-muted font-medium hover:underline"
          >
            Deshabilitar todas
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {sections.map((s) => (
          <div
            key={s.id}
            className={`card p-5 transition-opacity ${s.enabled ? '' : 'opacity-40'}`}
          >
            {/* Header con toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={s.enabled}
                  onClick={() => update(s.id, { enabled: !s.enabled })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    s.enabled ? 'bg-cta' : 'bg-[#cbd5e1]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      s.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

                <div className="min-w-0">
                  <h3 className={`font-semibold truncate ${s.enabled ? 'text-text-main' : 'text-text-muted'}`}>
                    {s.name}
                  </h3>
                  <p className="text-xs text-text-muted truncate">{s.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {!s.enabled && (
                  <span className="text-xs bg-[#f1f5f9] text-text-muted px-2 py-0.5 rounded-full">
                    excluida
                  </span>
                )}
                <span className="text-xs bg-secondary text-primary px-2 py-0.5 rounded-full font-medium">
                  {s.id}
                </span>
              </div>
            </div>

            {/* Controles — solo visibles si habilitada */}
            {s.enabled && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Layout */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Layout</label>
                  <select
                    className="input-field text-sm py-2"
                    value={s.layout_type}
                    onChange={(e) => update(s.id, { layout_type: e.target.value as Section['layout_type'] })}
                  >
                    <option value="single">Columna única</option>
                    <option value="two-col">2 columnas</option>
                    <option value="three-col">3 columnas</option>
                    <option value="grid-2">Grid 2 cols</option>
                    <option value="grid-3">Grid 3 cols</option>
                  </select>
                </div>

                {/* Col split */}
                {s.layout_type === 'two-col' && (
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Distribución</label>
                    <select
                      className="input-field text-sm py-2"
                      value={s.col_split ?? '50/50'}
                      onChange={(e) => update(s.id, { col_split: e.target.value as Section['col_split'] })}
                    >
                      <option value="50/50">50 / 50</option>
                      <option value="40/60">40 / 60</option>
                      <option value="60/40">60 / 40</option>
                      <option value="33/67">33 / 67</option>
                    </select>
                  </div>
                )}

                {/* Align items */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Alineación H</label>
                  <select
                    className="input-field text-sm py-2"
                    value={s.align_items}
                    onChange={(e) => update(s.id, { align_items: e.target.value as Section['align_items'] })}
                  >
                    <option value="flex-start">Inicio</option>
                    <option value="center">Centro</option>
                    <option value="flex-end">Final</option>
                  </select>
                </div>

                {/* Justify content */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Alineación V</label>
                  <select
                    className="input-field text-sm py-2"
                    value={s.justify_content}
                    onChange={(e) => update(s.id, { justify_content: e.target.value as Section['justify_content'] })}
                  >
                    <option value="flex-start">Inicio</option>
                    <option value="center">Centro</option>
                    <option value="flex-end">Final</option>
                    <option value="space-between">Separado</option>
                  </select>
                </div>

                {/* Padding V */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">
                    Padding vertical
                  </label>
                  <select
                    className="input-field text-sm py-2"
                    value={s.padding_v}
                    onChange={(e) => update(s.id, { padding_v: Number(e.target.value) })}
                  >
                    {[0, 32, 48, 64, 96].map((v) => (
                      <option key={v} value={v}>{v} px</option>
                    ))}
                  </select>
                </div>

                {/* Padding H */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">
                    Padding horizontal
                  </label>
                  <select
                    className="input-field text-sm py-2"
                    value={s.padding_h}
                    onChange={(e) => update(s.id, { padding_h: Number(e.target.value) })}
                  >
                    {[0, 16, 32, 64].map((v) => (
                      <option key={v} value={v}>{v} px</option>
                    ))}
                  </select>
                </div>

                {/* Color de fondo */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">
                    Color de fondo
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded-lg border border-[#e2e8f0] cursor-pointer p-0.5"
                      value={s.background_color === 'transparent' ? '#ffffff' : s.background_color}
                      onChange={(e) => update(s.id, { background_color: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input-field text-sm py-2 font-mono"
                      value={s.background_color}
                      onChange={(e) => update(s.id, { background_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Aviso si no hay secciones habilitadas */}
      {enabledCount === 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <span className="material-symbols-outlined text-amber-500 flex-shrink-0" style={{ fontSize: 18 }}>
            warning
          </span>
          <p className="text-sm text-amber-700">
            Habilita al menos una sección para generar el JSON.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary">
          ← Atrás
        </button>
        <button
          onClick={() => onConfirm(sections)}
          disabled={enabledCount === 0}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generar JSON ({enabledCount} sección{enabledCount !== 1 ? 'es' : ''}) →
        </button>
      </div>
    </div>
  )
}
