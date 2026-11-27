import { MODEL } from '../../shared/gemini.mjs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default async () =>
  new Response(
    JSON.stringify({
      ok: true,
      model: MODEL,
      apiKeyConfigured: Boolean(process.env.CHAVE_API || process.env.GEMINI_API_KEY)
    }),
    { headers: { 'Content-Type': 'application/json', ...CORS } }
  );

export const config = { path: '/api/health' };
