import oracledb from 'oracledb';
import { runQuery } from '../config/database';
import { Consulta, CriarConsultaBody, AtualizarConsultaBody } from '../types';

// Consulta herda o dono via Animal -> Responsavel, por isso o duplo JOIN.

export async function listarPorUsuario(uid: string): Promise<Consulta[]> {
  const result = await runQuery<Consulta>(
    `SELECT c.id_consulta, c.historico_consulta, c.st_consulta, c.dt_consulta, c.hr_consulta, c.id_animal
     FROM T_CLYVO_CONSULTA c
     INNER JOIN T_CLYVO_ANIMAL a ON a.id_animal = c.id_animal
     INNER JOIN T_CLYVO_RESPONSAVEL r ON r.id_responsavel = a.id_responsavel
     WHERE r.id_usuario_dono = :idUsuario
     ORDER BY c.dt_consulta DESC`,
    { idUsuario: Number(uid) }
  );
  return result.rows ?? [];
}

export async function buscarPorId(id: number, uid: string): Promise<Consulta | null> {
  const result = await runQuery<Consulta>(
    `SELECT c.id_consulta, c.historico_consulta, c.st_consulta, c.dt_consulta, c.hr_consulta, c.id_animal
     FROM T_CLYVO_CONSULTA c
     INNER JOIN T_CLYVO_ANIMAL a ON a.id_animal = c.id_animal
     INNER JOIN T_CLYVO_RESPONSAVEL r ON r.id_responsavel = a.id_responsavel
     WHERE c.id_consulta = :id AND r.id_usuario_dono = :idUsuario`,
    { id, idUsuario: Number(uid) }
  );
  return result.rows?.[0] ?? null;
}

export async function listarPorAnimal(idAnimal: number, uid: string): Promise<Consulta[]> {
  const result = await runQuery<Consulta>(
    `SELECT c.id_consulta, c.historico_consulta, c.st_consulta, c.dt_consulta, c.hr_consulta, c.id_animal
     FROM T_CLYVO_CONSULTA c
     INNER JOIN T_CLYVO_ANIMAL a ON a.id_animal = c.id_animal
     INNER JOIN T_CLYVO_RESPONSAVEL r ON r.id_responsavel = a.id_responsavel
     WHERE c.id_animal = :idAnimal AND r.id_usuario_dono = :idUsuario
     ORDER BY c.dt_consulta DESC`,
    { idAnimal, idUsuario: Number(uid) }
  );
  return result.rows ?? [];
}

export async function criar(body: CriarConsultaBody): Promise<Consulta> {
  const status = body.st_consulta ?? 'Agendado';

  const result = await runQuery<{ id_consulta: number }>(
    `INSERT INTO T_CLYVO_CONSULTA (historico_consulta, st_consulta, dt_consulta, hr_consulta, id_animal)
     VALUES (:historico, :status, TO_DATE(:data, 'YYYY-MM-DD'), :hora, :idAnimal)
     RETURNING id_consulta INTO :novoId`,
    {
      historico: body.historico_consulta,
      status,
      data: body.dt_consulta,
      hora: body.hr_consulta,
      idAnimal: body.id_animal,
      novoId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );

  const novoId = (result.outBinds as any).novoId[0];
  return {
    id_consulta: novoId,
    historico_consulta: body.historico_consulta,
    st_consulta: status,
    dt_consulta: body.dt_consulta,
    hr_consulta: body.hr_consulta,
    id_animal: body.id_animal,
  };
}

export async function atualizar(
  id: number,
  body: AtualizarConsultaBody,
  uid: string
): Promise<boolean> {
  const result = await runQuery(
    `UPDATE T_CLYVO_CONSULTA c
     SET historico_consulta = :historico,
         st_consulta = :status,
         dt_consulta = TO_DATE(:data, 'YYYY-MM-DD'),
         hr_consulta = :hora
     WHERE c.id_consulta = :id
       AND EXISTS (
         SELECT 1 FROM T_CLYVO_ANIMAL a
         INNER JOIN T_CLYVO_RESPONSAVEL r ON r.id_responsavel = a.id_responsavel
         WHERE a.id_animal = c.id_animal AND r.id_usuario_dono = :idUsuario
       )`,
    {
      id,
      idUsuario: Number(uid),
      historico: body.historico_consulta,
      status: body.st_consulta,
      data: body.dt_consulta,
      hora: body.hr_consulta,
    }
  );
  return (result.rowsAffected ?? 0) > 0;
}

export async function remover(id: number, uid: string): Promise<boolean> {
  const result = await runQuery(
    `DELETE FROM T_CLYVO_CONSULTA c
     WHERE c.id_consulta = :id
       AND EXISTS (
         SELECT 1 FROM T_CLYVO_ANIMAL a
         INNER JOIN T_CLYVO_RESPONSAVEL r ON r.id_responsavel = a.id_responsavel
         WHERE a.id_animal = c.id_animal AND r.id_usuario_dono = :idUsuario
       )`,
    { id, idUsuario: Number(uid) }
  );
  return (result.rowsAffected ?? 0) > 0;
}