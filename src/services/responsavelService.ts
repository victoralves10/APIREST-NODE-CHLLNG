import { runQuery } from '../config/database';
import { Responsavel, CriarResponsavelBody } from '../types';

export async function listarPorUsuario(uid: string): Promise<Responsavel[]> {
  const result = await runQuery<Responsavel>(
    `SELECT id_responsavel, uid_firebase, cpf_responsavel, nm_responsavel, nr_telefone_responsavel
     FROM T_CLYVO_RESPONSAVEL
     WHERE uid_firebase = :uid
     ORDER BY nm_responsavel`,
    { uid }
  );
  return result.rows ?? [];
}

export async function buscarPorId(id: number, uid: string): Promise<Responsavel | null> {
  const result = await runQuery<Responsavel>(
    `SELECT id_responsavel, uid_firebase, cpf_responsavel, nm_responsavel, nr_telefone_responsavel
     FROM T_CLYVO_RESPONSAVEL
     WHERE id_responsavel = :id AND uid_firebase = :uid`,
    { id, uid }
  );
  return result.rows?.[0] ?? null;
}

export async function buscarPorCpf(cpf: string, uid: string): Promise<Responsavel | null> {
  const result = await runQuery<Responsavel>(
    `SELECT id_responsavel, uid_firebase, cpf_responsavel, nm_responsavel, nr_telefone_responsavel
     FROM T_CLYVO_RESPONSAVEL
     WHERE cpf_responsavel = :cpf AND uid_firebase = :uid`,
    { cpf, uid }
  );
  return result.rows?.[0] ?? null;
}

export async function criar(body: CriarResponsavelBody, uid: string): Promise<Responsavel> {
  const result = await runQuery<{ id_responsavel: number }>(
    `INSERT INTO T_CLYVO_RESPONSAVEL (uid_firebase, cpf_responsavel, nm_responsavel, nr_telefone_responsavel)
     VALUES (:uid, :cpf, :nome, :telefone)
     RETURNING id_responsavel INTO :novoId`,
    {
      uid,
      cpf: body.cpf_responsavel,
      nome: body.nm_responsavel,
      telefone: body.nr_telefone_responsavel,
      novoId: { dir: 3003 /* BIND_OUT */, type: 2010 /* NUMBER */ },
    }
  );

  const novoId = (result.outBinds as any).novoId[0];
  return {
    id_responsavel: novoId,
    uid_firebase: uid,
    cpf_responsavel: body.cpf_responsavel,
    nm_responsavel: body.nm_responsavel,
    nr_telefone_responsavel: body.nr_telefone_responsavel,
  };
}

export async function atualizar(
  id: number,
  body: CriarResponsavelBody,
  uid: string
): Promise<boolean> {
  const result = await runQuery(
    `UPDATE T_CLYVO_RESPONSAVEL
     SET cpf_responsavel = :cpf, nm_responsavel = :nome, nr_telefone_responsavel = :telefone
     WHERE id_responsavel = :id AND uid_firebase = :uid`,
    {
      id,
      uid,
      cpf: body.cpf_responsavel,
      nome: body.nm_responsavel,
      telefone: body.nr_telefone_responsavel,
    }
  );
  return (result.rowsAffected ?? 0) > 0;
}

export async function remover(id: number, uid: string): Promise<boolean> {
  // ON DELETE CASCADE no schema já cuida de remover Animais e Consultas vinculados.
  const result = await runQuery(
    `DELETE FROM T_CLYVO_RESPONSAVEL WHERE id_responsavel = :id AND uid_firebase = :uid`,
    { id, uid }
  );
  return (result.rowsAffected ?? 0) > 0;
}

/**
 * Conta quantos animais um responsável ainda tem.
 * Não é usado diretamente aqui (o CASCADE do banco já remove tudo junto),
 * mas fica disponível caso o time queira, no futuro, impedir a remoção
 * do responsável enquanto ele ainda tiver animais vinculados, em vez de
 * deixar o CASCADE remover tudo silenciosamente.
 */
export async function contarAnimaisVinculados(idResponsavel: number): Promise<number> {
  const result = await runQuery<{ TOTAL: number }>(
    `SELECT COUNT(*) AS total FROM T_CLYVO_ANIMAL WHERE id_responsavel = :id`,
    { id: idResponsavel }
  );
  return result.rows?.[0]?.TOTAL ?? 0;
}
