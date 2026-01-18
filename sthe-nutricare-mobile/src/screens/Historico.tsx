import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

// ⚠️ CONFIRA SEU IP
const API_URL = 'http://192.168.1.3:3000';

export function Historico({ route, navigation }: any) {
  const { usuarioId } = route.params;
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca a lista completa
  useFocusEffect(
    useCallback(() => {
      async function carregarHistorico() {
        try {
          const response = await axios.get(`${API_URL}/agendamentos/${usuarioId}/historico`);
          setLista(response.data);
        } catch (error) {
          console.log('Erro ao buscar histórico');
        } finally {
          setLoading(false);
        }
      }
      carregarHistorico();
    }, [usuarioId])
  );

  // Função que desenha CADA item da lista
  const renderItem = ({ item }: any) => {
    const data = new Date(item.dataHoraConsulta);
    const dataFormatada = data.toLocaleDateString('pt-BR');
    const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Define cor baseada no status
    let corStatus = '#FBA94C'; // Laranja (Aguardando)
    if (item.status === 'CANCELADO') corStatus = '#E83F5B'; // Vermelho
    if (item.status === 'CONCLUIDO') corStatus = '#04D361'; // Verde (Futuro: implementaremos isso)

    return (
      <View style={[styles.card, { borderLeftColor: corStatus }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.data}>{dataFormatada} às {horaFormatada}</Text>
          <Text style={[styles.status, { color: corStatus }]}>{item.status}</Text>
        </View>
        <Text style={styles.pagamento}>Pagamento via: {item.formaPagamento}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico 📂</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltar}>Voltar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#04D361" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum registro encontrado.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  voltar: { color: '#E1E1E6', fontSize: 16 },
  
  // Estilo do Card da Lista
  card: {
    backgroundColor: '#202024',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    // A cor da borda vem dinâmica no código acima
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  data: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  status: { fontSize: 12, fontWeight: 'bold' },
  pagamento: { color: '#C4C4CC', fontSize: 14 },
  empty: { color: '#777', textAlign: 'center', marginTop: 50 }
});