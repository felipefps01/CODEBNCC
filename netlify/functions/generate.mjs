import { callGemini } from '../../shared/gemini.mjs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS }
  });

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Método não permitido.' }, 405);
  }

  const apiKey = process.env.CHAVE_API || process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    return json(
      { error: 'CHAVE_API não configurada nas variáveis de ambiente do site no Netlify.' },
      500
    );
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Corpo da requisição inválido.' }, 400);
  }

  const { imageBase64, mimeType } = payload || {};
  if (!imageBase64) {
    return json({ error: 'Envie a imagem da atividade (imageBase64).' }, 400);
  }

  try {
    const result = await callGemini({ imageBase64, mimeType, apiKey });
    return json(result);
  } catch (err) {
    console.error('Erro na função generate:', err);
    return json({ error: err.message || 'Erro inesperado ao consultar a IA.' }, err.status || 502);
  }
};

export const config = { path: '/api/generate' };
