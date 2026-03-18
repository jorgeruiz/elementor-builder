import { parseHtmlToAst } from './lib/html-parser';
import { detectSections } from './lib/section-detector';
import { generateElementorJson } from './lib/json-generator';
import { validateElementorJson } from './lib/validators';

const testHtmls = {
  landing: `<html><body><header id="header"><h1>Logo</h1></header><section class="hero"><h1>Welcome</h1><p>Test</p><a class="btn" href="#">Click</a></section><section class="features"><h2>Features</h2><ul><li>A</li><li>B</li></ul></section><footer id="footer"><p>Copyright</p></footer></body></html>`,
  large: `<html><body><header>Nav</header>${Array(150).fill('<section class="content"><h2>Content Block</h2><p>Lorem ipsum</p><img src="test.jpg"/></section>').join('')}<footer>End</footer></body></html>`,
  broken: `<html><body><header><h1>Unclosed Tag</header><section><p>Test</p></section></body></html>`
};

async function runTest(name: string, html: string) {
  console.log('\\n--- TEST: ' + name + ' ---');
  try {
    const ast = parseHtmlToAst(html);
    const sections = detectSections(ast);
    console.log('Detected ' + sections.length + ' sections.');
    
    const files = generateElementorJson(sections, {
      projectName: name,
      pageType: 'landing',
      outputPreference: 'both',
      fidelity: 'high',
      style: 'native',
      maxFileSizeKb: 100,
      usePlaceholders: true,
      language: 'es'
    });

    console.log('Generated ' + files.length + ' files.');
    
    for (const f of files) {
      const report = validateElementorJson(f.content);
      if (!report.isValid) {
        console.error('Validación falló para ' + f.filename + ': ', report.errors);
      } else {
        console.log('✔ Archivo validado: ' + f.filename);
      }
    }
  } catch (err: any) {
    console.error('Error during test:', err.message);
  }
}

async function main() {
  await runTest('Caso 1: Landing', testHtmls.landing);
  await runTest('Caso 3: Página Gigante', testHtmls.large);
  await runTest('Caso 5: Rota', testHtmls.broken);
}

main();
