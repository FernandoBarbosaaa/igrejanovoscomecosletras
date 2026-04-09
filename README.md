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

- **Chave API do Vagalume** (opcional, mas recomendada para letras completas): Obtenha gratuitamente em [vagalume.com.br/api](https://api.vagalume.com.br/docs). Substitua `{your_key}` no código ou configure como variável de ambiente `VAGALUME_API_KEY` no Vercel.
- Para produção, teste a busca de letras reais.