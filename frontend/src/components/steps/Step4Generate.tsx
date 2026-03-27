'use client'

import { useEffect, useRef, useState } from 'react'
import { streamGenerate, getDownloadUrl } from '@/lib/api'
import type { Section, SSEEvent } from '@/lib/types'

interface Props {
  sections: Section[]
  htmlContent: string
  domain: string
  onReset: () => void
}

interface SectionStatus {
  id: string
  name: string
  status: 'pending' | 'generating' | 'done' | 'error'
  error?: string
}

export default function Step4Generate({ sections, htmlContent, domain, onReset }: Props) {
  const [statuses, setStatuses] = useState<SectionStatus[]>(
    sections.map((s) => ({ id: s.id, name: s.name, status: 'pending' })),
  )
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] } | null>(null)
  const [running, setRunning] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const started = useRef(false)

  function patchStatus(id: string, patch: Partial<SectionStatus>) {
    setStatuses((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  useEffect(() => {
    if (started.current) return
    started.current = true
    setRunning(true)

    streamGenerate(
      sections,
      htmlContent,
      domain,
      `Página – ${domain}`,
      (event: SSEEvent) => {
        if (event.type === 'section_start' && event.section_id) {
          patchStatus(event.section_id, { status: 'generating' })
        } else if (event.type === 'section_done' && event.section_id) {
          patchStatus(event.section_id, { status: 'done' })
        } else if (event.type === 'error' && event.section_id) {
          patchStatus(event.section_id, { status: 'error', error: event.message })
        } else if (event.type === 'complete') {
          if (event.download_url) setDownloadUrl(getDownloadUrl(event.download_url))
          if (event.validation) setValidation(event.validation)
          setRunning(false)
        }
      },
    ).catch((e: Error) => {
      setGlobalError(e.message)
      setRunning(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const statusIcon: Record<SectionStatus['status'], string> = {
    pending: 'schedule',
    generating: 'autorenew',
    done: 'check_circle',
    error: 'error',
  }

  const statusColor: Record<SectionStatus['status'], string> = {
    pending: 'text-text-muted',
    generating: 'text-cta animate-spin',
    done: 'text-green-500',
    error: 'text-red-500',
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-main mb-2">
          {running ? 'Generando JSON…' : downloadUrl ? 'JSON generado' : 'Generación'}
        </h1>
        <p className="text-text-muted">
          {running
            ? 'Claude está construyendo el JSON sección por sección.'
            : downloadUrl
            ? 'Tu archivo está listo para descargar.'
            : 'Preparando…'}
        </p>
      </div>

      {/* Lista de secciones */}
      <div className="card p-5 mb-6 space-y-2">
        {statuses.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 py-2 border-b last:border-b-0 border-[#f1f5f9]"
          >
            <span
              className={`material-symbols-outlined ${statusColor[s.status]}`}
              style={{ fontSize: 20 }}
            >
              {statusIcon[s.status]}
            </span>
            <span className="flex-1 text-sm font-medium text-text-main">{s.name}</span>
            <span className="text-xs text-text-muted capitalize">
              {s.status === 'generating' ? 'generando…' : s.status}
            </span>
          </div>
        ))}
      </div>

      {/* Error global */}
      {globalError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <span className="material-symbols-outlined text-red-500" style={{ fontSize: 18 }}>
            error
          </span>
          <p className="text-sm text-red-700">{globalError}</p>
        </div>
      )}

      {/* Resultado */}
      {downloadUrl && (
        <div className="card p-5 mb-6">
          {/* Validación */}
          {validation && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                validation.valid
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <span
                className={`material-symbols-outlined ${
                  validation.valid ? 'text-green-600' : 'text-amber-600'
                }`}
                style={{ fontSize: 20 }}
              >
                {validation.valid ? 'verified' : 'warning'}
              </span>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    validation.valid ? 'text-green-700' : 'text-amber-700'
                  }`}
                >
                  {validation.valid
                    ? 'JSON válido — sin elementos legacy'
                    : `${validation.errors.length} advertencia(s) encontradas`}
                </p>
                {!validation.valid && (
                  <ul className="mt-1 space-y-0.5">
                    {validation.errors.map((e, i) => (
                      <li key={i} className="text-xs text-amber-600">
                        · {e}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <a
            href={downloadUrl}
            download
            className="btn-primary w-full flex items-center justify-center gap-2 text-base"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              download
            </span>
            Descargar JSON para Elementor
          </a>
        </div>
      )}

      {/* Botón reset */}
      {!running && (
        <button
          onClick={onReset}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            restart_alt
          </span>
          Convertir otro diseño
        </button>
      )}
    </div>
  )
}
