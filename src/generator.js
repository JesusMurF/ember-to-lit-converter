export function generateLitComponent(info) {
  // Generar los imports necesarios
  const imports = generateImports(info);

  // Generar la clase
  const classDeclaration = generateClass(info);

  return `${imports}\n\n${classDeclaration}`;
}

function generateImports(info) {
  const imports = [];

  // Import básico de Lit
  imports.push(`import { LitElement, html } from 'lit';`);

  // Si hay propiedades tracked, necesitamos el decorador
  if (info.trackedProperties.length > 0) {
    imports.push(`import { property } from 'lit/decorators.js';`);
  }

  return imports.join('\n');
}

function generateClass(info) {
  const className = info.className;
  const properties = generateProperties(info);
  const methods = generateMethods(info);
  const renderMethod = generateRenderMethod();

  return `export class ${className} extends LitElement {
    ${properties}
    ${methods}
    ${renderMethod}
    }`;
}

function generateProperties(info) {
  if (info.trackedProperties.length === 0) {
    return '';
  }

  const props = info.trackedProperties.map((prop) => {
    const value = prop.initialValue !== null ? ` = ${prop.initialValue}` : '';
    return `  @property() ${prop.name}${value};`;
  });

  return props.join('\n') + '\n';
}

function generateMethods(info) {
  if (!info.methods || info.methods.length === 0) {
    return '';
  }

  const methods = info.methods.map((method) => {
    const params = method.params.join(', ');
    return `  ${method.name}(${params}) {
    // TODO: Implementar lógica del método
  }`;
  });

  return methods.join('\n\n') + '\n';
}

function generateRenderMethod() {
  return `  render() {
    return html\`
      <!-- TODO: Convertir template Handlebars -->
    \`;
  }`;
}
