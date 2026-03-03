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

// Conditional nodes

test('generateLitComponent renders if-conditional without else branch', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [
        {
          type: 'conditional',
          condition: 'this.isActive',
          consequent: [{ type: 'text', chars: 'Hi' }],
          alternate: null,
          isTodo: false,
        },
      ],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes("this.isActive ? html`Hi` : ''"));
});

test('generateLitComponent renders if-conditional with else branch', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [
        {
          type: 'conditional',
          condition: 'this.isActive',
          consequent: [{ type: 'text', chars: 'Hi' }],
          alternate: [{ type: 'text', chars: 'Bye' }],
          isTodo: false,
        },
      ],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('this.isActive ? html`Hi` : html`Bye`'));
});

test('generateLitComponent renders element inside conditional consequent', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [
        {
          type: 'conditional',
          condition: 'this.show',
          consequent: [{ type: 'element', tag: 'p', attrs: [], children: [{ type: 'text', chars: 'Yes' }] }],
          alternate: null,
          isTodo: false,
        },
      ],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('html`<p>Yes</p>`'));
});

test('generateLitComponent renders expression inside conditional consequent', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [
        {
          type: 'conditional',
          condition: 'this.show',
          consequent: [{ type: 'expression', code: 'this.name' }],
          alternate: null,
          isTodo: false,
        },
      ],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('html`${this.name}`'));
});

test('generateLitComponent renders TODO condition when isTodo is true', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [
        {
          type: 'conditional',
          condition: 'false /* TODO: condición compleja */',
          consequent: [{ type: 'text', chars: 'X' }],
          alternate: null,
          isTodo: true,
        },
      ],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('false /* TODO'));
});

test('generateLitComponent renders nested conditional nodes', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [
        {
          type: 'conditional',
          condition: 'this.a',
          consequent: [
            {
              type: 'conditional',
              condition: 'this.b',
              consequent: [{ type: 'text', chars: 'X' }],
              alternate: null,
              isTodo: false,
            },
          ],
          alternate: null,
          isTodo: false,
        },
      ],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes("this.b ? html`X` : ''"));
  assert.ok(output.includes('this.a ?'));
});

test('generateLitComponent interpolates helper-resolved condition string', () => {
  const info = {
    ...baseInfo,
    template: {
      roots: [
        {
          type: 'conditional',
          condition: "(this.status === 'active')",
          consequent: [{ type: 'text', chars: 'Ok' }],
          alternate: null,
          isTodo: false,
        },
      ],
    },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes("(this.status === 'active') ? html`Ok` : ''"));
});
