/** @type {Record<string, string>} Maps Ember helper names to JS binary operators. */
const HELPER_OPERATORS = {
  eq: '===',
  'not-eq': '!==',
  neq: '!==',
  lt: '<',
  lte: '<=',
  gt: '>',
  gte: '>=',
  and: '&&',
  or: '||',
};

/**
 * Extracts template information from a Glimmer ASTv1 into a normalized IR.
 * @param {import('@glimmer/syntax').ASTv1.Template} hbsAst - Glimmer template AST
 * @returns {{ roots: Array<object> }} Template IR with root nodes
 */
export function extractTemplateInfo(hbsAst) {
  const roots = hbsAst.body.map(visitStatement).filter(Boolean);
  return { roots };
}

/**
 * Dispatches an AST node to the appropriate visitor.
 * @param {import('@glimmer/syntax').ASTv1.Statement} node - Glimmer AST node
 * @returns {object | null} IR node or null if unsupported
 */
function visitStatement(node) {
  if (node.type === 'MustacheStatement') return visitMustache(node);
  if (node.type === 'ElementNode') return visitElement(node);
  if (node.type === 'TextNode') return visitText(node);
  if (node.type === 'BlockStatement') return visitBlock(node);
  return null;
}

/**
 * Converts an ElementNode to an element IR node with its children and attributes recursively visited.
 * Element modifiers (e.g. `{{on "click" this.handler}}`) are converted to event binding attrs.
 * @param {import('@glimmer/syntax').ASTv1.ElementNode} node - Glimmer element node
 * @returns {{ type: 'element', tag: string, attrs: Array<object>, children: Array<object> }} IR element node
 */
function visitElement(node) {
  const attrs = node.attributes.map(visitAttr);
  const modifierAttrs = node.modifiers.map(visitModifier).filter(Boolean);
  const children = node.children.map(visitStatement).filter(Boolean);
  return { type: 'element', tag: node.tag, attrs: [...attrs, ...modifierAttrs], children };
}

/**
 * Converts an ElementModifierStatement to an event binding attr IR node.
 * Supports the `on` modifier: `{{on "event" this.handler}}` → `{ name: '@event', value: expression }`.
 * Unknown modifiers are emitted as a TODO attr.
 * @param {import('@glimmer/syntax').ASTv1.ElementModifierStatement} node - Glimmer modifier node
 * @returns {{ name: string, value: object } | null} IR attr node or null
 */
function visitModifier(node) {
  const modifierName = node.path.original;

  if (modifierName === 'on') {
    const eventName = node.params[0]?.value;
    const handlerPath = node.params[1]?.original;
    if (!eventName || !handlerPath) return null;
    return { name: `@${eventName}`, value: { type: 'expression', code: handlerPath } };
  }

  return {
    name: `data-todo-modifier-${modifierName}`,
    value: { type: 'static', chars: `TODO: convert {{${modifierName}}} modifier` },
  };
}

/**
 * Converts an AttrNode to an attribute IR node.
 * @param {import('@glimmer/syntax').ASTv1.AttrNode} node - Glimmer attribute node
 * @returns {{ name: string, value: object }} IR attribute node
 */
function visitAttr(node) {
  return { name: node.name, value: visitAttrValue(node.value) };
}

/**
 * Converts an attribute value node to an IR value.
 * Handles static text, dynamic expressions, and concatenated values.
 * @param {import('@glimmer/syntax').ASTv1.TextNode | import('@glimmer/syntax').ASTv1.MustacheStatement | import('@glimmer/syntax').ASTv1.ConcatStatement} node - Glimmer attr value node
 * @returns {{ type: 'static', chars: string } | { type: 'expression', code: string } | { type: 'concat', parts: Array<object> }} IR value node
 */
function visitAttrValue(node) {
  if (node.type === 'TextNode') return { type: 'static', chars: node.chars };
  if (node.type === 'MustacheStatement') {
    return { type: 'expression', code: node.path.original };
  }
  // ConcatStatement: mixed static + dynamic parts
  const parts = node.parts.map((part) => {
    if (part.type === 'TextNode') return { type: 'static', chars: part.chars };
    return { type: 'expression', code: part.path.original };
  });
  return { type: 'concat', parts };
}

