import oracledb from "oracledb";
import { runQuery } from "../config/database";

export interface Usuario {
  id_usuario: number;
  nm_usuario: string;
  email_usuario: string;
  senha_hash: string;
}

export async function buscarPorEmail(email: string): Promise<Usuario | null> {
  const result = await runQuery<Usuario>(
    `SELECT id_usuario, nm_usuario, email_usuario, senha_hash
     FROM T_CLYVO_USUARIO
     WHERE email_usuario = :email`,
    { email }
  );
  return result.rows?.[0] ?? null;
}

export async function buscarPorId(id: string): Promise<Usuario | null> {
  const result = await runQuery<Usuario>(
    `SELECT id_usuario, nm_usuario, email_usuario, senha_hash
     FROM T_CLYVO_USUARIO
     WHERE id_usuario = :id`,
    { id }
  );
  return result.rows?.[0] ?? null;
}

export async function criar(nome: string, email: string, senhaHash: string): Promise<Usuario> {
  const result = await runQuery<{ id_usuario: number }>(
    `INSERT INTO T_CLYVO_USUARIO (nm_usuario, email_usuario, senha_hash)
     VALUES (:nome, :email, :senhaHash)
     RETURNING id_usuario INTO :novoId`,
    {
      nome,
      email,
      senhaHash,
      novoId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );

  const novoId = (result.outBinds as any).novoId[0];
  return {
    id_usuario: novoId,
    nm_usuario: nome,
    email_usuario: email,
    senha_hash: senhaHash,
  };
}

export async function atualizar(id: string, nome: string, email: string, senhaHash?: string): Promise<void> {
  if (senhaHash) {
    await runQuery(
      `UPDATE T_CLYVO_USUARIO
       SET nm_usuario = :nome, email_usuario = :email, senha_hash = :senhaHash
       WHERE id_usuario = :id`,
      { id, nome, email, senhaHash }
    );
  } else {
    await runQuery(
      `UPDATE T_CLYVO_USUARIO
       SET nm_usuario = :nome, email_usuario = :email
       WHERE id_usuario = :id`,
      { id, nome, email }
    );
  }
}

export async function apagar(id: string): Promise<void> {
  await runQuery(
    `DELETE FROM T_CLYVO_USUARIO WHERE id_usuario = :id`,
    { id }
  );
}