import { preprocess } from '@glimmer/syntax';
import { HbsSyntaxError } from './errors.js';

/**
 * Parses an Ember Handlebars template string into a Glimmer ASTv1.
 * @param {string} hbs - Handlebars template source code
 * @returns {import('@glimmer/syntax').ASTv1.Template} Glimmer template AST
 * @throws {Error} Throws 'Ember template syntax error' if the template has syntax errors
 */
export function parseHbsTemplate(hbs) {
  try {
    return preprocess(hbs);
  } catch {
    throw new HbsSyntaxError();
  }
}
