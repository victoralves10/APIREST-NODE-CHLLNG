import 'dotenv/config';
import app from './app';
import { initDatabase, closeDatabase } from './config/database';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

async function start() {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('[server] JWT_SECRET não configurado no .env. O servidor não pode iniciar sem isso.');
      process.exit(1);
    }

    await initDatabase();

    const server = app.listen(PORT, () => {
      console.log(`[server] ClyvoVet backend rodando em http://localhost:${PORT}`);
      console.log('[server] Autenticação: JWT próprio (login/cadastro em /auth)');
    });

    // Encerramento gracioso: fecha o pool do Oracle antes de derrubar o processo.
    const shutdown = async () => {
      console.log('\n[server] Encerrando...');
      server.close();
      await closeDatabase();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[server] Falha ao iniciar o servidor:', err);
    process.exit(1);
  }
}

start();