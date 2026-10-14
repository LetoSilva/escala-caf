import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'escala.json');

// Garante que o diretório e arquivo de dados existam
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function carregarDados() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const conteudo = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(conteudo);
    }
  } catch (err) {
    console.error('Erro ao ler escala.json:', err);
  }
  return { substituicoes: {}, ausencias: [] };
}

// Clientes conectados ao Server-Sent Events para atualização instantânea (tempo real)
const sseClients: express.Response[] = [];

function notificarTodosClientes(dados: any) {
  const payload = `data: ${JSON.stringify(dados)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

function salvarDados(dados: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dados, null, 2), 'utf-8');
    notificarTodosClientes(dados);
  } catch (err) {
    console.error('Erro ao salvar escala.json:', err);
  }
}

// Inicializa dados padrão se vazio
if (!fs.existsSync(DATA_FILE)) {
  salvarDados({ substituicoes: {}, ausencias: [] });
}

// Rotas de API para compartilhamento em tempo real entre todos os colaboradores
app.get('/api/escala', (req, res) => {
  res.json(carregarDados());
});

// Stream de eventos em tempo real (Server-Sent Events) - notificação instantânea para todos
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Envia dados atuais imediatamente ao conectar
  const dadosIniciais = carregarDados();
  res.write(`data: ${JSON.stringify(dadosIniciais)}\n\n`);

  sseClients.push(res);

  // Ping a cada 15 segundos para manter a conexão aberta e viva
  const pingInterval = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(pingInterval);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(pingInterval);
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

app.post('/api/escala', (req, res) => {
  const dados = req.body;
  if (dados && typeof dados === 'object') {
    salvarDados(dados);
  }
  res.json({ ok: true, dados: carregarDados() });
});

app.post('/api/substituicoes', (req, res) => {
  const { chave, valor } = req.body;
  const dados = carregarDados();
  if (chave && valor) {
    dados.substituicoes[chave] = valor;
    salvarDados(dados);
  }
  res.json({ ok: true, substituicoes: dados.substituicoes });
});

app.delete('/api/substituicoes/:chave', (req, res) => {
  const { chave } = req.params;
  const dados = carregarDados();
  if (chave && dados.substituicoes[chave]) {
    delete dados.substituicoes[chave];
    salvarDados(dados);
  }
  res.json({ ok: true, substituicoes: dados.substituicoes });
});

app.delete('/api/substituicoes-mes/:prefixo', (req, res) => {
  const { prefixo } = req.params;
  const dados = carregarDados();
  Object.keys(dados.substituicoes).forEach(k => {
    if (k.startsWith(prefixo)) {
      delete dados.substituicoes[k];
    }
  });
  salvarDados(dados);
  res.json({ ok: true, substituicoes: dados.substituicoes });
});

app.post('/api/ausencias', (req, res) => {
  const ausencia = req.body;
  const dados = carregarDados();
  if (ausencia && ausencia.colaborador) {
    dados.ausencias = dados.ausencias || [];
    dados.ausencias.push(ausencia);
    salvarDados(dados);
  }
  res.json({ ok: true, ausencias: dados.ausencias });
});

app.delete('/api/ausencias/:id', (req, res) => {
  const { id } = req.params;
  const dados = carregarDados();
  dados.ausencias = (dados.ausencias || []).filter((a: any) => a.id !== id);
  salvarDados(dados);
  res.json({ ok: true, ausencias: dados.ausencias });
});

async function start() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server CAF Escala rodando em http://0.0.0.0:${PORT}`);
  });
}

start();
