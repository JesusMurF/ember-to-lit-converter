import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateLitComponent } from '../src/generator.js';

const baseInfo = {
  className: 'MyComponent',
  trackedProperties: [],
  services: [],
  imports: [],
  methods: [],
  getters: [],
  setters: [],
  classConstructor: null,
};

test('generateLitComponent renders ${this.title} when template has a single expression node', () => {
  const info = {
    ...baseInfo,
    template: { roots: [{ type: 'expression', code: 'this.title' }] },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('${this.title}'));
  assert.ok(!output.includes('TODO: Convertir template Handlebars'));
});

test('generateLitComponent renders TODO placeholder when template is null', () => {
  const info = { ...baseInfo, template: null };

  const output = generateLitComponent(info);

  assert.ok(output.includes('TODO: Convertir template Handlebars'));
});

test('generateLitComponent renders TODO placeholder when template.roots is empty', () => {
  const info = { ...baseInfo, template: { roots: [] } };

  const output = generateLitComponent(info);

  assert.ok(output.includes('TODO: Convertir template Handlebars'));
});

test('generateLitComponent renders multiple expressions when template has several nodes', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [
        { type: 'expression', code: 'this.firstName' },
        { type: 'expression', code: 'this.lastName' },
      ],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('${this.firstName}'));
  assert.ok(output.includes('${this.lastName}'));
});

test('generateLitComponent renders a text node inside an element', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [{ type: 'element', tag: 'p', attrs: [], children: [{ type: 'text', chars: 'Hello' }] }],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('<p>Hello</p>'));
});

test('generateLitComponent renders an expression inside an element', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [
        {
          type: 'element',
          tag: 'p',
          attrs: [],
          children: [{ type: 'expression', code: 'this.name' }],
        },
      ],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('<p>${this.name}</p>'));
});

test('generateLitComponent renders static attribute', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [
        {
          type: 'element',
          tag: 'p',
          attrs: [{ name: 'class', value: { type: 'static', chars: 'btn' } }],
          children: [],
        },
      ],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('<p class="btn"></p>'));
});

test('generateLitComponent renders dynamic attribute', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [
        {
          type: 'element',
          tag: 'p',
          attrs: [{ name: 'id', value: { type: 'expression', code: 'this.itemId' } }],
          children: [],
        },
      ],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('<p id=${this.itemId}></p>'));
});

test('generateLitComponent renders concat attribute', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [
        {
          type: 'element',
          tag: 'p',
          attrs: [
            {
              name: 'class',
              value: {
                type: 'concat',
                parts: [
                  { type: 'static', chars: 'btn ' },
                  { type: 'expression', code: 'this.extra' },
                ],
              },
            },
          ],
          children: [],
        },
      ],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('<p class="btn ${this.extra}"></p>'));
});

test('generateLitComponent renders nested elements', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [
        {
          type: 'element',
          tag: 'div',
          attrs: [],
          children: [
            { type: 'element', tag: 'p', attrs: [], children: [{ type: 'text', chars: 'Hello' }] },
          ],
        },
      ],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('<div><p>Hello</p></div>'));
});
