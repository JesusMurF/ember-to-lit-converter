import generate from '@babel/generator';
import traverse from '@babel/traverse';

/**
 * Checks whether a decorator list contains a decorator with the given name.
 * @param {object[]|undefined} decorators - Babel decorator node array
 * @param {string} name - Decorator name to look for
 * @returns {boolean}
 */
function hasDecorator(decorators, name) {
  return decorators?.some((d) => d.expression.name === name) ?? false;
}

/**
 * Finds a @service or @inject decorator, with or without call expression.
 * @param {object[]|undefined} decorators - Babel decorator node array
 * @returns {object|undefined} The matching decorator node, or undefined
 */
function findServiceDecorator(decorators) {
  const names = new Set(['service', 'inject']);
  return decorators?.find((d) => {
    if (names.has(d.expression.name)) return true;
    return (
      d.expression.type === 'CallExpression' &&
      names.has(d.expression.callee.name)
    );
  });
}

/**
 * Returns the first string argument of a call-expression decorator, or null.
 * @param {object} decorator - Babel decorator node
 * @returns {string|null}
 */
function getDecoratorArgument(decorator) {
  if (decorator.expression.type !== 'CallExpression') return null;
  return decorator.expression.arguments[0]?.value ?? null;
}

/**
 * Extracts parameter names from a Babel param node array.
 * @param {object[]} params - Babel param nodes
 * @returns {string[]}
 */
function extractParamNames(params) {
  return params.map((p) => p.name);
}

/**
 * Generates source code string from a Babel AST node.
 * @param {object} node - Babel AST node
 * @returns {string}
 */
function generateCode(node) {
  return generate.default(node).code;
}

/**
 * Extracts component information from a Babel AST into an Intermediate Representation (IR).
 * Traverses the AST to extract class name, tracked properties, imports, methods, and getters.
 * @param {object} ast - Babel AST of an Ember component
 * @returns {object} IR object containing className, trackedProperties, services, imports, methods, getters, setters, classConstructor. Methods include an isAction flag.
 */
export function extractComponentInfo(ast) {
  const info = {
    className: null,
    trackedProperties: [],
    services: [],
    imports: [],
    methods: [],
    getters: [],
    setters: [],
    classConstructor: null,
  };

  function handleMethod(node) {
    info.methods.push({
      name: node.key.name,
      params: extractParamNames(node.params),
      body: generateCode(node.body),
      isAction: hasDecorator(node.decorators, 'action'),
    });
  }

  function handleGetter(node) {
    info.getters.push({ name: node.key.name, body: generateCode(node.body) });
  }

  function handleSetter(node) {
    info.setters.push({
      name: node.key.name,
      param: node.params[0].name,
      body: generateCode(node.body),
    });
  }

  function handleConstructorMethod(node) {
    info.classConstructor = {
      params: extractParamNames(node.params),
      body: generateCode(node.body),
    };
  }

  traverse.default(ast, {
    ClassDeclaration(path) {
      info.className = path.node.id.name;
    },

    ClassProperty(path) {
      const { decorators, key, value } = path.node;

      const serviceDecorator = findServiceDecorator(decorators);
      if (serviceDecorator) {
        const name = key.name;
        const serviceName = getDecoratorArgument(serviceDecorator) ?? name;
        info.services.push({ name, serviceName });
        return;
      }

      if (hasDecorator(decorators, 'tracked')) {
        info.trackedProperties.push({
          name: key.name,
          initialValue: value?.value ?? null,
        });
      }
    },

    ImportDeclaration(path) {
      const importInfo = {
        source: path.node.source.value,
        specifiers: [],
      };

      path.node.specifiers.forEach((spec) => {
        if (spec.type === 'ImportDefaultSpecifier') {
          importInfo.specifiers.push(spec.local.name);
        } else if (spec.type === 'ImportSpecifier') {
          importInfo.specifiers.push(spec.imported.name);
        }
      });

      info.imports.push(importInfo);
    },

    ClassMethod(path) {
      const handlers = {
        method: handleMethod,
        get: handleGetter,
        set: handleSetter,
        constructor: handleConstructorMethod,
      };
      handlers[path.node.kind]?.(path.node);
    },
  });

  return info;
}
