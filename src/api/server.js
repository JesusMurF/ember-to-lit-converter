import Fastify from 'fastify';
import cors from '@fastify/cors';
import { convertRoutes } from './routes/convert.js';

export function buildServer(options = {}) {
  const fastify = Fastify({
    logger: {
      level: options.logLevel || 'info'
    }
  });

  // Register CORS plugin
  fastify.register(cors, {
    origin: true // Allow all origins in development
    // In production: origin: process.env.ALLOWED_ORIGINS?.split(',')
  });

  // Register routes
  fastify.register(convertRoutes);

  return fastify;
}

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

// Only start server if running directly (not imported for tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
