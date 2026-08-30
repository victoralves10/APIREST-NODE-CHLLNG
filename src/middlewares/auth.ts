import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Middleware que protege as rotas, exigindo um JWT válido no header
 * Authorization: Bearer <token>.
 *
 * O token é emitido pelo próprio backend (ver authController.ts),
 * após login ou cadastro bem-sucedidos.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('authorization') || req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação ausente.' });
  }

  const token = authHeader.substring('Bearer '.length);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      error: 'JWT_SECRET não configurado no servidor. Confira o .env.',
    });
  }

  try {
    const decoded = jwt.verify(token, secret) as { uid: string };
    req.uid = decoded.uid;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}