import 'dotenv/config';
import app from './app';
import { initDatabase, closeDatabase } from './config/database';
import { initFirebaseAdmin } from './middlewares/auth';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

async function start() {
  try {
    await initDatabase();
    initFirebaseAdmin();

    const server = app.listen(PORT, () => {
      const authMode = process.env.AUTH_MODE ?? 'strict';
      console.log(`[server] ClyvoVet backend rodando em http://localhost:${PORT}`);
      console.log(`[server] Modo de autenticação: ${authMode.toUpperCase()}`);
      if (authMode === 'open') {
        console.log(
          '[server] ⚠️  AUTH_MODE=open — o servidor NÃO está validando tokens do Firebase. ' +
            'Use apenas para testes locais. Troque para "strict" antes de conectar o app de verdade.'
        );
      }
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
