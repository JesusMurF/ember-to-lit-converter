import generate from '@babel/generator';
import traverse from '@babel/traverse';

/**
 * Extracts component information from a Babel AST into an Intermediate Representation (IR).
 * Traverses the AST to extract class name, tracked properties, imports, methods, and getters.
 * @param {object} ast - Babel AST of an Ember component
 * @returns {object} IR object containing className, trackedProperties, imports, methods, getters, setters, classConstructor. Methods include an isAction flag.
 */
export function extractComponentInfo(ast) {
  const info = {
    className: null,
    trackedProperties: [],
    imports: [],
    methods: [],
    getters: [],
    setters: [],
    classConstructor: null,
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
        const isAction = path.node.decorators?.some(
          (decorator) => decorator.expression.name === 'action',
        ) ?? false;

        info.methods.push({
          name: methodName,
          params: paramNames,
          body: generate.default(path.node.body).code,
          isAction,
        });
      } else if (path.node.kind === 'get') {
        const getterName = path.node.key.name;
        const body = generate.default(path.node.body).code;

        info.getters.push({
          name: getterName,
          body,
        });
      } else if (path.node.kind === 'set') {
        info.setters.push({
          name: path.node.key.name,
          param: path.node.params[0].name,
          body: generate.default(path.node.body).code,
        });
      } else if (path.node.kind === 'constructor') {
        const paramNames = path.node.params.map((param) => param.name);

        info.classConstructor = {
          params: paramNames,
          body: generate.default(path.node.body).code,
        };
      }
    },
  });

  return info;
}
