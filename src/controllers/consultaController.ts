import { Request, Response } from 'express';
import * as consultaService from '../services/consultaService';

const STATUS_VALIDOS = ['Agendado', 'Concluido', 'Atrasado'];

export async function listar(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const consultas = await consultaService.listarPorUsuario(uid);
    res.status(200).json(consultas);
  } catch (err) {
    console.error('[consultaController.listar]', err);
    res.status(500).json({ error: 'Erro ao listar consultas.' });
  }
}

export async function buscarPorId(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const id = Number(req.params.id);
    const consulta = await consultaService.buscarPorId(id, uid);

    if (!consulta) {
      return res.status(404).json({ error: 'Consulta não encontrada.' });
    }
    res.status(200).json(consulta);
  } catch (err) {
    console.error('[consultaController.buscarPorId]', err);
    res.status(500).json({ error: 'Erro ao buscar consulta.' });
  }
}

export async function criar(req: Request, res: Response) {
  try {
    const { historico_consulta, dt_consulta, hr_consulta, id_animal, st_consulta } = req.body;

    if (!historico_consulta || !dt_consulta || !hr_consulta || !id_animal) {
      return res.status(400).json({
        error: 'Campos obrigatórios: historico_consulta, dt_consulta, hr_consulta, id_animal.',
      });
    }

    if (st_consulta && !STATUS_VALIDOS.includes(st_consulta)) {
      return res.status(400).json({ error: `st_consulta deve ser um de: ${STATUS_VALIDOS.join(', ')}.` });
    }

    const novaConsulta = await consultaService.criar(req.body);
    res.status(201).json(novaConsulta);
  } catch (err) {
    console.error('[consultaController.criar]', err);
    res.status(500).json({ error: 'Erro ao criar consulta.' });
  }
}

export async function atualizar(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const id = Number(req.params.id);
    const { historico_consulta, dt_consulta, hr_consulta, st_consulta } = req.body;

    if (!historico_consulta || !dt_consulta || !hr_consulta || !st_consulta) {
      return res.status(400).json({
        error: 'Campos obrigatórios: historico_consulta, dt_consulta, hr_consulta, st_consulta.',
      });
    }

    if (!STATUS_VALIDOS.includes(st_consulta)) {
      return res.status(400).json({ error: `st_consulta deve ser um de: ${STATUS_VALIDOS.join(', ')}.` });
    }

    const atualizado = await consultaService.atualizar(
      id,
      { historico_consulta, dt_consulta, hr_consulta, st_consulta },
      uid
    );

    if (!atualizado) {
      return res.status(404).json({ error: 'Consulta não encontrada.' });
    }
    res.status(200).json({ id_consulta: id, historico_consulta, dt_consulta, hr_consulta, st_consulta });
  } catch (err) {
    console.error('[consultaController.atualizar]', err);
    res.status(500).json({ error: 'Erro ao atualizar consulta.' });
  }
}

export async function remover(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const id = Number(req.params.id);
    const removido = await consultaService.remover(id, uid);

    if (!removido) {
      return res.status(404).json({ error: 'Consulta não encontrada.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('[consultaController.remover]', err);
    res.status(500).json({ error: 'Erro ao remover consulta.' });
  }
}
