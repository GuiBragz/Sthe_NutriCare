import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Adeus IP local! Agora usamos a URL do servidor na nuvem.
const api = axios.create({
  baseURL: "https://sthe-nutricare-api.onrender.com",
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@StheNutriCare:token");

    if (token) {
      // O formato com colchetes é universal e não falha
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("🎫 Enviando token para o Render na rota:", config.url);
    } else {
      console.log(
        "❌ Nenhum token encontrado no celular para a rota:",
        config.url,
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
