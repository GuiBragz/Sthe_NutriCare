import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const buscarPlanoPorUsuario = async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;

    // Busca o plano mais recente criado para este usuário
    const plano = await prisma.planoNutricional.findFirst({
      where: { usuarioId: Number(usuarioId) },
      orderBy: { dataUpload: 'desc' } // Pega o último
    });

    if (!plano) {
      return res.status(404).json({ erro: 'Nenhum plano encontrado.' });
    }

    return res.json(plano);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar plano.' });
  }
};