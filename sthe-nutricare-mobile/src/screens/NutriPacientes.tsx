import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export function NutriPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  
  // Controle do Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<any>(null);

  // 1. Busca os pacientes no Banco de Dados
  const carregarPacientes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/pacientes/buscar?busca=${busca}`);
      setPacientes(response.data);
    } catch (error) {
      console.log('Erro ao buscar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarPacientes();
    }, [busca])
  );

  function abrirDetalhes(paciente: any) {
    setPacienteSelecionado(paciente);
    setModalVisible(true);
  }

  // 2. Função de enviar dieta (que você já tinha, agora conectada ao Modal)
  function enviarDieta(pacienteId: number) {
    Alert.alert(
      "Enviar Dieta",
      "Deseja enviar a dieta padrão de Hipertrofia para este paciente?",
      [
        { text: "Cancelar", style: "cancel" },
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
              setModalVisible(false); // Fecha o modal após enviar
            } catch (e) { 
              Alert.alert("Erro ao enviar a dieta"); 
            }
          }
        }
      ]
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#F0E6F5']} style={styles.container}>
      <Text style={styles.title}>Meus Pacientes 👥</Text>

      {/* BARRA DE PESQUISA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={{marginLeft: 15}} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Pesquisar por nome..."
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')} style={{padding: 10}}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* LISTA DE PACIENTES */}
      {loading && pacientes.length === 0 ? (
        <ActivityIndicator size="large" color="#2F9F85" style={{marginTop: 50}} />
      ) : (
        <FlatList 
          data={pacientes}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum paciente encontrado.</Text>}
          renderItem={({ item }: any) => (
              <TouchableOpacity style={styles.card} onPress={() => abrirDetalhes(item)}>
                  <View style={styles.cardInfo}>
                      <View style={styles.avatarMini}>
                         <Ionicons name="person" size={20} color="#FFF" />
                      </View>
                      <View>
                        <Text style={styles.nome}>{item.nomeCompleto}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                      </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#CCC" />
              </TouchableOpacity>
          )}
        />
      )}

      {/* --- MODAL FICHA DO PACIENTE --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setModalVisible(false)}>
              <Ionicons name="close-circle" size={32} color="#E83F5B" />
            </TouchableOpacity>

            {pacienteSelecionado && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{alignItems: 'center', marginBottom: 20}}>
                  <Ionicons name="person-circle" size={80} color="#A555B9" />
                  <Text style={styles.modalNome}>{pacienteSelecionado.nomeCompleto}</Text>
                  <Text style={styles.modalEmail}>{pacienteSelecionado.email}</Text>
                </View>

                <View style={styles.dadosGrid}>
                  <View style={styles.dadoBox}>
                    <Text style={styles.dadoLabel}>ALTURA</Text>
                    <Text style={styles.dadoValor}>{pacienteSelecionado.altura ? `${pacienteSelecionado.altura}m` : '--'}</Text>
                  </View>
                  <View style={styles.dadoBox}>
                    <Text style={styles.dadoLabel}>SEXO</Text>
                    <Text style={styles.dadoValor}>{pacienteSelecionado.sexo || '--'}</Text>
                  </View>
                  <View style={styles.dadoBox}>
                    <Text style={styles.dadoLabel}>NASCIMENTO</Text>
                    <Text style={styles.dadoValor}>{pacienteSelecionado.dataNascimento || '--'}</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Objetivos</Text>
                <Text style={styles.infoText}>{pacienteSelecionado.objetivos || 'Não preenchido'}</Text>

                <Text style={styles.sectionTitle}>Contato</Text>
                <Text style={styles.infoText}>📱 {pacienteSelecionado.telefone || 'Não preenchido'}</Text>

                {/* BOTÃO PARA MANDAR DIETA */}
                <TouchableOpacity style={styles.btnDieta} onPress={() => enviarDieta(pacienteSelecionado.id)}>
                  <Ionicons name="restaurant" size={20} color="#FFF" style={{marginRight: 10}}/>
                  <Text style={styles.btnDietaText}>ENVIAR DIETA PADRÃO</Text>
                </TouchableOpacity>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#A555B9', marginBottom: 20 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 15, marginBottom: 20, elevation: 2 },
  searchInput: { flex: 1, padding: 15, color: '#333' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },

  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardInfo: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatarMini: { backgroundColor: '#A555B9', padding: 10, borderRadius: 20 },
  nome: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  email: { color: '#666', fontSize: 12 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: '85%' },
  closeModalBtn: { alignSelf: 'flex-end', marginBottom: 10 },
  modalNome: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 10 },
  modalEmail: { color: '#666' },
  
  dadosGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dadoBox: { alignItems: 'center', backgroundColor: '#F9F9F9', padding: 15, borderRadius: 15, flex: 1, marginHorizontal: 5 },
  dadoLabel: { fontSize: 10, color: '#999', fontWeight: 'bold', marginBottom: 5 },
  dadoValor: { fontSize: 16, fontWeight: 'bold', color: '#2F9F85' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#A555B9', marginBottom: 5, marginTop: 15 },
  infoText: { fontSize: 16, color: '#555', backgroundColor: '#F5F5F5', padding: 15, borderRadius: 10 },

  btnDieta: { backgroundColor: '#FF9966', flexDirection: 'row', padding: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 30, marginBottom: 20 },
  btnDietaText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});