import oracledb from 'oracledb';

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];

let pool: oracledb.Pool | null = null;

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
 * O node-oracledb devolve os nomes das colunas em MAIÚSCULO por padrão
 * (ex: SENHA_HASH), mesmo quando a coluna foi criada em minúsculo no SQL.
 * Todo o código dos services usa os nomes em minúsculo (senha_hash,
 * nm_usuario, etc.), então esta função converte cada linha retornada
 * antes de devolver — evita ter que reescrever cada query com aspas
 * duplas ou renomear cada service individualmente.
 */
function paraMinusculo<T>(linha: any): T {
  const convertida: any = {};
  for (const chave in linha) {
    convertida[chave.toLowerCase()] = linha[chave];
  }
  return convertida as T;
}

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

    if (result.rows) {
      result.rows = result.rows.map((linha) => paraMinusculo<T>(linha));
    }

    return result;
  } finally {
    await connection.close();
  }
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.close(10);
    pool = null;
    console.log('[database] Pool de conexões Oracle fechado.');
  }
}