/**
 * Converts a TextNode to a text IR node. Returns null for whitespace-only nodes.
 * @param {import('@glimmer/syntax').ASTv1.TextNode} node - Glimmer text node
 * @returns {{ type: 'text', chars: string } | null} IR text node or null
 */
function visitText(node) {
  if (!node.chars.trim()) return null;
  return { type: 'text', chars: node.chars };
}

/**
 * Converts a MustacheStatement to an expression IR node.
 * Captures `this.*` properties and dotted paths (e.g. block-param references like `item.name`).
 * Bare identifiers without dots (potential helper calls) are ignored.
 * @param {import('@glimmer/syntax').ASTv1.MustacheStatement} node - Glimmer mustache node
 * @returns {{ type: 'expression', code: string } | null} IR node or null if unsupported
 */
function visitMustache(node) {
  const original = node.path.original;
  if (original.includes('.')) {
    return { type: 'expression', code: original };
  }
  return null;
}

/**
 * Converts a Glimmer expression param to its JS string representation.
 * @param {import('@glimmer/syntax').ASTv1.Expression} node - Glimmer expression node
 * @returns {string | null} JS string or null if unsupported
 */
function visitParam(node) {
  if (node.type === 'PathExpression') return node.original;
  if (node.type === 'StringLiteral') return `'${node.value}'`;
  if (node.type === 'NumberLiteral') return String(node.value);
  if (node.type === 'BooleanLiteral') return String(node.value);
  if (node.type === 'SubExpression') return visitSubExpression(node);
  return null;
}

/**
 * Converts a SubExpression helper call to its JS condition string.
 * Supports eq, not-eq, neq, lt, lte, gt, gte, and, or, not.
 * @param {import('@glimmer/syntax').ASTv1.SubExpression} node - Glimmer subexpression node
 * @returns {string | null} JS condition string or null if helper is unsupported
 */
function visitSubExpression(node) {
  const helperName = node.path.original;

  if (helperName === 'not') {
    const operand = visitParam(node.params[0]);
    return operand ? `!${operand}` : null;
  }

  const operator = HELPER_OPERATORS[helperName];
  if (operator) {
    const left = visitParam(node.params[0]);
    const right = visitParam(node.params[1]);
    return left && right ? `(${left} ${operator} ${right})` : null;
  }

  return null;
}

/**
 * Converts a BlockStatement `each` to an each IR node.
 * @param {import('@glimmer/syntax').ASTv1.BlockStatement} node - Glimmer block node
 * @returns {{ type: 'each', iterable: string, item: string, children: Array<object> }} IR node
 */
function visitEach(node) {
  const iterable = node.params[0]?.original ?? 'items /* TODO */';
  const item = node.program.blockParams[0] ?? 'item';
  const children = node.program.body.map(visitStatement).filter(Boolean);
  return { type: 'each', iterable, item, children };
}

/**
 * Converts a BlockStatement (if/each) to the appropriate IR node.
 * Only supports `if` and `each` helpers; other block helpers return null.
 * @param {import('@glimmer/syntax').ASTv1.BlockStatement} node - Glimmer block node
 * @returns {{ type: 'conditional', condition: string, consequent: Array<object>, alternate: Array<object>|null, isTodo: boolean } | { type: 'each', iterable: string, item: string, children: Array<object> } | null} IR node
 */
function visitBlock(node) {
  if (node.path.original === 'each') return visitEach(node);
  if (node.path.original !== 'if') return null;

  const param = node.params[0];
  let condition;
  let isTodo = false;

  if (param?.type === 'PathExpression') {
    condition = param.original;
  } else if (param?.type === 'SubExpression') {
    const resolved = visitSubExpression(param);
    if (resolved) {
      condition = resolved;
    } else {
      condition = 'false /* TODO: condición compleja */';
      isTodo = true;
    }
  } else {
    condition = 'false /* TODO: condición compleja */';
    isTodo = true;
  }

  const consequent = node.program.body.map(visitStatement).filter(Boolean);
  const alternate = node.inverse
    ? node.inverse.body.map(visitStatement).filter(Boolean)
    : null;

  return { type: 'conditional', condition, consequent, alternate, isTodo };
}
