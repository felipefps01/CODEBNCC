# CODEBNCC

Aplicativo que gera códigos de habilidades da **BNCC** (prefixo **EI02**, grupo de Bebês da Educação Infantil) a partir de uma imagem da atividade pedagógica, usando a IA **gemini-3.1-flash-lite**.

## Funcionalidades

- **Upload de imagem da atividade** (seleção ou arrastar e soltar) e análise por IA
- **Códigos gerados** com prefixo `EI02`, agrupados por campo de experiência, com justificativa
- **Histórico de códigos gerados** (botão na barra superior, salvo no navegador)
- **Alternar claro/escuro** (botão na barra superior)
- Interface **Material Design 3**

## Arquitetura

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite, CSS com tokens Material Design 3 |
| Backend | Netlify Functions (`netlify/functions`) em produção; Express para desenvolvimento local |
| IA | Google Gemini — modelo `gemini-3.1-flash-lite` (lógica compartilhada em `shared/gemini.mjs`) |

A chave de API (`CHAVE_API`) nunca vai para o navegador: fica em variável de ambiente no servidor Express (local) ou nas variáveis de ambiente do site no Netlify (produção).

## Como rodar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure a chave da API — copie `.env.example` para `.env` e preencha:

   ```bash
   cp .env.example .env
   # edite o .env: CHAVE_API=sua-chave-do-google-ai-studio
   ```

   A chave é lida pelo backend em `CHAVE_API` (aceita também `GEMINI_API_KEY`) e nunca é exposta ao navegador.

3. Em desenvolvimento (backend na porta 3001 + frontend na porta 5173, com proxy de `/api`):

   ```bash
   npm run dev
   ```

   Acesse http://localhost:5173

4. Em produção (Node/Express):

   ```bash
   npm run build
   npm start
   ```

   O Express serve o build do Vite (`dist/`) e a API na porta `3001` (configurável em `PORT`).

## Deploy no Netlify

O repositório inclui `netlify.toml` e as funções serverless em `netlify/functions/`:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Funções**: `netlify/functions/generate.mjs` (rota `/api/generate`) e `netlify/functions/health.mjs` (rota `/api/health`), já mapeadas via `config.path` — sem necessidade de redirects

Passos:

1. Conecte o repositório no Netlify (ou use `netlify deploy --prod`).
2. Em **Site settings > Environment variables**, cadastre:
   - `CHAVE_API` = sua chave do [Google AI Studio](https://aistudio.google.com/apikey)
3. Faça o deploy (ou "Clear cache and deploy site" após cadastrar a variável).

O frontend chamado em `/api/*` é atendido pelas funções serverless — não há backend Express no Netlify.

## Solução de problemas

- **"Backend indisponível em /api" no Netlify** — o deploy não incluiu as funções. Confirme que `netlify.toml` e `netlify/functions/` estão no repositório e refaça o deploy.
- **Banner "CHAVE_API não configurada" no Netlify** — cadastre a variável de ambiente no painel (Site settings > Environment variables) e refaça o deploy. Localmente, copie `.env.example` para `.env`, preencha `CHAVE_API` e reinicie.
- **"Erro de conexão" local** — rode sempre com `npm run dev` (backend + web juntos; o Vite repassa `/api` ao backend) ou `npm start` em produção Node, que serve build e API na mesma porta.
- **Porta do backend ocupada (local)** — defina `PORT=outra-porta` no `.env`; o proxy do Vite usa o mesmo valor.
- **HTTP 403** — a chave não tem permissão para o modelo `gemini-3.1-flash-lite`; gere uma nova chave no [Google AI Studio](https://aistudio.google.com/apikey).
- **HTTP 429** — limite de requisições atingido; aguarde e tente novamente.

## Uso

1. Envie a imagem da atividade no cartão de upload.
2. Clique em **Gerar códigos BNCC (EI02)**.
3. A IA analisa a atividade e retorna de 2 a 6 habilidades `EI02` do catálogo da BNCC, com descrição, campo de experiência e justificativa.
4. Cada análise é registrada no **Histórico** (ícone de relógio na barra superior), de onde pode ser consultada ou removida.
5. Use o ícone de sol/lua na barra superior para alternar claro/escuro.
