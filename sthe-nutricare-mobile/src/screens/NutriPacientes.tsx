import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from '../services/api';

export function NutriPacientes() {
  const navigation = useNavigation<any>();

  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<any>(null);

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

  function irParaCriarDieta() {
    setModalVisible(false);
    navigation.navigate('NutriCriarPlano', { 
      pacienteId: pacienteSelecionado.id, 
      pacienteNome: pacienteSelecionado.nomeCompleto 
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Pacientes</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#B8860B" style={{marginLeft: 15}} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Pesquisar por nome..."
          placeholderTextColor="#999"
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')} style={{padding: 10}}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {loading && pacientes.length === 0 ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{marginTop: 50}} />
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
                  <Ionicons name="chevron-forward" size={24} color="#FFD700" />
              </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setModalVisible(false)}>
              <Ionicons name="close-circle" size={32} color="#D32F2F" />
            </TouchableOpacity>

            {pacienteSelecionado && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{alignItems: 'center', marginBottom: 20}}>
                  <View style={styles.avatarGrande}>
                    <Ionicons name="person" size={50} color="#FFF" />
                  </View>
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
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>{pacienteSelecionado.objetivos || 'Nao preenchido'}</Text>
                </View>

                <Text style={styles.sectionTitle}>Contato</Text>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>{pacienteSelecionado.telefone || 'Nao preenchido'}</Text>
                </View>

                <TouchableOpacity style={styles.btnDieta} onPress={irParaCriarDieta}>
                  <Ionicons name="document-text" size={20} color="#FFF" style={{marginRight: 10}}/>
                  <Text style={styles.btnDietaText}>CRIAR PLANO ALIMENTAR</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.btnDieta, { backgroundColor: '#B8860B', marginTop: 10, marginBottom: 20 }]} 
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('NutriDesempenhoPaciente', { 
                      pacienteId: pacienteSelecionado.id, 
                      pacienteNome: pacienteSelecionado.nomeCompleto 
                    });
                  }}
                >
                  <Ionicons name="stats-chart" size={20} color="#FFF" style={{marginRight: 10}}/>
                  <Text style={styles.btnDietaText}>VER DESEMPENHO</Text>
                </TouchableOpacity>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDE7', padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32', marginBottom: 20 },
  
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 15, 
    marginBottom: 20, 
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  searchInput: { flex: 1, padding: 15, color: '#333' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },

  card: { 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 10, 
    elevation: 2, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  cardInfo: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatarMini: { backgroundColor: '#2E7D32', padding: 10, borderRadius: 20 },
  nome: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  email: { color: '#666', fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#EFEDE7', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 24, 
    maxHeight: '85%',
    borderTopWidth: 2,
    borderColor: '#FFD700'
  },
  closeModalBtn: { alignSelf: 'flex-end', marginBottom: 10 },
  avatarGrande: { backgroundColor: '#2E7D32', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFD700' },
  modalNome: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginTop: 10 },
  modalEmail: { color: '#666' },
  
  dadosGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dadoBox: { alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 15, flex: 1, marginHorizontal: 5, borderWidth: 1, borderColor: '#FFD700' },
  dadoLabel: { fontSize: 10, color: '#999', fontWeight: 'bold', marginBottom: 5 },
  dadoValor: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginBottom: 5, marginTop: 15 },
  infoBox: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#FFD700' },
  infoText: { fontSize: 14, color: '#555' },

  btnDieta: { backgroundColor: '#2E7D32', flexDirection: 'row', padding: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  btnDietaText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});