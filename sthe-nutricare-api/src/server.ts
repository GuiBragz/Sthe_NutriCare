import express from 'express';
import cors from 'cors';
import { criarUsuario, login } from './controllers/UsuarioController'; // <--- ATENÇÃO AQUI: Importe o login

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.json({ status: 'online', message: '🚀 API Sthe NutriCare rodando!' });
});

// --- ROTAS ---
app.post('/usuarios', criarUsuario);
app.post('/login', login); // <--- NOVA ROTA

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`⚡ Servidor rodando na porta ${PORT}`);
});