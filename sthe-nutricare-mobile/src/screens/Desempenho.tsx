import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export function Desempenho() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📈 Meu Desempenho</Text>
      <Text style={{color: '#666'}}>Em breve: Gráficos de Evolução</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  text: { fontSize: 20, fontWeight: 'bold', color: '#A555B9' }
});