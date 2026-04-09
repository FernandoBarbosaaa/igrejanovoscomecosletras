document.getElementById('pptxForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const songName = document.getElementById('songName').value;
  const artistName = document.getElementById('artistName').value;
  const messageDiv = document.getElementById('message');

  messageDiv.textContent = 'Gerando PowerPoint...';

  try {
    const response = await fetch('/generate-pptx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ songName, artistName })
    });

    if (response.ok) {
      // Download automático
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${songName.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      messageDiv.textContent = 'PowerPoint gerado com sucesso!';
    } else {
      const error = await response.json();
      messageDiv.textContent = error.error;
    }
  } catch (error) {
    messageDiv.textContent = 'Erro ao gerar PowerPoint.';
  }
});