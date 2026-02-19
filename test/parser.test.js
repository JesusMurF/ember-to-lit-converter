import { test } from 'node:test';
import assert from 'node:assert';
import { parseEmberComponent } from '../src/parser.js';

test('parseEmberComponent returns AST with Program body', () => {
  const code = `
    import Component from '@glimmer/component';
    import { tracked } from '@glimmer/tracking';

    export default class MyComponent extends Component {
      @tracked count = 0;
    }
  `;

  const ast = parseEmberComponent(code);
  assert.strictEqual(ast.type, 'File');
  assert.ok(ast.program.body.length > 0);
});

test('parseEmberComponent throws error on invalid JavaScript syntax', () => {
  const invalidCode = `
    import Component from '@glimmer/component';

    export default class BrokenComponent extends Component {
      @tracked count = ;
    }
  `;

  assert.throws(() => parseEmberComponent(invalidCode), {
    name: 'Error',
    message: 'Ember component syntax error',
  });
});

test('parseEmberComponent accepts valid code as string', () => {
  const validCode = `
    import Component from '@glimmer/component';
    import { tracked } from '@glimmer/tracking';

    export default class TestComponent extends Component {
      @tracked count = 0;
    }
  `;

  const ast = parseEmberComponent(validCode);
  assert.strictEqual(ast.type, 'File');
  assert.ok(ast.program.body.length > 0);
});
