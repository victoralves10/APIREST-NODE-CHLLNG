import { Router } from 'express';
import * as animalController from '../controllers/animalController';

const router = Router();

// GET /animais                  -> lista todos
// GET /animais?microchip=XXX    -> busca por microchip (deduplicação do modal "Nova Consulta")
router.get('/', animalController.listar);

router.get('/:id', animalController.buscarPorId);
router.get('/:id/consultas', animalController.listarConsultasDoAnimal);
router.post('/', animalController.criar);
router.put('/:id', animalController.atualizar);
router.delete('/:id', animalController.remover);

export default router;
