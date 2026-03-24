import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // <-- Importação adicionada
import api from "../services/api";

export function Perfil({ route, navigation }: any) {
  const { usuarioId } = route.params;
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados para Edição
  const [modalVisible, setModalVisible] = useState(false);
  const [editNome, setEditNome] = useState("");
  const [editAltura, setEditAltura] = useState("");
  const [editNascimento, setEditNascimento] = useState("");
  const [editObjetivos, setEditObjetivos] = useState("");

  const carregarPerfil = async () => {
    try {
      const response = await api.get(`/usuarios/${usuarioId}`);
      setPerfil(response.data);
    } catch (error) {
      console.log("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [usuarioId]),
  );

  function calcularIdadeReal(dataString: string) {
    if (!dataString) return "--";
    let diaNasc, mesNasc, anoNasc;
    const limpa = dataString.trim();

    try {
      if (limpa.includes("-")) {
        const partes = limpa.split("-");
        if (partes[0].length === 4) {
          anoNasc = parseInt(partes[0]);
          mesNasc = parseInt(partes[1]) - 1;
          diaNasc = parseInt(partes[2]);
        } else {
          diaNasc = parseInt(partes[0]);
          mesNasc = parseInt(partes[1]) - 1;
          anoNasc = parseInt(partes[2]);
        }
      } else if (limpa.includes("/")) {
        const partes = limpa.split("/");
        diaNasc = parseInt(partes[0]);
        mesNasc = parseInt(partes[1]) - 1;
        anoNasc = parseInt(partes[2]);
      } else return dataString;

      if (!anoNasc || !mesNasc || !diaNasc) return dataString;

      const hoje = new Date();
      let idade = hoje.getFullYear() - anoNasc;
      if (
        hoje.getMonth() < mesNasc ||
        (hoje.getMonth() === mesNasc && hoje.getDate() < diaNasc)
      ) {
        idade--;
      }
      return `${idade} anos`;
    } catch (e) {
      return dataString;
    }
  }

  function abrirEdicao() {
    if (perfil) {
      setEditNome(perfil.nomeCompleto);
      setEditAltura(perfil.altura ? String(perfil.altura) : "");
      setEditNascimento(perfil.dataNascimento || "");
      setEditObjetivos(perfil.objetivos || "");
      setModalVisible(true);
    }
  }

  async function salvarEdicao() {
    try {
      await api.put(`/usuarios/${usuarioId}`, {
        nome: editNome,
        altura: editAltura,
        objetivos: editObjetivos,
        nascimento: editNascimento,
        sexo: perfil.sexo,
      });

      setModalVisible(false);
      Alert.alert("Sucesso", "Perfil atualizado!");
      carregarPerfil();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar.");
    }
  }

  // 👇 LÓGICA DE LOGOUT CORRIGIDA
  async function handleLogout() {
    Alert.alert("Sair", "Tem certeza que deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Destrói o token do aparelho
            await AsyncStorage.removeItem("@StheNutriCare:token");

            // 2. Reseta a pilha de navegação para que o usuário não consiga "Voltar"
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (error) {
            Alert.alert("Erro", "Houve um problema ao tentar sair.");
          }
        },
      },
    ]);
  }

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#2E7D32"
        style={{ flex: 1, backgroundColor: "#EFEDE7" }}
      />
    );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.iconBtn}>
            <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
          </TouchableOpacity>
        </View>

        {/* Card Principal */}
        <View style={styles.cardProfile}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={60} color="#FFF" />
            </View>
            <View style={styles.camIcon}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </View>
          </View>

          <Text style={styles.name}>{perfil?.nomeCompleto}</Text>
          <Text style={styles.email}>{perfil?.email}</Text>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ALTURA</Text>
              <Text style={styles.statValue}>
                {perfil?.altura ? `${perfil.altura} m` : "--"}
              </Text>
            </View>
            <View style={styles.statLine} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>IDADE</Text>
              <Text style={styles.statValue}>
                {calcularIdadeReal(perfil?.dataNascimento)}
              </Text>
            </View>
            <View style={styles.statLine} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SEXO</Text>
              <Text style={styles.statValue}>{perfil?.sexo || "--"}</Text>
            </View>
          </View>
        </View>

        {/* Objetivos */}
        <Text style={styles.sectionTitle}>Meus Objetivos</Text>
        <View style={styles.cardInfo}>
          {perfil?.objetivos ? (
            perfil.objetivos.split(",").map((obj: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#FFF"
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.tagText}>{obj.trim()}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: "#999" }}>Nenhum objetivo definido.</Text>
          )}
        </View>

        <TouchableOpacity style={styles.editButton} onPress={abrirEdicao}>
          <Text style={styles.editButtonText}>EDITAR PERFIL</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- MODAL DE EDIÇÃO --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Editar Dados</Text>

            <Text style={styles.labelInput}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              value={editNome}
              onChangeText={setEditNome}
            />

            <Text style={styles.labelInput}>
              Data de Nascimento (DD/MM/AAAA)
            </Text>
            <TextInput
              style={styles.input}
              value={editNascimento}
              onChangeText={setEditNascimento}
              placeholder="Ex: 15/05/1999"
              keyboardType="numeric"
            />

            <Text style={styles.labelInput}>Altura (ex: 1.75)</Text>
            <TextInput
              style={styles.input}
              value={editAltura}
              onChangeText={setEditAltura}
              keyboardType="numeric"
            />

            <Text style={styles.labelInput}>
              Objetivos (separe por vírgula)
            </Text>
            <TextInput
              style={styles.input}
              value={editObjetivos}
              onChangeText={setEditObjetivos}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.btnCancel}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={salvarEdicao} style={styles.btnSave}>
                <Text style={styles.btnSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFEDE7" },
  content: { padding: 24, paddingTop: 50 },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },
  iconBtn: {
    padding: 8,
    backgroundColor: "#FFF",
    borderRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#FFD700",
  },

  cardProfile: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  avatarContainer: { marginBottom: 10, position: "relative" },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  camIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#B8860B",
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFF",
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 5,
    textAlign: "center",
  },
  email: { fontSize: 14, color: "#666", marginBottom: 20 },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EFEDE7",
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  statItem: { alignItems: "center", flex: 1 },
  statLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#999",
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 5,
  },
  statLine: { width: 1, height: "100%", backgroundColor: "#EFEDE7" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
    marginLeft: 5,
  },
  cardInfo: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  tag: {
    backgroundColor: "#2E7D32",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },

  editButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 30,
    padding: 15,
    alignItems: "center",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  editButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "85%",
    backgroundColor: "#EFEDE7",
    borderRadius: 20,
    padding: 25,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  labelInput: {
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#FFF",
    fontSize: 16,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  btnCancel: { flex: 1, alignItems: "center", padding: 15 },
  btnCancelText: { color: "#666", fontWeight: "bold" },
  btnSave: {
    flex: 1,
    backgroundColor: "#2E7D32",
    borderRadius: 10,
    alignItems: "center",
    padding: 15,
  },
  btnSaveText: { color: "#FFF", fontWeight: "bold" },
});
