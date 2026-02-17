import { parseEmberComponent } from '../../parser.js';
import { extractComponentInfo } from '../../extractor.js';
import { generateLitComponent } from '../../generator.js';
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
      const { code } = request.body;

      try {
        const ast = parseEmberComponent(code);
        const info = extractComponentInfo(ast);
        const litCode = generateLitComponent(info);

        return { litCode };
      } catch (error) {
        if (error.message === 'Ember component syntax error') {
          reply.code(400);
          return {
            error: 'Invalid JavaScript syntax',
            details: 'The provided Ember component code contains syntax errors',
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
