import generate from '@babel/generator';
import traverse from '@babel/traverse';

/**
 * Extracts component information from a Babel AST into an Intermediate Representation (IR).
 * Traverses the AST to extract class name, tracked properties, imports, methods, and getters.
 * @param {object} ast - Babel AST of an Ember component
 * @returns {object} IR object containing className, trackedProperties, imports, methods, and getters
 */
export function extractComponentInfo(ast) {
  const info = {
    className: null,
    trackedProperties: [],
    imports: [],
    methods: [],
    getters: [],
  };

  traverse.default(ast, {
    ClassDeclaration(path) {
      info.className = path.node.id.name;
    },

    ClassProperty(path) {
      const hasTrackedDecorator = path.node.decorators?.some(
        (decorator) => decorator.expression.name === 'tracked',
      );

      if (hasTrackedDecorator) {
        info.trackedProperties.push({
          name: path.node.key.name,
          initialValue: path.node.value?.value ?? null,
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
      if (path.node.kind === 'method') {
        const methodName = path.node.key.name;
        const paramNames = path.node.params.map((param) => param.name);

        info.methods.push({
          name: methodName,
          params: paramNames,
          body: generate.default(path.node.body).code,
        });
      } else if (path.node.kind === 'get') {
        const getterName = path.node.key.name;
        const body = generate.default(path.node.body).code;

        info.getters.push({
          name: getterName,
          body,
        });
      }
    },
  });

  return info;
}
