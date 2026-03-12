import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const ENDERECO_CONSULTORIO = "Av. Boa Viagem, 1234, Sala 101 - Recife/PE";

// 1. PACIENTE: RESERVAR UM AGENDAMENTO (Atualizado)
export const criarAgendamento = async (req: Request, res: Response) => {
  try {
    const { usuarioId, dataHora, formaPagamento, tipoConsulta } = req.body;

    if (!usuarioId || !dataHora || !formaPagamento) {
      return res.status(400).json({ erro: 'Dados incompletos para agendamento.' });
    }

    // O PULO DO GATO: Procura se a Nutricionista abriu essa vaga exata
    const vagaDisponivel = await prisma.agendamento.findFirst({
      where: {
        dataHoraConsulta: new Date(dataHora),
        tipoConsulta: tipoConsulta,
        status: 'DISPONIVEL' // Só pega se estiver livre!
      }
    });

    if (!vagaDisponivel) {
      return res.status(404).json({ erro: 'Este horário não está disponível. A Nutricionista não liberou esta vaga ou já foi ocupada.' });
    }

    // Atualiza a vaga existente, colocando o ID do paciente nela
    const agendamentoConfirmado = await prisma.agendamento.update({
      where: { id: vagaDisponivel.id },
      data: {
        usuarioId: Number(usuarioId),
        formaPagamento: formaPagamento,
        valorPago: 150.00,
        status: 'AGENDADO'
      }
    });

    return res.status(200).json({
      mensagem: 'Agendamento realizado com sucesso!',
      agendamento: agendamentoConfirmado
    });

  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return res.status(500).json({ erro: 'Erro interno ao realizar agendamento.' });
  }
};

// 2. BUSCAR PRÓXIMA CONSULTA
export const buscarProximaConsulta = async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const proxima = await prisma.agendamento.findFirst({
      where: {
        usuarioId: Number(usuarioId),
        dataHoraConsulta: { gte: hoje },
        status: { notIn: ['CANCELADO', 'DISPONIVEL'] } // Pega as que já são do paciente
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
    
    // Quando cancela, a vaga volta a ficar disponível sem dono
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

// 5. ATUALIZAR LINK DO MEET (Para a Nutri usar)
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

// 6. LISTAR TODOS AGENDAMENTOS (Para a Agenda da Nutri)
export const listarTodosAgendamentos = async (req: Request, res: Response) => {
    try {
        const lista = await prisma.agendamento.findMany({
            where: { status: { not: 'CANCELADO' } },
            include: { usuario: true }, // Traz o nome do paciente junto se tiver
            orderBy: { dataHoraConsulta: 'asc' }
        });
        return res.json(lista);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao listar agenda." });
    }
};

// 👇 NOVAS FUNÇÕES ABAIXO 👇

// 7. NUTRI: CRIAR HORÁRIO LIVRE
export const criarHorarioDisponivel = async (req: Request, res: Response) => {
  try {
    const { dataHora, tipoConsulta } = req.body;

    if (!dataHora) {
      return res.status(400).json({ erro: 'Data e hora são obrigatórios.' });
    }

    // Verifica se já não existe uma vaga nesse exato momento
    const jaExiste = await prisma.agendamento.findFirst({
      where: {
        dataHoraConsulta: new Date(dataHora),
        status: { not: 'CANCELADO' }
      }
    });

    if (jaExiste) {
      return res.status(400).json({ erro: 'Já existe um registro neste horário.' });
    }

    const novoHorario = await prisma.agendamento.create({
      data: {
        dataHoraConsulta: new Date(dataHora),
        tipoConsulta: tipoConsulta || 'PRESENCIAL',
        status: 'DISPONIVEL',
        endereco: tipoConsulta === 'PRESENCIAL' ? ENDERECO_CONSULTORIO : null,
      }
    });

    return res.status(201).json({ mensagem: 'Horário liberado!', novoHorario });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao criar vaga.' });
  }
};

// 8. PACIENTE: LISTAR HORÁRIOS LIVRES
export const listarHorariosDisponiveis = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.query; // Para filtrar 'ONLINE' ou 'PRESENCIAL'
    const hoje = new Date();

    const vagas = await prisma.agendamento.findMany({
      where: {
        status: 'DISPONIVEL',
        dataHoraConsulta: { gt: hoje }, // Só pega vagas no futuro
        
        // 👇 A CORREÇÃO ESTÁ AQUI: "as 'ONLINE' | 'PRESENCIAL'"
        tipoConsulta: tipo ? (String(tipo) as 'ONLINE' | 'PRESENCIAL') : undefined 
      },
      orderBy: { dataHoraConsulta: 'asc' }
    });

    return res.json(vagas);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao listar vagas.' });
  }
};