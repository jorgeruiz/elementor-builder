import { useState, useRef } from 'react';
import { UploadedFiles } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

interface Props {
  files: UploadedFiles;
  updateFiles: (files: Partial<UploadedFiles>) => void;
  onNext: () => void;
}

export default function UploadStep({ files, updateFiles, onNext }: Props) {
  const [error, setError] = useState('');

  const handleHtmlFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
        setError('El archivo debe ser un HTML válido.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateFiles({ 
          htmlFile: file, 
          htmlContent: ev.target?.result as string 
        });
        setError('');
      };
      reader.readAsText(file);
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('El archivo de referencia debe ser una imagen (PNG/JPG).');
        return;
      }
      updateFiles({ imageFile: file });
      setError('');
    }
  };

  const handleNext = () => {
    if (!files.htmlContent) {
      setError('Por favor, sube un archivo HTML o ingresa código HTML antes de continuar.');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
          <div className="bg-primary/10 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>
          </div>
          <div>
            <h3 className="font-medium text-lg">Archivo HTML (Obligatorio)</h3>
            <p className="text-sm text-muted-foreground mt-1">Sube la maqueta que deseas convertir a Elementor.</p>
          </div>
          <Label htmlFor="html-upload" className="cursor-pointer">
            <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80">
              Seleccionar archivo .html
            </div>
            <Input id="html-upload" type="file" accept=".html,text/html" className="hidden" onChange={handleHtmlFile} />
          </Label>
          {files.htmlFile && (
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Cargado: {files.htmlFile.name}
            </p>
          )}
        </div>

        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
          <div className="bg-primary/10 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </div>
          <div>
            <h3 className="font-medium text-lg">Imagen Referencia (Opcional)</h3>
            <p className="text-sm text-muted-foreground mt-1">Sube una captura de la página para estructuración visual.</p>
          </div>
          <Label htmlFor="img-upload" className="cursor-pointer">
            <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80">
              Seleccionar PNG/JPG
            </div>
            <Input id="img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
          </Label>
          {files.imageFile && (
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Cargada: {files.imageFile.name}
            </p>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext} disabled={!files.htmlContent}>
          Siguiente paso {`->`}
        </Button>
      </div>
    </div>
  );
}
