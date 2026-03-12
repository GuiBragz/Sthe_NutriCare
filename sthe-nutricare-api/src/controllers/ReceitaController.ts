import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// ==========================================
// 1. ROTAS DA NUTRICIONISTA (CRUD Básico)
// ==========================================

export const criarReceita = async (req: Request, res: Response) => {
  try {
    const { titulo, ingredientes, modoPreparo, caloriasTotais, fotoUrl, categoria } = req.body;
    const novaReceita = await prisma.receita.create({
      data: { 
        titulo, 
        ingredientes, 
        modoPreparo, 
        caloriasTotais: Number(caloriasTotais), 
        fotoUrl, 
        categoria 
      }
    });
    return res.status(201).json({ mensagem: 'Receita criada!', receita: novaReceita });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao criar receita.' });
  }
};

export const editarReceita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    if (data.caloriasTotais) data.caloriasTotais = Number(data.caloriasTotais);

    const receitaAtualizada = await prisma.receita.update({
      where: { id: Number(id) },
      data
    });
    return res.json({ mensagem: 'Receita actualizada!', receita: receitaAtualizada });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao editar receita.' });
  }
};

export const excluirReceita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.receita.delete({ where: { id: Number(id) } });
    return res.json({ mensagem: 'Receita excluída com sucesso!' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao excluir receita.' });
  }
};

// ==========================================
// 2. ROTAS DO FEED (Listagem para o Ecrã Principal)
// ==========================================

export const listarReceitas = async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.query; // Recebemos isto para saber se o utilizador já deu like/favorito

    const receitas = await prisma.receita.findMany({
      orderBy: { dataCriacao: 'desc' }, // As mais recentes primeiro
      include: {
        _count: {
          select: { likes: true, comentarios: true } // Traz o total de likes e comentários
        },
        // Se foi passado um usuarioId, verificamos se ELE deu like ou favoritou
        likes: usuarioId ? { where: { usuarioId: Number(usuarioId) } } : false,
        favoritos: usuarioId ? { where: { usuarioId: Number(usuarioId) } } : false,
      }
    });

    // Formatamos a resposta para ficar muito mais fácil de usar no telemóvel (App)
    const receitasFormatadas = receitas.map((r: any) => ({
      ...r,
      totalLikes: r._count.likes,
      totalComentarios: r._count.comentarios,
      curtidoPorMim: r.likes ? r.likes.length > 0 : false,
      favoritoPorMim: r.favoritos ? r.favoritos.length > 0 : false,
      // Limpamos os dados em bruto para não pesar a internet
      likes: undefined,
      favoritos: undefined,
      _count: undefined
    }));

    return res.json(receitasFormatadas);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao listar receitas.' });
  }
};

// ==========================================
// 3. ROTAS DE INTERAÇÃO (Like, Favorito, Comentar)
// ==========================================

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID da Receita
    const { usuarioId } = req.body;

    // Verifica se já deu like
    const existeLike = await prisma.receitaLike.findUnique({
      where: { usuarioId_receitaId: { usuarioId: Number(usuarioId), receitaId: Number(id) } }
    });

    if (existeLike) {
      // Se já tinha like, remove (Unlike)
      await prisma.receitaLike.delete({ where: { id: existeLike.id } });
      return res.json({ mensagem: 'Like removido.', curtido: false });
    } else {
      // Se não tinha, adiciona (Like)
      await prisma.receitaLike.create({
        data: { usuarioId: Number(usuarioId), receitaId: Number(id) }
      });
      return res.json({ mensagem: 'Like adicionado.', curtido: true });
    }
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao processar like.' });
  }
};

export const toggleFavorito = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const { usuarioId } = req.body;

    const existeFav = await prisma.receitaFavorita.findUnique({
      where: { usuarioId_receitaId: { usuarioId: Number(usuarioId), receitaId: Number(id) } }
    });

    if (existeFav) {
      await prisma.receitaFavorita.delete({ where: { id: existeFav.id } });
      return res.json({ mensagem: 'Removido dos favoritos.', favorito: false });
    } else {
      await prisma.receitaFavorita.create({
        data: { usuarioId: Number(usuarioId), receitaId: Number(id) }
      });
      return res.json({ mensagem: 'Adicionado aos favoritos.', favorito: true });
    }
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao processar favorito.' });
  }
};

// COMENTÁRIOS
export const adicionarComentario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const { usuarioId, texto } = req.body;

    if (!texto) return res.status(400).json({ erro: 'O comentário não pode estar vazio.' });

    const comentario = await prisma.comentarioReceita.create({
      data: {
        texto,
        usuarioId: Number(usuarioId),
        receitaId: Number(id)
      },
      // Retornamos logo os dados do utilizador que comentou para aparecer a foto e nome dele no ecrã
      include: { usuario: { select: { nomeCompleto: true, fotoPerfilUrl: true, tipo: true } } }
    });

    return res.status(201).json(comentario);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao adicionar comentário.' });
  }
};

export const listarComentarios = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comentarios = await prisma.comentarioReceita.findMany({
      where: { receitaId: Number(id) },
      orderBy: { dataCriacao: 'asc' }, // Do mais antigo para o mais novo
      include: { usuario: { select: { nomeCompleto: true, fotoPerfilUrl: true, tipo: true } } }
    });
    return res.json(comentarios);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao procurar comentários.' });
  }
};