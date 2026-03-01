/**
 * Generates Lit component code from the Intermediate Representation (IR).
 * Creates imports, class declaration, properties, methods, getters, setters, and render method.
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
  const services = generateServices(info);
  const properties = generateProperties(info);
  const constructor = generateConstructor(info);
  const getters = generateGetters(info);
  const setters = generateSetters(info);
  const methods = generateMethods(info);
  const renderMethod = generateRenderMethod(info);

  return `export class ${className} extends LitElement {
    ${services}
    ${properties}
    ${constructor}
    ${getters}
    ${setters}
    ${methods}
    ${renderMethod}
    }`;
}

/**
 * Generates the constructor declaration.
 * @param {object} info - IR object containing constructor
 * @returns {string} Constructor declaration or empty string
 */
function generateConstructor(info) {
  // 'classConstructor' avoids collision with Object.prototype.constructor
  if (!info.classConstructor) return '';
  const params = info.classConstructor.params.join(', ');
  return `  constructor(${params}) ${info.classConstructor.body}\n`;
}

/**
 * Generates service stub declarations with TODO comments.
 * Each Ember service becomes a null property annotated with a migration hint.
 * @param {object} info - IR object containing services
 * @returns {string} Service stub declarations or empty string
 */
function generateServices(info) {
  if (!info.services || info.services.length === 0) return '';

  const services = info.services.map((s) => {
    const serviceRef =
      s.name !== s.serviceName ? `('${s.serviceName}') ${s.name}` : s.name;
    return `  // TODO: @service ${serviceRef} — replace with your preferred DI pattern (singleton, reactive controller, context API…)\n  ${s.name} = null;`;
  });

  return services.join('\n\n') + '\n';
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
    return `  get ${getter.name}() ${getter.body}`;
  });

  return getters.join('\n\n') + '\n';
}

/**
 * Generates setter method declarations.
 * @param {object} info - IR object containing setters
 * @returns {string} Setter declarations or empty string
 */
function generateSetters(info) {
  if (!info.setters || info.setters.length === 0) {
    return '';
  }

  const setters = info.setters.map((setter) => {
    return `  set ${setter.name}(${setter.param}) ${setter.body}`;
  });

  return setters.join('\n\n') + '\n';
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
    if (method.isAction) {
      return `  ${method.name} = (${params}) => ${method.body}`;
    }
    return `  ${method.name}(${params}) ${method.body}`;
  });

  return methods.join('\n\n') + '\n';
}

/**
 * Generates the render method declaration.
 * Uses ir.template if present, otherwise emits a TODO placeholder.
 * @param {object} info - IR object containing optional template field
 * @returns {string} Render method declaration
 */
function generateRenderMethod(info) {
  if (!info.template || info.template.roots.length === 0) {
    return `  render() {
    return html\`
      <!-- TODO: Convertir template Handlebars -->
    \`;
  }`;
  }

  const body = info.template.roots.map(generateNode).join('');

  return `  render() {
    return html\`${body}\`;
  }`;
}

/**
 * Converts a single IR template node to its Lit html string representation.
 * @param {object} node - IR node
 * @returns {string} Lit template fragment
 */
function generateNode(node) {
  if (node.type === 'expression') return `\${${node.code}}`;
  if (node.type === 'text') return node.chars;
  if (node.type === 'element') return generateElement(node);
  return '';
}

/**
 * Converts an element IR node to its Lit html string representation.
 * @param {{ tag: string, attrs: Array<object>, children: Array<object> }} node - IR element node
 * @returns {string} Lit template fragment
 */
function generateElement(node) {
  const attrs = node.attrs.map(generateAttr).join('');
  const children = node.children.map(generateNode).join('');
  return `<${node.tag}${attrs}>${children}</${node.tag}>`;
}

/**
 * Converts an attribute IR node to its HTML/Lit string representation.
 * @param {{ name: string, value: object }} attr - IR attribute node
 * @returns {string} Attribute string fragment
 */
function generateAttr(attr) {
  const value = generateAttrValue(attr.value);
  return ` ${attr.name}=${value}`;
}

/**
 * Converts an attribute value IR node to its string representation.
 * Static values use quoted strings; expressions use Lit bindings; concat mixes both.
 * @param {{ type: string, chars?: string, code?: string, parts?: Array<object> }} value - IR attr value
 * @returns {string} Attribute value string
 */
function generateAttrValue(value) {
  if (value.type === 'static') return `"${value.chars}"`;
  if (value.type === 'expression') return `\${${value.code}}`;
  const parts = value.parts
    .map((p) => (p.type === 'static' ? p.chars : `\${${p.code}}`))
    .join('');
  return `"${parts}"`;
}
