import fs from 'fs';
import * as parser from '@babel/parser';

export function parseEmberComponent(filePathOrCode) {
  let code;

  // Detectar si es una ruta de archivo o código directo
  if (fs.existsSync(filePathOrCode)) {
    // Es una ruta de archivo, leer el contenido
    code = fs.readFileSync(filePathOrCode, 'utf-8');
  } else {
    // Es código directo
    code = filePathOrCode;
  }

  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['classProperties', 'decorators-legacy'],
    });
    return ast;
  } catch (error) {
    throw new Error('Ember component syntax error');
  }
}
