const express = require('express');
const PptxGenJS = require('pptxgenjs');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Função para buscar letra usando Genius API (exemplo)
async function buscarLetra(songName, artistName) {
  // Nota: Você precisa de uma chave API do Genius. Substitua 'YOUR_GENIUS_API_KEY' pela sua chave.
  const apiKey = 'YOUR_GENIUS_API_KEY';
  const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(songName + ' ' + artistName)}`;

  try {
    const response = await axios.get(searchUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const hits = response.data.response.hits;
    if (hits.length > 0) {
      const songUrl = hits[0].result.url;
      // Para simplificar, assumimos que a letra está disponível. Em produção, você pode precisar de scraping ou outra API.
      // Aqui, simulamos retornando uma letra de exemplo.
      return "Esta é uma letra de exemplo.\n\n[Verso 1]\nLinha 1\nLinha 2\n\n[Coro]\nCoro linha 1\nCoro linha 2";
    }
  } catch (error) {
    throw new Error('Letra não encontrada');
  }
}

// Função para dividir letra em slides
function dividirEmSlides(letra) {
  // Dividir por quebras duplas (estrofes)
  const estrofes = letra.split('\n\n').filter(e => e.trim());
  return estrofes;
}

// Endpoint para gerar PPTX
app.post('/generate-pptx', async (req, res) => {
  const { songName, artistName } = req.body;

  try {
    const letra = await buscarLetra(songName, artistName);
    const slides = dividirEmSlides(letra);

    const pptx = new PptxGenJS();

    // Configurar layout
    pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 5.625 }); // 16:9
    pptx.layout = 'CUSTOM';

    slides.forEach(estrofe => {
      const slide = pptx.addSlide();
      slide.background = { color: '000000' }; // Fundo preto
      slide.addText(estrofe, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 4.625,
        fontSize: 36,
        color: 'FFFFFF',
        align: 'left',
        valign: 'top',
        lineSpacing: 1.2
      });
    });

    const fileName = `${songName.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
    const filePath = path.join(__dirname, fileName);

    await pptx.writeFile({ fileName });

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Erro ao baixar arquivo');
      }
      // Remover arquivo após download
      require('fs').unlinkSync(filePath);
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});