import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';

export function NutriDashboard() {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal de Link do Meet
  const [modalLinkVisible, setModalLinkVisible] = useState(false);
  const [linkMeet, setLinkMeet] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Modal de Criar Horário
  const [modalVagaVisible, setModalVagaVisible] = useState(false);
  const [dataNovaVaga, setDataNovaVaga] = useState(new Date());
  const [tipoNovaVaga, setTipoNovaVaga] = useState<'PRESENCIAL'|'ONLINE'>('PRESENCIAL');
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');

  useFocusEffect(useCallback(() => {
    carregarAgenda();
  }, []));

  async function carregarAgenda() {
    setLoading(true);
    try {
      const response = await api.get('/agendamentos/geral/todos');
      setAgendamentos(response.data);
    } catch (error) { 
      console.log('Erro ao carregar agenda:', error); 
    } finally {
      setLoading(false);
    }
  }

  // --- FUNÇÕES DO MEET ---
  async function salvarLink() {
    if(!linkMeet || !selectedId) return;
    try {
      await api.patch(`/agendamentos/${selectedId}/link`, { link: linkMeet });
      Alert.alert("Sucesso", "Link enviado para o paciente!");
      setModalLinkVisible(false);
      setLinkMeet('');
      carregarAgenda(); // Atualiza a lista
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar o link.");
    }
  }

  // --- FUNÇÕES DE CRIAR VAGA ---
  const onChangePicker = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDataNovaVaga(selectedDate);
  };

  async function handleCriarVaga() {
    try {
      await api.post('/agendamentos/disponivel', {
        dataHora: dataNovaVaga.toISOString(),
        tipoConsulta: tipoNovaVaga
      });
      Alert.alert("Vaga Criada!", "Os pacientes já podem ver este horário.");
      setModalVagaVisible(false);
      carregarAgenda();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível criar a vaga.");
    }
  }

  // --- RENDERIZAR CARD DA AGENDA ---
  const renderItem = ({ item }: any) => {
    const dataFormatada = new Date(item.dataHoraConsulta).toLocaleDateString('pt-BR');
    const horaFormatada = new Date(item.dataHoraConsulta).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
    
    // Se não tem usuário, é um horário livre!
    const isLivre = item.status === 'DISPONIVEL';

    return (
      <View style={[styles.card, isLivre && styles.cardLivre]}>
        <View style={styles.cardHeader}>
          {isLivre ? (
            <Text style={styles.textoLivre}>🟢 HORÁRIO LIVRE</Text>
          ) : (
            <Text style={styles.paciente}>👤 {item.usuario?.nomeCompleto || 'Paciente'}</Text>
          )}

          <View style={[styles.badge, { backgroundColor: item.tipoConsulta === 'ONLINE' ? '#59A5D8' : '#A555B9' }]}>
            <Text style={styles.badgeText}>{item.tipoConsulta}</Text>
          </View>
        </View>
        
        <Text style={styles.data}>📅 {dataFormatada} às ⏰ {horaFormatada}</Text>

        {/* Botão de Meet só aparece se tiver paciente e for online */}
        {!isLivre && item.tipoConsulta === 'ONLINE' && (
            <TouchableOpacity 
                style={styles.btnLink} 
                onPress={() => { setSelectedId(item.id); setLinkMeet(item.linkMeet || ''); setModalLinkVisible(true); }}
            >
                <Ionicons name="videocam" size={20} color="#FFF" />
                <Text style={{color:'#FFF', fontWeight:'bold'}}>{item.linkMeet ? 'Editar Link Meet' : 'Adicionar Link Meet'}</Text>
            </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#F0E6F5']} style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Minha Agenda 📅</Text>
        <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVagaVisible(true)}>
            <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
         <ActivityIndicator size="large" color="#2F9F85" style={{marginTop: 50}} />
      ) : (
        <FlatList 
          data={agendamentos} 
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Text style={{textAlign: 'center', color: '#999', marginTop: 50}}>Nenhum horário na agenda.</Text>}
        />
      )}

      {/* --- MODAL: COLAR LINK DO MEET --- */}
      <Modal visible={modalLinkVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Link da Videochamada</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Cole o link do Google Meet aqui" 
                    value={linkMeet} 
                    onChangeText={setLinkMeet}
                />
                <TouchableOpacity onPress={salvarLink} style={styles.btnSalvar}>
                    <Text style={{color:'#FFF', fontWeight:'bold'}}>SALVAR LINK</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalLinkVisible(false)} style={{marginTop:15, padding: 10}}>
                    <Text style={{color:'#666', fontWeight: 'bold'}}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* --- MODAL: CRIAR NOVA VAGA --- */}
      <Modal visible={modalVagaVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Liberar Novo Horário</Text>
                
                <Text style={styles.label}>Data e Hora:</Text>
                <View style={{flexDirection: 'row', gap: 10, marginBottom: 20}}>
                  <TouchableOpacity style={styles.pickerBtn} onPress={() => {setMode('date'); setShowPicker(true);}}>
                    <Ionicons name="calendar" size={20} color="#A555B9" />
                    <Text>{dataNovaVaga.toLocaleDateString('pt-BR')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.pickerBtn} onPress={() => {setMode('time'); setShowPicker(true);}}>
                    <Ionicons name="time" size={20} color="#A555B9" />
                    <Text>{dataNovaVaga.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</Text>
                  </TouchableOpacity>
                </View>

                {showPicker && (
                  <DateTimePicker value={dataNovaVaga} mode={mode} is24Hour display="default" onChange={onChangePicker} minimumDate={new Date()} />
                )}

                <Text style={styles.label}>Tipo de Atendimento:</Text>
                <View style={{flexDirection: 'row', gap: 10, marginBottom: 30, width: '100%'}}>
                  <TouchableOpacity 
                    style={[styles.typeBtn, tipoNovaVaga === 'PRESENCIAL' && styles.typeBtnAtivo]} 
                    onPress={() => setTipoNovaVaga('PRESENCIAL')}
                  >
                    <Text style={[styles.typeTxt, tipoNovaVaga === 'PRESENCIAL' && {color: '#FFF'}]}>Consultório</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.typeBtn, tipoNovaVaga === 'ONLINE' && styles.typeBtnAtivo]} 
                    onPress={() => setTipoNovaVaga('ONLINE')}
                  >
                    <Text style={[styles.typeTxt, tipoNovaVaga === 'ONLINE' && {color: '#FFF'}]}>Online (Meet)</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleCriarVaga} style={styles.btnSalvar}>
                    <Text style={{color:'#FFF', fontWeight:'bold'}}>CRIAR VAGA</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVagaVisible(false)} style={{marginTop:15, padding: 10}}>
                    <Text style={{color:'#666', fontWeight: 'bold'}}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#A555B9' },
  btnAdd: { backgroundColor: '#2F9F85', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 3, borderLeftWidth: 5, borderLeftColor: '#A555B9' },
  cardLivre: { borderLeftColor: '#04D361', backgroundColor: '#F0FFF4' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  paciente: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  textoLivre: { fontWeight: 'bold', fontSize: 14, color: '#04D361' },
  data: { color: '#666', marginBottom: 10, fontWeight: '500' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  
  btnLink: { backgroundColor: '#2F9F85', flexDirection: 'row', padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 5 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalView: { width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  input: { width: '100%', borderWidth: 1, borderColor: '#DDD', padding: 15, borderRadius: 10, marginBottom: 15, backgroundColor: '#F9F9F9' },
  btnSalvar: { backgroundColor: '#A555B9', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center' },
  
  label: { alignSelf: 'flex-start', fontWeight: 'bold', color: '#666', marginBottom: 8 },
  pickerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F5F5F5', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  typeBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 2, borderColor: '#EEE', alignItems: 'center' },
  typeBtnAtivo: { backgroundColor: '#2F9F85', borderColor: '#2F9F85' },
  typeTxt: { fontWeight: 'bold', color: '#999' }
});