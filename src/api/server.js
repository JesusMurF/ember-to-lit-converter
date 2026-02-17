import Fastify from 'fastify';
import cors from '@fastify/cors';
import { convertRoutes } from './routes/convert.js';

/**
 * Builds and configures a Fastify server instance with CORS and conversion routes.
 * @param {object} options - Server configuration options
 * @param {string} [options.logLevel] - Logging level for Pino logger
 * @returns {import('fastify').FastifyInstance} Configured Fastify server instance
 */
export function buildServer(options = {}) {
  const fastify = Fastify({
    logger: {
      level: options.logLevel || 'info',
    },
  });

  fastify.register(cors, {
    origin: true,
  });

  fastify.register(convertRoutes);

  return fastify;
}

/**
 * Starts the Fastify server and begins listening for requests.
 * @async
 * @param {object} options - Server startup options
 * @param {number} [options.port] - Port number to listen on
 * @param {string} [options.host] - Host address to bind to
 * @param {string} [options.logLevel] - Logging level passed to buildServer
 * @returns {Promise<import('fastify').FastifyInstance>} Running Fastify server instance
 * @throws {Error} Exits process with code 1 if server fails to start
 */
export async function startServer(options = {}) {
  const fastify = buildServer(options);

  try {
    const port = options.port || 3000;
    const host = options.host || '0.0.0.0';

    await fastify.listen({ port, host });

    fastify.log.info(`Server listening on http://${host}:${port}`);

    return fastify;
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
