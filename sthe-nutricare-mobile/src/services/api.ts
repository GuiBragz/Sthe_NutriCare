import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MEU_IP = "192.168.1.6"; // Confirme se o IP ainda é esse

const api = axios.create({
  baseURL: `http://${MEU_IP}:3000`,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@StheNutriCare:token");

    if (token) {
      // O formato com colchetes é universal e não falha
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("🎫 Enviando token para a rota:", config.url);
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
