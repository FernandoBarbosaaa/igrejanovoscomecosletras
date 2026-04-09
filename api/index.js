const express = require('express');
const PptxGenJS = require('pptxgenjs');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Função para buscar letra (usando scraping de letras.mus.br)
async function buscarLetra(songName, artistName) {
  const searchUrl = `https://www.letras.mus.br/buscar.php?q=${encodeURIComponent(songName + ' ' + artistName)}`;

  try {
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);
    const firstResult = $('a[href*="/letra/"]').first().attr('href');
    if (!firstResult) throw new Error('Música não encontrada');

    const letraUrl = `https://www.letras.mus.br${firstResult}`;
    const letraResponse = await axios.get(letraUrl);
    const $letra = cheerio.load(letraResponse.data);
    const letra = $letra('.letra-cnt p').text().trim();
    if (!letra) throw new Error('Letra não disponível');

    return letra;
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