'use client'

import { useState, useRef, useCallback, DragEvent } from 'react'
import { analyzeDesign } from '@/lib/api'
import type { AnalyzeResponse } from '@/lib/types'

interface Props {
  onDone: (result: AnalyzeResponse, htmlFile: File, htmlContent: string) => void
}

interface FileZoneProps {
  label: string
  accept: string
  required?: boolean
  file: File | null
  onFile: (f: File) => void
  icon: string
  hint: string
}

function FileZone({ label, accept, required, file, onFile, icon, hint }: FileZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer.files[0]
      if (f) onFile(f)
    },
    [onFile],
  )

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm font-semibold text-text-main">{label}</span>
        {required ? (
          <span className="text-xs text-red-500 font-medium">requerido</span>
        ) : (
          <span className="text-xs text-text-muted">opcional</span>
        )}
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl p-5 flex items-center gap-4 transition-all ${
          file
            ? 'border-cta bg-secondary/30'
            : dragging
            ? 'border-primary bg-secondary/20'
            : 'border-[#e2e8f0] bg-white hover:border-cta hover:bg-secondary/10'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            file ? 'bg-cta' : 'bg-[#f1f5f9]'
          }`}
        >
          <span
            className={`material-symbols-outlined ${file ? 'text-white' : 'text-text-muted'}`}
            style={{ fontSize: 20 }}
          >
            {file ? 'check_circle' : icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          {file ? (
            <>
              <p className="text-sm font-semibold text-cta truncate">{file.name}</p>
              <p className="text-xs text-text-muted">
                {(file.size / 1024).toFixed(1)} KB · click para cambiar
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-text-main">Arrastra o haz click</p>
              <p className="text-xs text-text-muted">{hint}</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
      </div>
    </div>
  )
}

export default function Step1Upload({ onDone }: Props) {
  const [htmlFile, setHtmlFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [instructionsFile, setInstructionsFile] = useState<File | null>(null)
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = htmlFile && domain.trim()

  async function handleSubmit() {
    if (!htmlFile || !domain.trim()) return
    setLoading(true)
    setError(null)
    try {
      const htmlContent = await htmlFile.text()
      const result = await analyzeDesign(htmlFile, imageFile, instructionsFile, domain.trim())
      onDone(result, htmlFile, htmlContent)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Título */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-main mb-2">
          Subir archivos del diseño
        </h1>
        <p className="text-text-muted">
          Sube tu HTML y la imagen de referencia para que Claude analice las secciones.
        </p>
      </div>

      <div className="card p-6 space-y-4">
        {/* Archivos */}
        <FileZone
          label="Archivo HTML"
          accept=".html,.htm"
          required
          file={htmlFile}
          onFile={setHtmlFile}
          icon="code"
          hint="index.html · Será el HTML de referencia para la conversión"
        />
        <FileZone
          label="Imagen de referencia"
          accept="image/*"
          file={imageFile}
          onFile={setImageFile}
          icon="image"
          hint="design.png · Ayuda a Claude a entender el layout visual"
        />
        <FileZone
          label="Instrucciones adicionales"
          accept=".txt"
          file={instructionsFile}
          onFile={setInstructionsFile}
          icon="description"
          hint="instructions.txt · Notas sobre el diseño o preferencias"
        />

        {/* Dominio */}
        <div>
          <label className="block text-sm font-semibold text-text-main mb-1.5">
            Dominio del sitio
            <span className="text-red-500 ml-1">requerido</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
              https://
            </span>
            <input
              type="text"
              className="input-field pl-16"
              placeholder="ejemplo.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmit()}
            />
          </div>
          <p className="text-xs text-text-muted mt-1">
            Se usará para construir las URLs de imágenes en WordPress.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <span className="material-symbols-outlined text-red-500 flex-shrink-0" style={{ fontSize: 18 }}>
              error
            </span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analizando con Claude…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  auto_awesome
                </span>
                Analizar diseño
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { icon: 'html', text: 'HTML limpio con IDs de sección' },
          { icon: 'palette', text: 'Imagen de referencia mejora resultados' },
          { icon: 'domain', text: 'Dominio correcto para URLs de imágenes' },
        ].map((tip) => (
          <div key={tip.icon} className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30">
            <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontSize: 18 }}>
              {tip.icon}
            </span>
            <p className="text-xs text-text-muted">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
