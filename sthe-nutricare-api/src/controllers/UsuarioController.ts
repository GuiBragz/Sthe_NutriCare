import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const criarUsuario = async (req: Request, res: Response) => {
  try {
    // 1. Recebe os dados que vem do corpo da requisição (JSON)
    const { nomeCompleto, email, senha } = req.body;

    // 2. Validação simples (depois melhoramos)
    if (!nomeCompleto || !email || !senha) {
      return res.status(400).json({ erro: 'Preencha todos os campos!' });
    }

    // 3. Verifica se já existe esse email
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExiste) {
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }

    // 4. Salva no Banco (Prisma faz a mágica)
    const novoUsuario = await prisma.usuario.create({
      data: {
        nomeCompleto,
        email,
        senha, // Obs: Em produção, jamais salvamos senha pura (usamos bcrypt), mas pro teste serve.
        tipo: 'PACIENTE' // Por padrão, todo mundo que se cadastra é paciente
      }
    });

    // 5. Devolve a resposta de sucesso
    return res.status(201).json({
      mensagem: 'Usuário criado com sucesso!',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nomeCompleto,
        email: novoUsuario.email
      }

      
    });

    
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
  
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    // 1. Busca o usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    // 2. Valida se usuário existe e se a senha bate
    // (Obs: Num app real, usaríamos bcrypt para comparar hash, aqui é texto puro pro MVP)
    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    // 3. Sucesso! Retorna os dados
    return res.json({
      mensagem: 'Login realizado!',
      usuario: {
        id: usuario.id,
        nome: usuario.nomeCompleto,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });

  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};