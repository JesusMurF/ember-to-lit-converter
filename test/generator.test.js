import { test } from 'node:test';
import assert from 'node:assert';
import { generateLitComponent } from '../src/generator.js';

test('generateLitComponent generates correct Lit code from minimal component structure', () => {
  const info = {
    className: 'MinimalComponent',
    trackedProperties: [],
    imports: [],
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes(`import { LitElement, html } from 'lit';`));
  assert.ok(!output.includes(`import { property }`));
  assert.ok(
    output.includes('export class MinimalComponent extends LitElement'),
  );
  assert.ok(output.includes('render()'));
  assert.ok(output.includes('<!-- TODO: Convertir template Handlebars -->'));
});

test('generateLitComponent includes tracked properties correctly with @property decorator', () => {
  const info = {
    className: 'CounterComponent',
    trackedProperties: [
      { name: 'count', initialValue: 0 },
      { name: 'isActive', initialValue: true },
      { name: 'message', initialValue: null },
    ],
    imports: [],
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes(`import { property } from 'lit/decorators.js';`));
  assert.ok(output.includes('@property() count = 0;'));
  assert.ok(output.includes('@property() isActive = true;'));
  assert.ok(output.includes('@property() message;'));
  assert.ok(
    output.includes('export class CounterComponent extends LitElement'),
  );
});

test('generateLitComponent handles empty or incomplete input correctly', () => {
  // Case 1: Null className (edge case - might happen during malformed extraction)
  const infoNullClass = {
    className: null,
    trackedProperties: [],
    imports: [],
  };

  const outputNull = generateLitComponent(infoNullClass);

  // Should still generate output with null in class name
  assert.ok(outputNull.includes('export class null extends LitElement'));
  assert.ok(outputNull.includes(`import { LitElement, html } from 'lit';`));

  // Case 2: Empty properties
  const infoEmpty = {
    className: 'EmptyComponent',
    trackedProperties: [],
    imports: [],
  };

  const outputEmpty = generateLitComponent(infoEmpty);

  // Should generate valid component without property decorator import
  assert.ok(
    outputEmpty.includes('export class EmptyComponent extends LitElement'),
  );
  assert.ok(!outputEmpty.includes('import { property }'));
  assert.ok(outputEmpty.includes('render()'));

  // Case 3: Single property to verify structure
  const infoSingle = {
    className: 'SinglePropComponent',
    trackedProperties: [{ name: 'value', initialValue: 42 }],
    imports: [],
  };

  const outputSingle = generateLitComponent(infoSingle);

  assert.ok(outputSingle.includes('@property() value = 42;'));
  assert.ok(outputSingle.includes('import { property }'));
});

test('generateLitComponent returns valid non-empty JavaScript string', () => {
  const info = {
    className: 'TestComponent',
    trackedProperties: [{ name: 'data', initialValue: 'test' }],
    imports: [],
  };

  const output = generateLitComponent(info);

  assert.strictEqual(typeof output, 'string');
  assert.ok(output.length > 0);
  assert.ok(output.includes('import'));
  assert.ok(output.includes('export'));
  assert.ok(output.includes('class'));
  assert.ok(output.includes('extends'));
  assert.ok(output.includes('\n'));
  assert.ok(!output.includes('undefined'));
});

test('generateLitComponent generates method without parameters', () => {
  const info = {
    className: 'ButtonComponent',
    trackedProperties: [],
    imports: [],
    methods: [{ name: 'handleClick', params: [], body: "{\n  console.log('clicked');\n}" }],
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('handleClick()'));
  assert.ok(output.includes("console.log('clicked')"));

  const handleClickIndex = output.indexOf('handleClick()');
  const renderIndex = output.indexOf('render()');
  assert.ok(handleClickIndex < renderIndex);
});

test('generateLitComponent generates method with parameters', () => {
  const info = {
    className: 'FormComponent',
    trackedProperties: [],
    imports: [],
    methods: [{ name: 'submitForm', params: ['event', 'data'], body: '{\n  event.preventDefault();\n  console.log(data);\n}' }],
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('submitForm(event, data)'));
  assert.ok(output.includes('submitForm(event, data) {'));
  assert.ok(output.includes('event.preventDefault()'));
});

test('generateLitComponent generates multiple methods', () => {
  const info = {
    className: 'CalculatorComponent',
    trackedProperties: [],
    imports: [],
    methods: [
      { name: 'add', params: ['a', 'b'], body: '{\n  return a + b;\n}' },
      { name: 'subtract', params: ['x', 'y'], body: '{\n  return x - y;\n}' },
      { name: 'reset', params: [], body: '{\n  this.result = 0;\n}' },
    ],
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('add(a, b)'));
  assert.ok(output.includes('subtract(x, y)'));
  assert.ok(output.includes('reset()'));

  const addIndex = output.indexOf('add(a, b)');
  const subtractIndex = output.indexOf('subtract(x, y)');
  const resetIndex = output.indexOf('reset()');

  assert.ok(addIndex < subtractIndex);
  assert.ok(subtractIndex < resetIndex);
});

test('generateLitComponent generates getter', () => {
  const info = {
    className: 'TestComponent',
    trackedProperties: [],
    imports: [],
    methods: [],
    getters: [{ name: 'fullName', body: '{\n  return this.firstName + this.lastName;\n}' }],
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('get fullName()'));
  assert.ok(output.includes('return this.firstName + this.lastName'));
});

test('generateLitComponent generates multiple getters', () => {
  const info = {
    className: 'PersonComponent',
    trackedProperties: [],
    imports: [],
    methods: [],
    getters: [
      { name: 'fullName', body: '{\n  return this.first + this.last;\n}' },
      { name: 'initials', body: '{\n  return this.first[0] + this.last[0];\n}' },
    ],
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('get fullName()'));
  assert.ok(output.includes('return this.first + this.last'));
  assert.ok(output.includes('get initials()'));
  assert.ok(output.includes('return this.first[0] + this.last[0]'));
});

test('generateLitComponent maintains standard class order: properties, getters, methods, render', () => {
  const info = {
    className: 'CompleteComponent',
    trackedProperties: [{ name: 'count', initialValue: 0 }],
    imports: [],
    methods: [{ name: 'increment', params: [], body: '{\n  this.count++;\n}' }],
    getters: [{ name: 'doubleCount', body: '{\n  return this.count * 2;\n}' }],
  };

  const output = generateLitComponent(info);

  // Find positions of each section
  const propertyIndex = output.indexOf('@property() count');
  const getterIndex = output.indexOf('get doubleCount()');
  const methodIndex = output.indexOf('increment()');
  const renderIndex = output.indexOf('render()');

  // Verify all sections are present
  assert.ok(propertyIndex > -1, 'property should be present');
  assert.ok(getterIndex > -1, 'getter should be present');
  assert.ok(methodIndex > -1, 'method should be present');
  assert.ok(renderIndex > -1, 'render should be present');

  // Verify correct order: properties < getters < methods < render
  assert.ok(
    propertyIndex < getterIndex,
    'properties should come before getters',
  );
  assert.ok(getterIndex < methodIndex, 'getters should come before methods');
  assert.ok(methodIndex < renderIndex, 'methods should come before render');
});
