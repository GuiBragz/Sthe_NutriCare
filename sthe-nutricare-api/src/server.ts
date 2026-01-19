import express from 'express';
import cors from 'cors';
import { criarUsuario, login, buscarUsuarioPorId, atualizarUsuario } from './controllers/UsuarioController';
import { criarAgendamento, buscarProximaConsulta, cancelarAgendamento, listarHistorico } from './controllers/AgendamentoController';
import { buscarPlanoPorUsuario } from './controllers/PlanoController';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.json({ status: 'online', message: '🚀 API Sthe NutriCare rodando!' });
});

// --- ROTAS DE USUÁRIO ---
app.post('/usuarios', criarUsuario);
app.post('/login', login);
app.get('/usuarios/:id', buscarUsuarioPorId); // <--- CORRIGIDO AQUI (era router, virou app)


// --- ROTAS DE AGENDAMENTO ---
app.post('/agendamentos', criarAgendamento);
app.get('/agendamentos/:usuarioId', buscarProximaConsulta);
app.patch('/agendamentos/:id/cancelar', cancelarAgendamento);
app.get('/agendamentos/:usuarioId/historico', listarHistorico);
app.get('/planos/:usuarioId', buscarPlanoPorUsuario);
app.put('/usuarios/:id', atualizarUsuario); // <--- Rota de Edição (PUT)

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`⚡ Servidor rodando na porta ${PORT}`);
});