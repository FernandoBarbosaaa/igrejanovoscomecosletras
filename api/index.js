const express = require('express');
const PptxGenJS = require('pptxgenjs');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Função para buscar letra
async function buscarLetra(songName, artistName) {
  const apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artistName)}/${encodeURIComponent(songName)}`;

  try {
    const response = await axios.get(apiUrl);
    if (response.data.lyrics) {
      return response.data.lyrics;
    }
    throw new Error('Letra não encontrada');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('Música não encontrada na base de dados');
    }
    throw new Error('Erro ao buscar letra: ' + error.message);
  }
}

// Função para dividir letra em slides
function dividirEmSlides(letra, linhasPorSlide = 4) {
  const linhas = letra.split('\n').filter(l => l.trim());
  const slides = [];
  for (let i = 0; i < linhas.length; i += linhasPorSlide) {
    slides.push(linhas.slice(i, i + linhasPorSlide));
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
    pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 5.625 });
    pptx.layout = 'CUSTOM';

    // Slide de título
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: '000000' };
    titleSlide.addText(`${songName}\n${artistName}`, {
      x: 0.5,
      y: 1,
      w: 9,
      h: 3.625,
      fontSize: 48,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
      fontFace: 'Arial'
    });

    // Slides de letra (AJUSTADO)
    slides.forEach(linhas => {
      const slide = pptx.addSlide();
      slide.background = { color: '000000' };

      slide.addText(
        linhas.map(linha => ({
          text: linha,
          options: { breakLine: true }
        })),
        {
          x: 0.3,               // mais próximo da esquerda
          y: 0.5,
          w: 9,
          h: 4.625,
          fontSize: 40,         // 👈 tamanho ajustado
          color: 'FFFFFF',
          align: 'left',        // 👈 alinhamento à esquerda
          valign: 'top',
          fontFace: 'Arial',
          lineSpacingMultiple: 1.2
        }
      );
    });

    const fileName = `${songName.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
    const filePath = path.join('/tmp', fileName);

    await pptx.writeFile({ fileName: filePath });

    res.download(filePath, fileName, () => fs.unlinkSync(filePath));

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = app;