import express from 'express';
import cors from 'cors';
import { criarUsuario, login } from './controllers/UsuarioController';

// AQUI ESTAVA O ERRO: Deixe apenas esta linha completa abaixo
import { criarAgendamento, buscarProximaConsulta, cancelarAgendamento, listarHistorico } from './controllers/AgendamentoController';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.json({ status: 'online', message: '🚀 API Sthe NutriCare rodando!' });
});

// --- ROTAS ---
app.post('/usuarios', criarUsuario);
app.post('/login', login);

// Rotas de Agendamento
app.post('/agendamentos', criarAgendamento);
app.get('/agendamentos/:usuarioId', buscarProximaConsulta);
app.patch('/agendamentos/:id/cancelar', cancelarAgendamento);
app.get('/agendamentos/:usuarioId/historico', listarHistorico);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`⚡ Servidor rodando na porta ${PORT}`);
});