import { test } from 'node:test';
import assert from 'node:assert';
import { parseEmberComponent } from '../src/parser.js';
import { extractComponentInfo } from '../src/extractor.js';

test('extractComponentInfo extracts className from simple Ember component', () => {
  const code = `
    import Component from '@glimmer/component';

    export default class MyComponent extends Component {
    }
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.strictEqual(info.className, 'MyComponent');
});

test('extractComponentInfo extracts className from component with tracked properties', () => {
  const code = `
    import Component from '@glimmer/component';
    import { tracked } from '@glimmer/tracking';

    export default class CounterComponent extends Component {
      @tracked count = 0;
    }
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.strictEqual(info.className, 'CounterComponent');
});

test('extractComponentInfo returns null className when no class declaration exists', () => {
  const code = `
    import Component from '@glimmer/component';

    const myFunction = () => {
      return 'hello';
    };
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.strictEqual(info.className, null);
});

test('extractComponentInfo extracts className with numbers and underscores', () => {
  const code = `
    import Component from '@glimmer/component';

    export default class My_Component123 extends Component {
    }
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.strictEqual(info.className, 'My_Component123');
});

test('extractComponentInfo extracts className from component with methods', () => {
  const code = `
    import Component from '@glimmer/component';

    export default class ButtonComponent extends Component {
      handleClick() {
        console.log('clicked');
      }
    }
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.strictEqual(info.className, 'ButtonComponent');
});

test('extractComponentInfo extracts method without parameters', () => {
  const code = `
    import Component from '@glimmer/component';

    export default class ButtonComponent extends Component {
      handleClick() {
        console.log('clicked');
      }
    }
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.ok(Array.isArray(info.methods));
  assert.strictEqual(info.methods.length, 1);
  assert.strictEqual(info.methods[0].name, 'handleClick');
  assert.ok(Array.isArray(info.methods[0].params));
  assert.strictEqual(info.methods[0].params.length, 0);
  assert.ok(info.methods[0].body.includes("console.log('clicked')"));
});

test('extractComponentInfo extracts method with parameters', () => {
  const code = `
    import Component from '@glimmer/component';

    export default class FormComponent extends Component {
      submitForm(event, data) {
        event.preventDefault();
        console.log(data);
      }
    }
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.strictEqual(info.methods.length, 1);
  assert.strictEqual(info.methods[0].name, 'submitForm');
  assert.strictEqual(info.methods[0].params.length, 2);
  assert.strictEqual(info.methods[0].params[0], 'event');
  assert.strictEqual(info.methods[0].params[1], 'data');
  assert.ok(info.methods[0].body.includes('event.preventDefault()'));
});

test('extractComponentInfo extracts multiple methods', () => {
  const code = `
    import Component from '@glimmer/component';

    export default class CalculatorComponent extends Component {
      add(a, b) {
        return a + b;
      }

      subtract(x, y) {
        return x - y;
      }

      reset() {
        this.result = 0;
      }
    }
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.strictEqual(info.methods.length, 3);

  assert.strictEqual(info.methods[0].name, 'add');
  assert.deepStrictEqual(info.methods[0].params, ['a', 'b']);
  assert.ok(info.methods[0].body.includes('return a + b'));

  assert.strictEqual(info.methods[1].name, 'subtract');
  assert.deepStrictEqual(info.methods[1].params, ['x', 'y']);
  assert.ok(info.methods[1].body.includes('return x - y'));

  assert.strictEqual(info.methods[2].name, 'reset');
  assert.deepStrictEqual(info.methods[2].params, []);
  assert.ok(info.methods[2].body.includes('this.result = 0'));
});

test('extractComponentInfo extracts getter', () => {
  const code = `
    import Component from '@glimmer/component';

    export default class UserComponent extends Component {
      get fullName() {
        return this.firstName + ' ' + this.lastName;
      }
    }
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.ok(Array.isArray(info.getters));
  assert.strictEqual(info.getters.length, 1);
  assert.strictEqual(info.getters[0].name, 'fullName');
  assert.ok(info.getters[0].body.includes("return this.firstName + ' ' + this.lastName"));
});

test('extractComponentInfo extracts multiple getters', () => {
  const code = `
    import Component from '@glimmer/component';

    export default class PersonComponent extends Component {
      get fullName() {
        return this.firstName + ' ' + this.lastName;
      }

      get initials() {
        return this.firstName[0] + this.lastName[0];
      }
    }
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.strictEqual(info.getters.length, 2);
  assert.strictEqual(info.getters[0].name, 'fullName');
  assert.ok(info.getters[0].body.includes("return this.firstName + ' ' + this.lastName"));
  assert.strictEqual(info.getters[1].name, 'initials');
  assert.ok(info.getters[1].body.includes('return this.firstName[0] + this.lastName[0]'));
});

test('extractComponentInfo extracts constructor without parameters', () => {
  const code = `
    import Component from '@glimmer/component';

    export default class MyComponent extends Component {
      constructor() {
        super();
        this.name = 'default';
      }
    }
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.ok(info.classConstructor !== null);
  assert.ok(Array.isArray(info.classConstructor.params));
  assert.strictEqual(info.classConstructor.params.length, 0);
  assert.ok(info.classConstructor.body.includes('super()'));
  assert.ok(info.classConstructor.body.includes("this.name = 'default'"));
});

test('extractComponentInfo extracts constructor with parameters', () => {
  const code = `
    import Component from '@glimmer/component';

    export default class MyComponent extends Component {
      constructor(owner, args) {
        super(owner, args);
        this.value = args.value;
      }
    }
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.ok(info.classConstructor !== null);
  assert.strictEqual(info.classConstructor.params.length, 2);
  assert.strictEqual(info.classConstructor.params[0], 'owner');
  assert.strictEqual(info.classConstructor.params[1], 'args');
  assert.ok(info.classConstructor.body.includes('super(owner, args)'));
  assert.ok(info.classConstructor.body.includes('this.value = args.value'));
});

test('extractComponentInfo constructor does not interfere with methods', () => {
  const code = `
    import Component from '@glimmer/component';

    export default class MyComponent extends Component {
      constructor(owner, args) {
        super(owner, args);
      }

      handleClick() {
        console.log('clicked');
      }
    }
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.ok(info.classConstructor !== null);
  assert.strictEqual(info.classConstructor.params.length, 2);
  assert.strictEqual(info.methods.length, 1);
  assert.strictEqual(info.methods[0].name, 'handleClick');
});

test('extractComponentInfo handles getters and methods together', () => {
  const code = `
    import Component from '@glimmer/component';

    export default class MixedComponent extends Component {
      get total() {
        return this.items.length;
      }

      handleClick() {
        console.log('clicked');
      }
    }
  `;

  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  assert.strictEqual(info.getters.length, 1);
  assert.strictEqual(info.getters[0].name, 'total');
  assert.ok(info.getters[0].body.includes('return this.items.length'));

  assert.strictEqual(info.methods.length, 1);
  assert.strictEqual(info.methods[0].name, 'handleClick');
  assert.ok(info.methods[0].body.includes("console.log('clicked')"));
});
