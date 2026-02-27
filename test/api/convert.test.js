import { test } from 'node:test';
import assert from 'node:assert';
import { buildServer } from '../../src/api/server.js';

test('POST /api/convert returns Lit component for valid Ember code', async () => {
  const server = buildServer({ logLevel: 'silent' });

  const response = await server.inject({
    method: 'POST',
    url: '/api/convert',
    payload: {
      code: `
        import Component from '@glimmer/component';
        import { tracked } from '@glimmer/tracking';

        export default class TestComponent extends Component {
          @tracked count = 0;
        }
      `,
    },
  });

  assert.strictEqual(response.statusCode, 200);

  const data = JSON.parse(response.payload);
  assert.ok(data.litCode);
  assert.ok(data.litCode.includes('LitElement'));
  assert.ok(data.litCode.includes('@property() count = 0'));

  await server.close();
});

test('POST /api/convert returns 400 for invalid JavaScript syntax', async () => {
  const server = buildServer({ logLevel: 'silent' });

  const response = await server.inject({
    method: 'POST',
    url: '/api/convert',
    payload: {
      code: `
        import Component from '@glimmer/component';

        export default class BrokenComponent extends Component {
          @tracked count = ;
        }
      `,
    },
  });

  assert.strictEqual(response.statusCode, 400);

  const data = JSON.parse(response.payload);
  assert.strictEqual(data.error, 'Invalid syntax');
  assert.ok(data.details);

  await server.close();
});

test('POST /api/convert returns 400 when code is missing', async () => {
  const server = buildServer({ logLevel: 'silent' });

  const response = await server.inject({
    method: 'POST',
    url: '/api/convert',
    payload: {},
  });

  assert.strictEqual(response.statusCode, 400);

  await server.close();
});

test('POST /api/convert returns 400 when code exceeds max length', async () => {
  const server = buildServer({ logLevel: 'silent' });

  const largeCode = 'a'.repeat(102401);

  const response = await server.inject({
    method: 'POST',
    url: '/api/convert',
    payload: {
      code: largeCode,
    },
  });

  assert.strictEqual(response.statusCode, 400);

  await server.close();
});

test('POST /api/convert converts {{this.prop}} from hbs field into render body', async () => {
  const server = buildServer({ logLevel: 'silent' });

  const response = await server.inject({
    method: 'POST',
    url: '/api/convert',
    payload: {
      code: `
        import Component from '@glimmer/component';
        export default class MyComponent extends Component {}
      `,
      hbs: '{{this.title}}',
    },
  });

  assert.strictEqual(response.statusCode, 200);

  const data = JSON.parse(response.payload);
  assert.ok(data.litCode.includes('${this.title}'));
  assert.ok(!data.litCode.includes('TODO: Convertir template Handlebars'));

  await server.close();
});

test('POST /api/convert returns 400 for invalid HBS syntax', async () => {
  const server = buildServer({ logLevel: 'silent' });

  const response = await server.inject({
    method: 'POST',
    url: '/api/convert',
    payload: {
      code: `
        import Component from '@glimmer/component';
        export default class MyComponent extends Component {}
      `,
      hbs: '{{#if}}',
    },
  });

  assert.strictEqual(response.statusCode, 400);

  const data = JSON.parse(response.payload);
  assert.strictEqual(data.error, 'Invalid syntax');

  await server.close();
});

test('POST /api/convert handles component with methods', async () => {
  const server = buildServer({ logLevel: 'silent' });

  const response = await server.inject({
    method: 'POST',
    url: '/api/convert',
    payload: {
      code: `
        import Component from '@glimmer/component';

        export default class ButtonComponent extends Component {
          handleClick(event) {
            console.log('clicked');
          }
        }
      `,
    },
  });

  assert.strictEqual(response.statusCode, 200);

  const data = JSON.parse(response.payload);
  assert.ok(data.litCode.includes('handleClick(event)'));

  await server.close();
});
