import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getIntervaloHoje() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
}

export const getDiarioHoje = async (req: Request, res: Response) => {
  const { usuarioId } = req.params;
  const { startOfDay, endOfDay } = getIntervaloHoje();

  try {
    let diario = await prisma.diarioDiario.findFirst({
      where: {
        usuarioId: Number(usuarioId),
        dataRegistro: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: { refeicoes: true }
    });

    if (!diario) {
      diario = await prisma.diarioDiario.create({
        data: {
          usuarioId: Number(usuarioId),
          caloriasConsumidas: 0,
          caloriasQueimadas: 0,
          aguaConsumida: 0,
          layoutUsado: 'SIMPLES'
        },
        include: { refeicoes: true }
      });
    }

    return res.json(diario);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar diario" });
  }
};

export const atualizarRapido = async (req: Request, res: Response) => {
  const { usuarioId, tipo, valor } = req.body;
  const { startOfDay, endOfDay } = getIntervaloHoje();

  try {
    const campo = tipo === 'comida' ? 'caloriasConsumidas' : 'caloriasQueimadas';

    const diario = await prisma.diarioDiario.findFirst({
      where: {
        usuarioId: Number(usuarioId),
        dataRegistro: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (!diario) {
      return res.status(404).json({ error: "Diario nao encontrado" });
    }

    await prisma.diarioDiario.update({
      where: { id: diario.id },
      data: {
        [campo]: { increment: Number(valor) }
      }
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ error: "Erro ao atualizar calorias" });
  }
};

export const atualizarAgua = async (req: Request, res: Response) => {
  const { usuarioId, aguaConsumida } = req.body;
  const { startOfDay, endOfDay } = getIntervaloHoje();

  try {
    const diario = await prisma.diarioDiario.findFirst({
      where: {
        usuarioId: Number(usuarioId),
        dataRegistro: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (!diario) {
      return res.status(404).json({ error: "Diario nao encontrado" });
    }

    await prisma.diarioDiario.update({
      where: { id: diario.id },
      data: { aguaConsumida: Number(aguaConsumida) }
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ error: "Erro ao atualizar agua" });
  }
};

export const salvarRegistroPro = async (req: Request, res: Response) => {
  const { usuarioId, layoutUsado, aguaConsumida, caloriasConsumidas, refeicoes } = req.body;
  const { startOfDay, endOfDay } = getIntervaloHoje();

  try {
    let diario = await prisma.diarioDiario.findFirst({
      where: { 
        usuarioId: Number(usuarioId), 
        dataRegistro: { gte: startOfDay, lte: endOfDay } 
      }
    });

    if (!diario) {
      diario = await prisma.diarioDiario.create({
        data: { 
          usuarioId: Number(usuarioId), 
          caloriasConsumidas: 0, 
          caloriasQueimadas: 0, 
          aguaConsumida: 0 
        }
      });
    }

    await prisma.refeicao.deleteMany({ 
      where: { diarioId: diario.id } 
    });

    const diarioAtualizado = await prisma.diarioDiario.update({
      where: { id: diario.id },
      data: {
        layoutUsado,
        aguaConsumida: Number(aguaConsumida),
        caloriasConsumidas: Number(caloriasConsumidas),
        refeicoes: {
          create: refeicoes?.map((ref: any) => ({
            nome: ref.nome,
            calorias: Number(ref.calorias),
            proteinas: Number(ref.proteinas) || 0,
            carboidratos: Number(ref.carboidratos) || 0,
            gorduras: Number(ref.gorduras) || 0
          })) || []
        }
      },
      include: { refeicoes: true }
    });

    return res.json(diarioAtualizado);
  } catch (error) {
    return res.status(400).json({ error: "Erro ao salvar registro detalhado" });
  }
};

export const getHistoricoDiarios = async (req: Request, res: Response) => {
  const { usuarioId } = req.params;
  try {
    const diarios = await prisma.diarioDiario.findMany({
      where: { usuarioId: Number(usuarioId) },
      orderBy: { dataRegistro: 'asc' },
      include: { refeicoes: true }
    });
    return res.json(diarios);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar historico" });
  }
};