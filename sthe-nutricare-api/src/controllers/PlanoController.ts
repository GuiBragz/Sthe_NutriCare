import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// 1. A Nutri salva o plano escrito direto no banco
export const salvarPlano = async (req: Request, res: Response) => {
  try {
    const { usuarioId, titulo, descricao } = req.body;

    if (!usuarioId || !titulo || !descricao) {
      return res.status(400).json({ erro: 'Preencha todos os campos do plano.' });
    }

    const novoPlano = await prisma.planoNutricional.create({
      data: {
        usuarioId: Number(usuarioId),
        titulo,
        descricao, 
      }
    });

    return res.status(201).json({ mensagem: 'Plano salvo com sucesso!', plano: novoPlano });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao salvar plano alimentar.' });
  }
};

// 2. Busca o plano mais recente do paciente
export const buscarPlanoPorUsuario = async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;

    const plano = await prisma.planoNutricional.findFirst({
      where: { usuarioId: Number(usuarioId) },
      orderBy: { dataUpload: 'desc' }
    });

    if (!plano) {
      return res.status(404).json({ erro: 'Nenhum plano encontrado.' });
    }

    return res.json(plano);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar plano.' });
  }
};

// 3. 👇 NOVA: Editar o plano existente (PUT)
export const editarPlano = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo, descricao } = req.body;

    const planoAtualizado = await prisma.planoNutricional.update({
      where: { id: Number(id) },
      data: { titulo, descricao }
    });

    return res.json({ mensagem: 'Plano atualizado com sucesso!', plano: planoAtualizado });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao editar plano alimentar.' });
  }
};

// 4. 👇 NOVA: Excluir o plano (DELETE)
export const excluirPlano = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.planoNutricional.delete({
      where: { id: Number(id) }
    });

    return res.json({ mensagem: 'Plano excluído com sucesso!' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao excluir plano alimentar.' });
  }
};