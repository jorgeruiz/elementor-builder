import { AstNode, ParsedSection } from '@/types/ast';
import { countAstElements } from '@/lib/html-parser';
import { v4 as uuidv4 } from 'uuid';

/**
 * Intenta inferir el rol semántico de una sección basado en sus clases, ID o contenio.
 */
function inferSemanticRole(node: AstNode, index: number, isLast: boolean): ParsedSection['semanticRole'] {
  const identifiers = [...node.classes, node.id || '', node.tagName].join(' ').toLowerCase();

  if (identifiers.includes('header') || identifiers.includes('nav') || node.tagName === 'header') {
    return 'header';
  }
  if (identifiers.includes('footer') || node.tagName === 'footer' || isLast) {
    return 'footer';
  }
  if (identifiers.includes('hero') || identifiers.includes('banner') || (index === 0 && countAstElements(node) > 5)) {
    return 'hero';
  }
  if (identifiers.includes('feat') || identifiers.includes('service') || identifiers.includes('benefit')) {
    return 'features';
  }
  
  return 'content';
}

function generateSectionName(role: string, index: number): string {
  const names: Record<string, string> = {
    header: 'Header / Nav',
    footer: 'Footer',
    hero: 'Hero Section',
    features: 'Features / Benefits',
    content: `Content Block ${index + 1}`,
    unknown: `Generic Section ${index + 1}`
  };
  return names[role] || names['unknown'];
}

/**
 * Toma el nodo raíz y lo divide en secciones de primer nivel.
 * Si el body tiene divs wrappers (ej. #root, .app), intenta bajar un nivel para encontrar las secciones reales.
 */
export function detectSections(rootAst: AstNode): ParsedSection[] {
  let candidates: AstNode[] = [];

  // Si el root tiene un solo container hijo masivo (ej. React/Next root), bajar un nivel.
  let currentRoot = rootAst;
  while (currentRoot.children.length === 1 && currentRoot.children[0].type === 'container') {
    currentRoot = currentRoot.children[0];
  }

  // Identificar candidatos a sección
  for (const child of currentRoot.children) {
    if (child.type === 'container' || child.tagName === 'section' || child.tagName === 'header' || child.tagName === 'footer') {
      candidates.push(child);
    } else if (child.type !== 'text' || (child.content && child.content.trim())) {
      // Elementos sueltos fuera de secciones se agrupan en un dummy container
      candidates.push({
        type: 'container',
        tagName: 'div',
        classes: ['unwrapped-content'],
        children: [child]
      });
    }
  }

  // Filtrar contenedores vacíos o inútiles
  candidates = candidates.filter(c => countAstElements(c) > 0);

  const sections: ParsedSection[] = candidates.map((node, i) => {
    const role = inferSemanticRole(node, i, i === candidates.length - 1);
    const elementCount = countAstElements(node);
    return {
      id: uuidv4(),
      semanticRole: role,
      name: generateSectionName(role, i),
      nodes: [node],
      elementCount,
    };
  });

  return sections;
}
