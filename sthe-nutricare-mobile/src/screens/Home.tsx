import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

// ⚠️ IMPORTANTE: CONFIRA SE O IP ESTÁ IGUAL AO DO ARQUIVO AGENDAMENTO
const API_URL = 'http://192.168.1.3:3000'; 

export function Home({ route, navigation }: any) {
  const { nome, id } = route.params || { nome: 'Visitante', id: 0 };
  const [consulta, setConsulta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Função para buscar dados no backend
  const carregarDados = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/agendamentos/${id}`);
      
      // Se tiver data, salva no estado. Se não, limpa.
      if (response.data.dataHoraConsulta) {
        setConsulta(response.data);
      } else {
        setConsulta(null);
      }
    } catch (error) {
      console.log('Erro ao buscar consulta ou nenhuma encontrada.');
      setConsulta(null);
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect garante que a busca roda toda vez que a tela aparece
  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [id])
  );

  // Função de Cancelar
  async function handleCancelar() {
    Alert.alert(
      "Cancelar Consulta",
      "Tem certeza que deseja cancelar?",
      [
        { text: "Não", style: "cancel" },
        { 
          text: "Sim, cancelar", 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.patch(`${API_URL}/agendamentos/${consulta.id}/cancelar`);
              Alert.alert("Cancelado", "Sua consulta foi cancelada.");
              carregarDados(); // Atualiza a tela
            } catch (error) {
              Alert.alert("Erro", "Não foi possível cancelar.");
            }
          }
        }
      ]
    );
  }

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Olá, {nome}! 👋</Text>
      <Text style={styles.subtitle}>Seu painel nutricional</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próxima Consulta</Text>
        
        {loading ? (
          <ActivityIndicator color="#04D361" />
        ) : consulta ? (
          <View>
            <Text style={styles.dataDestaque}>
              {formatarData(consulta.dataHoraConsulta)}
            </Text>
            <Text style={styles.statusBadge}>
              Status: {consulta.status.replace('_', ' ')}
            </Text>

            {/* Botão de Cancelar (Só aparece se tiver consulta) */}
            <TouchableOpacity style={styles.buttonCancel} onPress={handleCancelar}>
              <Text style={styles.buttonCancelText}>Cancelar Agendamento</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.cardText}>Nenhuma consulta futura agendada.</Text>
        )}
      </View>

      <TouchableOpacity 
        style={styles.buttonSchedule} 
        onPress={() => navigation.navigate('Agendamento', { usuarioId: id })}
      >
        <Text style={styles.buttonText}>📅 Agendar Nova Consulta</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.buttonLogout} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214', padding: 24, justifyContent: 'center' },
  greeting: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#E1E1E6', fontSize: 16, marginTop: 4, marginBottom: 40 },
  card: { backgroundColor: '#202024', padding: 20, borderRadius: 8, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#04D361' },
  cardTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  cardText: { color: '#C4C4CC' },
  
  // Estilos Dinâmicos
  dataDestaque: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  statusBadge: { color: '#FBA94C', fontSize: 14, marginTop: 4, fontWeight: 'bold', marginBottom: 15 },
  
  buttonCancel: { padding: 10, backgroundColor: 'rgba(232, 63, 91, 0.1)', borderRadius: 4, alignItems: 'center', borderWidth: 1, borderColor: '#E83F5B' },
  buttonCancelText: { color: '#E83F5B', fontWeight: 'bold', fontSize: 14 },

  buttonSchedule: { marginTop: 10, padding: 15, backgroundColor: '#04D361', borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonLogout: { marginTop: 10, padding: 15, backgroundColor: '#29292E', borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold' }
});