import { runQuery } from '../config/database';
import { Animal, CriarAnimalBody } from '../types';

// Todas as queries fazem JOIN com T_CLYVO_RESPONSAVEL para checar o uid_firebase,
// já que Animal não guarda o uid diretamente — ele herda o "dono" via responsável.

export async function listarPorUsuario(uid: string): Promise<Animal[]> {
  const result = await runQuery<Animal>(
    `SELECT a.id_animal, a.rg_animal, a.nr_microchip_animal, a.nm_animal,
            a.dt_nascimento_animal, a.peso_animal, a.especie_animal, a.raca_animal,
            a.id_responsavel
     FROM T_CLYVO_ANIMAL a
     INNER JOIN T_CLYVO_RESPONSAVEL r ON r.id_responsavel = a.id_responsavel
     WHERE r.uid_firebase = :uid
     ORDER BY a.nm_animal`,
    { uid }
  );
  return result.rows ?? [];
}

export async function buscarPorId(id: number, uid: string): Promise<Animal | null> {
  const result = await runQuery<Animal>(
    `SELECT a.id_animal, a.rg_animal, a.nr_microchip_animal, a.nm_animal,
            a.dt_nascimento_animal, a.peso_animal, a.especie_animal, a.raca_animal,
            a.id_responsavel
     FROM T_CLYVO_ANIMAL a
     INNER JOIN T_CLYVO_RESPONSAVEL r ON r.id_responsavel = a.id_responsavel
     WHERE a.id_animal = :id AND r.uid_firebase = :uid`,
    { id, uid }
  );
  return result.rows?.[0] ?? null;
}

export async function buscarPorMicrochip(microchip: string, uid: string): Promise<Animal | null> {
  const result = await runQuery<Animal>(
    `SELECT a.id_animal, a.rg_animal, a.nr_microchip_animal, a.nm_animal,
            a.dt_nascimento_animal, a.peso_animal, a.especie_animal, a.raca_animal,
            a.id_responsavel
     FROM T_CLYVO_ANIMAL a
     INNER JOIN T_CLYVO_RESPONSAVEL r ON r.id_responsavel = a.id_responsavel
     WHERE a.nr_microchip_animal = :microchip AND r.uid_firebase = :uid`,
    { microchip, uid }
  );
  return result.rows?.[0] ?? null;
}

export async function criar(body: CriarAnimalBody): Promise<Animal> {
  const result = await runQuery<{ id_animal: number }>(
    `INSERT INTO T_CLYVO_ANIMAL
       (rg_animal, nr_microchip_animal, nm_animal, dt_nascimento_animal, peso_animal, especie_animal, raca_animal, id_responsavel)
     VALUES
       (:rg, :microchip, :nome, TO_DATE(:nascimento, 'YYYY-MM-DD'), :peso, :especie, :raca, :idResponsavel)
     RETURNING id_animal INTO :novoId`,
    {
      rg: body.rg_animal ?? null,
      microchip: body.nr_microchip_animal ?? null,
      nome: body.nm_animal,
      nascimento: body.dt_nascimento_animal ?? null,
      peso: body.peso_animal ?? null,
      especie: body.especie_animal,
      raca: body.raca_animal ?? null,
      idResponsavel: body.id_responsavel,
      novoId: { dir: 3003, type: 2010 },
    }
  );

  const novoId = (result.outBinds as any).novoId[0];
  return { id_animal: novoId, ...body } as Animal;
}

export async function atualizar(id: number, body: CriarAnimalBody, uid: string): Promise<boolean> {
  const result = await runQuery(
    `UPDATE T_CLYVO_ANIMAL a
     SET rg_animal = :rg,
         nr_microchip_animal = :microchip,
         nm_animal = :nome,
         dt_nascimento_animal = TO_DATE(:nascimento, 'YYYY-MM-DD'),
         peso_animal = :peso,
         especie_animal = :especie,
         raca_animal = :raca
     WHERE a.id_animal = :id
       AND EXISTS (
         SELECT 1 FROM T_CLYVO_RESPONSAVEL r
         WHERE r.id_responsavel = a.id_responsavel AND r.uid_firebase = :uid
       )`,
    {
      id,
      uid,
      rg: body.rg_animal ?? null,
      microchip: body.nr_microchip_animal ?? null,
      nome: body.nm_animal,
      nascimento: body.dt_nascimento_animal ?? null,
      peso: body.peso_animal ?? null,
      especie: body.especie_animal,
      raca: body.raca_animal ?? null,
    }
  );
  return (result.rowsAffected ?? 0) > 0;
}

export async function remover(id: number, uid: string): Promise<boolean> {
  // ON DELETE CASCADE cuida de remover as Consultas vinculadas a este animal.
  const result = await runQuery(
    `DELETE FROM T_CLYVO_ANIMAL a
     WHERE a.id_animal = :id
       AND EXISTS (
         SELECT 1 FROM T_CLYVO_RESPONSAVEL r
         WHERE r.id_responsavel = a.id_responsavel AND r.uid_firebase = :uid
       )`,
    { id, uid }
  );
  return (result.rowsAffected ?? 0) > 0;
}
