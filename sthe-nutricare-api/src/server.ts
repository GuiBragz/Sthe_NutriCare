import "dotenv/config";
import express from "express";
import cors from "cors";
import { authMiddleware } from "./middlewares/auth";
import {
  criarUsuario,
  login,
  buscarUsuarioPorId,
  atualizarUsuario,
  buscarPacientes,
  salvarPushToken,
} from "./controllers/UsuarioController";
import {
  criarAgendamento,
  buscarProximaConsulta,
  cancelarAgendamento,
  listarHistorico,
  listarTodosAgendamentos,
  atualizarLinkMeet,
  criarHorarioDisponivel,
  listarHorariosDisponiveis,
  atualizarStatusConsulta,
} from "./controllers/AgendamentoController";
import {
  buscarPlanoPorUsuario,
  salvarPlano,
  editarPlano,
  excluirPlano,
} from "./controllers/PlanoController";
import {
  criarReceita,
  listarReceitas,
  editarReceita,
  excluirReceita,
  toggleLike,
  toggleFavorito,
  adicionarComentario,
  listarComentarios,
} from "./controllers/ReceitaController";
import {
  getDiarioHoje,
  atualizarRapido,
  atualizarAgua,
  salvarRegistroPro,
  getHistoricoDiarios,
} from "./controllers/DiarioController";
import { dispararLembreteAgua } from "./controllers/NotificacaoController";
import { iniciarRotinas } from "./services/CronService";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ status: "online", message: "API Sthe NutriCare rodando!" });
});

app.post("/usuarios", criarUsuario);
app.post("/login", login);

app.get("/pacientes/buscar", authMiddleware, buscarPacientes);
app.get("/usuarios/:id", authMiddleware, buscarUsuarioPorId);
app.put("/usuarios/:id", authMiddleware, atualizarUsuario);
app.patch("/usuarios/:id/token", authMiddleware, salvarPushToken);

app.post("/agendamentos", authMiddleware, criarAgendamento);
app.post("/agendamentos/disponivel", authMiddleware, criarHorarioDisponivel);
app.post("/notificacoes/agua", authMiddleware, dispararLembreteAgua);
app.get("/agendamentos/vagas", authMiddleware, listarHorariosDisponiveis);
app.get("/agendamentos/geral/todos", authMiddleware, listarTodosAgendamentos);
app.get("/agendamentos/:usuarioId", authMiddleware, buscarProximaConsulta);
app.patch("/agendamentos/:id/cancelar", authMiddleware, cancelarAgendamento);
app.get("/agendamentos/:usuarioId/historico", authMiddleware, listarHistorico);
app.patch("/agendamentos/:id/link", authMiddleware, atualizarLinkMeet);
app.patch("/agendamentos/:id/status", authMiddleware, atualizarStatusConsulta);

app.post("/planos", authMiddleware, salvarPlano);
app.get("/planos/:usuarioId", authMiddleware, buscarPlanoPorUsuario);
app.put("/planos/:id", authMiddleware, editarPlano);
app.delete("/planos/:id", authMiddleware, excluirPlano);

app.post("/diario", authMiddleware, salvarRegistroPro);
app.post("/diario/atualizar-rapido", authMiddleware, atualizarRapido);
app.post("/diario/atualizar-agua", authMiddleware, atualizarAgua);
app.get("/diario/hoje/:usuarioId", authMiddleware, getDiarioHoje);
app.get("/diario/historico/:usuarioId", authMiddleware, getHistoricoDiarios);

app.post("/receitas", authMiddleware, criarReceita);
app.get("/receitas", authMiddleware, listarReceitas);
app.put("/receitas/:id", authMiddleware, editarReceita);
app.delete("/receitas/:id", authMiddleware, excluirReceita);
app.post("/receitas/:id/like", authMiddleware, toggleLike);
app.post("/receitas/:id/favorito", authMiddleware, toggleFavorito);
app.get("/receitas/:id/comentarios", authMiddleware, listarComentarios);
app.post("/receitas/:id/comentarios", authMiddleware, adicionarComentario);

iniciarRotinas();

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
