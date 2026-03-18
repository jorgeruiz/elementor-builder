export type AstNodeType = 'root' | 'container' | 'heading' | 'text' | 'image' | 'button' | 'list' | 'icon' | 'unknown';

export interface AstNode {
  type: AstNodeType;
  tagName: string;
  classes: string[];
  id?: string;
  content?: string;
  src?: string;
  href?: string;
  alt?: string;
  children: AstNode[];
  // Original HTML if needed for fallback
  raw?: string;
}

export interface ParsedSection {
  id: string;
  semanticRole: 'header' | 'hero' | 'features' | 'content' | 'footer' | 'unknown';
  name: string;
  nodes: AstNode[];
  elementCount: number;
}
