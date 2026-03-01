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

test('extractTemplateInfo extracts <p>Hello</p> as element with text child', () => {
  const ast = parseHbsTemplate('<p>Hello</p>');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots.length, 1);
  assert.strictEqual(info.roots[0].type, 'element');
  assert.strictEqual(info.roots[0].tag, 'p');
  assert.strictEqual(info.roots[0].children.length, 1);
  assert.strictEqual(info.roots[0].children[0].type, 'text');
  assert.strictEqual(info.roots[0].children[0].chars, 'Hello');
});

test('extractTemplateInfo extracts nested elements', () => {
  const ast = parseHbsTemplate('<div><p>Hello</p></div>');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots.length, 1);
  assert.strictEqual(info.roots[0].tag, 'div');
  const child = info.roots[0].children[0];
  assert.strictEqual(child.type, 'element');
  assert.strictEqual(child.tag, 'p');
  assert.strictEqual(child.children[0].chars, 'Hello');
});

test('extractTemplateInfo extracts expression inside element', () => {
  const ast = parseHbsTemplate('<p>{{this.name}}</p>');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots[0].type, 'element');
  assert.strictEqual(info.roots[0].tag, 'p');
  assert.strictEqual(info.roots[0].children[0].type, 'expression');
  assert.strictEqual(info.roots[0].children[0].code, 'this.name');
});

test('extractTemplateInfo filters whitespace-only text nodes', () => {
  const ast = parseHbsTemplate('<div>  \n  </div>');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots[0].children.length, 0);
});

test('extractTemplateInfo extracts static attribute', () => {
  const ast = parseHbsTemplate('<p class="btn">Hi</p>');
  const info = extractTemplateInfo(ast);

  const attr = info.roots[0].attrs[0];
  assert.strictEqual(attr.name, 'class');
  assert.strictEqual(attr.value.type, 'static');
  assert.strictEqual(attr.value.chars, 'btn');
});

test('extractTemplateInfo extracts dynamic attribute', () => {
  const ast = parseHbsTemplate('<p id={{this.itemId}}>Hi</p>');
  const info = extractTemplateInfo(ast);

  const attr = info.roots[0].attrs[0];
  assert.strictEqual(attr.name, 'id');
  assert.strictEqual(attr.value.type, 'expression');
  assert.strictEqual(attr.value.code, 'this.itemId');
});

test('extractTemplateInfo extracts concat attribute', () => {
  const ast = parseHbsTemplate('<p class="btn {{this.extra}}">Hi</p>');
  const info = extractTemplateInfo(ast);

  const attr = info.roots[0].attrs[0];
  assert.strictEqual(attr.name, 'class');
  assert.strictEqual(attr.value.type, 'concat');
  assert.strictEqual(attr.value.parts[0].type, 'static');
  assert.strictEqual(attr.value.parts[0].chars, 'btn ');
  assert.strictEqual(attr.value.parts[1].type, 'expression');
  assert.strictEqual(attr.value.parts[1].code, 'this.extra');
});

test('extractTemplateInfo extracts element with no attributes', () => {
  const ast = parseHbsTemplate('<div>Hi</div>');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots[0].attrs.length, 0);
});
