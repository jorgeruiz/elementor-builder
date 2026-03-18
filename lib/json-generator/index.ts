import { ParsedSection } from '@/types/ast';
import { ElementorElement, ElementorTemplate } from '@/types/elementor';
import { astToElementor } from '@/lib/elementor-mapper';
import { createBaseTemplate } from '@/lib/templates';
import { ProjectConfig } from '@/types';

const MAX_WIDGETS_PER_FILE = 80;

interface GeneratedFile {
  filename: string;
  content: string;
  isFullPage: boolean;
}

export function generateElementorJson(sections: ParsedSection[], config: ProjectConfig): GeneratedFile[] {
  const generated: GeneratedFile[] = [];
  
  // 1. Convert AST to Elementor Nodes per section
  const sectionElements = sections.map(sec => {
    return {
      name: sec.name,
      id: sec.id,
      elements: astToElementor({ type: 'root', tagName: 'root', classes: [], children: sec.nodes })
    };
  });

  // Calculate total size/complexity
  const totalElements = sections.reduce((acc, curr) => acc + curr.elementCount, 0);

  // 2. Decide strategy based on config and size
  const shouldSplit = totalElements > MAX_WIDGETS_PER_FILE || config.outputPreference === 'sections';

  // 3. Generate Full Page if requested and not strictly strictly forced otherwise
  if (config.outputPreference !== 'sections') {
    const allContent = sectionElements.flatMap(s => s.elements);
    const fullTemplate = createBaseTemplate(`${config.projectName} - Full Page`, allContent);
    generated.push({
      filename: `${config.projectName.replace(/\s+/g, '_').toLowerCase()}_full.json`,
      content: JSON.stringify(fullTemplate, null, 2),
      isFullPage: true
    });
  }

  // 4. Generate Split chunks if needed or requested
  if (shouldSplit || config.outputPreference === 'both') {
    sectionElements.forEach((sec, idx) => {
      // Create a template just for this section
      const secTemplate = createBaseTemplate(`${config.projectName} - Phase ${idx + 1} (${sec.name})`, sec.elements);
      generated.push({
        filename: `0${idx + 1}_${sec.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.json`,
        content: JSON.stringify(secTemplate, null, 2),
        isFullPage: false
      });
    });
  }

  return generated;
}
