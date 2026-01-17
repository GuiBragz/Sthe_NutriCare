import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const criarAgendamento = async (req: Request, res: Response) => {
  try {
    const { usuarioId, dataHora, formaPagamento } = req.body;

    // 1. Validação básica
    if (!usuarioId || !dataHora || !formaPagamento) {
      return res.status(400).json({ erro: 'Faltam dados para o agendamento.' });
    }

    // 2. Verifica se o horário já está ocupado (Regra básica)
    // Buscamos qualquer agendamento naquele horário que NÃO esteja cancelado
    const horarioOcupado = await prisma.agendamento.findFirst({
      where: {
        dataHoraConsulta: new Date(dataHora), // Converte string pra Data
        status: {
          not: 'CANCELADO' // Ignora os cancelados, eles liberam a vaga
        }
      }
    });

    if (horarioOcupado) {
      return res.status(409).json({ erro: 'Este horário já está reservado.' });
    }

    // 3. Cria o agendamento com status "AGUARDANDO_PAGAMENTO"
    const novoAgendamento = await prisma.agendamento.create({
      data: {
        usuarioId: Number(usuarioId),
        dataHoraConsulta: new Date(dataHora),
        valorPago: 150.00, // Valor fixo por enquanto (ou viria do front)
        formaPagamento: formaPagamento, // "PIX" ou "CARTAO"
        status: 'AGUARDANDO_PAGAMENTO'
      }
    });

    return res.status(201).json({
      mensagem: 'Agendamento pré-reservado! Aguardando pagamento.',
      agendamento: novoAgendamento
    });

  } catch (error) {
    console.error(error); // Ajuda a ver o erro no terminal se der ruim
    return res.status(500).json({ erro: 'Erro ao criar agendamento' });
  }
};