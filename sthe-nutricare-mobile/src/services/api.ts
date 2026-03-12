import axios from 'axios';

// SÓ MUDA AQUI AGORA!
const MEU_IP = '192.168.1.7'; // IP novo

const api = axios.create({
  
  baseURL: `http://${MEU_IP}:3000`
});

export default api;