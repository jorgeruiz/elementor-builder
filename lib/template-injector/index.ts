import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

export async function processTemplateInjection(htmlContent: string) {
  const templatePath = path.join(process.cwd(), 'public', 'plantilla-base-universal-elementor.json');
  let templateStr = fs.readFileSync(templatePath, 'utf-8');
  
  // Encontrar dinámicamente todos los placeholders __ALGO__
  const matches = [...templateStr.matchAll(/__([A-Z0-9_]+)__/g)];
  const placeholders = [...new Set(matches.map(m => m[0]))];
  
  if (placeholders.length === 0) {
    throw new Error('La plantilla base no contiene placeholders (ej. __TITULO__).');
  }

  // Construir un esquema Zod estructurado para instruir al LLM basado en los marcadores encontrados
  const schemaShape: Record<string, z.ZodString> = {};
  for (const ph of placeholders) {
    schemaShape[ph] = z.string().describe(`Extract the equivalent content for placeholder ${ph} from the HTML. If missing, return an empty string. Colors should be hex. Image URLs can be extracted from src.`);
  }
  
  const schema = z.object(schemaShape);

  // Llamar al LLM (Modelo rápido gpt-4o-mini es suficiente para data extraction)
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema,
    prompt: `
      You are an expert Elementor to HTML data mapper. 
      Analyze the provided HTML code representing a web page design.
      Extract the exact texts, URLs, and hex colors that correspond to the requested placeholders.
      If a placeholder isn't found in the HTML (e.g. lack of testimonials, or no 3rd CTA), return an empty string "".
      For colors like __COLOR_PRIMARIO__ or __COLOR_OSCURO__, guess the best brand hex color from the inline CSS or Tailwind classes.
      
      HTML Content:
      ${htmlContent.slice(0, 35000)}
    `,
  });

  // Reemplazar los valores recuperados por el LLM en el String de la Plantilla
  for (const [key, value] of Object.entries(object)) {
    if (typeof value === 'string' && value.trim() !== '') {
      templateStr = templateStr.replaceAll(key, value);
    } else {
      // Si el LLM no encontró valor, dejamos el texto vacío para no estropear diseño.
      templateStr = templateStr.replaceAll(key, '');
    }
  }

  // Fallback: eliminar cualquier placeholder residual que no fue macheado.
  templateStr = templateStr.replace(/__[A-Z0-9_]+__/g, '');

  return JSON.parse(templateStr);
}
