import { NextResponse } from 'next/server';
import { parseHtmlToAst } from '@/lib/html-parser';
import { detectSections } from '@/lib/section-detector';
import { SectionMetadata } from '@/types';

export async function POST(req: Request) {
  try {
    const { htmlContent, config } = await req.json();

    if (!htmlContent) {
      return NextResponse.json({ error: 'No HTML content provided' }, { status: 400 });
    }

    // 1. Parse HTML to Custom AST
    const ast = parseHtmlToAst(htmlContent);

    // 2. Detect Sections
    const rawSections = detectSections(ast);

    // 3. Map to Presentation Metadata
    const sections: SectionMetadata[] = rawSections.map(sec => {
      // Logic for dummy warnings based on config (fidelity)
      const warnings: string[] = [];
      if (sec.elementCount > 50 && config.fidelity === 'high') {
        warnings.push('Se detectó layout grande: Se simplificará para máxima compatibilidad.');
      }
      if (sec.nodes.some(n => n.type === 'unknown')) {
        warnings.push('Contiene elementos no estándar.');
      }

      return {
        id: sec.id,
        name: sec.name,
        type: sec.semanticRole,
        elementCount: sec.elementCount,
        tokensEstimated: sec.elementCount * 8, // dummy estimation
        status: warnings.length > 0 ? 'warning' : 'success',
        warnings,
      };
    });

    // We also could return the full AST or cache it somehow (e.g. KV store), 
    // but for now we just return metadata. Next steps will send it again for building.
    return NextResponse.json({ success: true, sections });

  } catch (error: any) {
    console.error('Error in analyze API:', error);
    return NextResponse.json({ error: error.message || 'Error processing HTML' }, { status: 500 });
  }
}
