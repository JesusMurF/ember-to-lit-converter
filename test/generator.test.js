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

test('generateLitComponent generates constructor without parameters', () => {
  const info = {
    className: 'MyComponent',
    trackedProperties: [],
    imports: [],
    methods: [],
    getters: [],
    classConstructor: { params: [], body: '{\n  super();\n  this.name = \'default\';\n}' },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('constructor()'));
  assert.ok(output.includes('super()'));
  assert.ok(output.includes("this.name = 'default'"));
});

test('generateLitComponent generates constructor with parameters', () => {
  const info = {
    className: 'MyComponent',
    trackedProperties: [],
    imports: [],
    methods: [],
    getters: [],
    classConstructor: { params: ['owner', 'args'], body: '{\n  super(owner, args);\n  this.value = args.value;\n}' },
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('constructor(owner, args)'));
  assert.ok(output.includes('super(owner, args)'));
  assert.ok(output.includes('this.value = args.value'));
});

test('generateLitComponent constructor appears after properties in output', () => {
  const info = {
    className: 'MyComponent',
    trackedProperties: [{ name: 'count', initialValue: 0 }],
    imports: [],
    methods: [],
    getters: [],
    classConstructor: { params: ['owner', 'args'], body: '{\n  super(owner, args);\n}' },
  };

  const output = generateLitComponent(info);

  const propertyIndex = output.indexOf('@property() count');
  const constructorIndex = output.indexOf('constructor(owner, args)');

  assert.ok(propertyIndex > -1, 'property should be present');
  assert.ok(constructorIndex > -1, 'constructor should be present');
  assert.ok(propertyIndex < constructorIndex, 'properties should come before constructor');
});

test('generateLitComponent generates @action method as arrow function', () => {
  const info = {
    className: 'ButtonComponent',
    trackedProperties: [],
    imports: [],
    methods: [{ name: 'handleClick', params: [], body: "{\n  console.log('clicked');\n}", isAction: true }],
    getters: [],
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('handleClick = () =>'), 'should generate arrow function');
  assert.ok(!output.includes('handleClick()'), 'should not generate regular method');
  assert.ok(output.includes("console.log('clicked')"));
});

test('generateLitComponent generates @action method with parameters as arrow function', () => {
  const info = {
    className: 'FormComponent',
    trackedProperties: [],
    imports: [],
    methods: [{ name: 'submit', params: ['event'], body: '{\n  event.preventDefault();\n}', isAction: true }],
    getters: [],
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('submit = (event) =>'), 'should generate arrow function with params');
  assert.ok(output.includes('event.preventDefault()'));
});

test('generateLitComponent generates mixed @action and regular methods correctly', () => {
  const info = {
    className: 'FormComponent',
    trackedProperties: [],
    imports: [],
    methods: [
      { name: 'submit', params: ['event'], body: '{\n  this.send();\n}', isAction: true },
      { name: 'validate', params: [], body: '{\n  return true;\n}', isAction: false },
      { name: 'reset', params: [], body: '{\n  this.value = null;\n}', isAction: true },
    ],
    getters: [],
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('submit = (event) =>'), 'submit should be arrow function');
  assert.ok(output.includes('validate()'), 'validate should be regular method');
  assert.ok(output.includes('reset = () =>'), 'reset should be arrow function');
});

test('generateLitComponent generates setter', () => {
  const info = {
    className: 'UserComponent',
    trackedProperties: [],
    imports: [],
    methods: [],
    getters: [],
    setters: [{ name: 'fullName', param: 'value', body: '{\n  this._fullName = value;\n}' }],
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('set fullName(value)'));
  assert.ok(output.includes('this._fullName = value'));
});

test('generateLitComponent generates multiple setters', () => {
  const info = {
    className: 'PersonComponent',
    trackedProperties: [],
    imports: [],
    methods: [],
    getters: [],
    setters: [
      { name: 'firstName', param: 'value', body: '{\n  this._firstName = value;\n}' },
      { name: 'lastName', param: 'value', body: '{\n  this._lastName = value;\n}' },
    ],
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('set firstName(value)'));
  assert.ok(output.includes('this._firstName = value'));
  assert.ok(output.includes('set lastName(value)'));
  assert.ok(output.includes('this._lastName = value'));
});

test('generateLitComponent generates getter and setter with the same name', () => {
  const info = {
    className: 'UserComponent',
    trackedProperties: [],
    imports: [],
    methods: [],
    getters: [{ name: 'name', body: '{\n  return this._name;\n}' }],
    setters: [{ name: 'name', param: 'value', body: '{\n  this._name = value.trim();\n}' }],
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('get name()'));
  assert.ok(output.includes('return this._name'));
  assert.ok(output.includes('set name(value)'));
  assert.ok(output.includes('this._name = value.trim()'));

  const getterIndex = output.indexOf('get name()');
  const setterIndex = output.indexOf('set name(value)');
  assert.ok(getterIndex < setterIndex, 'getter should appear before setter');
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

test('generateLitComponent generates null stub and TODO comment for a single service', () => {
  const info = {
    className: 'MyComponent',
    trackedProperties: [],
    services: [{ name: 'store', serviceName: 'store' }],
    imports: [],
    methods: [],
    getters: [],
    setters: [],
    classConstructor: null,
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('// TODO: @service store —'), 'should include TODO comment with service name');
  assert.ok(output.includes('store = null;'), 'should declare property as null');
});

test('generateLitComponent includes custom service name in TODO comment', () => {
  const info = {
    className: 'MyComponent',
    trackedProperties: [],
    services: [{ name: 'myService', serviceName: 'my-custom-service' }],
    imports: [],
    methods: [],
    getters: [],
    setters: [],
    classConstructor: null,
  };

  const output = generateLitComponent(info);

  assert.ok(
    output.includes("// TODO: @service ('my-custom-service') myService —"),
    'should include custom service name in TODO',
  );
  assert.ok(output.includes('myService = null;'), 'should declare property as null');
});

test('generateLitComponent generates stubs for multiple services', () => {
  const info = {
    className: 'MyComponent',
    trackedProperties: [],
    services: [
      { name: 'store', serviceName: 'store' },
      { name: 'router', serviceName: 'router' },
    ],
    imports: [],
    methods: [],
    getters: [],
    setters: [],
    classConstructor: null,
  };

  const output = generateLitComponent(info);

  assert.ok(output.includes('store = null;'), 'should declare store as null');
  assert.ok(output.includes('router = null;'), 'should declare router as null');
});

test('generateLitComponent omits service section when no services present', () => {
  const info = {
    className: 'MyComponent',
    trackedProperties: [],
    services: [],
    imports: [],
    methods: [],
    getters: [],
    setters: [],
    classConstructor: null,
  };

  const output = generateLitComponent(info);

  assert.ok(!output.includes('// TODO: @service'), 'should not include service TODO');
  assert.ok(!output.includes('= null;'), 'should not include null property');
});

test('generateLitComponent places services before tracked properties', () => {
  const info = {
    className: 'MyComponent',
    trackedProperties: [{ name: 'count', initialValue: 0 }],
    services: [{ name: 'store', serviceName: 'store' }],
    imports: [],
    methods: [],
    getters: [],
    setters: [],
    classConstructor: null,
  };

  const output = generateLitComponent(info);

  const serviceIndex = output.indexOf('store = null;');
  const propertyIndex = output.indexOf('@property()');

  assert.ok(serviceIndex > -1, 'service stub should be present');
  assert.ok(propertyIndex > -1, 'tracked property should be present');
  assert.ok(serviceIndex < propertyIndex, 'services should come before tracked properties');
});
