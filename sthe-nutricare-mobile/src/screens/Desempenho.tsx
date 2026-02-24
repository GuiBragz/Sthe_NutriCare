import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

// Pega a largura da tela para o gráfico caber certinho
const screenWidth = Dimensions.get('window').width;

export function Desempenho() {
  
  // Dados Fakes de Peso (Últimos 6 meses)
  const dadosPeso = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    datasets: [
      {
        data: [85, 84, 82.5, 81, 79.5, 78], // Exemplo de emagrecimento
        color: (opacity = 1) => `rgba(165, 85, 185, ${opacity})`, // Cor Roxo
        strokeWidth: 2 
      }
    ],
    legend: ["Evolução de Peso (kg)"] 
  };

  // Dados Fakes de Macros (Dieta atual)
  const dadosMacros = {
    labels: ["Carbo", "Prot", "Gord"],
    data: [0.5, 0.3, 0.2], // 50% Carbo, 30% Proteína, 20% Gordura
    colors: ["#A555B9", "#2F9F85", "#FBA94C"]
  };

  const chartConfig = {
    backgroundGradientFrom: "#FFF",
    backgroundGradientTo: "#FFF",
    color: (opacity = 1) => `rgba(47, 159, 133, ${opacity})`, // Verde padrão
    strokeWidth: 2, 
    barPercentage: 0.5,
    decimalPlaces: 1,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#F0E6F5', '#D8BFD8']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Meu Desempenho 📈</Text>
          <Text style={styles.subtitle}>Acompanhe sua evolução</Text>
        </View>

        {/* CARD 1: Gráfico de Linha (Peso) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="body" size={20} color="#A555B9" />
            <Text style={styles.cardTitle}>Histórico de Peso</Text>
          </View>
          
          <LineChart
            data={dadosPeso}
            width={screenWidth - 60} // Ajuste para caber no card
            height={220}
            chartConfig={chartConfig}
            bezier // Deixa a linha curva (mais bonito)
            style={styles.chartStyle}
          />
          <Text style={styles.insight}>📉 Você perdeu 7kg nos últimos 6 meses!</Text>
        </View>

        {/* CARD 2: Bolas de Progresso (Macros) */}
        <View style={styles.card}>
           <View style={styles.cardHeader}>
            <Ionicons name="pie-chart" size={20} color="#2F9F85" />
            <Text style={styles.cardTitle}>Distribuição da Dieta</Text>
          </View>

          <ProgressChart
            data={dadosMacros}
            width={screenWidth - 60}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1, index) => {
                 // Gambiarra técnica pra mudar a cor de cada anel
                 const cores = ["#A555B9", "#2F9F85", "#FBA94C"]; 
                 return cores[index as number] || `rgba(0,0,0,${opacity})`;
              }
            }}
            hideLegend={false}
          />
           <Text style={styles.insight}>🥗 Sua dieta está focada em Carbos complexos.</Text>
        </View>

        {/* CARD 3: Resumo em Texto */}
        <View style={styles.statsGrid}>
            <View style={styles.statBox}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Treinos no Mês</Text>
            </View>
            <View style={styles.statBox}>
                <Text style={styles.statNumber}>85%</Text>
                <Text style={styles.statLabel}>Foco na Dieta</Text>
            </View>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666' },

  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 20,
    elevation: 4, alignItems: 'center'
  },
  cardHeader: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', marginBottom: 10, gap: 8 },
  cardTitle: { fontWeight: 'bold', color: '#555', fontSize: 16 },
  
  chartStyle: {
    borderRadius: 16, marginVertical: 8
  },
  insight: { fontSize: 12, color: '#666', fontStyle: 'italic', marginTop: 10 },

  statsGrid: { flexDirection: 'row', gap: 15 },
  statBox: { 
      flex: 1, backgroundColor: 'rgba(255,255,255,0.6)', padding: 20, borderRadius: 15, 
      alignItems: 'center', borderWidth: 1, borderColor: '#FFF' 
  },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#A555B9' },
  statLabel: { fontSize: 12, color: '#666', fontWeight: 'bold' }
});