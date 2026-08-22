import { Request, Response } from 'express';
import * as responsavelService from '../services/responsavelService';

export async function listar(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const { cpf } = req.query;

    if (cpf && typeof cpf === 'string') {
      const responsavel = await responsavelService.buscarPorCpf(cpf, uid);
      return res.status(200).json(responsavel); // pode ser null — o mobile já trata isso
    }

    const responsaveis = await responsavelService.listarPorUsuario(uid);
    res.status(200).json(responsaveis);
  } catch (err) {
    console.error('[responsavelController.listar]', err);
    res.status(500).json({ error: 'Erro ao listar responsáveis.' });
  }
}

export async function buscarPorId(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const id = Number(req.params.id);
    const responsavel = await responsavelService.buscarPorId(id, uid);

    if (!responsavel) {
      return res.status(404).json({ error: 'Responsável não encontrado.' });
    }
    res.status(200).json(responsavel);
  } catch (err) {
    console.error('[responsavelController.buscarPorId]', err);
    res.status(500).json({ error: 'Erro ao buscar responsável.' });
  }
}

export async function criar(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const { cpf_responsavel, nm_responsavel, nr_telefone_responsavel } = req.body;

    if (!cpf_responsavel || !nm_responsavel || !nr_telefone_responsavel) {
      return res.status(400).json({
        error: 'Campos obrigatórios: cpf_responsavel, nm_responsavel, nr_telefone_responsavel.',
      });
    }

    const novoResponsavel = await responsavelService.criar(
      { cpf_responsavel, nm_responsavel, nr_telefone_responsavel },
      uid
    );
    res.status(201).json(novoResponsavel);
  } catch (err) {
    console.error('[responsavelController.criar]', err);
    res.status(500).json({ error: 'Erro ao criar responsável.' });
  }
}

export async function atualizar(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const id = Number(req.params.id);
    const { cpf_responsavel, nm_responsavel, nr_telefone_responsavel } = req.body;

    if (!cpf_responsavel || !nm_responsavel || !nr_telefone_responsavel) {
      return res.status(400).json({
        error: 'Campos obrigatórios: cpf_responsavel, nm_responsavel, nr_telefone_responsavel.',
      });
    }

    const atualizado = await responsavelService.atualizar(
      id,
      { cpf_responsavel, nm_responsavel, nr_telefone_responsavel },
      uid
    );

    if (!atualizado) {
      return res.status(404).json({ error: 'Responsável não encontrado.' });
    }
    res.status(200).json({ id_responsavel: id, cpf_responsavel, nm_responsavel, nr_telefone_responsavel });
  } catch (err) {
    console.error('[responsavelController.atualizar]', err);
    res.status(500).json({ error: 'Erro ao atualizar responsável.' });
  }
}

export async function remover(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const id = Number(req.params.id);
    const removido = await responsavelService.remover(id, uid);

    if (!removido) {
      return res.status(404).json({ error: 'Responsável não encontrado.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('[responsavelController.remover]', err);
    res.status(500).json({ error: 'Erro ao remover responsável.' });
  }
}
