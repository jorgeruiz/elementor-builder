import { NextResponse } from 'next/server';
import { processTemplateInjection } from '@/lib/template-injector';
import { validateElementorJson } from '@/lib/validators';
import JSZip from 'jszip';

function generateReadme(projectName: string, files: any[], warnings: string[]) {
  return `
# Elementor JSON Builder - Export Report
**Proyecto:** ${projectName}
**Fecha:** ${new Date().toISOString().split('T')[0]}

## Archivos Generados
${files.map(f => `- ${f.filename}`).join('\n')}

## Advertencias de Validacion
${warnings.length > 0 ? warnings.map(w => `- ${w}`).join('\n') : 'Ninguna advertencia. Archivos 100% compatibles.'}

## Instrucciones de Importación
1. Ve a WordPress > Plantillas (Templates) > Plantillas Guardadas.
2. Haz clic en el botón "Importar Plantillas" en la parte superior.
3. Arrastra los archivos JSON provistos en esta carpeta.
4. Una vez importados, ve a tu página y haz clic en el icono gris de carpeta para insertarlos desde "Mis Plantillas".

**Nota anti-truncamiento:** Si generaste un archivo "_full", pero falla al insertar en tu página en vivo, significa que tu servidor PHP no tiene suficiente memoria (post_max_size/memory_limit). En ese caso, elimina el full e importa las plantillas modulares una por una.
`;
}

export async function POST(req: Request) {
  try {
    const { htmlContent, config } = await req.json();

    if (!htmlContent) {
      return NextResponse.json({ error: 'No HTML content' }, { status: 400 });
    }

    // Pipeline Inyección LLM
    const injectedJson = await processTemplateInjection(htmlContent);
    const generatedFiles = [
      {
        filename: `${config.projectName.replace(/\s+/g, '_')}_universal.json`,
        content: JSON.stringify(injectedJson, null, 2)
      }
    ];

    const allWarnings: string[] = [];
    
    // Validación
    generatedFiles.forEach(gf => {
      const report = validateElementorJson(gf.content);
      if (!report.isValid) {
        throw new Error(`Fallo crítico de validación en ${gf.filename}: ` + report.errors.join(', '));
      }
      allWarnings.push(...report.warnings);
    });

    // Construir ZIP
    const zip = new JSZip();
    
    generatedFiles.forEach(gf => {
      zip.file(gf.filename, gf.content);
    });

    zip.file('README-IMPORTACION.txt', generateReadme(config.projectName, generatedFiles, allWarnings));

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    return new NextResponse(zipBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${config.projectName.replace(/\s+/g, '_')}_elementor.zip"`,
      },
    });

  } catch (error: any) {
    console.error('Error generating export:', error);
    return NextResponse.json({ error: error.message || 'Error generating export' }, { status: 500 });
  }
}
