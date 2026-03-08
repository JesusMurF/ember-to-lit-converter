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

// {{#if}} — PathExpression conditions

test('extractTemplateInfo extracts {{#if this.isActive}} as conditional node', () => {
  const ast = parseHbsTemplate('{{#if this.isActive}}<p>Hi</p>{{/if}}');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots.length, 1);
  const node = info.roots[0];
  assert.strictEqual(node.type, 'conditional');
  assert.strictEqual(node.condition, 'this.isActive');
  assert.strictEqual(node.isTodo, false);
  assert.strictEqual(node.consequent.length, 1);
  assert.strictEqual(node.consequent[0].type, 'element');
  assert.strictEqual(node.alternate, null);
});

test('extractTemplateInfo extracts {{#if}} with {{else}} branch', () => {
  const ast = parseHbsTemplate('{{#if this.isActive}}<p>Hi</p>{{else}}<p>Bye</p>{{/if}}');
  const info = extractTemplateInfo(ast);

  const node = info.roots[0];
  assert.strictEqual(node.type, 'conditional');
  assert.notStrictEqual(node.alternate, null);
  assert.strictEqual(node.alternate.length, 1);
  assert.strictEqual(node.alternate[0].type, 'element');
});

test('extractTemplateInfo extracts {{#if}} with mustache in consequent', () => {
  const ast = parseHbsTemplate('{{#if this.isActive}}{{this.name}}{{/if}}');
  const info = extractTemplateInfo(ast);

  const node = info.roots[0];
  assert.strictEqual(node.consequent.length, 1);
  assert.strictEqual(node.consequent[0].type, 'expression');
  assert.strictEqual(node.consequent[0].code, 'this.name');
});

test('extractTemplateInfo extracts {{#if}} with nested element in consequent', () => {
  const ast = parseHbsTemplate('{{#if this.show}}<div><p>Nested</p></div>{{/if}}');
  const info = extractTemplateInfo(ast);

  const node = info.roots[0];
  assert.strictEqual(node.consequent[0].type, 'element');
  assert.strictEqual(node.consequent[0].tag, 'div');
  assert.strictEqual(node.consequent[0].children[0].tag, 'p');
});

test('extractTemplateInfo extracts nested {{#if}} blocks', () => {
  const ast = parseHbsTemplate('{{#if this.a}}{{#if this.b}}<p>X</p>{{/if}}{{/if}}');
  const info = extractTemplateInfo(ast);

  const outer = info.roots[0];
  assert.strictEqual(outer.type, 'conditional');
  assert.strictEqual(outer.consequent[0].type, 'conditional');
  assert.strictEqual(outer.consequent[0].condition, 'this.b');
});

// {{#if}} — SubExpression helpers

test('extractTemplateInfo extracts {{#if (eq this.status "active")}} condition', () => {
  const ast = parseHbsTemplate('{{#if (eq this.status "active")}}<p>Ok</p>{{/if}}');
  const info = extractTemplateInfo(ast);

  const node = info.roots[0];
  assert.strictEqual(node.condition, "(this.status === 'active')");
  assert.strictEqual(node.isTodo, false);
});

test('extractTemplateInfo extracts {{#if (not-eq this.status "inactive")}} condition', () => {
  const ast = parseHbsTemplate('{{#if (not-eq this.status "inactive")}}...{{/if}}');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots[0].condition, "(this.status !== 'inactive')");
});

test('extractTemplateInfo extracts {{#if (or this.a this.b)}} condition', () => {
  const ast = parseHbsTemplate('{{#if (or this.a this.b)}}...{{/if}}');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots[0].condition, '(this.a || this.b)');
});

test('extractTemplateInfo extracts {{#if (and this.a this.b)}} condition', () => {
  const ast = parseHbsTemplate('{{#if (and this.a this.b)}}...{{/if}}');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots[0].condition, '(this.a && this.b)');
});

test('extractTemplateInfo extracts {{#if (not this.flag)}} condition', () => {
  const ast = parseHbsTemplate('{{#if (not this.flag)}}...{{/if}}');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots[0].condition, '!this.flag');
});

test('extractTemplateInfo extracts nested SubExpression in {{#if}}', () => {
  const ast = parseHbsTemplate('{{#if (eq this.a (eq this.b "x"))}}...{{/if}}');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots[0].condition, "(this.a === (this.b === 'x'))");
  assert.strictEqual(info.roots[0].isTodo, false);
});

test('extractTemplateInfo marks unknown helper in {{#if}} as TODO', () => {
  const ast = parseHbsTemplate('{{#if (unknownHelper this.a)}}...{{/if}}');
  const info = extractTemplateInfo(ast);

  const node = info.roots[0];
  assert.strictEqual(node.isTodo, true);
  assert.ok(node.condition.includes('TODO'));
});

// {{#each}}

test('extractTemplateInfo extracts {{#each this.items as |item|}} as each node', () => {
  const ast = parseHbsTemplate('{{#each this.items as |item|}}<p>{{item.name}}</p>{{/each}}');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots.length, 1);
  const node = info.roots[0];
  assert.strictEqual(node.type, 'each');
  assert.strictEqual(node.iterable, 'this.items');
  assert.strictEqual(node.item, 'item');
  assert.strictEqual(node.children.length, 1);
  assert.strictEqual(node.children[0].type, 'element');
  assert.strictEqual(node.children[0].tag, 'p');
});

