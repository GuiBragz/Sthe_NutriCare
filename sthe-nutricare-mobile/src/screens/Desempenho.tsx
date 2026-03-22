import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export function Desempenho() {
  
  const dadosPeso = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    datasets: [
      {
        data: [85, 84, 82.5, 81, 79.5, 78], 
        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`, 
        strokeWidth: 2 
      }
    ],
    legend: ["Evolucao de Peso (kg)"] 
  };

  const dadosMacros = {
    labels: ["Carbo", "Prot", "Gord"],
    data: [0.5, 0.3, 0.2], 
    colors: ["#2E7D32", "#FFD700", "#EFEDE7"]
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Meu Desempenho</Text>
          <Text style={styles.subtitle}>Acompanhe sua evolucao</Text>
        </View>

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
          <Text style={styles.insight}>Voce perdeu 7kg nos ultimos 6 meses.</Text>
        </View>

        <View style={styles.card}>
           <View style={styles.cardHeader}>
            <Ionicons name="pie-chart" size={20} color="#FFD700" />
            <Text style={styles.cardTitle}>Distribuicao da Dieta</Text>
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
                 const cores = ["#2E7D32", "#FFD700", "#EFEDE7"]; 
                 return cores[index as number] || `rgba(0,0,0,${opacity})`;
              }
            }}
            hideLegend={false}
          />
           <Text style={styles.insight}>Sua dieta esta focada em Carbos complexos.</Text>
        </View>

        <View style={styles.statsGrid}>
            <View style={styles.statBox}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Treinos no Mes</Text>
            </View>
            <View style={styles.statBox}>
                <Text style={styles.statNumber}>85%</Text>
                <Text style={styles.statLabel}>Foco na Dieta</Text>
            </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEDE7' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32' },
  subtitle: { fontSize: 16, color: '#666' },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, marginBottom: 20,
    elevation: 4, alignItems: 'center', borderWidth: 1, borderColor: '#FFD700'
  },
  cardHeader: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', marginBottom: 10, gap: 8 },
  cardTitle: { fontWeight: 'bold', color: '#2E7D32', fontSize: 16 },
  
  chartStyle: {
    borderRadius: 16, marginVertical: 8
  },
  insight: { fontSize: 12, color: '#666', fontStyle: 'italic', marginTop: 10 },

  statsGrid: { flexDirection: 'row', gap: 15 },
  statBox: { 
      flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 15, 
      alignItems: 'center', borderWidth: 1, borderColor: '#FFD700' 
  },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32' },
  statLabel: { fontSize: 12, color: '#666', fontWeight: 'bold' }
});