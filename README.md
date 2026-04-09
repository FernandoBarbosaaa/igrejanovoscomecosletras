# Gerador de PowerPoint para Louvores

Este projeto gera automaticamente arquivos PowerPoint (.pptx) com letras de louvores.

## Como usar localmente

1. Instale as dependências: `npm install`
2. Execute: `npm start`
3. Acesse http://localhost:3000

## Deploy no Vercel

1. Faça commit dos arquivos no Git (git init, git add ., git commit -m "Initial commit").
2. Conecte o repositório ao Vercel (vercel.com).
3. O Vercel detectará automaticamente a configuração via vercel.json e api/index.js.
4. Substitua 'YOUR_GENIUS_API_KEY' pela sua chave da Genius API.

## Configuração

- **Busca de letras**: Usa Lyrics.ovh API (gratuita e sem chave). Base de dados extensa, mas pode não ter todas as músicas de louvor.
- Para produção, se letras não forem encontradas, considere adicionar opção para inserir manualmente.