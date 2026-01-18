import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

// ⚠️ ATENÇÃO: Confirme se o IP é o mesmo do App.tsx
// Se mudou o IP do computador hoje, atualize aqui também!
const API_URL = 'http://192.168.1.3:3000/agendamentos';

export function Agendamento({ route, navigation }: any) {
  const { usuarioId } = route.params;

  const [dataConsulta, setDataConsulta] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date'); 
  const [pagamento, setPagamento] = useState('PIX');
  const [loading, setLoading] = useState(false);

  // Lógica para salvar a data/hora escolhida
  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false); // Fecha o relógio/calendário
    
    if (selectedDate) {
      // Se estamos no Android, o comportamento padrão é substituir.
      // Vamos garantir que a data atualize corretamente.
      setDataConsulta(selectedDate);
    }
  };

  // Função para abrir o Calendário
  const showDatepicker = () => {
    setMode('date');
    setShowPicker(true);
  };

  // Função para abrir o Relógio
  const showTimepicker = () => {
    setMode('time');
    setShowPicker(true);
  };

  async function handleAgendar() {
    setLoading(true);
    try {
      console.log("Enviando:", dataConsulta.toISOString());
      
      await axios.post(API_URL, {
        usuarioId: usuarioId,
        dataHora: dataConsulta.toISOString(),
        formaPagamento: pagamento
      });

      Alert.alert('Sucesso! 🎉', 'Agendamento realizado.');
      navigation.goBack(); 

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível agendar. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  }

  // Formatação para exibir na tela (Pt-BR)
  const diaFormatado = dataConsulta.toLocaleDateString('pt-BR');
  const horaFormatada = dataConsulta.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Consulta 📅</Text>

      <Text style={styles.label}>1. Escolha a Data e o Horário:</Text>
      
      {/* --- SEPARAÇÃO CLARA DOS BOTÕES --- */}
      <View style={styles.row}>
        
        {/* BOTÃO DATA */}
        <TouchableOpacity style={styles.selectorButton} onPress={showDatepicker}>
          <Text style={styles.selectorLabel}>DIA</Text>
          <Text style={styles.selectorValue}>{diaFormatado}</Text>
        </TouchableOpacity>

        {/* BOTÃO HORA */}
        <TouchableOpacity style={styles.selectorButton} onPress={showTimepicker}>
          <Text style={styles.selectorLabel}>HORA</Text>
          <Text style={styles.selectorValue}>{horaFormatada}</Text>
        </TouchableOpacity>

      </View>

      {/* Componente Invisível (Popup) */}
      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={dataConsulta}
          mode={mode} // <--- Aqui ele alterna entre 'date' e 'time'
          is24Hour={true}
          display="default"
          onChange={onChange}
          minimumDate={new Date()}
        />
      )}

      <Text style={[styles.label, { marginTop: 30 }]}>2. Forma de Pagamento:</Text>
      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.payButton, pagamento === 'PIX' && styles.payButtonSelected]}
          onPress={() => setPagamento('PIX')}
        >
          <Text style={styles.payText}>PIX</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.payButton, pagamento === 'CARTAO' && styles.payButtonSelected]}
          onPress={() => setPagamento('CARTAO')}
        >
          <Text style={styles.payText}>CARTÃO</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleAgendar} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmText}>CONFIRMAR AGENDAMENTO</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 30, textAlign: 'center' },
  label: { color: '#E1E1E6', fontSize: 16, marginBottom: 10 },
  
  // Estilo novo para ficar um do lado do outro
  row: { flexDirection: 'row', gap: 15, marginBottom: 10 },
  
  selectorButton: { 
    flex: 1, 
    backgroundColor: '#202024', 
    padding: 15, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#323238',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectorLabel: { color: '#04D361', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  selectorValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  payButton: { flex: 1, padding: 16, backgroundColor: '#202024', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#323238' },
  payButtonSelected: { borderColor: '#04D361', backgroundColor: '#00291D' },
  payText: { color: '#FFF', fontWeight: 'bold' },
  confirmButton: { marginTop: 'auto', backgroundColor: '#04D361', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  confirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});