import { AstNode } from '@/types/ast';
import { ElementorElement } from '@/types/elementor';
import { createSection, createColumn, createWidget } from '@/lib/templates';

function mapNodeToWidget(node: AstNode): ElementorElement | null {
  const content = node.content || 'Lorem Ipsum';

  switch (node.type) {
    case 'heading':
      return createWidget('heading', {
        title: content,
        header_size: node.tagName
      });
    case 'text':
      return createWidget('text-editor', {
        editor: `<p>${content}</p>`
      });
    case 'button':
      return createWidget('button', {
        text: content,
        link: { url: node.href || '#' }
      });
    case 'image':
      return createWidget('image', {
        image: { url: node.src || 'https://via.placeholder.com/800x600' }
      });
    case 'icon':
      return createWidget('icon-list', {
        icon_list: [
          { text: 'Item', icon: { value: 'fas fa-check' } }
        ]
      });
    default:
      return null;
  }
}

/**
 * Convierte un AST de una sección en un árbol de Elementor (Section -> Column -> Widgets/InnerSections)
 */
export function astToElementor(node: AstNode): ElementorElement[] {
  // Caso 1: Es un widget hoja (no contenedor)
  if (node.type !== 'container' && node.type !== 'root' && node.type !== 'list') {
    const widget = mapNodeToWidget(node);
    return widget ? [widget] : [];
  }

  // Caso 2: Es un contenedor
  // Procesamos a los hijos recursivamente
  let childElements: ElementorElement[] = [];
  for (const child of node.children) {
    childElements = childElements.concat(astToElementor(child));
  }

  // Si no hay hijos útiles tras el mapeo, lo ignoramos
  if (childElements.length === 0) {
    return [];
  }

  // Si este contenedor era top level (o simulado por el section detector)
  // necesita ser envuelto en Section > Column
  if (node.tagName === 'section' || node.tagName === 'header' || node.tagName === 'footer' || node.classes.includes('unwrapped-content')) {
    const column = createColumn(childElements);
    return [createSection([column])];
  }

  // Si es un div intermedio normal (grids, flex)
  // Para Elementor puro, si un div agrupa widgets, en muchos casos lo aplanamos,
  // a menos que parezca necesitar columnas (Inner Sections). 
  // Por simplicidad estricta y anti-roturas, aplanamos si sus hijos son widgets directos.
  const containsSections = childElements.some(e => e.elType === 'section');
  if (containsSections) {
      // Si tiene inner sections, simplemente devolvemos la lista de hijos
      return childElements;
  } else {
      // Si solo tiene widgets, devolvemos la lista de widgets plana
      return childElements;
  }
}
