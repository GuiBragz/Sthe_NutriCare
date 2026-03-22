import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api'; 

export function Agendamento({ route, navigation }: any) {
  const { usuarioId } = route.params;

  const [tipoConsulta, setTipoConsulta] = useState<'PRESENCIAL' | 'ONLINE'>('PRESENCIAL');
  const [pagamento, setPagamento] = useState('PIX');
  
  const [vagas, setVagas] = useState<any[]>([]);
  const [vagaSelecionada, setVagaSelecionada] = useState<any>(null);
  const [loadingVagas, setLoadingVagas] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    buscarVagasLivres();
  }, [tipoConsulta]);

  async function buscarVagasLivres() {
    setLoadingVagas(true);
    setVagaSelecionada(null); 
    try {
      const response = await api.get(`/agendamentos/vagas?tipo=${tipoConsulta}`);
      setVagas(response.data);
    } catch (error) {
      console.log('Erro ao buscar vagas:', error);
    } finally {
      setLoadingVagas(false);
    }
  }

  async function handleAgendar() {
    if (!vagaSelecionada) {
      return Alert.alert("Atencao", "Por favor, selecione um horario disponivel.");
    }

    setLoadingSubmit(true);
    try {
      await api.post('/agendamentos', {
        usuarioId: usuarioId,
        dataHora: vagaSelecionada.dataHoraConsulta,
        formaPagamento: pagamento,
        tipoConsulta: tipoConsulta 
      });

      Alert.alert('Sucesso!', 'Agendamento reservado com sucesso.');
      navigation.goBack(); 
    } catch (error: any) {
      const msgErro = error.response?.data?.erro || 'Erro ao realizar agendamento.';
      Alert.alert('Ops!', msgErro);
      buscarVagasLivres(); 
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.title}>Nova Consulta</Text>
        </View>

        <Text style={styles.sectionLabel}>1. TIPO DE ATENDIMENTO</Text>
        <View style={styles.typeContainer}>
           <TouchableOpacity 
             style={[styles.typeBtn, tipoConsulta === 'PRESENCIAL' && styles.typeBtnSelected]}
             onPress={() => setTipoConsulta('PRESENCIAL')}
           >
             <Ionicons name="business" size={24} color={tipoConsulta === 'PRESENCIAL' ? '#FFFFFF' : '#2E7D32'} />
             <Text style={[styles.typeText, tipoConsulta === 'PRESENCIAL' && styles.typeTextSelected]}>NO CONSULTORIO</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             style={[styles.typeBtn, tipoConsulta === 'ONLINE' && styles.typeBtnSelected]}
             onPress={() => setTipoConsulta('ONLINE')}
           >
             <Ionicons name="videocam" size={24} color={tipoConsulta === 'ONLINE' ? '#FFFFFF' : '#2E7D32'} />
             <Text style={[styles.typeText, tipoConsulta === 'ONLINE' && styles.typeTextSelected]}>ONLINE</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
            {tipoConsulta === 'PRESENCIAL' ? (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Ionicons name="location-sharp" size={18} color="#FFD700" style={{marginRight: 8}} />
                    <Text style={styles.infoText}>Av. Boa Viagem, 1234, Sala 101 - Recife/PE</Text>
                </View>
            ) : (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Ionicons name="logo-google" size={18} color="#FFD700" style={{marginRight: 8}} />
                    <Text style={styles.infoText}>O link do Google Meet sera enviado antes da consulta.</Text>
                </View>
            )}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 25 }]}>2. HORARIOS DISPONIVEIS</Text>
        
        {loadingVagas ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginVertical: 20 }} />
        ) : vagas.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-clear-outline" size={40} color="#CCC" />
            <Text style={styles.emptyText}>Nenhuma vaga liberada para consultas {tipoConsulta.toLowerCase()} no momento.</Text>
          </View>
        ) : (
          <View style={styles.vagasGrid}>
            {vagas.map((vaga) => {
               const data = new Date(vaga.dataHoraConsulta).toLocaleDateString('pt-BR');
               const hora = new Date(vaga.dataHoraConsulta).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
               const isSelected = vagaSelecionada?.id === vaga.id;

               return (
                 <TouchableOpacity 
                   key={vaga.id}
                   style={[styles.vagaCard, isSelected && styles.vagaCardSelected]}
                   onPress={() => setVagaSelecionada(vaga)}
                 >
                   <Ionicons name={isSelected ? "checkmark-circle" : "time-outline"} size={20} color={isSelected ? "#FFFFFF" : "#2E7D32"} />
                   <View>
                     <Text style={[styles.vagaData, isSelected && {color:'#FFFFFF'}]}>{data}</Text>
                     <Text style={[styles.vagaHora, isSelected && {color:'#FFFFFF'}]}>{hora}</Text>
                   </View>
                 </TouchableOpacity>
               );
            })}
          </View>
        )}

        <Text style={[styles.sectionLabel, { marginTop: 25 }]}>3. PAGAMENTO VIA:</Text>
        <View style={styles.paymentContainer}>
          <TouchableOpacity 
            style={[styles.payOption, pagamento === 'PIX' && styles.payOptionSelected]}
            onPress={() => setPagamento('PIX')}
          >
            <Ionicons name="qr-code-outline" size={24} color={pagamento === 'PIX' ? '#FFFFFF' : '#2E7D32'} />
            <Text style={[styles.payText, pagamento === 'PIX' && styles.payTextSelected]}>PIX</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.payOption, pagamento === 'CARTAO' && styles.payOptionSelected]}
            onPress={() => setPagamento('CARTAO')}
          >
            <Ionicons name="card-outline" size={24} color={pagamento === 'CARTAO' ? '#FFFFFF' : '#2E7D32'} />
            <Text style={[styles.payText, pagamento === 'CARTAO' && styles.payTextSelected]}>CARTAO</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.valorCard}>
          <Text style={styles.valorLabel}>Valor da Consulta:</Text>
          <Text style={styles.valorTotal}>R$ 150,00</Text>
        </View>

        <TouchableOpacity 
          style={[styles.confirmButtonContainer, (!vagaSelecionada || loadingSubmit) && { opacity: 0.6 }]} 
          onPress={handleAgendar} 
          disabled={!vagaSelecionada || loadingSubmit}
        >
          <View style={styles.mainButton}>
            {loadingSubmit ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmText}>RESERVAR HORARIO</Text>}
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDE7' },
  content: { padding: 24, paddingTop: 50, paddingBottom: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 8, backgroundColor: '#FFFFFF', borderRadius: 10, marginRight: 15, elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32' },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: '#666', marginBottom: 10, letterSpacing: 1 },
  
  typeContainer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  typeBtn: { flex: 1, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FFD700', elevation: 2 },
  typeBtnSelected: { backgroundColor: '#2E7D32', borderColor: '#FFD700' },
  typeText: { fontSize: 10, fontWeight: 'bold', color: '#333', marginTop: 5 },
  typeTextSelected: { color: '#FFFFFF' },

  infoBox: { marginTop: 5, padding: 15, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#FFD700' },
  infoText: { fontSize: 12, color: '#555', fontStyle: 'italic', flex: 1 },

  emptyBox: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 15, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 10 },
  vagasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  vagaCard: { width: '48%', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#FFD700', elevation: 1 },
  vagaCardSelected: { backgroundColor: '#2E7D32', borderColor: '#FFD700' },
  vagaData: { fontSize: 12, color: '#666', fontWeight: 'bold' },
  vagaHora: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  
  paymentContainer: { flexDirection: 'row', gap: 15 },
  payOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 15, backgroundColor: '#FFFFFF', borderRadius: 15, borderWidth: 1, borderColor: '#FFD700' },
  payOptionSelected: { backgroundColor: '#2E7D32', borderColor: '#FFD700' },
  payText: { fontWeight: 'bold', color: '#333' },
  payTextSelected: { color: '#FFFFFF' },

  valorCard: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#FFD700' },
  valorLabel: { fontSize: 16, color: '#333' },
  valorTotal: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },

  confirmButtonContainer: { marginTop: 40, elevation: 5 },
  mainButton: { backgroundColor: '#2E7D32', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFD700' },
  confirmText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});