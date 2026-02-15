import { parseEmberComponent } from '../../parser.js';
import { extractComponentInfo } from '../../extractor.js';
import { generateLitComponent } from '../../generator.js';
import {
  convertRequestSchema,
  convertResponseSchema,
  errorResponseSchema
} from '../schemas/convert.js';

export async function convertRoutes(fastify, options) {
  fastify.post('/api/convert', {
    schema: {
      body: convertRequestSchema,
      response: {
        200: convertResponseSchema,
        400: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      const { code } = request.body;

      try {
        // Step 1: Parse Ember component to AST
        const ast = parseEmberComponent(code);

        // Step 2: Extract component info to IR
        const info = extractComponentInfo(ast);

        // Step 3: Generate Lit component code
        const litCode = generateLitComponent(info);

        // Return success response
        return { litCode };

      } catch (error) {
        // Handle parsing errors (invalid syntax)
        if (error.message === 'Sintáxis del código Javascript del componente inválida') {
          reply.code(400);
          return {
            error: 'Invalid JavaScript syntax',
            details: 'The provided Ember component code contains syntax errors'
          };
        }

        // Handle unexpected errors
        fastify.log.error(error);
        reply.code(500);
        return {
          error: 'Internal server error',
          details: 'An unexpected error occurred during conversion'
        };
      }
    }
  });
}
