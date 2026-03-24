import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const emailNutri = "contatostheffanesantos@gmail.com"; // Coloque o email real dela aqui
  const senhaPlana = "08051468"; // A senha que ela vai usar para logar

  // Criptografa a senha
  const senhaCriptografada = await bcrypt.hash(senhaPlana, 10);

  // O upsert procura pelo email. Se achar, atualiza. Se não achar, cria.
  const nutri = await prisma.usuario.upsert({
    where: { email: emailNutri },
    update: {
      senha: senhaCriptografada,
      tipo: "NUTRICIONISTA",
    },
    create: {
      nomeCompleto: "Stheffane Santos",
      email: emailNutri,
      senha: senhaCriptografada,
      tipo: "NUTRICIONISTA",
      termosAceitos: true,
    },
  });

  console.log("✅ Conta da Nutricionista configurada com sucesso!");
  console.log(`Email: ${nutri.email}`);
  console.log(`Senha: ${senhaPlana} (Salva como hash no banco)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
