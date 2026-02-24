import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Endereço fixo do consultório (Stheffane)
const ENDERECO_CONSULTORIO = "Av. Boa Viagem, 1234, Sala 101 - Recife/PE";

// 1. CRIAR AGENDAMENTO (Atualizado com Tipo e Endereço)
export const criarAgendamento = async (req: Request, res: Response) => {
  try {
    // 👇 Recebemos agora o 'tipoConsulta' do App
    const { usuarioId, dataHora, formaPagamento, tipoConsulta } = req.body;

    if (!usuarioId || !dataHora || !formaPagamento) {
      return res.status(400).json({ erro: 'Dados incompletos para agendamento.' });
    }

    // Verifica disponibilidade
    const horarioOcupado = await prisma.agendamento.findFirst({
      where: {
        dataHoraConsulta: new Date(dataHora),
        status: { not: 'CANCELADO' }
      }
    });

    if (horarioOcupado) {
      return res.status(409).json({ erro: 'Este horário já está reservado.' });
    }

    // Define endereço se for presencial
    const enderecoFinal = (tipoConsulta === 'PRESENCIAL') ? ENDERECO_CONSULTORIO : null;

    const novoAgendamento = await prisma.agendamento.create({
      data: {
        usuarioId: Number(usuarioId),
        dataHoraConsulta: new Date(dataHora),
        valorPago: 150.00,
        formaPagamento: formaPagamento,
        status: 'AGENDADO', // Mudei de 'AGUARDANDO_PAGAMENTO' para simplificar o MVP
        
        // 👇 Novos Campos
        tipoConsulta: tipoConsulta || 'PRESENCIAL',
        endereco: enderecoFinal,
        linkMeet: null // Começa vazio, a Nutri põe depois
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

// 2. BUSCAR PRÓXIMA CONSULTA (Já vai trazer os dados novos automaticamente)
export const buscarProximaConsulta = async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const proxima = await prisma.agendamento.findFirst({
      where: {
        usuarioId: Number(usuarioId),
        dataHoraConsulta: { gte: hoje },
        status: { not: 'CANCELADO' }
      },
      orderBy: { dataHoraConsulta: 'asc' }
    });

    if (!proxima) {
      return res.status(200).json({ mensagem: 'Nenhuma consulta agendada.' });
    }

    return res.json(proxima);

  } catch (error) {
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
    return res.status(500).json({ erro: 'Erro ao cancelar agendamento.' });
  }
};

// 4. LISTAR HISTÓRICO (Do Paciente)
export const listarHistorico = async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;
    const lista = await prisma.agendamento.findMany({
      where: { usuarioId: Number(usuarioId) },
      orderBy: { dataHoraConsulta: 'desc' }
    });
    return res.json(lista);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar histórico.' });
  }
};

// 5. ATUALIZAR LINK DO MEET (Novo! Para a Nutri usar) 📹
export const atualizarLinkMeet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { link } = req.body;

        const agendamento = await prisma.agendamento.update({
            where: { id: Number(id) },
            data: { linkMeet: link }
        });

        return res.json({ mensagem: "Link salvo!", agendamento });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao salvar link." });
    }
};

// 6. LISTAR TODOS AGENDAMENTOS (Novo! Para a Agenda da Nutri) 📅
export const listarTodosAgendamentos = async (req: Request, res: Response) => {
    try {
        // Pega tudo que não foi cancelado, ordenado por data
        const lista = await prisma.agendamento.findMany({
            where: { status: { not: 'CANCELADO' } },
            include: { usuario: true }, // Traz o nome do paciente junto
            orderBy: { dataHoraConsulta: 'asc' }
        });
        return res.json(lista);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao listar agenda." });
    }
};