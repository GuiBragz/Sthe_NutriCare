import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

// ⚠️ ATENÇÃO: Confirme se o IP é o mesmo do App.tsx
const API_URL = 'http://192.168.1.3:3000/agendamentos';

export function Agendamento({ route, navigation }: any) {
  // Recebe o ID do usuário que veio da Home
  const { usuarioId } = route.params;

  const [dataConsulta, setDataConsulta] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pagamento, setPagamento] = useState('PIX'); // Padrão
  const [loading, setLoading] = useState(false);

  // Função para mudar a data selecionada
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDataConsulta(selectedDate);
    }
  };

  async function handleAgendar() {
    setLoading(true);
    try {
      // Envia para o Backend
      await axios.post(API_URL, {
        usuarioId: usuarioId,
        dataHora: dataConsulta.toISOString(), // Manda no formato universal
        formaPagamento: pagamento
      });

      Alert.alert('Sucesso! 🎉', 'Agendamento pré-reservado. Realize o pagamento para confirmar.');
      navigation.goBack(); // Volta pra Home

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível agendar. Tente outro horário.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Consulta 📅</Text>

      <Text style={styles.label}>Escolha a Data e Hora:</Text>
      
      {/* Botão que abre o calendário */}
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>
          {dataConsulta.toLocaleString('pt-BR')}
        </Text>
      </TouchableOpacity>

      {/* O componente do calendário (só aparece quando clica, no Android) */}
      {showPicker && (
        <DateTimePicker
          value={dataConsulta}
          mode="date" // ou "time" para hora. No iOS aparece os dois juntos as vezes.
          display="default"
          onChange={onChangeDate}
          minimumDate={new Date()} // Não deixa agendar no passado
        />
      )}

      <Text style={[styles.label, { marginTop: 20 }]}>Forma de Pagamento:</Text>
      <View style={styles.paymentContainer}>
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
  label: { color: '#E1E1E6', fontSize: 16, marginBottom: 8 },
  dateButton: { backgroundColor: '#202024', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#323238' },
  dateText: { color: '#FFF', fontSize: 16, textAlign: 'center' },
  paymentContainer: { flexDirection: 'row', gap: 10 },
  payButton: { flex: 1, padding: 16, backgroundColor: '#202024', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#323238' },
  payButtonSelected: { borderColor: '#04D361', backgroundColor: '#00291D' },
  payText: { color: '#FFF', fontWeight: 'bold' },
  confirmButton: { marginTop: 40, backgroundColor: '#04D361', padding: 16, borderRadius: 8, alignItems: 'center' },
  confirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});