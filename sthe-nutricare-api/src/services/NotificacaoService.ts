// Não coloque o import aqui no topo!

export const enviarNotificacao = async (token: string, titulo: string, mensagem: string, dados?: any) => {
  try {
    // Esse "truque" força o Node a carregar a biblioteca no formato ESM 
    // sem dar erro de compilação no TypeScript
    const { Expo } = await (eval('import("expo-server-sdk")') as Promise<any>);
    const expo = new Expo();

    // Valida se o token é um token válido do Expo
    if (!Expo.isExpoPushToken(token)) {
      console.error(`Token inválido: ${token}`);
      return;
    }

    const messages = [{
      to: token,
      sound: 'default' as const,
      title: titulo,
      body: mensagem,
      data: dados,
    }];

    // Envia em blocos (chunks) para evitar sobrecarga
    const chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
    
    console.log("✅ Notificação enviada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao enviar push:", error);
  }
};