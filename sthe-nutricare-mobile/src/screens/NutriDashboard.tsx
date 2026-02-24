import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export function NutriDashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [linkMeet, setLinkMeet] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useFocusEffect(useCallback(() => {
    carregarAgenda();
  }, []));

  async function carregarAgenda() {
    try {
      // ⚠️ DICA: No backend, você precisaria criar uma rota GET /agendamentos/todos
      // Por enquanto vamos simular pegando de um ID fixo ou crie essa rota no backend depois
      // Vou usar uma gambiarra pra listar do ID 1 e 2 só pra testar visualmente se não tiver a rota
      const response = await api.get('/agendamentos/2'); // Pega do usuario 2 (Guilherme)
      setAgendamentos([response.data]); // Coloca em array pra lista funcionar
    } catch (error) { console.log(error); }
  }

  async function salvarLink() {
    // Aqui você chamaria api.patch para salvar o link no banco
    Alert.alert("Link Salvo", `Link do Meet: ${linkMeet} enviado para o paciente!`);
    setModalVisible(false);
  }

  const renderItem = ({ item }: any) => {
    if(!item) return null;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.paciente}>Paciente: Guilherme Braga</Text> 
          {/* O nome viria de item.usuario.nomeCompleto se a API mandar */}
          <View style={[styles.badge, { backgroundColor: item.tipoConsulta === 'ONLINE' ? '#59A5D8' : '#2F9F85' }]}>
            <Text style={styles.badgeText}>{item.tipoConsulta}</Text>
          </View>
        </View>
        
        <Text style={styles.data}>
            {new Date(item.dataHoraConsulta).toLocaleDateString('pt-BR')} às {new Date(item.dataHoraConsulta).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
        </Text>

        {item.tipoConsulta === 'ONLINE' && (
            <TouchableOpacity 
                style={styles.btnLink} 
                onPress={() => { setSelectedId(item.id); setModalVisible(true); }}
            >
                <Ionicons name="link" size={20} color="#FFF" />
                <Text style={{color:'#FFF', fontWeight:'bold'}}>Adicionar Link Meet</Text>
            </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#F0E6F5']} style={styles.container}>
      <Text style={styles.title}>Minha Agenda 📅</Text>
      <FlatList data={agendamentos} renderItem={renderItem} />

      {/* Modal para Colar Link */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Link da Videochamada</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Cole o link do Google Meet aqui" 
                value={linkMeet} 
                onChangeText={setLinkMeet}
            />
            <TouchableOpacity onPress={salvarLink} style={styles.btnSalvar}>
                <Text style={{color:'#FFF', fontWeight:'bold'}}>ENVIAR PARA PACIENTE</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{marginTop:15}}>
                <Text style={{color:'#666'}}>Cancelar</Text>
            </TouchableOpacity>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#A555B9', marginBottom: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  paciente: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  data: { color: '#666', marginBottom: 15 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  btnLink: { backgroundColor: '#A555B9', flexDirection: 'row', padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 10 },
  
  modalView: { flex: 1, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  input: { width: '100%', borderWidth: 1, borderColor: '#DDD', padding: 15, borderRadius: 10, marginBottom: 15, backgroundColor: '#FFF' },
  btnSalvar: { backgroundColor: '#2F9F85', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center' }
});