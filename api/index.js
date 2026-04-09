const express = require('express');
const PptxGenJS = require('pptxgenjs');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Função para buscar letra (usando Genius API)
async function buscarLetra(songName, artistName) {
  const apiKey = 'YOUR_GENIUS_API_KEY'; // Substitua pela sua chave
  const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(songName + ' ' + artistName)}`;

  try {
    const response = await axios.get(searchUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const hits = response.data.response.hits;
    if (hits.length > 0) {
      const songUrl = hits[0].result.url;
      // Em produção, implemente scraping para extrair letra de songUrl.
      return "Letra de exemplo\n\n[Verso 1]\nTexto do verso\n\n[Coro]\nTexto do coro";
    }
    throw new Error('Letra não encontrada');
  } catch (error) {
    throw new Error('Erro ao buscar letra: ' + error.message);
  }
}

// Função para dividir letra em slides
function dividirEmSlides(letra, linhasPorSlide = 4) {
  const linhas = letra.split('\n').filter(l => l.trim());
  const slides = [];
  for (let i = 0; i < linhas.length; i += linhasPorSlide) {
    slides.push(linhas.slice(i, i + linhasPorSlide).join('\n'));
  }
  return slides;
}

// Endpoint para gerar PPTX
app.post('/generate-pptx', async (req, res) => {
  const { songName, artistName, letraManual, linhasPorSlide } = req.body;

  try {
    let letra = letraManual || await buscarLetra(songName, artistName);
    const slides = dividirEmSlides(letra, linhasPorSlide || 4);

    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 5.625 }); // 16:9
    pptx.layout = 'CUSTOM';

    slides.forEach(texto => {
      const slide = pptx.addSlide();
      slide.background = { color: '000000' }; // Fundo escuro
      slide.addText(texto, {
        x: 0.5, y: 0.5, w: 9, h: 4.625,
        fontSize: 36, color: 'FFFFFF', align: 'left', valign: 'top',
        lineSpacing: 1.2, fontFace: 'Arial'
      });
    });

    const fileName = `${songName.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
    const filePath = path.join('/tmp', fileName); // Usar /tmp no Vercel

    await pptx.writeFile({ fileName: filePath });

    res.download(filePath, fileName, () => fs.unlinkSync(filePath));

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Para Vercel, exportar o app
module.exports = app;