import { test } from 'node:test';
import assert from 'node:assert';
import { generateLitComponent } from '../src/generator.js';

test('generateLitComponent generates correct Lit code from minimal component structure', () => {
  const info = {
    className: 'MinimalComponent',
    trackedProperties: [],
    imports: []
  };

  const output = generateLitComponent(info);

  // Verify basic Lit imports
  assert.ok(output.includes(`import { LitElement, html } from 'lit';`));

  // Should NOT include property decorator import (no properties)
  assert.ok(!output.includes(`import { property }`));

  // Verify class declaration
  assert.ok(output.includes('export class MinimalComponent extends LitElement'));

  // Verify render method with TODO
  assert.ok(output.includes('render()'));
  assert.ok(output.includes('<!-- TODO: Convertir template Handlebars -->'));
});

test('generateLitComponent includes tracked properties correctly with @property decorator', () => {
  const info = {
    className: 'CounterComponent',
    trackedProperties: [
      { name: 'count', initialValue: 0 },
      { name: 'isActive', initialValue: true },
      { name: 'message', initialValue: null }
    ],
    imports: []
  };

  const output = generateLitComponent(info);

  // Verify property decorator import is included
  assert.ok(output.includes(`import { property } from 'lit/decorators.js';`));

  // Verify each property with correct decorator and initial value
  assert.ok(output.includes('@property() count = 0;'));
  assert.ok(output.includes('@property() isActive = true;'));
  assert.ok(output.includes('@property() message;'));

  // Verify class name
  assert.ok(output.includes('export class CounterComponent extends LitElement'));
});

test('generateLitComponent handles empty or incomplete input correctly', () => {
  // Case 1: Null className (edge case - might happen during malformed extraction)
  const infoNullClass = {
    className: null,
    trackedProperties: [],
    imports: []
  };

  const outputNull = generateLitComponent(infoNullClass);

  // Should still generate output with null in class name
  assert.ok(outputNull.includes('export class null extends LitElement'));
  assert.ok(outputNull.includes(`import { LitElement, html } from 'lit';`));

  // Case 2: Empty properties
  const infoEmpty = {
    className: 'EmptyComponent',
    trackedProperties: [],
    imports: []
  };

  const outputEmpty = generateLitComponent(infoEmpty);

  // Should generate valid component without property decorator import
  assert.ok(outputEmpty.includes('export class EmptyComponent extends LitElement'));
  assert.ok(!outputEmpty.includes('import { property }'));
  assert.ok(outputEmpty.includes('render()'));

  // Case 3: Single property to verify structure
  const infoSingle = {
    className: 'SinglePropComponent',
    trackedProperties: [{ name: 'value', initialValue: 42 }],
    imports: []
  };

  const outputSingle = generateLitComponent(infoSingle);

  assert.ok(outputSingle.includes('@property() value = 42;'));
  assert.ok(outputSingle.includes('import { property }'));
});

test('generateLitComponent returns valid non-empty JavaScript string', () => {
  const info = {
    className: 'TestComponent',
    trackedProperties: [{ name: 'data', initialValue: 'test' }],
    imports: []
  };

  const output = generateLitComponent(info);

  // Verify it's a string
  assert.strictEqual(typeof output, 'string');

  // Verify it's not empty
  assert.ok(output.length > 0);

  // Verify it contains basic JavaScript structure indicators
  assert.ok(output.includes('import'));
  assert.ok(output.includes('export'));
  assert.ok(output.includes('class'));
  assert.ok(output.includes('extends'));

  // Verify string is properly formatted with newlines
  assert.ok(output.includes('\n'));

  // Verify no undefined or null strings appear in output
  assert.ok(!output.includes('undefined'));
});

test('generateLitComponent generates method without parameters', () => {
  const info = {
    className: 'ButtonComponent',
    trackedProperties: [],
    imports: [],
    methods: [
      { name: 'handleClick', params: [] }
    ]
  };

  const output = generateLitComponent(info);

  // Verify method is generated
  assert.ok(output.includes('handleClick()'));

  // Verify method appears before render method
  const handleClickIndex = output.indexOf('handleClick()');
  const renderIndex = output.indexOf('render()');
  assert.ok(handleClickIndex < renderIndex);
});

test('generateLitComponent generates method with parameters', () => {
  const info = {
    className: 'FormComponent',
    trackedProperties: [],
    imports: [],
    methods: [
      { name: 'submitForm', params: ['event', 'data'] }
    ]
  };

  const output = generateLitComponent(info);

  // Verify method is generated with correct parameters
  assert.ok(output.includes('submitForm(event, data)'));

  // Verify method structure
  assert.ok(output.includes('submitForm(event, data) {'));
});

test('generateLitComponent generates multiple methods', () => {
  const info = {
    className: 'CalculatorComponent',
    trackedProperties: [],
    imports: [],
    methods: [
      { name: 'add', params: ['a', 'b'] },
      { name: 'subtract', params: ['x', 'y'] },
      { name: 'reset', params: [] }
    ]
  };

  const output = generateLitComponent(info);

  // Verify all methods are generated
  assert.ok(output.includes('add(a, b)'));
  assert.ok(output.includes('subtract(x, y)'));
  assert.ok(output.includes('reset()'));

  // Verify methods appear in order
  const addIndex = output.indexOf('add(a, b)');
  const subtractIndex = output.indexOf('subtract(x, y)');
  const resetIndex = output.indexOf('reset()');

  assert.ok(addIndex < subtractIndex);
  assert.ok(subtractIndex < resetIndex);
});
