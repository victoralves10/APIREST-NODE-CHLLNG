import { Request, Response } from 'express';
import * as animalService from '../services/animalService';
import * as consultaService from '../services/consultaService';

export async function listar(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const { microchip } = req.query;

    if (microchip && typeof microchip === 'string') {
      const animal = await animalService.buscarPorMicrochip(microchip, uid);
      return res.status(200).json(animal);
    }

    const animais = await animalService.listarPorUsuario(uid);
    res.status(200).json(animais);
  } catch (err) {
    console.error('[animalController.listar]', err);
    res.status(500).json({ error: 'Erro ao listar animais.' });
  }
}

export async function buscarPorId(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const id = Number(req.params.id);
    const animal = await animalService.buscarPorId(id, uid);

    if (!animal) {
      return res.status(404).json({ error: 'Animal não encontrado.' });
    }
    res.status(200).json(animal);
  } catch (err) {
    console.error('[animalController.buscarPorId]', err);
    res.status(500).json({ error: 'Erro ao buscar animal.' });
  }
}

export async function listarConsultasDoAnimal(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const id = Number(req.params.id);
    const consultas = await consultaService.listarPorAnimal(id, uid);
    res.status(200).json(consultas);
  } catch (err) {
    console.error('[animalController.listarConsultasDoAnimal]', err);
    res.status(500).json({ error: 'Erro ao buscar histórico de consultas do animal.' });
  }
}

export async function criar(req: Request, res: Response) {
  try {
    const { nm_animal, especie_animal, id_responsavel } = req.body;

    if (!nm_animal || !especie_animal || !id_responsavel) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nm_animal, especie_animal, id_responsavel.',
      });
    }

    const novoAnimal = await animalService.criar(req.body);
    res.status(201).json(novoAnimal);
  } catch (err) {
    console.error('[animalController.criar]', err);
    res.status(500).json({ error: 'Erro ao criar animal.' });
  }
}

export async function atualizar(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const id = Number(req.params.id);
    const { nm_animal, especie_animal } = req.body;

    if (!nm_animal || !especie_animal) {
      return res.status(400).json({ error: 'Campos obrigatórios: nm_animal, especie_animal.' });
    }

    const atualizado = await animalService.atualizar(id, req.body, uid);

    if (!atualizado) {
      return res.status(404).json({ error: 'Animal não encontrado.' });
    }
    res.status(200).json({ id_animal: id, ...req.body });
  } catch (err) {
    console.error('[animalController.atualizar]', err);
    res.status(500).json({ error: 'Erro ao atualizar animal.' });
  }
}

export async function remover(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const id = Number(req.params.id);
    const removido = await animalService.remover(id, uid);

    if (!removido) {
      return res.status(404).json({ error: 'Animal não encontrado.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('[animalController.remover]', err);
    res.status(500).json({ error: 'Erro ao remover animal.' });
  }
}
