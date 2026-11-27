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
| Backend | Node.js + Express (a chave de API fica apenas no servidor) |
| IA | Google Gemini — modelo `gemini-3.1-flash-lite` |

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

4. Em produção:

   ```bash
   npm run build
   npm start
   ```

   O Express serve o build do Vite (`dist/`) e a API na porta `3001` (configurável em `PORT`).

## Uso

1. Envie a imagem da atividade no cartão de upload.
2. Clique em **Gerar códigos BNCC (EI02)**.
3. A IA analisa a atividade e retorna de 2 a 6 habilidades `EI02` do catálogo da BNCC, com descrição, campo de experiência e justificativa.
4. Cada análise é registrada no **Histórico** (ícone de relógio na barra superior), de onde pode ser consultada ou removida.
5. Use o ícone de sol/lua na barra superior para alternar claro/escuro.
