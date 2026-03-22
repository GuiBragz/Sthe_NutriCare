import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';

export function NutriDashboard() {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalLinkVisible, setModalLinkVisible] = useState(false);
  const [linkMeet, setLinkMeet] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
      Alert.alert("Erro", "Falha ao carregar agenda.");
    } finally {
      setLoading(false);
    }
  }

  async function salvarLink() {
    if(!linkMeet || !selectedId) return;
    try {
      await api.patch(`/agendamentos/${selectedId}/link`, { link: linkMeet });
      Alert.alert("Sucesso", "Link enviado para o paciente.");
      setModalLinkVisible(false);
      setLinkMeet('');
      carregarAgenda();
    } catch (e) {
      Alert.alert("Erro", "Nao foi possivel salvar o link.");
    }
  }

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
      Alert.alert("Vaga Criada", "Os pacientes ja podem ver este horario.");
      setModalVagaVisible(false);
      carregarAgenda();
    } catch (e) {
      Alert.alert("Erro", "Nao foi possivel criar a vaga.");
    }
  }

  async function alterarStatusConsulta(id: number, novoStatus: string) {
    Alert.alert(
      "Confirmacao",
      `Deseja marcar esta consulta como ${novoStatus}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          onPress: async () => {
            try {
              await api.patch(`/agendamentos/${id}/status`, { status: novoStatus });
              Alert.alert("Sucesso", "Status atualizado.");
              carregarAgenda();
            } catch (error) {
              Alert.alert("Erro", "Falha ao atualizar o status.");
            }
          }
        }
      ]
    );
  }

  const renderItem = ({ item }: any) => {
    const dataFormatada = new Date(item.dataHoraConsulta).toLocaleDateString('pt-BR');
    const horaFormatada = new Date(item.dataHoraConsulta).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
    const isLivre = item.status === 'DISPONIVEL';
    const isAgendado = item.status === 'AGENDADO';

    return (
      <View style={[styles.card, isLivre && styles.cardLivre]}>
        <View style={styles.cardHeader}>
          {isLivre ? (
            <Text style={styles.textoLivre}>HORARIO LIVRE</Text>
          ) : (
            <Text style={styles.paciente}>{item.usuario?.nomeCompleto || 'Paciente'}</Text>
          )}

          <View style={[styles.badge, { backgroundColor: item.tipoConsulta === 'ONLINE' ? '#B8860B' : '#2E7D32' }]}>
            <Text style={styles.badgeText}>{item.tipoConsulta}</Text>
          </View>
        </View>
        
        <Text style={styles.data}>{dataFormatada} as {horaFormatada}</Text>
        <Text style={styles.statusText}>Status: {item.status}</Text>

        {!isLivre && item.tipoConsulta === 'ONLINE' && isAgendado && (
            <TouchableOpacity 
                style={styles.btnLink} 
                onPress={() => { setSelectedId(item.id); setLinkMeet(item.linkMeet || ''); setModalLinkVisible(true); }}
            >
                <Ionicons name="videocam" size={20} color="#FFF" />
                <Text style={styles.btnTextBranco}>{item.linkMeet ? 'Editar Link Meet' : 'Adicionar Link Meet'}</Text>
            </TouchableOpacity>
        )}

        {isAgendado && (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={[styles.btnAction, styles.btnRealizado]} 
              onPress={() => alterarStatusConsulta(item.id, 'REALIZADO')}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.btnTextBranco}>Compareceu</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnAction, styles.btnFaltou]} 
              onPress={() => alterarStatusConsulta(item.id, 'FALTOU')}
            >
              <Ionicons name="close-circle" size={20} color="#FFF" />
              <Text style={styles.btnTextBranco}>Faltou</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minha Agenda</Text>
        <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVagaVisible(true)}>
            <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
         <ActivityIndicator size="large" color="#2E7D32" style={styles.loader} />
      ) : (
        <FlatList 
          data={agendamentos} 
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum horario na agenda.</Text>}
        />
      )}

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
                    <Text style={styles.btnTextBranco}>SALVAR LINK</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalLinkVisible(false)} style={styles.btnCancel}>
                    <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      <Modal visible={modalVagaVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Liberar Novo Horario</Text>
                
                <Text style={styles.label}>Data e Hora</Text>
                <View style={styles.rowPicker}>
                  <TouchableOpacity style={styles.pickerBtn} onPress={() => {setMode('date'); setShowPicker(true);}}>
                    <Ionicons name="calendar" size={20} color="#2E7D32" />
                    <Text>{dataNovaVaga.toLocaleDateString('pt-BR')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.pickerBtn} onPress={() => {setMode('time'); setShowPicker(true);}}>
                    <Ionicons name="time" size={20} color="#2E7D32" />
                    <Text>{dataNovaVaga.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</Text>
                  </TouchableOpacity>
                </View>

                {showPicker && (
                  <DateTimePicker value={dataNovaVaga} mode={mode} is24Hour display="default" onChange={onChangePicker} minimumDate={new Date()} />
                )}

                <Text style={styles.label}>Tipo de Atendimento</Text>
                <View style={styles.rowTypes}>
                  <TouchableOpacity 
                    style={[styles.typeBtn, tipoNovaVaga === 'PRESENCIAL' && styles.typeBtnAtivo]} 
                    onPress={() => setTipoNovaVaga('PRESENCIAL')}
                  >
                    <Text style={[styles.typeTxt, tipoNovaVaga === 'PRESENCIAL' && styles.typeTxtAtivo]}>Consultorio</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.typeBtn, tipoNovaVaga === 'ONLINE' && styles.typeBtnAtivo]} 
                    onPress={() => setTipoNovaVaga('ONLINE')}
                  >
                    <Text style={[styles.typeTxt, tipoNovaVaga === 'ONLINE' && styles.typeTxtAtivo]}>Online</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleCriarVaga} style={styles.btnSalvar}>
                    <Text style={styles.btnTextBranco}>CRIAR VAGA</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVagaVisible(false)} style={styles.btnCancel}>
                    <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDE7', padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32' },
  btnAdd: { backgroundColor: '#2E7D32', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 3, borderWidth: 1, borderColor: '#FFD700' },
  loader: { marginTop: 50 },
  listContent: { paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50 },
  
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 3, borderLeftWidth: 5, borderLeftColor: '#2E7D32', borderWidth: 1, borderColor: '#FFD700' },
  cardLivre: { borderLeftColor: '#04D361', backgroundColor: '#F0FFF4' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  paciente: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  textoLivre: { fontWeight: 'bold', fontSize: 14, color: '#04D361' },
  data: { color: '#666', marginBottom: 5, fontWeight: '500' },
  statusText: { color: '#666', marginBottom: 10, fontSize: 12, fontWeight: 'bold' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  
  btnLink: { backgroundColor: '#B8860B', flexDirection: 'row', padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 5 },
  btnTextBranco: { color: '#FFF', fontWeight: 'bold' },
  
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, gap: 10 },
  btnAction: { flex: 1, flexDirection: 'row', padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 5 },
  btnRealizado: { backgroundColor: '#2E7D32' },
  btnFaltou: { backgroundColor: '#D32F2F' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalView: { width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5, borderWidth: 1, borderColor: '#FFD700' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', marginBottom: 20 },
  input: { width: '100%', borderWidth: 1, borderColor: '#FFD700', padding: 15, borderRadius: 10, marginBottom: 15, backgroundColor: '#F9F9F9' },
  btnSalvar: { backgroundColor: '#2E7D32', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnCancel: { marginTop: 15, padding: 10 },
  btnCancelText: { color: '#666', fontWeight: 'bold' },
  
  label: { alignSelf: 'flex-start', fontWeight: 'bold', color: '#666', marginBottom: 8 },
  rowPicker: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  pickerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F5F5F5', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FFD700' },
  rowTypes: { flexDirection: 'row', gap: 10, marginBottom: 30, width: '100%' },
  typeBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 2, borderColor: '#FFD700', alignItems: 'center' },
  typeBtnAtivo: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  typeTxt: { fontWeight: 'bold', color: '#2E7D32' },
  typeTxtAtivo: { color: '#FFF' }
});