import fs from 'fs';
import { extractComponentInfo } from './extractor.js';
import { generateLitComponent } from './generator.js';
import { parseEmberComponent } from './parser.js';
import { parseHbsTemplate } from './hbs-parser.js';
import { extractTemplateInfo } from './hbs-extractor.js';

const jsPath = './src/examples/user-card.js';
const hbsPath = './src/examples/user-card.hbs';

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
