import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api'; 

export function Agendamento({ route, navigation }: any) {
  const { usuarioId } = route.params;

  const [dataConsulta, setDataConsulta] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date'); 
  const [pagamento, setPagamento] = useState('PIX');
  
  // 👇 NOVO ESTADO PARA O TIPO DE CONSULTA
  const [tipoConsulta, setTipoConsulta] = useState<'PRESENCIAL' | 'ONLINE'>('PRESENCIAL');
  const [loading, setLoading] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDataConsulta(selectedDate);
  };

  const showMode = (currentMode: 'date' | 'time') => {
    setMode(currentMode);
    setShowPicker(true);
  };

  async function handleAgendar() {
    // Validação básica de horário (opcional)
    const hora = dataConsulta.getHours();
    if (hora < 8 || hora > 18) {
       return Alert.alert("Atenção", "Nosso horário de atendimento é das 08h às 18h.");
    }

    setLoading(true);
    try {
      await api.post('/agendamentos', {
        usuarioId: usuarioId,
        dataHora: dataConsulta.toISOString(),
        formaPagamento: pagamento,
        tipoConsulta: tipoConsulta // 👇 Enviando a escolha do usuário
      });

      Alert.alert('Sucesso! 🎉', 'Agendamento realizado com sucesso.');
      navigation.goBack(); 
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível agendar. Tente outro horário.');
    } finally {
      setLoading(false);
    }
  }

  const diaFormatado = dataConsulta.toLocaleDateString('pt-BR');
  const horaFormatada = dataConsulta.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <LinearGradient colors={['#FFFFFF', '#F0E6F5', '#D8BFD8']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#A555B9" />
          </TouchableOpacity>
          <Text style={styles.title}>Nova Consulta</Text>
        </View>

        {/* --- SELEÇÃO DE TIPO (NOVO) --- */}
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

        <Text style={styles.sectionLabel}>2. QUANDO SERÁ?</Text>
        
        {/* SELETORES DE DATA E HORA */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.selectorCard} onPress={() => showMode('date')}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar-outline" size={24} color="#A555B9" />
            </View>
            <Text style={styles.selectorLabel}>DATA</Text>
            <Text style={styles.selectorValue}>{diaFormatado}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.selectorCard} onPress={() => showMode('time')}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={24} color="#2F9F85" />
            </View>
            <Text style={styles.selectorLabel}>HORÁRIO</Text>
            <Text style={styles.selectorValue}>{horaFormatada}</Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={dataConsulta}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={onChange}
            minimumDate={new Date()}
          />
        )}

        {/* INFO DO LOCAL (NOVO) */}
        {tipoConsulta === 'PRESENCIAL' ? (
             <View style={styles.infoBox}>
                <Ionicons name="location-sharp" size={16} color="#666" />
                <Text style={styles.infoText}>Av. Boa Viagem, 1234, Sala 101 - Recife/PE</Text>
             </View>
        ) : (
             <View style={styles.infoBox}>
                <Ionicons name="logo-google" size={16} color="#666" />
                <Text style={styles.infoText}>O link do Google Meet será enviado após confirmação.</Text>
             </View>
        )}

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>3. PAGAMENTO VIA:</Text>
        
        {/* OPÇÕES DE PAGAMENTO */}
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

        {/* INFO DE VALOR */}
        <View style={styles.valorCard}>
          <Text style={styles.valorLabel}>Valor da Consulta:</Text>
          <Text style={styles.valorTotal}>R$ 150,00</Text>
        </View>

        {/* BOTÃO CONFIRMAR */}
        <TouchableOpacity style={styles.confirmButtonContainer} onPress={handleAgendar} disabled={loading}>
          <LinearGradient 
            colors={['#A555B9', '#2F9F85']} 
            start={{x:0, y:0}} end={{x:1, y:1}} 
            style={styles.gradientButton}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmText}>CONFIRMAR AGENDAMENTO</Text>}
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

  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10, marginTop: 15, letterSpacing: 1 },

  // --- ESTILOS DO TIPO DE CONSULTA ---
  typeContainer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  typeBtn: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#DDD', elevation: 2 },
  typeBtnSelected: { backgroundColor: '#A555B9', borderColor: '#A555B9' },
  typeText: { fontSize: 10, fontWeight: 'bold', color: '#999', marginTop: 5 },
  typeTextSelected: { color: '#FFF' },
  
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 10 },
  infoText: { fontSize: 12, color: '#666', fontStyle: 'italic' },

  row: { flexDirection: 'row', gap: 15 },
  
  selectorCard: { 
    flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 20, 
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.1, shadowRadius: 4
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  selectorLabel: { fontSize: 12, color: '#999', fontWeight: 'bold', marginBottom: 5 },
  selectorValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  paymentContainer: { flexDirection: 'row', gap: 15 },
  payOption: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: 15, backgroundColor: '#FFF', borderRadius: 15, borderWidth: 2, borderColor: '#F0E6F5'
  },
  payOptionSelected: { backgroundColor: '#A555B9', borderColor: '#A555B9' },
  payText: { fontWeight: 'bold', color: '#236b80' },
  payTextSelected: { color: '#FFF' },

  valorCard: { 
    marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#FFF'
  },
  valorLabel: { fontSize: 16, color: '#333' },
  valorTotal: { fontSize: 22, fontWeight: 'bold', color: '#2F9F85' },

  confirmButtonContainer: { marginTop: 40, elevation: 5 },
  gradientButton: { height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});