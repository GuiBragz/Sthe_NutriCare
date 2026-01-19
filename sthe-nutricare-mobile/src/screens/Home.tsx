import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

// ⚠️ CONFIRA SEU IP
const API_URL = 'http://192.168.1.3:3000'; 

export function Home({ route, navigation }: any) {
  const { nome, id } = route.params || { nome: 'Visitante', id: 0 };
  const [consulta, setConsulta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Busca dados (igual antes)
  const carregarDados = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/agendamentos/${id}`);
      if (response.data.dataHoraConsulta) {
        setConsulta(response.data);
      } else {
        setConsulta(null);
      }
    } catch (error) {
      setConsulta(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [id])
  );

  async function handleCancelar() {
    Alert.alert(
      "Cancelar",
      "Deseja realmente cancelar?",
      [
        { text: "Não", style: "cancel" },
        { 
          text: "Sim", style: 'destructive',
          onPress: async () => {
            try {
              await axios.patch(`${API_URL}/agendamentos/${consulta.id}/cancelar`);
              carregarDados();
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
    return {
      dia: data.toLocaleDateString('pt-BR'),
      hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#F0E6F5', '#D8BFD8']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {nome.split(' ')[0]}! 👋</Text>
            <Text style={styles.subtitle}>Vamos cuidar de você hoje?</Text>
          </View>
          
          {/* BOTÃO PERFIL (Mudamos de Log-out para Person) */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Perfil', { usuarioId: id })} 
            style={styles.iconBtn}
          >
            <Ionicons name="person-outline" size={24} color="#A555B9" />
          </TouchableOpacity>
        </View>

        {/* CARD DE PRÓXIMA CONSULTA */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color="#2F9F85" />
            <Text style={styles.cardTitle}>PRÓXIMA CONSULTA</Text>
          </View>
          
          {loading ? (
            <ActivityIndicator color="#A555B9" style={{marginVertical: 20}} />
          ) : consulta ? (
            <View style={styles.consultaInfo}>
              <Text style={styles.dataGrande}>{formatarData(consulta.dataHoraConsulta).dia}</Text>
              <Text style={styles.horaGrande}>{formatarData(consulta.dataHoraConsulta).hora}</Text>
              
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{consulta.status.replace('_', ' ')}</Text>
              </View>
              
              <TouchableOpacity style={styles.cancelLink} onPress={handleCancelar}>
                <Text style={styles.cancelText}>Cancelar agendamento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Você não tem consultas agendadas.</Text>
            </View>
          )}
        </View>

        {/* --- NOVO BOTÃO: MEU PLANO ALIMENTAR --- */}
        <TouchableOpacity 
          style={styles.dietCard}
          onPress={() => navigation.navigate('PlanoAlimentar', { usuarioId: id })}
        >
          <LinearGradient
            colors={['#FF9966', '#FF5E62']} // Gradiente Laranja/Vermelho
            start={{x:0, y:0}} end={{x:1, y:1}}
            style={styles.dietGradient}
          >
            <View>
              <Text style={styles.dietTitle}>MEU PLANO ALIMENTAR</Text>
              <Text style={styles.dietSub}>Ver o que comer hoje 🍎</Text>
            </View>
            <Ionicons name="restaurant-outline" size={32} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
        
        {/* BOTÃO AGENDAR (GRADIENTE) */}
        <TouchableOpacity 
          style={styles.actionButtonContainer}
          onPress={() => navigation.navigate('Agendamento', { usuarioId: id })}
        >
          <LinearGradient 
            colors={['#A555B9', '#2F9F85']} 
            start={{x:0, y:0}} end={{x:1, y:1}} 
            style={styles.gradientButton}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFF" style={{marginRight: 10}} />
            <Text style={styles.buttonText}>AGENDAR NOVA</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* BOTÃO HISTÓRICO (OUTLINE) */}
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Historico', { usuarioId: id })}
        >
          <Ionicons name="time-outline" size={20} color="#A555B9" style={{marginRight: 8}} />
          <Text style={styles.secondaryButtonText}>VER MEU HISTÓRICO</Text>
        </TouchableOpacity>

      </ScrollView>
      
      {/* Rodapé decorativo */}
      <View style={styles.footerDecoration} /> 
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#A555B9' },
  subtitle: { fontSize: 16, color: '#666' },
  iconBtn: { padding: 10, backgroundColor: '#FFF', borderRadius: 12, elevation: 2 },

  // Card Estilo Novo
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15, // Diminuí um pouco pra caber o botão de dieta
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 10 },
  cardTitle: { color: '#2F9F85', fontWeight: 'bold', fontSize: 14, marginLeft: 10, letterSpacing: 1 },
  
  consultaInfo: { alignItems: 'center' },
  dataGrande: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  horaGrande: { fontSize: 18, color: '#666', marginBottom: 15 },
  
  badgeContainer: { backgroundColor: '#FFF3E0', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 15 },
  badgeText: { color: '#F57C00', fontWeight: 'bold', fontSize: 12 },

  cancelLink: { padding: 5 },
  cancelText: { color: '#E83F5B', fontSize: 14 },

  emptyState: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#999', fontStyle: 'italic' },

  // --- ESTILOS DO BOTÃO DIETA ---
  dietCard: { marginBottom: 15, borderRadius: 20, elevation: 4, overflow: 'hidden' },
  dietGradient: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dietTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  dietSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },

  // Botões
  actionButtonContainer: { marginBottom: 15, elevation: 4 },
  gradientButton: { 
    flexDirection: 'row', height: 60, borderRadius: 30, 
    alignItems: 'center', justifyContent: 'center' 
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  secondaryButton: { 
    flexDirection: 'row', height: 55, borderRadius: 30, 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#A555B9', backgroundColor: 'transparent'
  },
  secondaryButtonText: { color: '#A555B9', fontWeight: 'bold', fontSize: 14 },

  footerDecoration: { height: 60, width: '100%', opacity: 0.3 }
});