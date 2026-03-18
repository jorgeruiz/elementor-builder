import * as cheerio from 'cheerio';
import { AstNode, AstNodeType } from '@/types/ast';

/**
 * Mapea etiquetas HTML comunes a tipos simplificados para Elementor.
 */
function getNodeType(tagName: string, $el: any): AstNodeType {
  const tag = tagName.toLowerCase();
  
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) return 'heading';
  if (['p', 'span', 'strong', 'em', 'b', 'i', 'blockquote'].includes(tag)) return 'text';
  if (['img', 'picture', 'svg'].includes(tag)) return 'image';
  if (tag === 'a' || $el.hasClass('btn') || $el.hasClass('button')) return 'button';
  if (['ul', 'ol', 'dl'].includes(tag)) return 'list';
  if (['div', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside'].includes(tag)) return 'container';
  if (['i', 'svg'].includes(tag) && ($el.hasClass('icon') || $el.hasClass('fa'))) return 'icon';

  return 'unknown';
}

function parseElement(el: any, $: any): AstNode | null {
  if (el.type === 'comment' || el.type === 'directive') return null;

  if (el.type === 'text') {
    const text = $(el).text().trim();
    if (!text) return null;
    return {
      type: 'text',
      tagName: 'textnode',
      classes: [],
      content: text,
      children: []
    };
  }

  const $el = $(el);
  const tagName = el.tagName || 'unknown';
  const type = getNodeType(tagName, $el);
  
  // Ignorar scripts, styles, etc.
  if (['script', 'style', 'noscript', 'meta', 'link', 'head', 'title'].includes(tagName.toLowerCase())) {
    return null;
  }

  const classes = $el.attr('class')?.split(' ').filter(Boolean) || [];
  const id = $el.attr('id');
  const src = $el.attr('src');
  const href = $el.attr('href');
  const alt = $el.attr('alt');
  const content = (type === 'heading' || type === 'text' || type === 'button') && el.children.length === 1 && el.children[0].type === 'text' 
    ? $(el).text().trim() : undefined;

  const children: AstNode[] = [];
  
  // Recursivamente procesar hijos
  el.childNodes.forEach((child: any) => {
    const parsedChild = parseElement(child, $);
    if (parsedChild) {
      children.push(parsedChild);
    }
  });

  return {
    type,
    tagName: tagName.toLowerCase(),
    classes,
    id,
    content,
    src,
    href,
    alt,
    children
  };
}

/**
 * Toma un string HTML y lo convierte en un AST filtrado y estructurado.
 */
export function parseHtmlToAst(html: string): AstNode {
  const $ = cheerio.load(html);
  const body = $('body').length ? $('body')[0] : $.root()[0];
  
  const rootNode = parseElement(body, $);
  
  return rootNode || { 
    type: 'root', 
    tagName: 'root', 
    classes: [], 
    children: [] 
  };
}

/**
 * Cuenta el total de elementos válidos en un sub-árbol AST.
 */
export function countAstElements(node: AstNode): number {
  let count = node.type !== 'container' && node.type !== 'root' ? 1 : 0;
  for (const child of node.children) {
    count += countAstElements(child);
  }
  return count;
}
