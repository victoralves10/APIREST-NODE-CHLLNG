import { Router } from 'express';
import * as consultaController from '../controllers/consultaController';

const router = Router();

router.get('/', consultaController.listar);
router.get('/:id', consultaController.buscarPorId);
router.post('/', consultaController.criar);
router.put('/:id', consultaController.atualizar);
router.delete('/:id', consultaController.remover);

export default router;
