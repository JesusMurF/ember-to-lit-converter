/**
 * Generates Lit component code from the Intermediate Representation (IR).
 * Creates imports, class declaration, properties, methods, getters, and render method.
 * @param {object} info - IR object containing component structure
 * @returns {string} Complete Lit component code as a string
 */
export function generateLitComponent(info) {
  const imports = generateImports(info);
  const classDeclaration = generateClass(info);

  return `${imports}\n\n${classDeclaration}`;
}

/**
 * Generates import statements for the Lit component.
 * @param {object} info - IR object containing component structure
 * @returns {string} Import statements as a string
 */
function generateImports(info) {
  const imports = [];

  imports.push(`import { LitElement, html } from 'lit';`);

  if (info.trackedProperties.length > 0) {
    imports.push(`import { property } from 'lit/decorators.js';`);
  }

  return imports.join('\n');
}

/**
 * Generates the complete Lit class declaration.
 * @param {object} info - IR object containing component structure
 * @returns {string} Class declaration with all members
 */
function generateClass(info) {
  const className = info.className;
  const properties = generateProperties(info);
  const getters = generateGetters(info);
  const methods = generateMethods(info);
  const renderMethod = generateRenderMethod();

  return `export class ${className} extends LitElement {
    ${properties}
    ${getters}
    ${methods}
    ${renderMethod}
    }`;
}

/**
 * Generates property declarations with `@property` decorators.
 * @param {object} info - IR object containing trackedProperties
 * @returns {string} Property declarations or empty string
 */
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

/**
 * Generates getter method declarations.
 * @param {object} info - IR object containing getters
 * @returns {string} Getter declarations or empty string
 */
function generateGetters(info) {
  if (!info.getters || info.getters.length === 0) {
    return '';
  }

  const getters = info.getters.map((getter) => {
    return `  get ${getter.name}() {
    // TODO: Implementar lógica del getter
  }`;
  });

  return getters.join('\n\n') + '\n';
}

/**
 * Generates method declarations.
 * @param {object} info - IR object containing methods
 * @returns {string} Method declarations or empty string
 */
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

/**
 * Generates the render method declaration.
 * @returns {string} Render method declaration
 */
function generateRenderMethod() {
  return `  render() {
    return html\`
      <!-- TODO: Convertir template Handlebars -->
    \`;
  }`;
}
