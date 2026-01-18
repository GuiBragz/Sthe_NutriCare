import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// 1. CRIAR AGENDAMENTO
export const criarAgendamento = async (req: Request, res: Response) => {
  try {
    const { usuarioId, dataHora, formaPagamento } = req.body;

    // Validação simples
    if (!usuarioId || !dataHora || !formaPagamento) {
      return res.status(400).json({ erro: 'Dados incompletos para agendamento.' });
    }

    // Verifica se o horário exato já está ocupado
    const horarioOcupado = await prisma.agendamento.findFirst({
      where: {
        dataHoraConsulta: new Date(dataHora),
        status: { not: 'CANCELADO' }
      }
    });

    if (horarioOcupado) {
      return res.status(409).json({ erro: 'Este horário já está reservado.' });
    }

    // Salva no banco
    const novoAgendamento = await prisma.agendamento.create({
      data: {
        usuarioId: Number(usuarioId),
        dataHoraConsulta: new Date(dataHora),
        valorPago: 150.00, // Valor fixo do MVP
        formaPagamento: formaPagamento,
        status: 'AGUARDANDO_PAGAMENTO'
      }
    });

    return res.status(201).json({
      mensagem: 'Agendamento realizado com sucesso!',
      agendamento: novoAgendamento
    });

  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return res.status(500).json({ erro: 'Erro interno ao criar agendamento.' });
  }
};

// 2. BUSCAR PRÓXIMA CONSULTA
export const buscarProximaConsulta = async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;

    // Define "Hoje" começando à meia-noite (00:00:00)
    // Isso garante que consultas marcadas para hoje, mas que já "passaram" da hora atual, ainda apareçam.
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const proxima = await prisma.agendamento.findFirst({
      where: {
        usuarioId: Number(usuarioId),
        dataHoraConsulta: {
          gte: hoje // Maior ou igual a hoje 00:00
        },
        status: { not: 'CANCELADO' }
      },
      orderBy: {
        dataHoraConsulta: 'asc' // Pega a mais próxima (menor data)
      }
    });

    if (!proxima) {
      return res.status(200).json({ mensagem: 'Nenhuma consulta agendada.' });
    }

    return res.json(proxima);

  } catch (error) {
    console.error("Erro ao buscar consulta:", error);
    return res.status(500).json({ erro: 'Erro ao buscar consulta.' });
  }
};

// 3. CANCELAR AGENDAMENTO
export const cancelarAgendamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.agendamento.update({
      where: { id: Number(id) },
      data: { status: 'CANCELADO' }
    });

    return res.json({ mensagem: 'Agendamento cancelado com sucesso.' });

  } catch (error) {
    console.error("Erro ao cancelar:", error);
    return res.status(500).json({ erro: 'Erro ao cancelar agendamento.' });
  }
};