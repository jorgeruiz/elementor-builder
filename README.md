# Elementor JSON Builder

Aplicación web robusta diseñada para convertir estructuras y archivos HTML en archivos JSON compatibles y listos para importar como Plantillas de Elementor en WordPress.

## Documentos de Arquitectura
Durante el desarrollo, se generaron los siguientes documentos de arquitectura en el sistema de planeación:
- `implementation_plan.md`: Diseño detallado de módulos y flujos de API.
- `transformation_rules.md`: Reglas del mapeo de AST a Elementor Widgets.

## ¿Qué resuelve esta aplicación?
El problema de generar JSON de Elementor desde páginas muy grandes, que usualmente fallan debido a caídas de memoria (OOM) o "server timeouts" en PHP al importarlas.

## Arquitectura

- **Frontend:** Next.js App Router, React, Tailwind CSS, shadcn/ui.
- **Flujo UX:** Un Wizard de 4 pasos (Subida -> Configuración -> Procesamiento/Vista Previa -> Exportación).
- **Backend (API Routes):**
  - `/api/analyze`: Utiliza `cheerio` para parsear HTML a un AST personalizado y luego lo segmenta en bloques lógicos.
  - `/api/export`: Aplica reglas de mapeo Elementor estrictas, verifica el peso de los componentes (módulo *Anti-truncamiento*) y genera un archivo ZIP conteniendo un JSON único (si es pequeño) o múltiples JSON segmentados (obligatorio para páginas grandes). Finalmente, incluye un LOG/README de importación.

## Instrucciones Locales
Para ejecutar esta aplicación en modo desarrollo:

1. Instala las dependencias:
   \`\`\`bash
   npm install
   \`\`\`
2. Inicia el servidor de Next.js:
   \`\`\`bash
   npm run dev
   \`\`\`
3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts Adicionales
Para correr las pruebas unitarias que validan los "5 Casos de Uso Clave" definidos:
\`\`\`bash
npx tsx test-pipeline.ts
\`\`\`
Esto validará la lógica core contra HTMLs complejos sin necesidad de levantar el navegador.
