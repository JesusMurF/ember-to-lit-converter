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
