import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHbsTemplate } from '../src/hbs-parser.js';
import { HbsSyntaxError } from '../src/errors.js';

test('parseHbsTemplate retorna un AST con body vacío para template vacío', () => {
  const ast = parseHbsTemplate('');

  assert.ok(Array.isArray(ast.body));
  assert.strictEqual(ast.body.length, 0);
});

test('parseHbsTemplate retorna un MustacheStatement para {{this.count}}', () => {
  const ast = parseHbsTemplate('{{this.count}}');

  assert.strictEqual(ast.body.length, 1);
  assert.strictEqual(ast.body[0].type, 'MustacheStatement');
  assert.strictEqual(ast.body[0].path.original, 'this.count');
});

test('parseHbsTemplate lanza Ember template syntax error con HBS inválido', () => {
  assert.throws(() => parseHbsTemplate('{{#if}}'), HbsSyntaxError);
});
