import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { authMiddleware } from './middlewares/auth';
import authRoutes from './routes/authRoutes';
import consultaRoutes from './routes/consultaRoutes';
import animalRoutes from './routes/animalRoutes';
import responsavelRoutes from './routes/responsavelRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Documentação interativa (Swagger UI) — não exige autenticação para ser
// acessada; os testes feitos a partir dela é que seguem as regras normais.
const openapiDocument = YAML.load(path.join(__dirname, '..', 'openapi.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Rota simples de verificação — não exige autenticação, útil para
// checar rapidamente se o servidor e o banco estão de pé.
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Login, cadastro e logout — não passam por authMiddleware, pois são
// justamente como o usuário CONSEGUE um token, não usa um que já tem.
app.use('/auth', authRoutes);

// A partir daqui, todas as rotas exigem um JWT válido (ver src/middlewares/auth.ts).
app.use('/consultas', authMiddleware, consultaRoutes);
app.use('/animais', authMiddleware, animalRoutes);
app.use('/responsaveis', authMiddleware, responsavelRoutes);

export default app;