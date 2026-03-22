import express from 'express';
import cors from 'cors';
import { 
  criarUsuario,
  login, 
  buscarUsuarioPorId, 
  atualizarUsuario, 
  buscarPacientes,
  salvarPushToken
} from './controllers/UsuarioController';
import { 
  criarAgendamento, 
  buscarProximaConsulta, 
  cancelarAgendamento, 
  listarHistorico, 
  listarTodosAgendamentos, 
  atualizarLinkMeet, 
  criarHorarioDisponivel,
  listarHorariosDisponiveis,
  atualizarStatusConsulta
} from './controllers/AgendamentoController';
import { 
  buscarPlanoPorUsuario, 
  salvarPlano, 
  editarPlano, 
  excluirPlano 
} from './controllers/PlanoController';
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
import {
  getDiarioHoje,
  atualizarRapido,
  atualizarAgua,
  salvarRegistroPro,
  getHistoricoDiarios
} from './controllers/DiarioController';
import { 
  dispararLembreteAgua
} from './controllers/NotificacaoController';
import { iniciarRotinas } from './services/CronService';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.json({ status: 'online', message: 'API Sthe NutriCare rodando!' });
});

app.post('/usuarios', criarUsuario);
app.post('/login', login);
app.get('/pacientes/buscar', buscarPacientes); 
app.get('/usuarios/:id', buscarUsuarioPorId); 
app.put('/usuarios/:id', atualizarUsuario); 
app.patch('/usuarios/:id/token', salvarPushToken);

app.post('/agendamentos', criarAgendamento);
app.post('/agendamentos/disponivel', criarHorarioDisponivel); 
app.post('/notificacoes/agua', dispararLembreteAgua);
app.get('/agendamentos/vagas', listarHorariosDisponiveis); 
app.get('/agendamentos/geral/todos', listarTodosAgendamentos);
app.get('/agendamentos/:usuarioId', buscarProximaConsulta);
app.patch('/agendamentos/:id/cancelar', cancelarAgendamento);
app.get('/agendamentos/:usuarioId/historico', listarHistorico);
app.patch('/agendamentos/:id/link', atualizarLinkMeet);
app.patch('/agendamentos/:id/status', atualizarStatusConsulta);

app.post('/planos', salvarPlano);
app.get('/planos/:usuarioId', buscarPlanoPorUsuario);
app.put('/planos/:id', editarPlano);
app.delete('/planos/:id', excluirPlano);

app.post('/diario', salvarRegistroPro);
app.post('/diario/atualizar-rapido', atualizarRapido);
app.post('/diario/atualizar-agua', atualizarAgua);
app.get('/diario/hoje/:usuarioId', getDiarioHoje);
app.get('/diario/historico/:usuarioId', getHistoricoDiarios);

app.post('/receitas', criarReceita);
app.get('/receitas', listarReceitas);
app.put('/receitas/:id', editarReceita);
app.delete('/receitas/:id', excluirReceita);
app.post('/receitas/:id/like', toggleLike);
app.post('/receitas/:id/favorito', toggleFavorito);
app.get('/receitas/:id/comentarios', listarComentarios);
app.post('/receitas/:id/comentarios', adicionarComentario);

iniciarRotinas();

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});