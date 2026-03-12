import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api'; 

export function Agendamento({ route, navigation }: any) {
  const { usuarioId } = route.params;

  const [tipoConsulta, setTipoConsulta] = useState<'PRESENCIAL' | 'ONLINE'>('PRESENCIAL');
  const [pagamento, setPagamento] = useState('PIX');
  
  // ESTADOS PARA AS VAGAS REAIS DO BANCO DE DADOS
  const [vagas, setVagas] = useState<any[]>([]);
  const [vagaSelecionada, setVagaSelecionada] = useState<any>(null);
  const [loadingVagas, setLoadingVagas] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Sempre que mudar o "Tipo", busca as vagas daquele tipo
  useEffect(() => {
    buscarVagasLivres();
  }, [tipoConsulta]);

  async function buscarVagasLivres() {
    setLoadingVagas(true);
    setVagaSelecionada(null); // Reseta a vaga se o usuário mudar de Online pra Presencial
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
      return Alert.alert("Atenção", "Por favor, selecione um horário disponível.");
    }

    setLoadingSubmit(true);
    try {
      // Manda a hora exata da vaga que a nutri criou
      await api.post('/agendamentos', {
        usuarioId: usuarioId,
        dataHora: vagaSelecionada.dataHoraConsulta,
        formaPagamento: pagamento,
        tipoConsulta: tipoConsulta 
      });

      Alert.alert('Sucesso! 🎉', 'Agendamento reservado com sucesso.');
      navigation.goBack(); 
    } catch (error: any) {
      const msgErro = error.response?.data?.erro || 'Erro ao realizar agendamento.';
      Alert.alert('Ops!', msgErro);
      buscarVagasLivres(); // Se alguém pegou a vaga antes, atualiza a lista!
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#F0E6F5', '#D8BFD8']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#A555B9" />
          </TouchableOpacity>
          <Text style={styles.title}>Nova Consulta</Text>
        </View>

        {/* --- 1. TIPO DE ATENDIMENTO --- */}
        <Text style={styles.sectionLabel}>1. TIPO DE ATENDIMENTO</Text>
        <View style={styles.typeContainer}>
           <TouchableOpacity 
             style={[styles.typeBtn, tipoConsulta === 'PRESENCIAL' && styles.typeBtnSelected]}
             onPress={() => setTipoConsulta('PRESENCIAL')}
           >
             <Ionicons name="business" size={24} color={tipoConsulta === 'PRESENCIAL' ? '#FFF' : '#A555B9'} />
             <Text style={[styles.typeText, tipoConsulta === 'PRESENCIAL' && styles.typeTextSelected]}>NO CONSULTÓRIO</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             style={[styles.typeBtn, tipoConsulta === 'ONLINE' && styles.typeBtnSelected]}
             onPress={() => setTipoConsulta('ONLINE')}
           >
             <Ionicons name="videocam" size={24} color={tipoConsulta === 'ONLINE' ? '#FFF' : '#A555B9'} />
             <Text style={[styles.typeText, tipoConsulta === 'ONLINE' && styles.typeTextSelected]}>ONLINE (MEET)</Text>
           </TouchableOpacity>
        </View>

        {/* INFO DO LOCAL */}
        <View style={styles.infoBox}>
            {tipoConsulta === 'PRESENCIAL' ? (
                <>
                    <Ionicons name="location-sharp" size={18} color="#A555B9" />
                    <Text style={styles.infoText}>Av. Boa Viagem, 1234, Sala 101 - Recife/PE</Text>
                </>
            ) : (
                <>
                    <Ionicons name="logo-google" size={18} color="#A555B9" />
                    <Text style={styles.infoText}>O link do Google Meet será enviado antes da consulta.</Text>
                </>
            )}
        </View>

        {/* --- 2. HORÁRIOS DISPONÍVEIS --- */}
        <Text style={[styles.sectionLabel, { marginTop: 25 }]}>2. HORÁRIOS DISPONÍVEIS</Text>
        
        {loadingVagas ? (
          <ActivityIndicator size="large" color="#A555B9" style={{ marginVertical: 20 }} />
        ) : vagas.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-clear-outline" size={40} color="#CCC" />
            <Text style={styles.emptyText}>Nenhuma vaga liberada para consultas {tipoConsulta.toLowerCase()} no momento.</Text>
          </View>
        ) : (
          <View style={styles.vagasGrid}>
            {vagas.map((vaga) => {
               // Formata a data e hora vinda do banco
               const data = new Date(vaga.dataHoraConsulta).toLocaleDateString('pt-BR');
               const hora = new Date(vaga.dataHoraConsulta).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
               const isSelected = vagaSelecionada?.id === vaga.id;

               return (
                 <TouchableOpacity 
                   key={vaga.id}
                   style={[styles.vagaCard, isSelected && styles.vagaCardSelected]}
                   onPress={() => setVagaSelecionada(vaga)}
                 >
                   <Ionicons name={isSelected ? "checkmark-circle" : "time-outline"} size={20} color={isSelected ? "#FFF" : "#A555B9"} />
                   <View>
                     <Text style={[styles.vagaData, isSelected && {color:'#FFF'}]}>{data}</Text>
                     <Text style={[styles.vagaHora, isSelected && {color:'#FFF'}]}>{hora}</Text>
                   </View>
                 </TouchableOpacity>
               );
            })}
          </View>
        )}

        {/* --- 3. PAGAMENTO --- */}
        <Text style={[styles.sectionLabel, { marginTop: 25 }]}>3. PAGAMENTO VIA:</Text>
        <View style={styles.paymentContainer}>
          <TouchableOpacity 
            style={[styles.payOption, pagamento === 'PIX' && styles.payOptionSelected]}
            onPress={() => setPagamento('PIX')}
          >
            <Ionicons name="qr-code-outline" size={24} color={pagamento === 'PIX' ? '#FFF' : '#A555B9'} />
            <Text style={[styles.payText, pagamento === 'PIX' && styles.payTextSelected]}>PIX</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.payOption, pagamento === 'CARTAO' && styles.payOptionSelected]}
            onPress={() => setPagamento('CARTAO')}
          >
            <Ionicons name="card-outline" size={24} color={pagamento === 'CARTAO' ? '#FFF' : '#A555B9'} />
            <Text style={[styles.payText, pagamento === 'CARTAO' && styles.payTextSelected]}>CARTÃO</Text>
          </TouchableOpacity>
        </View>

        {/* VALOR DA CONSULTA */}
        <View style={styles.valorCard}>
          <Text style={styles.valorLabel}>Valor da Consulta:</Text>
          <Text style={styles.valorTotal}>R$ 150,00</Text>
        </View>

        {/* BOTÃO CONFIRMAR */}
        <TouchableOpacity 
          style={[styles.confirmButtonContainer, (!vagaSelecionada || loadingSubmit) && { opacity: 0.6 }]} 
          onPress={handleAgendar} 
          disabled={!vagaSelecionada || loadingSubmit}
        >
          <LinearGradient 
            colors={['#A555B9', '#2F9F85']} 
            start={{x:0, y:0}} end={{x:1, y:1}} 
            style={styles.gradientButton}
          >
            {loadingSubmit ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmText}>RESERVAR HORÁRIO</Text>}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 50, paddingBottom: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 10, marginRight: 15, elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: '#666', marginBottom: 10, letterSpacing: 1 },
  
  typeContainer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  typeBtn: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#DDD', elevation: 2 },
  typeBtnSelected: { backgroundColor: '#A555B9', borderColor: '#A555B9' },
  typeText: { fontSize: 10, fontWeight: 'bold', color: '#999', marginTop: 5 },
  typeTextSelected: { color: '#FFF' },

  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5, padding: 15, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 12, borderWidth: 1, borderColor: '#FFF' },
  infoText: { fontSize: 12, color: '#555', fontStyle: 'italic', flex: 1 },

  // Estilos da Lista de Vagas
  emptyBox: { backgroundColor: '#FFF', padding: 30, borderRadius: 15, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 10 },
  vagasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  vagaCard: { width: '48%', backgroundColor: '#FFF', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderColor: '#F0E6F5', elevation: 1 },
  vagaCardSelected: { backgroundColor: '#A555B9', borderColor: '#A555B9' },
  vagaData: { fontSize: 12, color: '#666', fontWeight: 'bold' },
  vagaHora: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  
  paymentContainer: { flexDirection: 'row', gap: 15 },
  payOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 15, backgroundColor: '#FFF', borderRadius: 15, borderWidth: 2, borderColor: '#F0E6F5' },
  payOptionSelected: { backgroundColor: '#A555B9', borderColor: '#A555B9' },
  payText: { fontWeight: 'bold', color: '#236b80' },
  payTextSelected: { color: '#FFF' },

  valorCard: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#FFF' },
  valorLabel: { fontSize: 16, color: '#333' },
  valorTotal: { fontSize: 22, fontWeight: 'bold', color: '#2F9F85' },

  confirmButtonContainer: { marginTop: 40, elevation: 5 },
  gradientButton: { height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});