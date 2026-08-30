import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as usuarioService from '../services/usuarioService';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRACAO = '2h';

function gerarToken(idUsuario: number): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado.');
  }
  return jwt.sign({ uid: String(idUsuario) }, secret, { expiresIn: TOKEN_EXPIRACAO });
}

export async function cadastrar(req: Request, res: Response) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, email, senha.' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    const existente = await usuarioService.buscarPorEmail(email);
    if (existente) {
      return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const novoUsuario = await usuarioService.criar(nome, email, senhaHash);
    const token = gerarToken(novoUsuario.id_usuario);

    res.status(201).json({
      token,
      usuario: {
        id_usuario: novoUsuario.id_usuario,
        nm_usuario: novoUsuario.nm_usuario,
        email_usuario: novoUsuario.email_usuario,
      },
    });
  } catch (err) {
    console.error('[authController.cadastrar]', err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Campos obrigatórios: email, senha.' });
    }

    const usuario = await usuarioService.buscarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const token = gerarToken(usuario.id_usuario);

    res.status(200).json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nm_usuario: usuario.nm_usuario,
        email_usuario: usuario.email_usuario,
      },
    });
  } catch (err) {
    console.error('[authController.login]', err);
    res.status(500).json({ error: 'Erro ao efetuar login.' });
  }
}

export async function logout(_req: Request, res: Response) {
  res.status(200).json({ message: 'Logout efetuado. Descarte o token salvo no app.' });
}

export async function atualizarPerfil(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const { nome, email, senha } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, email.' });
    }

    let senhaHash: string | undefined;
    if (senha) {
      if (senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
      }
      senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    }

    await usuarioService.atualizar(uid, nome, email, senhaHash);

    res.status(200).json({ id_usuario: uid, nm_usuario: nome, email_usuario: email });
  } catch (err) {
    console.error('[authController.atualizarPerfil]', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
}

export async function apagarConta(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const { senha } = req.body;

    if (!senha) {
      return res.status(400).json({ error: 'Campo obrigatório: senha.' });
    }

    const usuario = await usuarioService.buscarPorId(uid);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    await usuarioService.apagar(uid);

    res.status(204).send();
  } catch (err) {
    console.error('[authController.apagarConta]', err);
    res.status(500).json({ error: 'Erro ao apagar conta.' });
  }
}