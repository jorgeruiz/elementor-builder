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
  const [isDraggingHtml, setIsDraggingHtml] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const processHtmlFile = (file: File) => {
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
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('El archivo de referencia debe ser una imagen (PNG/JPG).');
      return;
    }
    updateFiles({ imageFile: file });
    setError('');
  };

  const handleHtmlFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processHtmlFile(e.target.files[0]);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processImageFile(e.target.files[0]);
  };

  const handleDropHtml = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingHtml(false);
    if (e.dataTransfer.files?.[0]) processHtmlFile(e.dataTransfer.files[0]);
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    if (e.dataTransfer.files?.[0]) processImageFile(e.dataTransfer.files[0]);
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
        <Label 
          htmlFor="html-upload" 
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 transition-all duration-200 cursor-pointer overflow-hidden
            ${isDraggingHtml 
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
              : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingHtml(true); }}
          onDragLeave={() => setIsDraggingHtml(false)}
          onDrop={handleDropHtml}
        >
          <div className={`p-4 rounded-full transition-colors ${files.htmlFile ? 'bg-green-100 dark:bg-green-900/30' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
            {files.htmlFile ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 dark:text-zinc-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Archivo HTML {files.htmlFile ? 'Subido' : '(Obligatorio)'}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">Arrástralo aquí o haz clic para subir</p>
          </div>
          
          <Input id="html-upload" type="file" accept=".html,text/html" className="hidden" onChange={handleHtmlFile} />
          
          {files.htmlFile && (
            <div className="absolute bottom-0 left-0 w-full bg-green-50 dark:bg-green-900/20 py-2 border-t border-green-200 dark:border-green-800/30">
              <p className="text-xs font-medium text-green-700 dark:text-green-400 truncate px-4">
                {files.htmlFile.name}
              </p>
            </div>
          )}
        </Label>

        <Label 
          htmlFor="img-upload" 
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 transition-all duration-200 cursor-pointer overflow-hidden
            ${isDraggingImage 
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
              : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
          onDragLeave={() => setIsDraggingImage(false)}
          onDrop={handleDropImage}
        >
          <div className={`p-4 rounded-full transition-colors ${files.imageFile ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
            {files.imageFile ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 dark:text-zinc-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Imagen Referencia {files.imageFile ? 'Subida' : '(Opcional)'}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">Arrástrala aquí o haz clic para subir</p>
          </div>
          
          <Input id="img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
          
          {files.imageFile && (
            <div className="absolute bottom-0 left-0 w-full bg-blue-50 dark:bg-blue-900/20 py-2 border-t border-blue-200 dark:border-blue-800/30">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400 truncate px-4">
                {files.imageFile.name}
              </p>
            </div>
          )}
        </Label>
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
