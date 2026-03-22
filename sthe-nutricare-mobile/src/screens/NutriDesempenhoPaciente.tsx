import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

const screenWidth = Dimensions.get('window').width;

export function NutriDesempenhoPaciente({ route, navigation }: any) {
  const { pacienteId, pacienteNome } = route.params;

  const [loading, setLoading] = useState(true);
  const [diarios, setDiarios] = useState<any[]>([]);
  const [pesosEvolucao, setPesosEvolucao] = useState<number[]>([0]);
  const [datasEvolucao, setDatasEvolucao] = useState<string[]>(['']);

  async function carregarHistorico() {
    setLoading(true);
    try {
      const response = await api.get(`/diario/historico/${pacienteId}`);
      const dados = response.data;
      setDiarios(dados);

      if (dados.length > 0) {
        const pesos = dados.map((d: any) => d.pesoAtual || 0).filter((p: number) => p > 0);
        const datas = dados.map((d: any) => new Date(d.dataRegistro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        
        if (pesos.length > 0) {
          setPesosEvolucao(pesos);
          setDatasEvolucao(datas.slice(0, pesos.length));
        }
      }
    } catch (error) {
      console.log('Erro ao carregar historico');
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [pacienteId])
  );

  const dadosPeso = {
    labels: datasEvolucao.length > 0 ? datasEvolucao : ['Nenhum'],
    datasets: [{ data: pesosEvolucao.length > 0 ? pesosEvolucao : [0], color: () => '#2E7D32', strokeWidth: 2 }],
    legend: ["Evolucao de Peso (kg)"] 
  };

  const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`, 
    strokeWidth: 2, 
    barPercentage: 0.5,
    decimalPlaces: 1,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.title}>Desempenho: {pacienteNome.split(' ')[0]}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="body" size={20} color="#2E7D32" />
              <Text style={styles.cardTitle}>Historico de Peso</Text>
            </View>
            
            <LineChart
              data={dadosPeso}
              width={screenWidth - 60} 
              height={220}
              chartConfig={chartConfig}
              bezier 
              style={styles.chartStyle}
            />
          </View>

          <Text style={styles.sectionTitle}>Ultimos Registros Diarios</Text>

          {diarios.slice().reverse().map((diario, index) => (
            <View key={index} style={styles.diarioCard}>
              <View style={styles.diarioHeader}>
                <Text style={styles.diarioData}>{new Date(diario.dataRegistro).toLocaleDateString('pt-BR')}</Text>
                <View style={styles.badgeLayout}>
                  <Text style={styles.badgeText}>{diario.layoutUsado}</Text>
                </View>
              </View>

              <View style={styles.rowStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Consumido</Text>
                  <Text style={styles.statValue}>{diario.caloriasConsumidas} kcal</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Agua</Text>
                  <Text style={styles.statValue}>{diario.aguaConsumida} ml</Text>
                </View>
              </View>

              {diario.refeicoes && diario.refeicoes.length > 0 && (
                <View style={styles.refeicoesContainer}>
                  <Text style={styles.refeicoesTitle}>Refeicoes Registradas:</Text>
                  {diario.refeicoes.map((ref: any, i: number) => (
                    <Text key={i} style={styles.refeicaoText}>
                      - {ref.nome}: {ref.calorias} kcal (C: {ref.carboidratos}g, P: {ref.proteinas}g, G: {ref.gorduras}g)
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}

          {diarios.length === 0 && (
            <Text style={styles.emptyText}>Nenhum registro encontrado para este paciente.</Text>
          )}

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDE7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#FFD700' },
  backBtn: { padding: 8, backgroundColor: '#EFEDE7', borderRadius: 10, borderWidth: 1, borderColor: '#FFD700' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' },
  content: { padding: 24, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, marginBottom: 20, elevation: 4, borderWidth: 1, borderColor: '#FFD700' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  cardTitle: { fontWeight: 'bold', color: '#2E7D32', fontSize: 16 },
  chartStyle: { borderRadius: 16, marginVertical: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, marginTop: 10 },
  diarioCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#FFD700' },
  diarioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  diarioData: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  badgeLayout: { backgroundColor: '#2E7D32', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  rowStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statBox: { flex: 1, alignItems: 'center', backgroundColor: '#EFEDE7', padding: 10, borderRadius: 10, marginHorizontal: 5 },
  statLabel: { fontSize: 12, color: '#666' },
  statValue: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32' },
  refeicoesContainer: { marginTop: 10, padding: 10, backgroundColor: '#F9F9F9', borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  refeicoesTitle: { fontWeight: 'bold', fontSize: 12, color: '#333', marginBottom: 5 },
  refeicaoText: { fontSize: 12, color: '#666', marginBottom: 3 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 }
});