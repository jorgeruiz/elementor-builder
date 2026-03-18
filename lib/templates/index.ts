import { ElementorTemplate, ElementorElement } from '@/types/elementor';

export function createBaseTemplate(title: string, elements: ElementorElement[]): ElementorTemplate {
  return {
    version: '0.4',
    title: title,
    type: 'page',
    page_settings: {},
    content: elements
  };
}

// Helpers para crear cascarones de elementos vacíos
import { v4 as uuidv4 } from 'uuid';

export function createSection(children: ElementorElement[], isInner = false): ElementorElement {
  return {
    id: uuidv4().substring(0, 7),
    elType: 'section',
    settings: {
      content_width: 'boxed',
    },
    elements: children,
    isInner
  };
}

export function createColumn(children: ElementorElement[], width = '100'): ElementorElement {
  return {
    id: uuidv4().substring(0, 7),
    elType: 'column',
    settings: {
      _column_size: width
    },
    elements: children,
    isInner: false
  };
}

export function createWidget(type: import('@/types/elementor').WidgetType, settings: Record<string, any>): ElementorElement {
  return {
    id: uuidv4().substring(0, 7),
    elType: 'widget',
    widgetType: type,
    settings,
    elements: [],
    isInner: false
  };
}
