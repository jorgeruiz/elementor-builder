import WizardFlow from '@/components/wizard/WizardFlow';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 flex flex-col items-center pt-16 pb-24 font-sans selection:bg-indigo-500/30">
      
      {/* Super Subtle Background Grid (Linear/Vercel style) */}
      <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/djpdbmjsm/image/upload/v1724036130/grid-pattern_ebz2bx.svg')] bg-[length:32px_32px] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
          
          <div className="w-48 h-12 relative mb-6">
            <Image 
              src="/logo.png" 
              alt="Elementor Builder Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
            Acelera la migración a Elementor.
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Convierte tus diseños HTML estructurados en plantillas nativas de Elementor, listas para importar.
            <span className="block mt-1 font-medium text-zinc-700 dark:text-zinc-300">Algoritmo anti-truncamiento para páginas complejas.</span>
          </p>
        </div>
        
        <WizardFlow />
      </div>
    </main>
  );
}
