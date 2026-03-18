import { ElementorTemplate, ElementorElement } from '@/types/elementor';

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateElementorJson(jsonStr: string): ValidationReport {
  const report: ValidationReport = {
    isValid: true,
    errors: [],
    warnings: []
  };

  let obj: ElementorTemplate;
  try {
    obj = JSON.parse(jsonStr);
  } catch (e) {
    report.isValid = false;
    report.errors.push('El archivo no es un JSON válido (Posible truncamiento).');
    return report;
  }

  if (!obj.version || !obj.content || !Array.isArray(obj.content)) {
    report.isValid = false;
    report.errors.push('Estructura base de Elementor no encontrada.');
    return report;
  }

  // Verificar elementos truncados (objetos vacíos en arrays por cortes de string)
  const countNodes = (els: ElementorElement[]): number => {
    let c = els.length;
    for (const el of els) {
      if (!el.id || !el.elType) {
        report.errors.push('Se detectó un nodo corrupto o incompleto sin elType o ID.');
        report.isValid = false;
      }
      if (el.elements && Array.isArray(el.elements)) {
        c += countNodes(el.elements);
      }
    }
    return c;
  };

  const total = countNodes(obj.content);
  if (total === 0) {
    report.warnings.push('El JSON resultante no contiene widgets visuales.');
  }

  return report;
}
