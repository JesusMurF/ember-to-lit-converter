import traverse from '@babel/traverse';

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
      // Extraer el nombre de la clase
      info.className = path.node.id.name;
    },

    ClassProperty(path) {
      // Verificar si tiene el decorador @tracked
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
      // Extraer información de los imports
      const importInfo = {
        source: path.node.source.value,
        specifiers: [],
      };

      // Recorrer todos los especificadores del import
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
      // Only extract regular methods (ignore constructors, getters, setters)
      if (path.node.kind === 'method') {
        // Extract method name
        const methodName = path.node.key.name;

        // Extract parameter names
        const paramNames = path.node.params.map((param) => param.name);

        // Add to methods array
        info.methods.push({
          name: methodName,
          params: paramNames,
        });
      } else if (path.node.kind === 'get') {
        // Extract getter name
        const getterName = path.node.key.name;

        // Add to getters array
        info.getters.push({
          name: getterName,
        });
      }
    },
  });

  return info;
}
