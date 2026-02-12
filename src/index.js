import { extractComponentInfo } from './extractor.js';
import { generateLitComponent } from './generator.js';
import { parseEmberComponent } from './parser.js';

const ast = parseEmberComponent('./src/example-component.js');
const info = extractComponentInfo(ast);
const litCode = generateLitComponent(info);

console.log('=== COMPONENTE LIT GENERADO ===\n');
console.log(litCode);
