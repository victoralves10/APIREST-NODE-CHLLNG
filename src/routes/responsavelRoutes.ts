import { Router } from 'express';
import * as responsavelController from '../controllers/responsavelController';

const router = Router();

// GET /responsaveis            -> lista todos
// GET /responsaveis?cpf=XXX    -> busca por cpf (usado na deduplicação do modal "Nova Consulta")
router.get('/', responsavelController.listar);

router.get('/:id', responsavelController.buscarPorId);
router.post('/', responsavelController.criar);
router.put('/:id', responsavelController.atualizar);
router.delete('/:id', responsavelController.remover);

export default router;
