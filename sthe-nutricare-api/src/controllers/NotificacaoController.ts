import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { enviarNotificacao } from '../services/NotificacaoService';

export const dispararLembreteAgua = async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { pushToken: { not: null } }
    });

    for (const usuario of usuarios) {
      if (usuario.pushToken) {
        await enviarNotificacao(
          usuario.pushToken,
          "Hora da agua!",
          "Mantenha-se hidratado. Registre um copo de agua agora no app."
        );
      }
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao enviar notificacoes" });
  }
};