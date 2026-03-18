import WizardFlow from '@/components/wizard/WizardFlow';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 bg-gradient-to-br from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            Elementor JSON Builder
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Convierte tus diseños HTML estructurados en plantillas nativas de Elementor listas para importar en WordPress. 
            Procesamiento seguro anti-truncamiento para páginas grandes.
          </p>
        </div>
        
        <WizardFlow />
      </div>
    </main>
  );
}
