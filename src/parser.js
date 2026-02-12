import fs from 'fs';
import * as parser from '@babel/parser';

export function parseEmberComponent(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['classProperties', 'decorators-legacy'],
  });

  return ast;
}
