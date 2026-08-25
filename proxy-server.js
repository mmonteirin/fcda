import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwsqo9VNgfcitwTkYNB9SZzWKpsjw0J8JekP1gDvRCUzgli49JtqJA1XYPU0R2N_KvNA/exec';

// Middleware
app.use(cors());
app.use(express.json());

// Proxy endpoint para o Google Apps Script
app.get('/api/ranking', async (req, res) => {
  try {
    // Construir a URL com os parâmetros da requisição
    const url = new URL(GOOGLE_APPS_SCRIPT_URL);
    Object.keys(req.query).forEach(key => {
      if (req.query[key]) {
        url.searchParams.append(key, req.query[key]);
      }
    });

    console.log('Proxying request to:', url.toString());

    // Fazer a requisição para o Google Apps Script
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      redirect: 'follow' // Seguir redirecionamentos
    });

    console.log('Response status:', response.status);
    console.log('Response content-type:', response.headers.get('content-type'));

    const responseText = await response.text();
    console.log('Response length:', responseText.length);
    console.log('Response preview:', responseText.substring(0, 200));

    // Verificar se a resposta é HTML (página de login) em vez de JSON
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      console.error('Google Apps Script não está configurado como público');
      throw new Error('A API do Google Apps Script não está configurada como pública. Configure a implantação como "App da Web" com acesso "Qualquer pessoa".');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Tentar fazer parse como JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Resposta não é JSON válido');
    }
    
    // Retornar os dados com headers CORS
    res.json(data);
  } catch (error) {
    console.error('Erro no proxy:', error);
    res.status(500).json({ 
      erro: true, 
      mensagem: 'Erro ao carregar dados do ranking',
      detalhes: error.message,
      configuracao: 'Configure a implantação do Google Apps Script como "App da Web" com acesso "Qualquer pessoa"'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Proxy server rodando em http://localhost:${PORT}`);
  console.log(`Proxy endpoint: http://localhost:${PORT}/api/ranking`);
});