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
    <div className="w-full max-w-5xl mx-auto p-4 space-y-8">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center flex-1 relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 
              ${state.step > i + 1 ? 'bg-green-600 text-white' : 
                state.step === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {i + 1}
            </div>
            <div className="mt-2 text-center hidden sm:block">
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={`hidden sm:block absolute top-5 left-1/2 w-full h-[2px] -z-0
                ${state.step > i + 1 ? 'bg-green-600' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="border-2 shadow-sm">
        <CardHeader>
          <CardTitle>{steps[state.step - 1].title}</CardTitle>
          <CardDescription>{steps[state.step - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
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
