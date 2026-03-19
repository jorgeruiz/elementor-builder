import WizardFlow from '@/components/wizard/WizardFlow';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 py-10 relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 pt-8 flex flex-col items-center">
          
          {/* Logo Section */}
          <div className="w-48 h-16 relative mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <Image 
              src="/logo.png" 
              alt="Elementor Builder Logo" 
              fill 
              className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              priority
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
            Elementor JSON Builder
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            Convierte tus diseños HTML estructurados en plantillas nativas de Elementor listas para importar en WordPress. 
            <span className="block mt-2 text-indigo-300 font-medium">Procesamiento seguro anti-truncamiento para páginas complejas.</span>
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <WizardFlow />
        </div>
      </div>
    </main>
  );
}
