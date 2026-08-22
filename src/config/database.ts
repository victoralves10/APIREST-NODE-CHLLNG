import oracledb from 'oracledb';

// Faz o driver devolver os resultados já como objetos { coluna: valor },
// em vez de arrays posicionais — muito mais fácil de trabalhar no código.
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Converte automaticamente CLOB/BLOB para string/buffer direto no resultado,
// sem precisar tratar stream manualmente em cada query.
oracledb.fetchAsString = [oracledb.CLOB];

let pool: oracledb.Pool | null = null;

/**
 * Cria (uma única vez) o pool de conexões com o Oracle.
 * Chamado no start do servidor, antes de aceitar qualquer requisição.
 */
export async function initDatabase(): Promise<void> {
  if (pool) return;

  const { ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECT_STRING } = process.env;

  if (!ORACLE_USER || !ORACLE_PASSWORD || !ORACLE_CONNECT_STRING) {
    throw new Error(
      'Variáveis de ambiente do Oracle ausentes. Confira o arquivo .env (veja .env.example).'
    );
  }

  pool = await oracledb.createPool({
    user: ORACLE_USER,
    password: ORACLE_PASSWORD,
    connectString: ORACLE_CONNECT_STRING,
    poolMin: 1,
    poolMax: 5,
    poolIncrement: 1,
  });

  console.log('[database] Pool de conexões Oracle criado com sucesso.');
}

/**
 * Executa uma query única, cuidando de abrir e fechar a conexão sozinho.
 * Uso: await runQuery('SELECT * FROM tabela WHERE id = :id', { id: 1 })
 */
export async function runQuery<T = any>(
  sql: string,
  binds: oracledb.BindParameters = {},
  options: oracledb.ExecuteOptions = {}
): Promise<oracledb.Result<T>> {
  if (!pool) {
    throw new Error('Pool do Oracle ainda não foi inicializado. Chame initDatabase() primeiro.');
  }

  const connection = await pool.getConnection();
  try {
    const result = await connection.execute<T>(sql, binds, {
      autoCommit: true,
      ...options,
    });
    return result;
  } finally {
    await connection.close();
  }
}

/**
 * Fecha o pool de conexões (usado no shutdown gracioso do servidor).
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.close(10);
    pool = null;
    console.log('[database] Pool de conexões Oracle fechado.');
  }
}
