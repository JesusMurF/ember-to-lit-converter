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
  return null;
}

/**
 * Converts an ElementNode to an element IR node with its children and attributes recursively visited.
 * @param {import('@glimmer/syntax').ASTv1.ElementNode} node - Glimmer element node
 * @returns {{ type: 'element', tag: string, attrs: Array<object>, children: Array<object> }} IR element node
 */
function visitElement(node) {
  const attrs = node.attributes.map(visitAttr);
  const children = node.children.map(visitStatement).filter(Boolean);
  return { type: 'element', tag: node.tag, attrs, children };
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
 * Converts a MustacheStatement with a this.* path to an expression IR node.
 * @param {import('@glimmer/syntax').ASTv1.MustacheStatement} node - Glimmer mustache node
 * @returns {{ type: 'expression', code: string } | null} IR node or null if not this.*
 */
function visitMustache(node) {
  const original = node.path.original;
  if (original.startsWith('this.')) {
    return { type: 'expression', code: original };
  }
  return null;
}
