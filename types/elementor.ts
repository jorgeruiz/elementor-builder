export type ElementType = 'section' | 'column' | 'widget';
export type WidgetType = 'heading' | 'text-editor' | 'image' | 'button' | 'spacer' | 'divider' | 'icon-list';

export interface ElementSettings {
  [key: string]: any;
}

export interface ElementorElement {
  id: string;
  elType: ElementType;
  settings: ElementSettings;
  elements: ElementorElement[];
  isInner: boolean;
  widgetType?: WidgetType;
}

export interface ElementorTemplate {
  content: ElementorElement[];
  page_settings: any;
  version: string;
  title: string;
  type: string;
}
