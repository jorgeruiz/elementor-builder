import { ProjectConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  config: ProjectConfig;
  updateConfig: (config: Partial<ProjectConfig>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function ConfigStep({ config, updateConfig, onNext, onPrev }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="space-y-2">
          <Label htmlFor="projectName">Nombre del Proyecto</Label>
          <Input 
            id="projectName"
            value={config.projectName}
            onChange={(e) => updateConfig({ projectName: e.target.value })}
            placeholder="Ej. Landing Empresa 2026"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pageType">Tipo de Página</Label>
          <select 
            id="pageType"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={config.pageType}
            onChange={(e) => updateConfig({ pageType: e.target.value as any })}
          >
            <option value="landing">Landing Page</option>
            <option value="home">Home Page</option>
            <option value="service">Página de Servicio</option>
            <option value="product">Página de Producto</option>
            <option value="contact">Contacto</option>
            <option value="corporate">Corporativa</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="outputPref">Preferencia de Salida (Manejo de tamaño)</Label>
          <select 
            id="outputPref"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={config.outputPreference}
            onChange={(e) => updateConfig({ outputPreference: e.target.value as any })}
          >
            <option value="both">Recomendado: Completo si es posible, Secciones si es grande</option>
            <option value="full">Forzar archivo único Completo (Peligroso en págs grandes)</option>
            <option value="sections">Forzar solo módulos por secciones sueltas</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fidelity">Fidelidad Visual vs Compatibilidad</Label>
          <select 
            id="fidelity"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={config.fidelity}
            onChange={(e) => updateConfig({ fidelity: e.target.value as any })}
          >
            <option value="high">Alta Compatibilidad con Elementor (Secciones Estables)</option>
            <option value="medium">Fidelidad Visual Estricta (Estructuras Complejas)</option>
          </select>
        </div>

      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev}>Atrás</Button>
        <Button onClick={onNext}>Analizar y Procesar</Button>
      </div>
    </div>
  );
}
