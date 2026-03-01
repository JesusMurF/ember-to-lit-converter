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
 * Dispatches an AST statement node to the appropriate visitor.
 * @param {import('@glimmer/syntax').ASTv1.Statement} node - Glimmer statement node
 * @returns {object | null} IR node or null if unsupported
 */
function visitStatement(node) {
  if (node.type === 'MustacheStatement') return visitMustache(node);
  return null;
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
