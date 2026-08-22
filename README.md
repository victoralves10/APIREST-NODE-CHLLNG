# ClyvoVet Backend

API REST em Node.js + TypeScript + Oracle, feita para dar suporte ao **ClyvoVet Mobile** (Sprint 3 — Mobile Application Development).

## O que essa API faz

Expõe CRUD completo para as 3 entidades centrais do domínio:
- **Consultas** (`/consultas`)
- **Animais** (`/animais`)
- **Responsáveis** (`/responsaveis`)

Cada usuário só enxerga os próprios dados — o isolamento é feito pelo `uid` do Firebase (ver seção Autenticação).

## Stack

- Node.js + TypeScript
- Express
- `node-oracledb` (driver oficial Oracle, sem ORM)
- `firebase-admin` (validação de token, não login)

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar o `.env`

Copie o exemplo e preencha com seus dados reais:

```bash
cp .env.example .env
```

Preencha `ORACLE_USER`, `ORACLE_PASSWORD` e `ORACLE_CONNECT_STRING` com as credenciais do seu Oracle.

### 3. Rodar o script do banco

Execute `schema-clyvovet.sql` no seu Oracle (via SQL Developer ou similar) **antes** de subir o servidor. Isso cria as 3 tabelas e insere alguns dados de exemplo.

> ⚠️ O script tem `'SEU_UID_AQUI'` nos INSERTs de exemplo — troque pelo uid real do seu usuário de teste no Firebase quando ele existir (ou pelo mesmo valor usado em `AUTH_MODE=open`, ver abaixo, para testar agora).

### 4. Rodar o servidor em modo desenvolvimento

```bash
npm run dev
```

Se tudo estiver certo, o terminal mostra:

```
[server] ClyvoVet backend rodando em http://localhost:3000
[server] Modo de autenticação: OPEN
```

### 5. Testar pelo Swagger

Abra no navegador:

```
http://localhost:3000/docs
```

Você verá todas as rotas organizadas por grupo (Consultas, Animais, Responsáveis), cada uma com os campos esperados e exemplos prontos. Para testar:

1. Clique em qualquer rota para expandir
2. Clique em **"Try it out"**
3. Se a rota pedir o header `x-dev-uid`, preencha com `dev-user-1`
4. Preencha o corpo da requisição (já vem com um exemplo, é só editar)
5. Clique em **"Execute"**
6. A resposta real do servidor aparece logo abaixo, com status code e corpo

Isso substitui o Postman/Insomnia para testes rápidos — REQUESTS.md continua disponível como referência de texto simples, caso prefira.

## Autenticação — dois modos

Controlado pela variável `AUTH_MODE` no `.env`:

### `AUTH_MODE=open` (agora, enquanto o Firebase não está plugado)

Não exige token nenhum. Todo request usa um `uid` fixo (`dev-user-1`), a menos que você mande o header `x-dev-uid` com outro valor — útil para simular usuários diferentes no Postman.

```
GET /consultas
x-dev-uid: dev-user-1
```

Use este modo para testar o CRUD completo (rotas, banco, cascata de exclusão) sem precisar do Firebase ainda.

### `AUTH_MODE=strict` (produção — quando o Firebase estiver plugado)

Exige um ID Token válido do Firebase em toda rota:

```
GET /consultas
Authorization: Bearer <id-token-do-firebase>
```

Para ativar:
1. No [Firebase Console](https://console.firebase.google.com), vá em **Configurações do projeto > Contas de serviço** e gere uma nova chave privada (baixa um `.json`).
2. Cole o conteúdo desse JSON, como uma linha só, na variável `FIREBASE_SERVICE_ACCOUNT_JSON` do `.env`.
3. Troque `AUTH_MODE` para `strict`.
4. Reinicie o servidor.

## Rotas disponíveis

Ver `REQUESTS.md` para exemplos prontos de cada rota, ou testar direto pelo Swagger em `/docs` (recomendado — ver seção Setup acima).

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica se o servidor está de pé (sem autenticação) |
| GET | `/consultas` | Lista consultas do usuário |
| GET | `/consultas/:id` | Detalhe de uma consulta |
| POST | `/consultas` | Cria consulta |
| PUT | `/consultas/:id` | Atualiza consulta |
| DELETE | `/consultas/:id` | Remove consulta |
| GET | `/animais` | Lista animais do usuário |
| GET | `/animais?microchip=XXX` | Busca animal por microchip |
| GET | `/animais/:id` | Detalhe de um animal |
| GET | `/animais/:id/consultas` | Histórico de consultas do animal |
| POST | `/animais` | Cria animal |
| PUT | `/animais/:id` | Atualiza animal |
| DELETE | `/animais/:id` | Remove animal (cascata: remove consultas vinculadas) |
| GET | `/responsaveis` | Lista responsáveis do usuário |
| GET | `/responsaveis?cpf=XXX` | Busca responsável por CPF |
| GET | `/responsaveis/:id` | Detalhe de um responsável |
| POST | `/responsaveis` | Cria responsável |
| PUT | `/responsaveis/:id` | Atualiza responsável |
| DELETE | `/responsaveis/:id` | Remove responsável (cascata: remove animais e consultas vinculados) |

## Estrutura de pastas

```
src/
├── config/
│   └── database.ts        # Pool de conexões Oracle
├── middlewares/
│   └── auth.ts             # Validação de token (open/strict)
├── services/                # Acesso a dados (SQL puro via node-oracledb)
│   ├── consultaService.ts
│   ├── animalService.ts
│   └── responsavelService.ts
├── controllers/              # Recebe request, valida entrada, chama service
│   ├── consultaController.ts
│   ├── animalController.ts
│   └── responsavelController.ts
├── routes/                    # Define os caminhos HTTP de cada recurso
│   ├── consultaRoutes.ts
│   ├── animalRoutes.ts
│   └── responsavelRoutes.ts
├── types/
│   └── index.ts               # Tipos TypeScript compartilhados
├── app.ts                      # Monta o Express e aplica as rotas
└── server.ts                   # Sobe o servidor, inicializa Oracle e Firebase
```

## Build para produção

```bash
npm run build
npm start
```
