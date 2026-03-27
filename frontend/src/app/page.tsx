'use client'

import { useState } from 'react'
import type { WizardStep, AnalyzeResponse, Section } from '@/lib/types'
import Step1Upload from '@/components/steps/Step1Upload'
import Step2Analysis from '@/components/steps/Step2Analysis'
import Step3Review from '@/components/steps/Step3Review'
import Step4Generate from '@/components/steps/Step4Generate'

const STEPS = [
  { n: 1, label: 'Subir archivos' },
  { n: 2, label: 'Análisis' },
  { n: 3, label: 'Revisión' },
  { n: 4, label: 'Generar' },
]

export default function Home() {
  const [step, setStep] = useState<WizardStep>(1)
  const [htmlFile, setHtmlFile] = useState<File | null>(null)
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResponse | null>(null)
  const [sections, setSections] = useState<Section[]>([])

  function handleAnalyzeDone(result: AnalyzeResponse, file: File, content: string) {
    // Inicializar overrides con los valores sugeridos
    const enriched: Section[] = result.sections.map((s) => ({
      ...s,
      flex_direction: s.layout_type === 'two-col' ? 'row' : 'column',
      align_items: 'center',
      justify_content: 'flex-start',
      padding_v: s.suggested_padding_v,
      padding_h: s.suggested_padding_h,
    }))
    setHtmlFile(file)
    setHtmlContent(content)
    setAnalyzeResult(result)
    setSections(enriched)
    setStep(3)
  }

  function handleStep2Back() {
    setStep(1)
  }

  function handleStep3Confirm(updated: Section[]) {
    setSections(updated)
    setStep(4)
  }

  function handleStep3Back() {
    setStep(2)
  }

  function handleReset() {
    setStep(1)
    setHtmlFile(null)
    setHtmlContent('')
    setAnalyzeResult(null)
    setSections([])
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cta rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>
                code
              </span>
            </div>
            <span className="font-bold text-lg tracking-tight">Elementor Builder</span>
          </div>
          <span className="text-secondary text-sm hidden sm:block">
            HTML → JSON para Elementor Pro v3
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const done = step > s.n
              const active = step === s.n
              return (
                <div key={s.n} className="flex items-center flex-1 last:flex-none">
                  {/* Círculo */}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        done
                          ? 'bg-cta text-white'
                          : active
                          ? 'bg-primary text-white'
                          : 'bg-[#e2e8f0] text-text-muted'
                      }`}
                    >
                      {done ? (
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                          check
                        </span>
                      ) : (
                        s.n
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        active ? 'text-primary' : done ? 'text-cta' : 'text-text-muted'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {/* Línea conectora */}
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 mb-5 transition-colors ${
                        step > s.n ? 'bg-cta' : 'bg-[#e2e8f0]'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Contenido del paso */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {step === 1 && (
          <Step1Upload onDone={handleAnalyzeDone} />
        )}
        {step === 2 && analyzeResult && (
          <Step2Analysis
            result={analyzeResult}
            onBack={handleStep2Back}
            onContinue={() => setStep(3)}
          />
        )}
        {step === 3 && analyzeResult && (
          <Step3Review
            sections={sections}
            domain={analyzeResult.domain}
            onBack={handleStep3Back}
            onConfirm={handleStep3Confirm}
          />
        )}
        {step === 4 && analyzeResult && htmlFile && (
          <Step4Generate
            sections={sections}
            htmlContent={htmlContent}
            domain={analyzeResult.domain}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-3 text-center text-xs text-text-muted">
          Elementor Builder · Powered by Claude AI
        </div>
      </footer>
    </div>
  )
}
