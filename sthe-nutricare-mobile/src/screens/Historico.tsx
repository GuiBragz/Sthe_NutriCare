import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // Adicionei o degradê
import { Ionicons } from '@expo/vector-icons'; // Ícone de voltar

// 👇 IMPORTA O NOSSO ARQUIVO CENTRALIZADO
import api from '../services/api'; 

export function Historico({ route, navigation }: any) {
  const { usuarioId } = route.params;
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca a lista completa
  useFocusEffect(
    useCallback(() => {
      async function carregarHistorico() {
        try {
          // 👇 USAMOS api.get NA ROTA CENTRALIZADA
          const response = await api.get(`/agendamentos/${usuarioId}/historico`);
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

    // Define cor baseada no status (Nas cores do novo tema)
    let corStatus = '#2F9F85'; // Verde (Agendado/Padrão)
    let iconeStatus: any = "calendar";

    if (item.status === 'CANCELADO') {
        corStatus = '#E83F5B'; // Vermelho
        iconeStatus = "close-circle";
    }
    if (item.status === 'CONCLUIDO') {
        corStatus = '#A555B9'; // Roxo da marca
        iconeStatus = "checkmark-circle";
    }

    return (
      <View style={[styles.card, { borderLeftColor: corStatus }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.data}>{dataFormatada}</Text>
            <Text style={styles.hora}>{horaFormatada}</Text>
          </View>
          
          <View style={[styles.badge, { backgroundColor: corStatus }]}>
             <Ionicons name={iconeStatus} size={12} color="#FFF" style={{marginRight: 4}} />
             <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
            <Ionicons name="wallet-outline" size={16} color="#666" style={{marginRight: 5}} />
            <Text style={styles.pagamento}>Pagamento via: <Text style={{fontWeight: 'bold'}}>{item.formaPagamento}</Text></Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#F0E6F5', '#D8BFD8']} style={styles.container}>
      <View style={styles.content}>
        
        {/* CABEÇALHO */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#A555B9" />
            </TouchableOpacity>
            <Text style={styles.title}>Histórico 📂</Text>
        </View>

        {loading ? (
            <ActivityIndicator color="#A555B9" style={{ marginTop: 50 }} />
        ) : (
            <FlatList
            data={lista}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="file-tray-outline" size={50} color="#CCC" />
                    <Text style={styles.empty}>Nenhum registro encontrado.</Text>
                </View>
            }
            />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, paddingTop: 50 },
  
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 10, marginRight: 15, elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
  // Estilo do Card Novo (Fundo Branco + Sombra)
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    elevation: 3, // Sombra Android
    shadowColor: '#000', // Sombra iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  data: { color: '#333', fontWeight: 'bold', fontSize: 18 },
  hora: { color: '#999', fontSize: 14 },
  
  badge: { 
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, 
      paddingVertical: 5, borderRadius: 20 
  },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#FFF' },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },

  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  pagamento: { color: '#666', fontSize: 14 },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  empty: { color: '#999', marginTop: 10, fontStyle: 'italic' }
});