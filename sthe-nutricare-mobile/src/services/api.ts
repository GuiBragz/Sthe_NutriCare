import axios from 'axios';

// 👇 SÓ MUDA AQUI AGORA!
const MEU_IP = '192.168.1.6'; // Seu IP novo

const api = axios.create({
  // ❌ NÃO ASSIM: baseURL: `http://${'192.168.1.6'}:3000`
  
  // ✅ ASSIM (Use a variável sem aspas):
  baseURL: `http://${MEU_IP}:3000`
});

export default api;