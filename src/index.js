import fs from 'fs';
import { extractComponentInfo } from './extractor.js';
import { generateLitComponent } from './generator.js';
import { parseEmberComponent } from './parser.js';
import { parseHbsTemplate } from './hbs-parser.js';
import { extractTemplateInfo } from './hbs-extractor.js';

const jsPath = process.argv[2];
const hbsPath = process.argv[3];

if (!jsPath) {
  console.error('Usage: node src/index.js <component.js> [component.hbs]');
  process.exit(1);
}

const ast = parseEmberComponent(jsPath);
const info = extractComponentInfo(ast);

if (fs.existsSync(hbsPath)) {
  const hbs = fs.readFileSync(hbsPath, 'utf-8');
  const hbsAst = parseHbsTemplate(hbs);
  info.template = extractTemplateInfo(hbsAst);
}

const litCode = generateLitComponent(info);

console.log('=== INFORMACIÓN EXTRAÍDA DEL COMPONENTE ===\n');
console.log(info);

console.log('=== COMPONENTE LIT GENERADO ===\n');
console.log(litCode);
