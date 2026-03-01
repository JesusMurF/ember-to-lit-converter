import { parseEmberComponent } from '../../parser.js';
import { extractComponentInfo } from '../../extractor.js';
import { generateLitComponent } from '../../generator.js';
import { parseHbsTemplate } from '../../hbs-parser.js';
import { extractTemplateInfo } from '../../hbs-extractor.js';
import { EmberSyntaxError, HbsSyntaxError } from '../../errors.js';
import {
  convertRequestSchema,
  convertResponseSchema,
  errorResponseSchema,
} from '../schemas/convert.js';

/**
 * Registers the POST /api/convert route for Ember to Lit component conversion.
 * @param {import('fastify').FastifyInstance} fastify - The Fastify application instance
 * @returns {Promise<void>}
 */
/**
 * Builds the Intermediate Representation (IR) from Ember JS and optional HBS sources.
 * @param {string} code - Ember component JavaScript source
 * @param {string | undefined} hbs - Ember Handlebars template source (optional)
 * @returns {object} IR object ready for code generation
 */
function buildIr(code, hbs) {
  const ast = parseEmberComponent(code);
  const info = extractComponentInfo(ast);

  if (hbs) {
    const hbsAst = parseHbsTemplate(hbs);
    info.template = extractTemplateInfo(hbsAst);
  }

  return info;
}

export async function convertRoutes(fastify) {
  fastify.post('/api/convert', {
    schema: {
      body: convertRequestSchema,
      response: {
        200: convertResponseSchema,
        400: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    /**
     * Converts an Ember component to a Lit component.
     *
     * The conversion process follows a three-stage pipeline:
     * 1. Parse: Converts Ember JavaScript code to an Abstract Syntax Tree (AST)
     * 2. Extract: Transforms AST to framework-neutral Intermediate Representation (IR)
     * 3. Generate: Produces Lit component code from IR
     * @async
     * @param {object} request - Fastify request object with body.code containing Ember component code
     * @param {object} reply - Fastify reply object
     * @returns {Promise<{litCode: string}>} Success response with generated Lit component code
     * @throws {Error} Returns 400 status with error details when input code has invalid JavaScript syntax
     * @throws {Error} Returns 500 status with error details for unexpected conversion errors
     */
    handler: async (request, reply) => {
      const { code, hbs } = request.body;

      try {
        const ir = buildIr(code, hbs);
        const litCode = generateLitComponent(ir);
        request.log.debug({ ir }, 'extracted IR');

        return { litCode };
      } catch (error) {
        if (error instanceof EmberSyntaxError || error instanceof HbsSyntaxError) {
          reply.code(400);
          return {
            error: 'Invalid syntax',
            details: 'The provided Ember component or template code contains syntax errors',
          };
        }

        fastify.log.error(error);
        reply.code(500);
        return {
          error: 'Internal server error',
          details: 'An unexpected error occurred during conversion',
        };
      }
    },
  });
}