test('extractTemplateInfo extracts each with expression child', () => {
  const ast = parseHbsTemplate('{{#each this.users as |user|}}{{user.name}}{{/each}}');
  const info = extractTemplateInfo(ast);

  const node = info.roots[0];
  assert.strictEqual(node.type, 'each');
  assert.strictEqual(node.iterable, 'this.users');
  assert.strictEqual(node.item, 'user');
  assert.strictEqual(node.children[0].type, 'expression');
  assert.strictEqual(node.children[0].code, 'user.name');
});

test('extractTemplateInfo extracts each with multiple children', () => {
  const ast = parseHbsTemplate('{{#each this.items as |item|}}<li>{{item.title}}</li>{{/each}}');
  const info = extractTemplateInfo(ast);

  const node = info.roots[0];
  assert.strictEqual(node.type, 'each');
  assert.strictEqual(node.children.length, 1);
  assert.strictEqual(node.children[0].tag, 'li');
});

// {{#unless}}

test('extractTemplateInfo extracts {{#unless this.isHidden}} as negated conditional', () => {
  const ast = parseHbsTemplate('{{#unless this.isHidden}}<p>Visible</p>{{/unless}}');
  const info = extractTemplateInfo(ast);

  const node = info.roots[0];
  assert.strictEqual(node.type, 'conditional');
  assert.strictEqual(node.condition, '!this.isHidden');
  assert.strictEqual(node.isTodo, false);
  assert.strictEqual(node.consequent.length, 1);
  assert.strictEqual(node.alternate, null);
});

test('extractTemplateInfo extracts {{#unless}} with {{else}} branch', () => {
  const ast = parseHbsTemplate('{{#unless this.isHidden}}<p>A</p>{{else}}<p>B</p>{{/unless}}');
  const info = extractTemplateInfo(ast);

  const node = info.roots[0];
  assert.strictEqual(node.condition, '!this.isHidden');
  assert.notStrictEqual(node.alternate, null);
  assert.strictEqual(node.alternate.length, 1);
});

test('extractTemplateInfo extracts {{#unless (eq a b)}} with negated subexpression', () => {
  const ast = parseHbsTemplate('{{#unless (eq this.status "active")}}<p>No</p>{{/unless}}');
  const info = extractTemplateInfo(ast);

  const node = info.roots[0];
  assert.strictEqual(node.condition, "!(this.status === 'active')");
  assert.strictEqual(node.isTodo, false);
});

test('extractTemplateInfo marks unknown helper in {{#unless}} as TODO', () => {
  const ast = parseHbsTemplate('{{#unless (unknownHelper this.a)}}...{{/unless}}');
  const info = extractTemplateInfo(ast);

  const node = info.roots[0];
  assert.strictEqual(node.isTodo, true);
  assert.ok(node.condition.includes('TODO'));
});

// {{on}} modifier

test('extractTemplateInfo extracts {{on "click" this.handler}} as @click attr', () => {
  const ast = parseHbsTemplate('<button {{on "click" this.handleClick}}>Click</button>');
  const info = extractTemplateInfo(ast);

  const el = info.roots[0];
  assert.strictEqual(el.type, 'element');
  assert.strictEqual(el.tag, 'button');
  const attr = el.attrs[0];
  assert.strictEqual(attr.name, '@click');
  assert.strictEqual(attr.value.type, 'expression');
  assert.strictEqual(attr.value.code, 'this.handleClick');
});

test('extractTemplateInfo extracts {{on "input" this.handler}} as @input attr', () => {
  const ast = parseHbsTemplate('<input {{on "input" this.onInput}} />');
  const info = extractTemplateInfo(ast);

  const attr = info.roots[0].attrs[0];
  assert.strictEqual(attr.name, '@input');
  assert.strictEqual(attr.value.code, 'this.onInput');
});

test('extractTemplateInfo combines static attrs and on modifier attrs', () => {
  const ast = parseHbsTemplate('<button class="btn" {{on "click" this.save}}>Save</button>');
  const info = extractTemplateInfo(ast);

  const el = info.roots[0];
  assert.strictEqual(el.attrs.length, 2);
  assert.strictEqual(el.attrs[0].name, 'class');
  assert.strictEqual(el.attrs[1].name, '@click');
});

test('extractTemplateInfo emits TODO attr for unknown modifiers', () => {
  const ast = parseHbsTemplate('<div {{someModifier}}>X</div>');
  const info = extractTemplateInfo(ast);

  const attr = info.roots[0].attrs[0];
  assert.ok(attr.name.includes('todo-modifier'));
  assert.ok(attr.value.chars.includes('TODO'));
});

test('extractTemplateInfo ignores unknown block helpers', () => {
  const ast = parseHbsTemplate('{{#unknownHelper this.x}}<p>X</p>{{/unknownHelper}}');
  const info = extractTemplateInfo(ast);

  assert.strictEqual(info.roots.length, 0);
});
