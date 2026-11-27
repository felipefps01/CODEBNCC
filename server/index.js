import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '15mb' }));

const API_KEY = process.env.CHAVE_API || process.env.GEMINI_API_KEY || '';
const MODEL = 'gemini-3.1-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const CAMPOS = {
  EO: 'O eu, o outro e o eu no mundo (Identidade e Autonomia)',
  CG: 'Corpo, gestos e movimentos',
  TS: 'Traços, sons, cores e formas',
  EF: 'Escuta, fala, pensamento e imaginação',
  ET: 'Espaços, tempos, quantidades, relações e transformações'
};

function catalogoPrompt() {
  return [
    'EI02EO01 Demonstrar atitudes de cuidado e solidariedade na interação com crianças e adultos.',
    'EI02EO02 Perceber as possibilidades e os limites de seu corpo nas brincadeiras e interações das quais participa.',
    'EI02EO03 Compartilhar os objetos e os espaços com crianças da mesma faixa etária e adultos.',
    'EI02EO04 Comunicar-se com os colegas e os adultos, buscando compreendê-los e fazendo-se compreender.',
    'EI02EO05 Desenvolver o respeito ao outro e a hábitos de convívio social e familiar, observando as diferentes relações.',
    'EI02EO06 Respeitar regras básicas de convívio social nas interações e brincadeiras.',
    'EI02CG01 Apropriar-se de gestos e movimentos de sua cultura no cuidado de si e nos jogos e brincadeiras.',
    'EI02CG02 Deslocar seu corpo no espaço, orientando-se por noções como em frente, atrás, no alto, embaixo, dentro, fora.',
    'EI02CG03 Explorar formas de deslocamento no espaço (pular, saltar, dançar), combinando movimentos e seguindo orientações.',
    'EI02CG04 Demonstrar progressiva independência no cuidado do seu corpo.',
    'EI02CG05 Desenvolver progressivamente as habilidades manuais, como picar, folhear, pintar, rasgar, empilhar.',
    'EI02TS01 Utilizar diferentes fontes sonoras disponíveis no ambiente em brincadeiras cantadas, rimas, melodias.',
    'EI02TS02 Utilizar materiais variados com possibilidades de manipulação (argila, massa de modelar), explorando cores, texturas, superfícies.',
    'EI02TS03 Utilizar diferentes fontes sonoras e materiais para acompanhar brincadeiras cantadas, canções, músicas e melodias.',
    'EI02EF01 Dialogar com crianças e adultos, expressando seus desejos, necessidades, sentimentos e opiniões.',
    'EI02EF02 Manipular e explorar diferentes suportes e gêneros textuais (livros, revistas, embalagens) em situações cotidianas.',
    'EI02EF03 Demonstrar interesse em ouvir a leitura de histórias e outros textos, acompanhandos, se possível, com imagens.',
    'EI02EF04 Formular suposições sobre o que ouve, lê e observa em textos diversos.',
    'EI02EF05 Relatar experiências e fatos acontecidos, histórias ouvidas, filmes ou peças teatrais assistidas.',
    'EI02ET01 Explorar e descrever semelhanças e diferenças entre objetos, identificando semelhanças e diferenças.',
    'EI02ET02 Observar, relatar e descrever acontecimentos e objetos em suas dimensões e posições.',
    'EI02ET03 Explorar relações de causa e efeito na interação com o meio físico e social.',
    'EI02ET04 Identificar relações espaciais (dentro e fora, em cima, embaixo, acima, abaixo) e temporais (antes, durante e depois).',
    'EI02ET05 Classificar objetos por tamanho, cor, forma, uso e outras características.',
    'EI02ET06 Utilizar conceitos de medida (comprimento, peso, volume) em situações cotidianas.',
    'EI02ET07 Contar oralmente objetos, pessoas, livros etc., em contextos cotidianos.'
  ].join('\n');
}

function buildPrompt() {
  return [
    'Você é um especialista em BNCC (Base Nacional Comum Curricular) para a Educação Infantil.',
    'Analise a imagem da atividade pedagógica enviada e identifique os códigos de habilidades da BNCC',
    'que a atividade desenvolve, considerando APENAS habilidades do grupo de Bebês (zero a 1 ano e 7 meses),',
    'cujo prefixo é "EI02". Todo código gerado DEVE começar com "EI02".',
    '',
    'Catálogo de habilidades EI02 válidas:',
    catalogoPrompt(),
    '',
    'Campos de experiência:',
    ...Object.entries(CAMPOS).map(([sigla, nome]) => `- ${sigla}: ${nome}`),
    '',
    'Regras:',
    '- Retorne apenas códigos presentes no catálogo acima, com descrição correspondente.',
    '- Selecione somente habilidades realmente presentes na atividade da imagem (de 2 a 6 habilidades).',
    '- Responda exclusivamente com JSON válido no formato:',
    '{"codes":[{"code":"EI02EO01","description":"...","field":"O eu, o outro e o eu no mundo","justification":"por que esta habilidade está presente na atividade"}]}'
  ].join('\n');
}

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

  const body = {
    contents: [
      {
        parts: [
          { text: buildPrompt() },
          {
            inline_data: {
              mime_type: mimeType || 'image/png',
              data: imageBase64.replace(/^data:[^;]+;base64,/, '')
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Erro da API Gemini:', response.status, detail);
      return res.status(response.status).json({
        error: `Falha ao consultar a IA (HTTP ${response.status}).`
      });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { codes: [] };
    }

    const codes = (parsed.codes || [])
      .map(item => ({
        code: String(item.code || '').trim(),
        description: String(item.description || '').trim(),
        field: String(item.field || '').trim(),
        justification: String(item.justification || '').trim()
      }))
      .filter(item => /^EI02/.test(item.code));

    if (codes.length === 0) {
      return res.status(422).json({
        error: 'A IA não identificou habilidades EI02 válidas nesta atividade. Tente uma imagem mais clara.'
      });
    }

    return res.json({ model: MODEL, codes });
  } catch (err) {
    console.error('Erro ao chamar a API Gemini:', err);
    return res.status(502).json({ error: 'Erro inesperado ao consultar a IA.' });
  }
});

const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor CODEBNCC rodando em http://localhost:${PORT}`);
  console.log(`Modelo de IA: ${MODEL}`);
  console.log(`Chave de API (CHAVE_API): ${API_KEY ? 'configurada' : 'NÃO configurada'}`);
});
