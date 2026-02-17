import fs from 'fs';
import * as parser from '@babel/parser';

/**
 * Parses an Ember component into an Abstract Syntax Tree (AST).
 * Accepts either a file path or raw JavaScript code string.
 * @param {string} filePathOrCode - File path to an Ember component or raw JavaScript code
 * @returns {object} Babel AST representing the parsed component
 * @throws {Error} Throws 'Ember component syntax error' if parsing fails
 */
export function parseEmberComponent(filePathOrCode) {
  let code;

  if (fs.existsSync(filePathOrCode)) {
    code = fs.readFileSync(filePathOrCode, 'utf-8');
  } else {
    code = filePathOrCode;
  }

  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['classProperties', 'decorators-legacy'],
    });
    return ast;
  } catch {
    throw new Error('Ember component syntax error');
  }
}
