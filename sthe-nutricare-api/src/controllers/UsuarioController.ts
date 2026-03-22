import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const criarUsuario = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, telefone, nascimento, altura, sexo, objetivos } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Preencha os campos obrigatorios!' });
    }

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExiste) {
      return res.status(400).json({ erro: 'E-mail ja cadastrado.' });
    }

    const novoUsuario = await prisma.usuario.create({
      data: {
        nomeCompleto: nome,
        email,
        senha,
        telefone,
        dataNascimento: nascimento,
        sexo,
        altura: altura ? parseFloat(altura) : null, 
        objetivos,
        tipo: 'PACIENTE'
      }
    });

    return res.status(201).json({
      mensagem: 'Usuario criado com sucesso!',
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

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

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

export const buscarUsuarioPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) }
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuario nao encontrado' });
    }

    const { senha, ...dadosUsuario } = usuario;

    return res.json(dadosUsuario);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
};

export const atualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, telefone, altura, objetivos, sexo, nascimento } = req.body; 

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        nomeCompleto: nome,
        telefone,
        altura: altura ? parseFloat(altura) : undefined,
        objetivos,
        sexo,
        dataNascimento: nascimento
      }
    });

    return res.json(usuarioAtualizado);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao atualizar perfil' });
  }
};

export const buscarPacientes = async (req: Request, res: Response) => {
  try {
    const { busca } = req.query;

    const pacientes = await prisma.usuario.findMany({
      where: {
        tipo: 'PACIENTE',
        nomeCompleto: {
          contains: busca ? String(busca) : '',
        }
      },
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        telefone: true,
        sexo: true,
        altura: true,
        dataNascimento: true,
        objetivos: true,
        dataCriacao: true
      },
      orderBy: { nomeCompleto: 'asc' }
    });

    return res.json(pacientes);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar pacientes.' });
  }
};

export const salvarPushToken = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { token } = req.body;

    const usuario = await prisma.usuario.update({
      where: { id: Number(id) },
      data: { pushToken: token }
    });
    
    return res.json({ success: true, pushToken: usuario.pushToken });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao salvar o token de notificacao' });
  }
};