import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

// Dados fake de pacientes (Idealmente viria de uma rota GET /usuarios?tipo=PACIENTE)
const PACIENTES = [
    { id: 2, nome: 'Guilherme Braga', email: 'gui@email.com' },
    { id: 99, nome: 'Maria Silva', email: 'maria@email.com' }
];

export function NutriPacientes() {

  function enviarDieta(pacienteId: number) {
      // Aqui abriria uma tela pra digitar o texto da dieta
      // Para simplificar, vamos enviar uma dieta padrão
      Alert.alert(
          "Enviar Dieta",
          "Deseja enviar a dieta padrão de Hipertrofia para este paciente?",
          [
              { text: "Cancelar" },
              { 
                  text: "Enviar", 
                  onPress: async () => {
                      try {
                          await api.post('/planos', {
                              titulo: "Plano Hipertrofia (Atualizado)",
                              descricao: "Café: 4 Ovos. Almoço: 200g Frango. Jantar: Sopa.",
                              usuarioId: pacienteId
                          });
                          Alert.alert("Sucesso", "Dieta enviada!");
                      } catch (e) { Alert.alert("Erro ao enviar"); }
                  }
              }
          ]
      );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#F0E6F5']} style={styles.container}>
      <Text style={styles.title}>Meus Pacientes 👥</Text>
      
      <FlatList 
        data={PACIENTES}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
            <View style={styles.card}>
                <View>
                    <Text style={styles.nome}>{item.nome}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                </View>
                <TouchableOpacity style={styles.btnDieta} onPress={() => enviarDieta(item.id)}>
                    <Ionicons name="restaurant" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#A555B9', marginBottom: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 10, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nome: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  email: { color: '#666' },
  btnDieta: { backgroundColor: '#FF9966', padding: 12, borderRadius: 10 }
});