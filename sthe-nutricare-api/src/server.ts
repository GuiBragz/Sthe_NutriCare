import express from 'express';
import cors from 'cors';
import { 
  criarUsuario,
  login, 
  buscarUsuarioPorId, 
  atualizarUsuario, 
  buscarPacientes 
} from './controllers/UsuarioController';
import { 
  criarAgendamento, 
  buscarProximaConsulta, 
  cancelarAgendamento, 
  listarHistorico, 
  listarTodosAgendamentos, 
  atualizarLinkMeet, 
  criarHorarioDisponivel,
  listarHorariosDisponiveis
} from './controllers/AgendamentoController';
import { buscarPlanoPorUsuario } from './controllers/PlanoController';
import { 
  criarReceita, 
  listarReceitas, 
  editarReceita, 
  excluirReceita, 
  toggleLike, 
  toggleFavorito, 
  adicionarComentario, 
  listarComentarios 
} from './controllers/ReceitaController';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.json({ status: 'online', message: '🚀 API Sthe NutriCare rodando!' });
});

// --- ROTAS DE USUÁRIO ---
app.post('/usuarios', criarUsuario);
app.post('/login', login);

// Rotas fixas de usuário antes do :id
app.get('/pacientes/buscar', buscarPacientes); 

// Rotas dinâmicas de usuário
app.get('/usuarios/:id', buscarUsuarioPorId); 
app.put('/usuarios/:id', atualizarUsuario); 


// --- ROTAS DE AGENDAMENTO ---
// 1. Criação
app.post('/agendamentos', criarAgendamento);
app.post('/agendamentos/disponivel', criarHorarioDisponivel); 

// 2. Buscas fixas (Tem que ser ANTES do :usuarioId)
app.get('/agendamentos/vagas', listarHorariosDisponiveis); 
app.get('/agendamentos/geral/todos', listarTodosAgendamentos);

// 3. Buscas e edições dinâmicas (Usam parâmetros)
app.get('/agendamentos/:usuarioId', buscarProximaConsulta);
app.patch('/agendamentos/:id/cancelar', cancelarAgendamento);
app.get('/agendamentos/:usuarioId/historico', listarHistorico);
app.patch('/agendamentos/:id/link', atualizarLinkMeet);


// --- ROTAS DE PLANO ALIMENTAR ---
app.get('/planos/:usuarioId', buscarPlanoPorUsuario);


// 👇 AS ROTAS DE RECEITAS QUE FALTAVAM AQUI! 👇

// --- ROTAS DE RECEITAS (FEED E CRUD) ---
app.post('/receitas', criarReceita);
app.get('/receitas', listarReceitas);
app.put('/receitas/:id', editarReceita);
app.delete('/receitas/:id', excluirReceita);

// --- INTERAÇÕES NAS RECEITAS ---
app.post('/receitas/:id/like', toggleLike);
app.post('/receitas/:id/favorito', toggleFavorito);
app.get('/receitas/:id/comentarios', listarComentarios);
app.post('/receitas/:id/comentarios', adicionarComentario);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`⚡ Servidor rodando na porta ${PORT}`);
});