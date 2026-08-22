import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

let firebaseInitialized = false;

/**
 * Inicializa o Firebase Admin SDK, se ainda não foi inicializado
 * e se houver credenciais configuradas no .env.
 * Chamado uma vez no start do servidor.
 */
export function initFirebaseAdmin(): void {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    console.warn(
      '[auth] FIREBASE_SERVICE_ACCOUNT_JSON não configurado. ' +
        'O middleware de autenticação vai rejeitar qualquer token até isso ser preenchido.'
    );
    return;
  }

  const serviceAccount = JSON.parse(raw);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  firebaseInitialized = true;
  console.log('[auth] Firebase Admin SDK inicializado.');
}

/**
 * Middleware que protege as rotas.
 *
 * Comportamento depende de AUTH_MODE no .env:
 * - "open"   -> NÃO exige token. Usa um uid fixo de desenvolvimento (DEV_UID)
 *               ou o header "x-dev-uid" se enviado, só para permitir testar
 *               via Postman/Insomnia antes do Firebase estar plugado no app.
 *               ⚠️ Nunca usar em produção.
 * - "strict" -> exige um ID Token válido do Firebase no header
 *               Authorization: Bearer <token>. Rejeita com 401 se ausente/inválido.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const mode = process.env.AUTH_MODE ?? 'strict';

  if (mode === 'open') {
    // Modo de desenvolvimento: permite passar um uid via header pra simular
    // usuários diferentes sem precisar de token real ainda.
    req.uid = (req.header('x-dev-uid') as string) || 'dev-user-1';
    return next();
  }

  // Modo strict: validação real via Firebase
  const authHeader = req.header('authorization') || req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação ausente.' });
  }

  if (!firebaseInitialized) {
    return res.status(500).json({
      error: 'Firebase Admin SDK não está configurado no servidor. Confira FIREBASE_SERVICE_ACCOUNT_JSON no .env.',
    });
  }

  const token = authHeader.substring('Bearer '.length);

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}
