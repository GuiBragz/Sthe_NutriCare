import cron from 'node-cron';
import { prisma } from '../lib/prisma';
// 👇 CORREÇÃO: O import deve ser relativo à pasta atual do backend
import { enviarNotificacao } from './NotificacaoService'; 

export const iniciarRotinas = () => {
  cron.schedule('0 10,14,18 * * *', async () => {
    try {
      console.log("⏰ Executando rotina de lembrete de água...");
      
      const usuarios = await prisma.usuario.findMany({
        where: { pushToken: { not: null } }
      });

      for (const usuario of usuarios) {
        if (usuario.pushToken) {
          await enviarNotificacao(
            usuario.pushToken,
            "Hora da água! 💧",
            "Mantenha-se hidratado. Registre seu consumo agora no StheNutriCare."
          );
        }
      }
    } catch (error) {
      console.error("Erro na rotina Cron:", error);
    }
  });
};