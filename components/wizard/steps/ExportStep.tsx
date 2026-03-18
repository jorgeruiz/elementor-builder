import { useState } from 'react';
import { ConversionState } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  state: ConversionState;
  onPrev: () => void;
}

export default function ExportStep({ state, onPrev }: Props) {
  const [downloading, setDownloading] = useState(false);
  
  const isLarge = state.sections.reduce((acc, s) => acc + s.elementCount, 0) > 100;

  const handleDownload = async (mode: 'both' | 'full' | 'sections') => {
    try {
      setDownloading(true);
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlContent: state.files.htmlContent,
          config: { ...state.config, outputPreference: mode }
        })
      });

      if (!res.ok) throw new Error('Error al generar el archivo');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.config.projectName.replace(/\s+/g, '_')}_elementor.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">¡Archivos Generados Exitosamente!</h2>
        <p className="text-muted-foreground">Tu código HTML ha sido convertido al formato nativo de Elementor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card className={isLarge && state.config.outputPreference !== 'full' ? 'opacity-50' : 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10'}>
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="bg-green-100 dark:bg-green-800/50 p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Página Completa (JSON)</h3>
              <p className="text-sm text-muted-foreground mt-1 px-4">
                Un solo archivo con todo el layout. {isLarge && '⚠️ Riesgo de truncamiento al importar en servidores con poca RAM.'}
              </p>
            </div>
            <Button 
              className="w-full max-w-[200px]" 
              variant={isLarge ? "secondary" : "default"}
              onClick={() => handleDownload('full')}
              disabled={downloading}
            >
              {downloading ? 'Generando...' : 'Descargar Full Page'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/10">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="bg-blue-100 dark:bg-blue-800/50 p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Bundle Modular (ZIP)</h3>
              <p className="text-sm text-muted-foreground mt-1 px-4">
                Múltiples archivos por sección separados. 100% seguro contra caídas de memoria de PHP.
              </p>
            </div>
            <Button 
              className="w-full max-w-[200px]"
              onClick={() => handleDownload('sections')}
              disabled={downloading}
            >
              {downloading ? 'Generando...' : 'Descargar ZIP Modular'}
            </Button>
          </CardContent>
        </Card>

      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4 rounded-md">
        <h4 className="font-semibold text-amber-800 dark:text-amber-500 mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          Instrucciones de Importación
        </h4>
        <ol className="list-decimal list-inside text-sm text-amber-700 dark:text-amber-400/80 space-y-1 pl-1">
          <li>Ve a tu panel de WordPress {">"} Elementor {">"} Mis Plantillas.</li>
          <li>Usa el botón "Importar Plantillas" (icono nube flecha arriba).</li>
          <li>Sube los archivos JSON generados.</li>
          <li>Crea una página en Elementor y usa la biblioteca de "Mis Plantillas" para insertar.</li>
        </ol>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev}>Volver</Button>
        <Button variant="ghost" onClick={() => window.location.reload()}>Iniciar Nuevo Proyecto</Button>
      </div>
    </div>
  );
}
