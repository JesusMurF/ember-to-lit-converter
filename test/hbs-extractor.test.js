import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHbsTemplate } from '../src/hbs-parser.js';
import { extractTemplateInfo } from '../src/hbs-extractor.js';

test('extractTemplateInfo extracts {{this.title}} as an expression node', () => {
  const ast = parseHbsTemplate('{{this.title}}');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots.length, 1);
  assert.strictEqual(info.roots[0].type, 'expression');
  assert.strictEqual(info.roots[0].code, 'this.title');
});

test('extractTemplateInfo extracts multiple {{this.*}} mustaches as expression nodes', () => {
  const ast = parseHbsTemplate('{{this.firstName}} {{this.lastName}}');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots.length, 2);
  assert.strictEqual(info.roots[0].code, 'this.firstName');
  assert.strictEqual(info.roots[1].code, 'this.lastName');
});

test('extractTemplateInfo ignores non-this.* mustache and returns empty roots', () => {
  const ast = parseHbsTemplate('{{someHelper}}');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots.length, 0);
});

test('extractTemplateInfo returns empty roots for empty template', () => {
  const ast = parseHbsTemplate('');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots.length, 0);
});
