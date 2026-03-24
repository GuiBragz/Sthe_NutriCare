import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export function Login({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !senha)
      return Alert.alert("Atencao", "Preencha email e senha!");

    setLoading(true);
    try {
      const response = await api.post("/login", { email, senha });

      const { token, usuario: user } = response.data;

      if (token) {
        await AsyncStorage.setItem("@StheNutriCare:token", token);
      }

      if (user.tipo === "NUTRICIONISTA") {
        navigation.reset({
          index: 0,
          routes: [{ name: "NutriTabs" }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "MainTabs",
              params: {
                nome: user.nomeCompleto || user.nome,
                id: user.id,
              },
            },
          ],
        });
      }
    } catch (error) {
      Alert.alert("Erro", "Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  function handleEsqueciSenha() {
    Alert.alert(
      "Recuperacao",
      "Enviamos um link para o seu e-mail (Simulacao).",
    );
  }

  function handleGoogleLogin() {
    Alert.alert("Google", "Login com Google em desenvolvimento.");
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <Image
          source={require("../../assets/logo_ss_ss.png")}
          style={styles.logoMonogram}
          resizeMode="contain"
        />
        <Image
          source={require("../../assets/logo_stheffane_santos_nutricionista.png")}
          style={styles.logoText}
          resizeMode="contain"
        />

        <View style={styles.inputContainer}>
          <Ionicons
            name="person"
            size={20}
            color="#2E7D32"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="EMAIL"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#2E7D32"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="SENHA"
            placeholderTextColor="#666"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity style={styles.forgotBtn} onPress={handleEsqueciSenha}>
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={handleLogin}
          disabled={loading}
        >
          <View style={styles.mainButton}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>ENTRAR</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou continue com</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
          <Ionicons
            name="logo-google"
            size={24}
            color="#EA4335"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.googleText}>Entrar com Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAccountBtn}
          onPress={() => navigation.navigate("CadastroStep1")}
        >
          <Text style={styles.createAccountText}>
            Nao tem conta?{" "}
            <Text style={{ fontWeight: "bold", color: "#2E7D32" }}>
              Cadastre-se
            </Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFEDE7" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  logoMonogram: { width: 90, height: 90, marginBottom: 10 },
  logoText: { width: 240, height: 70, marginBottom: 40 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#FFD700",
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 55,
    width: "100%",
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: "#333" },

  forgotBtn: { alignSelf: "flex-end", marginBottom: 20, marginRight: 10 },
  forgotText: { color: "#2E7D32", fontSize: 14, fontWeight: "600" },

  buttonContainer: { width: "100%", marginBottom: 30 },
  mainButton: {
    backgroundColor: "#2E7D32",
    height: 55,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(0,0,0,0.1)" },
  dividerText: { marginHorizontal: 10, color: "#666", fontWeight: "bold" },

  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: 55,
    borderRadius: 30,
    elevation: 2,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#EFEDE7",
  },
  googleText: { color: "#555", fontSize: 16, fontWeight: "bold" },

  createAccountBtn: { marginTop: 10 },
  createAccountText: { color: "#333", fontSize: 16 },
});
