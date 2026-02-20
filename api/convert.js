import { buildServer } from '../src/api/server.js';

// Initialized once per cold start; reused across warm invocations.
const app = buildServer({ logLevel: 'error' });

/**
 * Vercel Serverless Function for /api/convert.
 *
 * Injects the native Node.js req/res into Fastify's internal HTTP server so it
 * handles routing, validation, and response as a normal HTTP request.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default async (req, res) => {
  await app.ready();
  app.server.emit('request', req, res);
};
