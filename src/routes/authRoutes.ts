import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/cadastro', authController.cadastrar);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.put('/perfil', authMiddleware, authController.atualizarPerfil);
router.delete('/conta', authMiddleware, authController.apagarConta);

export default router;