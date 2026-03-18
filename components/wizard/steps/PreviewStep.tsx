import { useEffect } from 'react';
import { ConversionState, SectionMetadata } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Props {
  state: ConversionState;
  setProcessing: (proc: boolean, prog?: number) => void;
  addLog: (log: string) => void;
  setSections: (secs: SectionMetadata[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function PreviewStep({ state, setProcessing, addLog, setSections, onNext, onPrev }: Props) {
  
  useEffect(() => {
    if (state.sections.length === 0 && !state.isProcessing && state.step === 3) {
      simulateProcessing();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step]);

  const simulateProcessing = async () => {
    setProcessing(true, 10);
    addLog('Iniciando lectura y validación de HTML...');
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          htmlContent: state.files.htmlContent,
          config: state.config
        })
      });

      setProcessing(true, 40);
      addLog('DOM Parse completado. Identificando bloques semánticos...');
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error desconocido al analizar');
      }

      setProcessing(true, 70);
      addLog('Calculando heurísticas y métricas de Elementor...');
      
      const parsedSections: SectionMetadata[] = data.sections;
      
      setProcessing(true, 90);
      addLog('Verificando compatibilidad XML/JSON... listo.');
      setSections(parsedSections);
      
    } catch (err: any) {
      addLog(`Error fatal: ${err.message}`);
      setProcessing(false, 10);
      return;
    }
    
    setProcessing(false, 100);
    addLog('¡Análisis completado!');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Estado del Procesamiento</h3>
        <Progress value={state.progress} className="w-full h-3" />
        <p className="text-sm text-muted-foreground">{state.progress}% completado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sections Detected */}
        <div className="border rounded-md p-4">
          <h4 className="font-medium mb-3">Bloques Detectados</h4>
          {state.sections.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Esperando evaluación...</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {state.sections.map((sec, i) => (
                <AccordionItem value={`item-${i}`} key={sec.id}>
                  <AccordionTrigger className="hover:no-underline px-2 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-md mb-2 data-[state=open]:rounded-b-none">
                    <div className="flex items-center gap-2">
                      <Badge variant={sec.status === 'success' ? 'default' : sec.status === 'warning' ? 'secondary' : 'destructive'} 
                             className={sec.status === 'success' ? 'bg-green-600' : sec.status === 'warning' ? 'bg-amber-500 text-white' : ''}>
                        {sec.status === 'success' ? 'OK' : sec.status === 'warning' ? 'WARN' : 'ERR'}
                      </Badge>
                      <span className="font-medium text-sm">{sec.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 border-x border-b rounded-b-md pt-2 pb-3 bg-slate-50/50 dark:bg-slate-900/30">
                    <p className="text-xs text-muted-foreground mb-2">
                      Elementos: {sec.elementCount} | Tipo inferido: {sec.type}
                    </p>
                    {sec.warnings.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-amber-600 dark:text-amber-400 space-y-1">
                        {sec.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* Console Logs */}
        <div className="border rounded-md p-4 bg-slate-950 font-mono text-zinc-300">
          <h4 className="text-zinc-100 font-medium mb-3 text-sm">Console Output</h4>
          <ScrollArea className="h-48 w-full rounded-md pr-4">
            {state.logs.length === 0 ? (
               <p className="text-xs text-zinc-600">No hay eventos recientes...</p>
            ) : (
              <ul className="space-y-1">
                {state.logs.map((log, i) => (
                  <li key={i} className="text-xs border-b border-zinc-800 pb-1">
                    <span className="text-green-500 mr-2">{'>'}</span>{log}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} disabled={state.isProcessing}>Atrás</Button>
        <Button onClick={onNext} disabled={state.isProcessing || state.sections.length === 0}>
          Revisar Opciones de Exportación
        </Button>
      </div>
    </div>
  );
}
