import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MODEL, callGemini } from '../shared/gemini.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envPath);
  } catch (err) {
    console.warn('Não foi possível carregar o .env:', err.message);
  }
}

app.use(express.json({ limit: '15mb' }));

const API_KEY = process.env.CHAVE_API || process.env.GEMINI_API_KEY || '';

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model: MODEL, apiKeyConfigured: Boolean(API_KEY) });
});

app.post('/api/generate', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({
      error: 'Chave de API não configurada. Defina CHAVE_API no arquivo .env do servidor.'
    });
  }

  const { imageBase64, mimeType } = req.body || {};
  if (!imageBase64) {
    return res.status(400).json({ error: 'Envie a imagem da atividade (imageBase64).' });
  }

  try {
    const result = await callGemini({ imageBase64, mimeType, apiKey: API_KEY });
    return res.json(result);
  } catch (err) {
    console.error('Erro ao gerar códigos:', err);
    return res.status(err.status || 502).json({
      error: err.message || 'Erro inesperado ao consultar a IA.'
    });
  }
});

const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

function portFromEnvFile() {
  try {
    const match = fs.readFileSync(envPath, 'utf8').match(/^PORT=(\d+)\s*$/m);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}

const PORT = portFromEnvFile() ?? (Number(process.env.PORT) || 3001);
app.listen(PORT, () => {
  console.log(`Servidor CODEBNCC rodando em http://localhost:${PORT}`);
  console.log(`Modelo de IA: ${MODEL}`);
  console.log(`Chave de API (CHAVE_API): ${API_KEY ? 'configurada' : 'NÃO configurada'}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} já está em uso. Encerre o processo que a ocupa ou defina PORT no .env.`);
  } else {
    console.error('Falha ao iniciar o servidor:', err.message);
  }
  process.exit(1);
});
