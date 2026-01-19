import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const criarUsuario = async (req: Request, res: Response) => {
  try {
    // 1. Recebe TODOS os dados vindos do App (Passo 1 + Passo 2)
    const { 
      nome,           // Vem do app como 'nome'
      email, 
      senha, 
      telefone, 
      nascimento,     // Vem do app como 'nascimento'
      altura, 
      sexo, 
      objetivos 
    } = req.body;

    // 2. Validação simples dos campos obrigatórios
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Preencha os campos obrigatórios!' });
    }

    // 3. Verifica se já existe esse email
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExiste) {
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }

    // 4. Salva no Banco (Mapeando os nomes corretamente)
    const novoUsuario = await prisma.usuario.create({
      data: {
        nomeCompleto: nome,       // O banco chama 'nomeCompleto', o app manda 'nome'
        email,
        senha,
        telefone,
        dataNascimento: nascimento, // O banco chama 'dataNascimento'
        sexo,
        // Garante que a altura seja salva como número (Float), caso venha como texto
        altura: altura ? parseFloat(altura) : null, 
        objetivos, // Já vem como string "SAUDE,EMAGRECER" do app
        tipo: 'PACIENTE'
      }
    });

    // 5. Devolve a resposta de sucesso
    return res.status(201).json({
      mensagem: 'Usuário criado com sucesso!',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nomeCompleto,
        email: novoUsuario.email
      }
    });

  } catch (error) {
    console.log(error); // Ajuda a ver o erro no terminal se acontecer
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

// --- LOGIN (Mantive igual, pois não mudou a lógica) ---
export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    // 1. Busca o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    // 2. Valida senha (texto puro pro MVP)
    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    // 3. Sucesso!
    return res.json({
      mensagem: 'Login realizado!',
      usuario: {
        id: usuario.id,
        nome: usuario.nomeCompleto,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });

  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};
// ... (mantenha o código de criarUsuario e login que já estão aí) ...

// 👇 ADICIONE ESTA FUNÇÃO NO FINAL DO ARQUIVO 👇
export const buscarUsuarioPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) }
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // O pulo do gato: Removemos a senha antes de enviar pro app (segurança!)
    const { senha, ...dadosUsuario } = usuario;

    return res.json(dadosUsuario);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
};
export const atualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Adicione 'nascimento' aqui na leitura
    const { nome, telefone, altura, objetivos, sexo, nascimento } = req.body; 

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        nomeCompleto: nome,
        telefone,
        altura: altura ? parseFloat(altura) : undefined,
        objetivos,
        sexo,
        dataNascimento: nascimento // <--- ATUALIZA AQUI NO BANCO
      }
    });

    return res.json(usuarioAtualizado);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao atualizar perfil' });
  }
};