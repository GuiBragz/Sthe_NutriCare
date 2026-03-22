import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api'; 

export function Home({ route, navigation }: any) {
  const { nome, id } = route.params || { nome: 'Visitante', id: 0 };
  const [consulta, setConsulta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const carregarDados = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.get(`/agendamentos/${id}`);
      
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
        { text: "Nao", style: "cancel" },
        { 
          text: "Sim", style: 'destructive',
          onPress: async () => {
            try {
              await api.patch(`/agendamentos/${consulta.id}/cancelar`);
              carregarDados();
            } catch (error) {
              Alert.alert("Erro", "Nao foi possivel cancelar.");
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Ola, {nome.split(' ')[0]}!</Text>
            <Text style={styles.subtitle}>Vamos cuidar de voce hoje?</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('Perfil', { usuarioId: id })} 
            style={styles.iconBtn}
          >
            <Ionicons name="person-outline" size={24} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color="#FFD700" />
            <Text style={styles.cardTitle}>PROXIMA CONSULTA</Text>
          </View>
          
          {loading ? (
            <ActivityIndicator color="#2E7D32" style={{marginVertical: 20}} />
          ) : consulta ? (
            <View style={styles.consultaInfo}>
              <Text style={styles.dataGrande}>{formatarData(consulta.dataHoraConsulta).dia}</Text>
              <Text style={styles.horaGrande}>{formatarData(consulta.dataHoraConsulta).hora}</Text>
              
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{consulta.status.replace('_', ' ')}</Text>
              </View>

              {consulta.tipoConsulta === 'ONLINE' && consulta.linkMeet && (
                <TouchableOpacity 
                  style={styles.meetBtn}
                  onPress={() => Linking.openURL(consulta.linkMeet)}
                >
                  <Ionicons name="videocam" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.meetBtnText}>ENTRAR NA REUNIAO</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.cancelLink} onPress={handleCancelar}>
                <Text style={styles.cancelText}>Cancelar agendamento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Voce nao tem consultas agendadas.</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.dietCard}
          onPress={() => navigation.navigate('PlanoAlimentar', { usuarioId: id })}
        >
          <View style={styles.dietGradient}>
            <View>
              <Text style={styles.dietTitle}>MEU PLANO ALIMENTAR</Text>
              <Text style={styles.dietSub}>Ver o que comer hoje</Text>
            </View>
            <Ionicons name="restaurant-outline" size={32} color="#FFD700" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButtonContainer}
          onPress={() => navigation.navigate('Agendamento', { usuarioId: id })}
        >
          <View style={styles.gradientButton}>
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" style={{marginRight: 10}} />
            <Text style={styles.buttonText}>AGENDAR NOVA</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Historico', { usuarioId: id })}
        >
          <Ionicons name="time-outline" size={20} color="#2E7D32" style={{marginRight: 8}} />
          <Text style={styles.secondaryButtonText}>VER MEU HISTORICO</Text>
        </TouchableOpacity>

      </ScrollView>
      
      <View style={styles.footerDecoration} /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDE7' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32' },
  subtitle: { fontSize: 16, color: '#666' },
  iconBtn: { padding: 10, backgroundColor: '#FFFFFF', borderRadius: 12, elevation: 2 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 15,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EFEDE7', paddingBottom: 10 },
  cardTitle: { color: '#2E7D32', fontWeight: 'bold', fontSize: 14, marginLeft: 10, letterSpacing: 1 },
  
  consultaInfo: { alignItems: 'center' },
  dataGrande: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  horaGrande: { fontSize: 18, color: '#666', marginBottom: 15 },
  
  badgeContainer: { backgroundColor: '#EFEDE7', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#FFD700' },
  badgeText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 12 },

  meetBtn: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
    elevation: 2
  },
  meetBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },

  cancelLink: { padding: 5 },
  cancelText: { color: '#D32F2F', fontSize: 14 },

  emptyState: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#999', fontStyle: 'italic' },

  dietCard: { marginBottom: 15, borderRadius: 20, elevation: 4, overflow: 'hidden' },
  dietGradient: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2E7D32' },
  dietTitle: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  dietSub: { color: '#EFEDE7', fontSize: 12 },

  actionButtonContainer: { marginBottom: 15, elevation: 4 },
  gradientButton: { 
    flexDirection: 'row', height: 60, borderRadius: 30, 
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2E7D32',
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  secondaryButton: { 
    flexDirection: 'row', height: 55, borderRadius: 30, 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#2E7D32', backgroundColor: 'transparent'
  },
  secondaryButtonText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 14 },

  footerDecoration: { height: 60, width: '100%', opacity: 0.3 }
});