'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectConfig, UploadedFiles, ConversionState, SectionMetadata } from '@/types';
import UploadStep from './steps/UploadStep';
import ConfigStep from './steps/ConfigStep';
import PreviewStep from './steps/PreviewStep';
import ExportStep from './steps/ExportStep';

const initialConfig: ProjectConfig = {
  projectName: 'My Elementor Project',
  pageType: 'landing',
  outputPreference: 'both',
  fidelity: 'high',
  style: 'native',
  maxFileSizeKb: 100,
  usePlaceholders: true,
  language: 'es',
};

const initialFiles: UploadedFiles = {
  htmlFile: null,
  htmlContent: '',
  imageFile: null,
};

export default function WizardFlow() {
  const [state, setState] = useState<ConversionState>({
    step: 1,
    files: initialFiles,
    config: initialConfig,
    sections: [],
    isProcessing: false,
    progress: 0,
    logs: [],
  });

  const nextStep = () => setState(s => ({ ...s, step: Math.min(s.step + 1, 4) }));
  const prevStep = () => setState(s => ({ ...s, step: Math.max(s.step - 1, 1) }));

  const updateFiles = (files: Partial<UploadedFiles>) => 
    setState(s => ({ ...s, files: { ...s.files, ...files } }));
    
  const updateConfig = (config: Partial<ProjectConfig>) => 
    setState(s => ({ ...s, config: { ...s.config, ...config } }));

  const setProcessing = (isProcessing: boolean, progress = 0) =>
    setState(s => ({ ...s, isProcessing, progress }));

  const addLog = (log: string) =>
    setState(s => ({ ...s, logs: [...s.logs, log] }));

  const setSections = (sections: SectionMetadata[]) =>
    setState(s => ({ ...s, sections }));

  const steps = [
    { title: 'Archivos', description: 'Sube tu HTML e imagen base' },
    { title: 'Configuración', description: 'Metadatos y preferencias' },
    { title: 'Procesamiento', description: 'Validación y secciones' },
    { title: 'Exportar', description: 'Descargar JSON Elementor' }
  ];

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-10 px-2 md:px-12">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center flex-1 relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold z-10 transition-colors duration-300
              ${state.step > i + 1 ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black ring-4 ring-[#fafafa] dark:ring-[#0a0a0a]' : 
                state.step === i + 1 ? 'bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white ring-4 ring-[#fafafa] dark:ring-[#0a0a0a]' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
              {state.step > i + 1 ? '✓' : i + 1}
            </div>
            <div className="mt-4 text-center hidden sm:block">
              <p className={`text-sm font-medium ${state.step >= i + 1 ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>{s.title}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={`hidden sm:block absolute top-4 left-[50%] w-full h-[1px] -z-0 transition-colors duration-500
                ${state.step > i + 1 ? 'bg-zinc-900 dark:bg-zinc-100 bg-opacity-100' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0c] shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20 px-6 py-5">
          <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{steps[state.step - 1].title}</CardTitle>
          <CardDescription className="text-zinc-500 mt-1">{steps[state.step - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-8">
          {state.step === 1 && (
            <UploadStep 
              files={state.files} 
              updateFiles={updateFiles} 
              onNext={nextStep} 
            />
          )}
          {state.step === 2 && (
            <ConfigStep 
              config={state.config} 
              updateConfig={updateConfig} 
              onNext={nextStep} 
              onPrev={prevStep} 
            />
          )}
          {state.step === 3 && (
            <PreviewStep 
              state={state} 
              setProcessing={setProcessing}
              addLog={addLog}
              setSections={setSections}
              onNext={nextStep} 
              onPrev={prevStep} 
            />
          )}
          {state.step === 4 && (
            <ExportStep 
              state={state} 
              onPrev={prevStep} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
