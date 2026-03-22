import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { enviarNotificacao } from '../services/NotificacaoService';

const ENDERECO_CONSULTORIO = "Av. Boa Viagem, 1234, Sala 101 - Recife/PE";

const gatewayPagamento = {
  estornarPix: async (agendamentoId: number, valor: any) => {
    return true;
  },
  estornarCartao: async (agendamentoId: number, valor: any) => {
    return true;
  }
};

async function processarEstornoGateway(agendamentoId: number, formaPagamento: string | null, valor: any) {
  if (!valor || !formaPagamento) return;
  
  if (formaPagamento === 'PIX') {
    await gatewayPagamento.estornarPix(agendamentoId, valor);
  } else if (formaPagamento === 'CARTAO') {
    await gatewayPagamento.estornarCartao(agendamentoId, valor);
  }
}

export const criarAgendamento = async (req: Request, res: Response) => {
  try {
    const { usuarioId, dataHora, formaPagamento, tipoConsulta } = req.body;

    if (!usuarioId || !dataHora || !formaPagamento) {
      return res.status(400).json({ erro: 'Dados incompletos para agendamento.' });
    }

    const vagaDisponivel = await prisma.agendamento.findFirst({
      where: {
        dataHoraConsulta: new Date(dataHora),
        tipoConsulta: tipoConsulta,
        status: 'DISPONIVEL'
      }
    });

    if (!vagaDisponivel) {
      return res.status(404).json({ erro: 'Este horario nao esta disponivel.' });
    }

    const agendamentoConfirmado = await prisma.agendamento.update({
      where: { id: vagaDisponivel.id },
      data: {
        usuarioId: Number(usuarioId),
        formaPagamento: formaPagamento,
        valorPago: 150.00,
        status: 'AGENDADO'
      },
      include: { usuario: true }
    });

    if (agendamentoConfirmado.usuario?.pushToken) {
      await enviarNotificacao(
        agendamentoConfirmado.usuario.pushToken,
        "Consulta Agendada",
        `Sua consulta foi marcada para ${new Date(dataHora).toLocaleString('pt-BR')}`
      );
    }

    return res.status(200).json({
      mensagem: 'Agendamento realizado com sucesso!',
      agendamento: agendamentoConfirmado
    });

  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno ao realizar agendamento.' });
  }
};

export const buscarProximaConsulta = async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const proxima = await prisma.agendamento.findFirst({
      where: {
        usuarioId: Number(usuarioId),
        dataHoraConsulta: { gte: hoje },
        status: { notIn: ['CANCELADO', 'DISPONIVEL'] }
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

export const cancelarAgendamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.agendamento.update({
      where: { id: Number(id) },
      data: { 
        status: 'DISPONIVEL',
        usuarioId: null,
        formaPagamento: null,
        valorPago: null
      }
    });
    
    return res.json({ mensagem: 'Agendamento cancelado. Vaga liberada.' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao cancelar agendamento.' });
  }
};

export const listarHistorico = async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;
    const lista = await prisma.agendamento.findMany({
      where: { usuarioId: Number(usuarioId) },
      orderBy: { dataHoraConsulta: 'desc' }
    });
    return res.json(lista);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar historico.' });
  }
};

export const atualizarLinkMeet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { link } = req.body;

        const agendamento = await prisma.agendamento.update({
            where: { id: Number(id) },
            data: { linkMeet: link },
            include: { usuario: true }
        });

        if (agendamento.usuario?.pushToken) {
          await enviarNotificacao(
            agendamento.usuario.pushToken,
            "Link da Consulta Online",
            "A nutricionista adicionou o link do Google Meet para a sua consulta."
          );
        }

        return res.json({ mensagem: "Link salvo!", agendamento });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao salvar link." });
    }
};

export const listarTodosAgendamentos = async (req: Request, res: Response) => {
    try {
        const lista = await prisma.agendamento.findMany({
            where: { status: { not: 'CANCELADO' } },
            include: { usuario: true },
            orderBy: { dataHoraConsulta: 'asc' }
        });
        return res.json(lista);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao listar agenda." });
    }
};

export const criarHorarioDisponivel = async (req: Request, res: Response) => {
  try {
    const { dataHora, tipoConsulta } = req.body;

    if (!dataHora) {
      return res.status(400).json({ erro: 'Data e hora sao obrigatorios.' });
    }

    const jaExiste = await prisma.agendamento.findFirst({
      where: {
        dataHoraConsulta: new Date(dataHora),
        status: { not: 'CANCELADO' }
      }
    });

    if (jaExiste) {
      return res.status(400).json({ erro: 'Ja existe um registro neste horario.' });
    }

    const novoHorario = await prisma.agendamento.create({
      data: {
        dataHoraConsulta: new Date(dataHora),
        tipoConsulta: tipoConsulta || 'PRESENCIAL',
        status: 'DISPONIVEL',
        endereco: tipoConsulta === 'PRESENCIAL' ? ENDERECO_CONSULTORIO : null,
      }
    });

    return res.status(201).json({ mensagem: 'Horario liberado!', novoHorario });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao criar vaga.' });
  }
};

export const listarHorariosDisponiveis = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.query;
    const hoje = new Date();

    const vagas = await prisma.agendamento.findMany({
      where: {
        status: 'DISPONIVEL',
        dataHoraConsulta: { gt: hoje },
        tipoConsulta: tipo ? (String(tipo) as 'ONLINE' | 'PRESENCIAL') : undefined 
      },
      orderBy: { dataHoraConsulta: 'asc' }
    });

    return res.json(vagas);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao listar vagas.' });
  }
};

export const atualizarStatusConsulta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const agendamento = await prisma.agendamento.findUnique({
      where: { id: Number(id) }
    });

    if (!agendamento) {
      return res.status(404).json({ erro: "Agendamento nao encontrado" });
    }

    if (status === 'FALTOU' && agendamento.status !== 'FALTOU') {
      await processarEstornoGateway(agendamento.id, agendamento.formaPagamento, agendamento.valorPago);
    }

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id: Number(id) },
      data: { status },
      include: { usuario: true }
    });

    if (agendamentoAtualizado.usuario?.pushToken) {
      await enviarNotificacao(
        agendamentoAtualizado.usuario.pushToken,
        "Atualizacao na Consulta",
        `O status da sua consulta mudou para: ${status}`
      );
    }

    return res.json(agendamentoAtualizado);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao atualizar o status do agendamento" });
  }
};